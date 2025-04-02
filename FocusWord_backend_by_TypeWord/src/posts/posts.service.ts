import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PostModel } from './posts.model';
import { PostsCategory } from './categories/category.model';
import { SeoService } from '../seo/seo.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.model';
import { CategoriesService } from './categories/categories.service';
import {
  PagesResponse,
  PostByIdResponse,
  PostsDeletedResponse,
  PostsPublishedResponse,
} from './responses/posts.ok.responses';
import { SeoPresetsService } from '../seo/seo-presets/seo-presets.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { PostDraft } from './drafts.model';
import { SEOPreset } from '../seo/seo-presets/seo-presets.model';
import { SEO } from '../seo/seo.model';
import { CreatePostDraftDto } from './dto/create-post-draft.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDraftDto } from './dto/update-post-draft.dto';
import { FilesService } from '../files/files.service';
import { FilesModel } from '../files/files.model';
import { MultiplePostsDto } from './dto/multiple-posts.dto';
import { NotFoundResponse } from '../responses/not-found.response';
import { ForbiddenResponse } from '../responses/forbidden.response';
import { BadRequestResponse } from '../responses/bad-request.response';
import { MiniatureModel } from '../files/miniature.model';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(PostModel)
    private readonly postRepository: typeof PostModel,
    @InjectModel(PostDraft)
    private readonly postsDraftsRepository: typeof PostDraft,
    @Inject(forwardRef(() => CategoriesService))
    private readonly categoriesService: CategoriesService,
    @Inject(FilesService)
    private readonly filesService: FilesService,
    @Inject(SeoService)
    private readonly seoService: SeoService,
    @Inject(SeoPresetsService)
    private readonly seoPresetService: SeoPresetsService,
    @Inject(UsersService)
    private readonly usersService: UsersService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  private async _postsIdExistsCheck(post_ids: number[]): Promise<PostModel[]> {
    const posts: PostModel[] = await this.postRepository.findAll({
      where: { id: post_ids },
      include: { all: true },
    });
    if (posts.length !== post_ids.length) {
      posts.forEach((post: PostModel): void => {
        const index: number = post_ids.indexOf(post.id);
        post_ids.splice(index, 1);
      });
      throw new NotFoundResponse(`Посты с id ${post_ids} не найдены.`);
    }
    return posts;
  }

  private async _cronPublishJob(date: Date, post_id: number): Promise<void> {
    const job_name = `Wait for publish post ${post_id}`;
    const job: CronJob = new CronJob(date, async (): Promise<void> => {
      const post: PostModel = await this.postRepository.findOne({ where: { id: post_id }, include: { all: true } });
      await this._updatePost(
        post_id,
        {
          title: post.draft.title,
          announcement: post.draft.announcement,
          text: post.draft.text,
          visibility: post.draft.visibility,
          category_id: post.draft.category_id,
          seo: post.draft.seo,
        },
        'PUBLISHED',
        post.draft.category,
        post.draft.user,
      );
      if (post.draft.status !== 'PUBLISHED') {
        await post.draft.$set('status', 'PUBLISHED');
      }
    });
    this.schedulerRegistry.addCronJob(job_name, job);
    job.start();
  }

  private _cronDeleteJob(post_id: number): void {
    try {
      const job: CronJob = this.schedulerRegistry.getCronJob(`Wait for publish post ${post_id}`);
      if (job) {
        this.schedulerRegistry.deleteCronJob(`Wait for publish post ${post_id}`);
      }
    } catch (e) {}
  }

  private async _createPost(
    dto: CreatePostDto,
    status: 'DRAFT' | 'PUBLISHED' | 'WAIT_FOR_PUBLISH',
    seo: SEO,
    category: PostsCategory,
    user: User,
    draft: PostDraft,
    file?: FilesModel,
  ): Promise<PostModel> {
    const postData: Omit<UpdatePostDto, 'seo'> = dto;
    const post: PostModel = await this.postRepository.create({
      ...postData,
      status: status,
      manual_seo: this.seoService.checkManualChangeSeo(dto.seo, category.seo_preset),
    });
    await post.$set('category', category);
    await post.$set('seo', seo);
    await post.$set('user', user);
    await post.$set('draft', draft);
    if (file) {
      await post.$set('image', file);
    }
    return await post.reload();
  }

  private async _createDraftAndPost(
    dto: CreatePostDraftDto,
    status: 'DRAFT' | 'PUBLISHED' | 'WAIT_FOR_PUBLISH',
    user_id: number,
  ): Promise<PostByIdResponse> {
    const user: User = await this.usersService.getUserById(user_id)
    const category: PostsCategory = await this.categoriesService.getCategoryById(1)
    if (dto.seo) {
      if (category.seo_preset) {
        dto.manual_seo = this.seoService.checkManualChangeSeo(dto.seo, category.seo_preset)
      }
    }
    let file: FilesModel | undefined
    if (dto.file_id) {
      file = await this.filesService.getFileInfo(dto.file_id);
      if (!file.image) {
        throw new BadRequestResponse('Файл не является изображением.')
      }
    }
    const seo: SEO = await this.seoPresetService.createSeoPresetDrafts(category.seo_preset, dto.seo);
    const draft: PostDraft = await this.postsDraftsRepository.create({
      ...dto,
      status: status,
      manual_seo: this.seoService.checkManualChangeSeo(
        dto.seo,
        category.seo_preset,
      ),
    });
    if (file) {
      await draft.$set('image', file);
    }
    await draft.$set('user', user);
    await draft.$set('category', category);
    await draft.$set('seo', seo);
    if (draft.status === 'WAIT_FOR_PUBLISH' || draft.status === 'DRAFT') {
      const post: PostModel = await this._createPost(
        {
          ...dto,
          visibility: false,
          seo: dto.seo,
        },
        status, seo, category, user, draft, file
      );
      await draft.$set('post', post);
      return await this.getPostById(post.id);
    } else {
      const post: PostModel = await this._createPost(dto, draft.status, seo, category, user, draft, file);
      await draft.$set('post', post);
      return await this.getPostById(post.id);
    }
  }

  private async _updatePost(
    post_id: number,
    dto: UpdatePostDto,
    status: 'DRAFT' | 'PUBLISHED' | 'WAIT_FOR_PUBLISH',
    category: PostsCategory,
    user: User,
    image?: FilesModel,
  ): Promise<PostModel> {
    const post: PostModel = await this.postRepository.findOne({ where: { id: post_id }, include: [SEO] });
    if (!post) {
      throw new NotFoundResponse(`Пост с id ${post_id} не найден`);
    }
    const postData: Omit<UpdatePostDto, 'seo'> = dto;
    const updatedPost: PostModel = await this.postRepository
      .update(
        {
          ...postData,
          status: status,
          manual_seo: this.seoService.checkManualChangeSeo(
            dto.seo,
            category ? category.seo_preset : undefined,
          ),
        },
        { where: { id: post_id }, returning: true },
      )
      .then(([, postModels]) => postModels[0]);
    if (image) {
      await post.$set('image', image);
    }
    await updatedPost.$set('category', category);
    await updatedPost.$set('user', user);
    return updatedPost.reload();
  }

  private async _updatePostDraft(
    dto: UpdatePostDraftDto,
    status: 'DRAFT' | 'PUBLISHED' | 'WAIT_FOR_PUBLISH',
    post_id: number,
    user_id: number,
    save?: boolean,
  ): Promise<PostDraft> {
    const draft: PostDraft = await this.postsDraftsRepository.findOne({
      where: { post_id: post_id },
      include: { all: true },
    });
    if (!draft) {
      throw new NotFoundResponse(`Черновик поста с id ${post_id} не найден.`);
    }
    if (save && draft.post.status == 'WAIT_FOR_PUBLISH') {
      throw new ForbiddenResponse('Доступ запрещён (пост ожидает публикации).');
    }
    let image: FilesModel | undefined
    if (dto.file_id) {
      image = await this.filesService.getFileInfo(dto.file_id);
      if (!image.image) {
        throw new BadRequestResponse('Файл не является изображением.')
      }
    }
    const user: User = await this.usersService.getUserById(user_id);
    const category: PostsCategory = await this.categoriesService.getCategoryById(draft.category_id);
    const draftData: Omit<UpdatePostDraftDto, 'seo'> = dto;
    await this.postsDraftsRepository
      .update(
        {
          ...draftData,
          status: status,
          manual_seo: this.seoService.checkManualChangeSeo(
            dto.seo,
            (category ? category.seo_preset : undefined)
              ? category.seo_preset
              : draft.category.seo_preset,
          ),
        },
        { where: { post_id: post_id }, returning: true },
      )
      .then(([, postDrafts]) => postDrafts[0]);
    await this.seoService.updateSeo(draft.seo.id, dto.seo);
    if (image) {
      await draft.$set('image', image);
    }
    await draft.$set('user', user)
    return await draft.reload();
  }

  async getPostsPagination(page: number, per_page: number): Promise<PagesResponse> {
    const offset: number = (page - 1) * per_page;
    return await this.postRepository
      .findAndCountAll({
        limit: per_page,
        offset: offset,
        order: ['createdAt'],
        attributes: ['id', 'title', 'updatedAt'],
        where: {  },
        include: [
          { model: User, attributes: ['id', 'name'] },
          { model: PostsCategory, attributes: ['id', 'name'] },
          { model: PostDraft, attributes: ['id'] }
        ],
      })
      .then(({ count, rows }): PagesResponse => {
        if (rows.length == 0) {
          throw new NotFoundResponse(`Посты на странице ${page} не найдены.`)
        }
        return { current_page: page, total_pages: Math.ceil(count / per_page), count: count, rows: rows };
      });
  }

  async getPostById(id: number): Promise<PostByIdResponse> {
    const post: PostModel = await this.postRepository.findOne(
      {
        where: { id },
        attributes: ['id', 'title', 'announcement', 'text', 'status', 'visibility'],
        include: [
          { model: FilesModel, include: [{ model: MiniatureModel, attributes: ['filepath'] }] },
          { model: User, attributes: ['id', 'name'] },
          { model: PostsCategory, attributes: ['id', 'name'], include: [SEOPreset] },
          { model: SEO },
          {
            model: PostDraft,
            attributes: ['id', 'title', 'announcement', 'text', 'status', 'visibility'],
            include: [
              { model: FilesModel, include: [{ model: MiniatureModel, attributes: ['filepath'] }] },
              { model: PostsCategory, attributes: ['id', 'name'], include: [SEOPreset] },
              { model: User, attributes: ['id', 'name'] },
              { model: SEO },
            ]
          }
        ]
      }
    )
    if (!post) {
      throw new NotFoundResponse(`Пост с id ${id} не найден.`)
    }
    return post
  }

  async createSavePost(dto: CreatePostDraftDto, user_id: number): Promise<PostByIdResponse> {
    return await this._createDraftAndPost(dto, "DRAFT", user_id)
  }

  async createPublishPost(dto: CreatePostDraftDto, user_id: number): Promise<PostByIdResponse> {
    if (!dto.date_to_publish || new Date(dto.date_to_publish).getTime() <= Date.now()) {
      return await this._createDraftAndPost(dto, 'PUBLISHED', user_id);
    } else {
      const post: PostByIdResponse = await this._createDraftAndPost(dto, 'WAIT_FOR_PUBLISH', user_id);
      await this._cronPublishJob(post.draft.date_to_publish, post.id);
      return post;
    }
  }

  async updatePublishPost(dto: UpdatePostDraftDto, post_id: number, user_id: number): Promise<PostByIdResponse> {
    this._cronDeleteJob(post_id);
    if (!dto.date_to_publish || new Date(dto.date_to_publish).getTime() <= Date.now()) {
      const draft: PostDraft = await this._updatePostDraft(dto, 'PUBLISHED', post_id, user_id);
      await this._updatePost(
        draft.post_id,
        {
          title: draft.title,
          announcement: draft.announcement,
          text: draft.text,
          visibility: draft.visibility,
          category_id: draft.category_id,
          seo: draft.seo,
        },
        'PUBLISHED',
        draft.category,
        draft.user,
        draft.image,
      );
      return await this.getPostById(draft.post_id);
    } else {
      const draft: PostDraft = await this._updatePostDraft(dto, 'WAIT_FOR_PUBLISH', post_id, user_id);
      await this._updatePost(post_id, dto, 'WAIT_FOR_PUBLISH', draft.category, draft.user, draft.image);
      await this._cronPublishJob(draft.date_to_publish, draft.post.id);
      return await this.getPostById(draft.post_id);
    }
  }

  async updateSavePost(
    dto: UpdatePostDraftDto,
    post_id: number,
    user_id: number,
  ): Promise<PostByIdResponse> {
    const draft: PostDraft = await this._updatePostDraft(dto, 'DRAFT', post_id, user_id, true)
    return await this.getPostById(draft.post_id)
  }

  async forwardUpdatePosts(dto: MultiplePostsDto, user_id: number): Promise<PostsPublishedResponse> {
    const posts: PostModel[] = await this._postsIdExistsCheck(dto.ids)
    posts.map(async (post: PostModel): Promise<void> => {
      await this.updatePublishPost({}, post.id, user_id)
    })
    return new PostsPublishedResponse(dto.ids);
  }

  async deletePosts(dto: MultiplePostsDto): Promise<PostsDeletedResponse> {
    await this._postsIdExistsCheck(dto.ids);
    dto.ids.forEach((id: number) => this._cronDeleteJob(id));
    await this.postRepository.destroy({ where: { id: dto.ids } });
    return new PostsDeletedResponse(dto.ids);
  }
}
