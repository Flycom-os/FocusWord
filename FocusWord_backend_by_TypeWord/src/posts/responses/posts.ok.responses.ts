import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SEO } from '../../seo/seo.model';
import { BelongsTo, ForeignKey } from 'sequelize-typescript';
import { FilesModel } from '../../files/files.model';
import { MiniatureModel } from '../../files/miniature.model';
import { SEOPreset } from '../../seo/seo-presets/seo-presets.model';

class PostUser {
  @ApiProperty({ example: 1, description: 'Уникальный идентификатор создателя / последнего редактора поста' })
  id: number;
  @ApiProperty({ example: "Администратор", description: 'Имя создателя / последнего редактора поста' })
  name: string;
}

class PostCategoryResponse {
  @ApiProperty({ example: 1, description: 'Уникальный идентификатор категории' })
  id: number;
  @ApiProperty({ example: 'Без категории', description: 'Название категории' })
  name: string;
  @ApiProperty({ description: 'Данные о SEO-предустановках категории' })
  seo_preset: SEOPreset
}

class PaginationPostDraft {
  @ApiProperty({ example: 1, description: 'Уникальный идентификатор черновика поста' })
  id: number;
}

class PaginationPost {
  @ApiProperty({ example: 1, description: 'Уникальный идентификатор поста' })
  id: number;
  @ApiProperty({ example: 'Новый пост', description: 'Заголовок поста' })
  title: string;
  @ApiProperty({ description: 'Данные о создателе / последнем редакторе поста' })
  user: PostUser;
  @ApiProperty({ description: 'Данные о категории поста' })
  category: PostCategoryResponse;
  @ApiProperty({ description: 'Данные о черновике поста' })
  draft: PaginationPostDraft;
}

export class PagesResponse {
  @ApiProperty({ example: 1 })
  count: number;
  @ApiProperty({ example: 1 })
  current_page: number;
  @ApiProperty({ example: 1 })
  total_pages: number;
  @ApiProperty({ type: [PaginationPost] })
  rows: PaginationPost[];
}

class PostMiniature {
  @ApiProperty({
    example: 'http://localhost:5000/staticdata/uploaded/file34.webp',
    description: 'Полный путь к сжатому файлу'
  })
  filepath: string;
}

class PostImage {
  @ApiProperty({ example: 1, description: 'Уникальный идентификатор медиафайла' })
  id: number;
  @ApiProperty({ description: 'Данные о сжатом изображении' })
  miniature: PostMiniature;
}

class PostDraft {
  @ApiProperty({ example: 1, description: 'Уникальный идентификатор черновика поста' })
  id: number;
  @ApiProperty({ example: 'Новый пост', description: 'Название черновика поста' })
  title: string;
  @ApiProperty({ example: 'Анонс', description: 'Анонс черновика поста' })
  announcement: string;
  @ApiProperty({ example: '<p>Текст поста</p>', description: 'Текст черновика поста' })
  text: string;
  @ApiProperty({ example: 'DRAFT | PUBLISHED | WAIT_FOR_PUBLISH', description: 'Статус черновика поста' })
  status: 'DRAFT' | 'PUBLISHED' | 'WAIT_FOR_PUBLISH';
  @ApiProperty({ example: false, description: 'Видимость поста (true = открыт / false = скрыт)' })
  visibility: boolean;
  @ApiPropertyOptional({ description: 'Данные об изображении черновика поста' })
  image: PostImage;
  @ApiProperty({ description: 'Данные о SEO черновика поста' })
  seo: SEO;
  @ApiProperty({
    example: '2023-08-17T01:23:08.069Z',
    description: 'Дата, когда опубликуется или применятся изменения черновика поста',
  })
  date_to_publish: Date;
  @ApiProperty({ example: false, description: 'Признак ручного изменения SEO-параметров' })
  manual_seo: boolean;
  @ApiProperty({ description: 'Данные о категории черновика поста' })
  category: PostCategoryResponse;
  @ApiProperty({ description: 'Данные о создателе / последнем редакторе черновика поста' })
  user: PostUser;
}

export class PostByIdResponse {
  @ApiProperty({ example: 1, description: 'Уникальный идентификатор поста' })
  id: number;
  @ApiProperty({ example: 'Новый пост', description: 'Заголовок поста' })
  title: string;
  @ApiProperty({ example: 'Анонс', description: 'Анонс поста' })
  announcement: string;
  @ApiProperty({ example: '<p>Текст поста</p>', description: 'Текст поста' })
  text: string;
  @ApiProperty({ example: 'DRAFT | PUBLISHED | WAIT_FOR_PUBLISH', description: 'Статус поста' })
  status: string;
  @ApiProperty({ example: false, description: 'Видимость поста (true = открыт / false = скрыт)' })
  visibility: boolean;
  @ApiPropertyOptional({ description: 'Данные об изображении черновика поста' })
  image: PostImage;
  @ApiProperty({ description: 'Данные о SEO-настройках поста' })
  seo: SEO;
  @ApiProperty({ example: false, description: 'Признак ручного изменения SEO-параметров' })
  manual_seo: boolean;
  @ApiProperty({ description: 'Данные о категории поста' })
  category: PostCategoryResponse;
  @ApiProperty({ description: 'Данные о создателе / последнем редакторе поста' })
  user: PostUser;
  @ApiProperty({ description: 'Данные о черновике поста' })
  draft: PostDraft;
}

export class PostsPublishedResponse {
  @ApiProperty({ example: 'Опубликовано', description: 'Статус ответа' })
  status: 'Опубликовано';
  @ApiProperty({ example: [1, 2, 3], description: 'id опубликованных постов' })
  ids: number[];

  constructor(ids: number[]) {
    this.ids = ids
  }
}

export class PostsDeletedResponse {
  @ApiProperty({ example: 'Удалено', description: 'Статус ответа' })
  status: 'Удалено';
  @ApiProperty({ example: [1, 2, 3], description: 'id удалённых постов' })
  ids: number[];

  constructor(ids: number[]) {
    this.ids = ids
  }
}
