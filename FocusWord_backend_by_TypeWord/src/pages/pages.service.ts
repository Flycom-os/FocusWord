import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Page } from './pages.model';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PageDraft } from './drafts.model';
import { User } from '../users/user.model';
import { TemplateModel } from '../templates/template.model';
import { SEOPreset } from '../seo/seo-presets/seo-presets.model';
import { SeoService } from '../seo/seo.service';
import { SEO } from '../seo/seo.model';
import { DeletePageDto } from './dto/delete-page.dto';
import { GetForPageIntf } from 'src/files/interfaces/service.interfaces';
import { SeoPresetsService } from '../seo/seo-presets/seo-presets.service';
import { UsersService } from '../users/users.service';
import { TemplatesService } from '../templates/templates.service';
import { CronJob } from 'cron';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CreateDraftDto } from './dto/create-draft.dto'
import { UpdateDraftDto } from './dto/update-draft.dto';
import { ForbiddenMethodUnallowResponse } from '../roles/responses/roles.forbidden.responses';
import { PagesDeletedResponse, PageByIdResponse } from './responses/pages.ok.response';
import { BadRequestResponse } from '../responses/bad-request.response';
import { FilesModel } from '../files/files.model';
import { FilesService } from '../files/files.service';
import { MiniatureModel } from '../files/miniature.model';
import { NotFoundResponse } from '../responses/not-found.response';

