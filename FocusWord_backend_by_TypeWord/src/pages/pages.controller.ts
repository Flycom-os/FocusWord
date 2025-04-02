import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param, Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PagesService } from './pages.service';
import { DeletePageDto } from './dto/delete-page.dto';
import { RoleProperties } from '../roles/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../roles/roles.guard';
import {
  ApiBadRequestResponse, ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse, ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse, ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { Page } from './pages.model';
import { GetForPageIntf } from 'src/files/interfaces/service.interfaces';
import { CreateDraftDto } from './dto/create-draft.dto';
import { UserId } from '../decorators/user-id.decorator';
import { UpdateDraftDto } from './dto/update-draft.dto';
import { PageByIdResponse, PagesDeletedResponse } from './responses/pages.ok.response';
import { NotFoundResponse } from '../responses/not-found.response';
import { ForbiddenResponse } from '../responses/forbidden.response';
import { UnauthorizedResponse } from '../responses/unauthorized.response';
import { BadRequestResponse } from '../responses/bad-request.response';
import { UnprocessableEntityResponse } from '../responses/validation.response';

@Controller('pages')
@ApiTags('Страницы')
export class PagesController {
  constructor(@Inject(PagesService) private readonly pagesService: PagesService) {}

  /**get pages for pagination*/
  @UsePipes(new ValidationPipe())
  @RoleProperties({ admin_panel_access: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Получение страницы c пагинацией' })
  @ApiUnauthorizedResponse({ description: 'Error: Unauthorized', type: UnauthorizedResponse })
  @ApiForbiddenResponse({ description: 'Error: Forbidden', type: ForbiddenResponse })
  @ApiNotFoundResponse({ description: 'Error: Not Found', type: NotFoundResponse })
  @ApiUnprocessableEntityResponse({ description: 'Error: Unprocessable Entity', type: UnprocessableEntityResponse })
  @Get('/pages/:page/:per_page')
  async getPagesPagination(
    @Param('page') page: number,
    @Param('per_page') per_page: number,
  ): Promise<GetForPageIntf<Page>> {
    return await this.pagesService.getPagesPagination(page, per_page);
  }

  /**get pages by ID */
  @UsePipes(new ValidationPipe())
  @RoleProperties({ admin_panel_access: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Получение страницы по id' })
  @ApiOkResponse({ description: 'Success', type: PageByIdResponse })
  @ApiUnauthorizedResponse({ description: 'Error: Unauthorized', type: UnauthorizedResponse })
  @ApiForbiddenResponse({ description: 'Error: Forbidden', type: ForbiddenResponse })
  @ApiNotFoundResponse({ description: 'Error: Not Found', type: NotFoundResponse })
  @ApiUnprocessableEntityResponse({ description: 'Error: Unprocessable Entity', type: UnprocessableEntityResponse })
  @Get('/pages/:id')
  async getPageById(@Param('id') id: number): Promise<PageByIdResponse> {
    return await this.pagesService.getPageByID(id);
  }

  /**create draft page and planned publication*/
  @UsePipes(new ValidationPipe())
  @RoleProperties({ admin_panel_access: true, publish_pages: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Создание страницы с публикацией' })
  @ApiCreatedResponse({ description: 'Created', type: PageByIdResponse })
  @ApiBadRequestResponse({ description: 'Error: Validation', type: BadRequestResponse })
  @ApiUnauthorizedResponse({ description: 'Error: Unauthorized', type: UnauthorizedResponse })
  @ApiForbiddenResponse({ description: 'Error: Forbidden', type: ForbiddenResponse })
  @ApiNotFoundResponse({ description: 'Error: Not Found', type: NotFoundResponse })
  @ApiUnprocessableEntityResponse({ description: 'Error: Unprocessable Entity', type: UnprocessableEntityResponse })
  @Post('create-publish')
  async createPublishPage(@Body() dto: CreateDraftDto, @UserId() user_id: number): Promise<PageByIdResponse> {
    return await this.pagesService.createPublishPage(dto, user_id);
  }

  /**create original and draft page*/
  @UsePipes(new ValidationPipe())
  @RoleProperties({ admin_panel_access: true, save_pages: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Создание страницы без публикации' })
  @ApiCreatedResponse({ description: 'Created', type: PageByIdResponse })
  @ApiBadRequestResponse({ description: 'Error: Validation', type: BadRequestResponse })
  @ApiUnauthorizedResponse({ description: 'Error: Unauthorized', type: UnauthorizedResponse })
  @ApiForbiddenResponse({ description: 'Error: Forbidden', type: ForbiddenResponse })
  @ApiNotFoundResponse({ description: 'Error: Not Found', type: NotFoundResponse })
  @ApiUnprocessableEntityResponse({ description: 'Error: Unprocessable Entity', type: UnprocessableEntityResponse })
  @Post('/create-save')
  async createSavePage(@Body() dto: CreateDraftDto, @UserId() user_id: number): Promise<PageByIdResponse> {
    return await this.pagesService.createPageAndDraft(dto, 'DRAFT', user_id);
  }

  /**update page without publication*/
  @UsePipes(new ValidationPipe())
  @RoleProperties({ admin_panel_access: true, publish_pages: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Обновление страницы без публикации' })
  @ApiOkResponse({ description: 'Success', type: PageByIdResponse })
  @ApiBadRequestResponse({ description: 'Error: Validation', type: BadRequestResponse })
  @ApiUnauthorizedResponse({ description: 'Error: Unauthorized', type: UnauthorizedResponse })
  @ApiForbiddenResponse({ description: 'Error: Forbidden', type: ForbiddenResponse })
  @ApiNotFoundResponse({ description: 'Error: Not Found', type: NotFoundResponse })
  @ApiUnprocessableEntityResponse({ description: 'Error: Unprocessable Entity', type: UnprocessableEntityResponse })
  @Patch('update-publish/:id')
  async updatePublishPage(
    @Body() dto: UpdateDraftDto,
    @Param('id') draft_id: number,
    @UserId() user_id: number,
  ): Promise<PageByIdResponse> {
    return await this.pagesService.updatePublishDraft(dto, draft_id, user_id);
  }

  /**update and save just page draft*/
  @UsePipes(new ValidationPipe())
  @RoleProperties({ admin_panel_access: true, publish_pages: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Обновление и сохранение черновика страницы' })
  @ApiOkResponse({ description: 'Success', type: PageByIdResponse })
  @ApiBadRequestResponse({ description: 'Error: Validation', type: BadRequestResponse })
  @ApiUnauthorizedResponse({ description: 'Error: Unauthorized', type: UnauthorizedResponse })
  @ApiForbiddenResponse({ description: 'Error: Forbidden', type: ForbiddenResponse })
  @ApiNotFoundResponse({ description: 'Error: Not Found', type: NotFoundResponse })
  @ApiUnprocessableEntityResponse({ description: 'Error: Unprocessable Entity', type: UnprocessableEntityResponse })
  @Patch('update-save/:id')
  async updateAndSaveDraft(
    @Body() dto: UpdateDraftDto,
    @Param('id') draft_id: number,
    @UserId() user_id: number,
  ): Promise<PageByIdResponse> {
    return await this.pagesService.updateSavePage(dto, draft_id, user_id);
  }

  /**delete one or more pages*/
  @UsePipes(new ValidationPipe())
  @RoleProperties({ admin_panel_access: true, save_pages: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Удаление страниц' })
  @ApiOkResponse({ description: 'Success', type: PagesDeletedResponse })
  @ApiBadRequestResponse({ description: 'Error: Validation', type: BadRequestResponse })
  @ApiUnauthorizedResponse({ description: 'Error: Unauthorized', type: UnauthorizedResponse })
  @ApiForbiddenResponse({ description: 'Error: Forbidden', type: ForbiddenResponse })
  @ApiNotFoundResponse({ description: 'Error: Not Found', type: NotFoundResponse })
  @ApiUnprocessableEntityResponse({ description: 'Error: Unprocessable Entity', type: UnprocessableEntityResponse })
  @Delete('/delete')
  async deletePages(@Body() dto: DeletePageDto): Promise<PagesDeletedResponse> {
    return await this.pagesService.deletePages(dto);
  }
}