@Injectable()
export class PagesService {
  constructor(
    @InjectModel(Page) private pageRepository: typeof Page,
    @InjectModel(PageDraft) private pageDraftRepository: typeof PageDraft,
    @Inject(SeoService) private readonly seoService: SeoService,
    @Inject(SeoPresetsService) private readonly seoPresetsService: SeoPresetsService,
    @Inject(UsersService) private readonly usersService: UsersService,
    @Inject(TemplatesService) private readonly templatesService: TemplatesService,
    @Inject(FilesService) private readonly filesService: FilesService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  /**
   * Создание Cron-работы по передаче данных из черновика страницы на её оригинал.
   * Create a Cron job to transfer data from a draft page to its original.
   */
  private async _cronPublishJob(date: Date, page_id: number, draft_id: number): Promise<void> {
    const job_name = `Wait for publish page ${page_id}`;
    const job: CronJob = new CronJob(date, async (): Promise<void> => {
      const draft: PageDraft = await this.pageDraftRepository.findOne({
        where: { id: { draft_id } },
        include: [User, TemplateModel, SEOPreset, Page],
      });
      if (!draft) {
        throw new HttpException('Page draft not found', 404);
      }
      await this._updatePage(
        draft.page_id,
        {
          title: draft.title,
          text: draft.text,
          template_id: draft.template_id,
          seo_preset_id: draft.seo_preset_id,
          seo: draft.seo,
        },
        'PUBLISHED',
        draft.user,
        draft.image,
        draft.template,
        draft.seo_preset,
      );
      if (draft.status !== 'PUBLISHED') {
        await draft.update({ status: 'PUBLISHED' });
      }
    });
    this.schedulerRegistry.addCronJob(job_name, job);
    job.start();
  }

  private _cronDeleteJob(page_id: number): void {
    try {
      const job: CronJob = this.schedulerRegistry.getCronJob(`Wait for publish page ${page_id}`);
      if (job) {
        this.schedulerRegistry.deleteCronJob(`Wait for publish page ${page_id}`);
      }
    } catch (e) {}
  }

  /**create new page*/
  private async _createPage(
    dto: CreatePageDto,
    status: 'PUBLISHED' | 'DRAFT' | 'WAIT_FOR_PUBLISH',
    draft: PageDraft,
    user: User,
    seo: SEO,
    template?: TemplateModel,
    seo_preset?: SEOPreset,
  ): Promise<Page> {
    const page: Page = await this.pageRepository.create({
      ...dto,
      status: status,
      manual_seo: this.seoService.checkManualChangeSeo(dto.seo, seo_preset),
    });
    await page.$set('user', user);
    await page.$set('template', template);
    await page.$set('seo', seo);
    await page.$set('seo_preset', seo_preset);
    await page.$set('draft', draft);
    return await page.reload();
  }

  /**update information page*/
  private async _updatePage(
    id: number,
    dto: UpdatePageDto,
    status: 'PUBLISHED' | 'DRAFT' | 'WAIT_FOR_PUBLISH',
    user: User,
    image?: FilesModel,
    template?: TemplateModel,
    seo_preset?: SEOPreset,

  ): Promise<Page> {
    const page: Page = await this.pageRepository.findOne({ where: { id: id }, include: [SEO] });
    if (!page) {
      throw new HttpException(`Страница с id ${id} не найдена`, HttpStatus.NOT_FOUND);
    }
    const { seo, ...pageData } = dto;
    const updatedPage: Page = await this.pageRepository
      .update(
        { ...pageData, status: status, manual_seo: this.seoService.checkManualChangeSeo(seo, seo_preset) },
        { where: { id }, returning: true },
      )
      .then(([, pages]) => pages[0]);
    await this.seoService.updateSeo(updatedPage.seo_id, seo);
    if (image) {
      await updatedPage.$set('image', image);
    }
    await updatedPage.$set('user', user);
    await updatedPage.$set('template', template);
    await updatedPage.$set('seo_preset', seo_preset);
    return await updatedPage.reload();
  }

  async _updatePageDraft(
    dto: UpdateDraftDto,
    draft_id: number,
    status: 'PUBLISHED' | 'DRAFT' | 'WAIT_FOR_PUBLISH',
    user_id: number,
    save?: boolean,
  ): Promise<PageDraft> {
    const draftExists: PageDraft = await this.pageDraftRepository.findOne({
      where: { id: draft_id },
      include: [SEO, Page],
    });

    if (!draftExists) {
      throw new HttpException(`Черновик с id ${draft_id} не найден`, HttpStatus.NOT_FOUND);
    }
    if (save && draftExists.page.status == 'WAIT_FOR_PUBLISH') {
      throw new ForbiddenMethodUnallowResponse();
    }
    let image: FilesModel | undefined
    if (dto.file_id) {
      image = await this.filesService.getFileInfo(dto.file_id);
      if (!image.image) {
        throw new BadRequestResponse('Файл не является изображением.')
      }
    }
    const user: User = await this.usersService.getUserById(user_id);
    const seoPreset: SEOPreset = await this.seoPresetsService.getSeoPresetById(dto.seo_preset_id);
    const template: TemplateModel = await this.templatesService.getTemplateById(dto.template_id);
    const draftData: Omit<UpdateDraftDto, 'seo'> = dto;
    const draft: PageDraft = await this.pageDraftRepository
      .update(
        {
          ...draftData,
          manual_seo: this.seoService.checkManualChangeSeo(dto.seo, seoPreset),
          date_to_publish: dto.date_to_publish,
          status: status,
        },
        { where: { id: draft_id }, returning: true },
      )
      .then(([, pageDrafts]) => pageDrafts[0]);
    await this.seoService.updateSeo(draftExists.seo.id, dto.seo);
    await draft.$set('user', user);
    if (image) {
      await draft.$set('image', image);
    }
    if (template) {
      await draft.$set('template', template);
    }
    return await draft.reload();
  }

  /**get pages for paggination*/
  async getPagesPagination(page: number, per_page: number): Promise<GetForPageIntf<Page>> {
    return await this.pageRepository
      .findAndCountAll({
        limit: per_page,
        offset: (page - 1) * per_page,
        order: ['createdAt'],
        attributes: ['id', 'title', 'status', 'manual_seo'],
        include: [
          { model: User, attributes: { exclude: ['password', 'refresh_token', 'ban_reason'] } },
          { model: PageDraft, attributes: ['id'] },
        ],
      })
      .then(({ rows, count }) => {
        return { current_page: page, total_pages: Math.ceil(count / per_page), count: count, rows: rows };
      });
  }

  /**get pages by ID */
  async getPageByID(id: number): Promise<PageByIdResponse> {
    const page: Page = await this.pageRepository
      .findByPk(id, {
        attributes: ['id', 'title', 'text', 'status', 'manual_seo'],
        include: [
          { model: FilesModel, include: [{ model: MiniatureModel, attributes: ['filepath'] }] },
          { model: User, attributes: ['id', 'name'] },
          { model: SEO },
          { model: SEOPreset },
          { model: TemplateModel },
          {
            model: PageDraft,
            attributes: ['id', 'title', 'text', 'status', 'date_to_publish', 'manual_seo'],
            include: [
              { model: FilesModel, include: [{ model: MiniatureModel, attributes: ['filepath'] }] },
              { model: SEO },
              { model: SEOPreset },
              { model: TemplateModel },
            ]
          },
        ],
      })
    if (!page) {
      throw new HttpException('Page not found', 404);
    }
    page.seo = this.seoService.seoSwitch(page.manual_seo, page.seo, page.seo_preset);
    return page;
  }

  /**
   * Создаёт черновик страницы и её оригинал с последующей публикацией (в зависимости от dto.date_to_publish)
   * Creates a draft of the page and its original with subsequent publication (depending on dto.date_to_publish)
   */
  async createPublishPage(dto: CreateDraftDto, user_id: number): Promise<PageByIdResponse> {
    if (!dto.date_to_publish || new Date(dto.date_to_publish).getTime() <= Date.now()) {
      return await this.createPageAndDraft(dto, 'PUBLISHED', user_id);
    } else {
      const page: PageByIdResponse = await this.createPageAndDraft(dto, 'WAIT_FOR_PUBLISH', user_id);
      await this._cronPublishJob(page.draft.date_to_publish, page.id, page.draft.id);
      return page;
    }
  }

  async updateSavePage(
    dto: UpdateDraftDto,
    draft_id: number,
    user_id: number,
  ): Promise<PageByIdResponse> {
    const pageDraft: PageDraft = await this._updatePageDraft(dto, draft_id, "DRAFT", user_id, true)
    return await this.getPageByID(pageDraft.page_id)
  }

  /**
   * Обновляет черновик страницы с последющей публикацией (в зависимости от dto.date_to_publish)
   * Updates the draft page with the latest publication (depending on dto.date_to_publish)
   */
  async updatePublishDraft(dto: UpdateDraftDto, draft_id: number, user_id: number): Promise<PageByIdResponse> {
    this._cronDeleteJob(draft_id);
    if (!dto.date_to_publish || new Date(dto.date_to_publish).getTime() <= Date.now()) {
      const updatedDraft: PageDraft = await this._updatePageDraft(dto, draft_id, 'PUBLISHED', user_id);
      const page: Page = await this._updatePage(
        updatedDraft.page_id,
        dto,
        'PUBLISHED',
        updatedDraft.user,
        updatedDraft.image,
        updatedDraft.template,
      );
      return await this.getPageByID(page.id)
    } else {
      const updatedDraft: PageDraft = await this._updatePageDraft(dto, draft_id, 'WAIT_FOR_PUBLISH', user_id);
      const page: Page = await this._updatePage(
        updatedDraft.page_id,
        dto,
        'WAIT_FOR_PUBLISH',
        updatedDraft.user,
        updatedDraft.image,
        updatedDraft.template,
      );
      await this._cronPublishJob(dto.date_to_publish, page.id, updatedDraft.id);
      return await this.getPageByID(page.id)
    }
  }

  /**
   * Создаёт черновик страницы и оригинал
   * Creates a draft page and an original
   */
  async createPageAndDraft(
    dto: CreateDraftDto,
    status: 'PUBLISHED' | 'DRAFT' | 'WAIT_FOR_PUBLISH',
    user_id: number,
  ): Promise<PageByIdResponse> {
    let file: FilesModel | undefined
    if (dto.file_id) {
      file = await this.filesService.getFileInfo(dto.file_id);
      if (!file.image) {
        throw new BadRequestResponse('Файл не является изображением.')
      }
    }
    const user: User = await this.usersService.getUserById(user_id);
    const seoPreset: SEOPreset = await this.seoPresetsService.getSeoPresetById(dto.seo_preset_id);
    const template: TemplateModel = await this.templatesService.getTemplateById(dto.template_id);
    const draftData: Omit<CreateDraftDto, 'seo'> = dto;
    const draft: PageDraft = await this.pageDraftRepository.create({
      ...draftData,
      date_to_publish: dto.date_to_publish,
      status: status,
      manual_seo: this.seoService.checkManualChangeSeo(dto.seo, seoPreset),
    });
    const seo: SEO = await this.seoPresetsService.createSeoPresetDrafts(seoPreset, dto.seo);
    if (file) {
      await draft.$set('image', file);
    }
    await draft.$set('user', user);
    await draft.$set('seo_preset', seoPreset);
    await draft.$set('template', template);
    const page: Page = await this._createPage(dto, status, draft, user, seo, template, seoPreset);
    await draft.$set('page', page);
    await draft.$set('seo', seo);
    return await this.getPageByID(page.id);
  }

  /**delete one or more pages*/
  async deletePages(dto: DeletePageDto): Promise<PagesDeletedResponse> {
    const pages: Page[] = await this.pagesIdExistsCheck(dto.ids);
    pages.forEach((page: Page): void => {
      this._cronDeleteJob(page.id);
    });
    await this.pageRepository.destroy({ where: { id: dto.ids } });
    return new PagesDeletedResponse(dto.ids)
  }

  /**check pages in database*/
  private async pagesIdExistsCheck(page_ids: number[]): Promise<Page[]> {
    const pages: Page[] = await this.pageRepository.findAll({
      where: { id: page_ids },
      include: { all: true },
    });
    if (pages.length !== page_ids.length) {
      pages.forEach((draft: Page): void => {
        const index: number = page_ids.indexOf(draft.id);
        page_ids.splice(index, 1);
      });
      throw new NotFoundResponse(`Страницы с id ${page_ids} не найдены.`);
    }
    return pages;
  }
}
