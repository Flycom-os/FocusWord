import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SEO } from '../../seo/seo.model';
import { SEOPreset } from '../../seo/seo-presets/seo-presets.model';

class PageUser {
  @ApiProperty({ example: 1, description: 'Уникальный идентификатор пользователя' })
  id: number;
  @ApiProperty({ example: 'Администратор', description: 'Имя создателя / последнего редактора страницы' })
  name: string;
}

class PaginationPage {
  id: number;
  title: string;
  user: PageUser;
}

export class PaginationResponse {
  count: number;
  current_page: number;
  total_pages: number;
  rows: PaginationPage[];
}

class PageMiniature {
  @ApiProperty({
    example: 'http://localhost:5000/staticdata/uploaded/file34.webp',
    description: 'Полный путь к сжатому файлу'
  })
  filepath: string;
}

class PageImage {
  @ApiProperty({ example: 1, description: 'Уникальный идентификатор медиафайла' })
  id: number;
  @ApiProperty({ description: 'Данные о сжатом изображении' })
  miniature: PageMiniature;
}

class PageDraft {
  @ApiProperty({ example: 1, description: 'Уникальный идентификатор страницы' })
  id: number;
  @ApiProperty({ example: 'Новая страница', description: 'Заголовок страницы' })
  title: string;
  @ApiProperty({ example: '<p>Текст страницы</p>', description: 'Текст страницы' })
  text: string;
  @ApiProperty({ example: 'DRAFT | PUBLISHED | WAIT_FOR_PUBLISH', description: 'Статус страницы' })
  status: string;
  @ApiProperty({
    example: '2023-08-17T01:23:08.069Z',
    description: 'Дата, когда опубликуется или применятся изменения черновика страницы',
  })
  date_to_publish: Date;
  @ApiPropertyOptional({ description: 'Данные об изображении черновика страницы' })
  image?: PageImage;
  @ApiProperty({ description: 'Данные о создателе / последнем редакторе черновика страницы' })
  user: PageUser;
  @ApiProperty({ description: 'Данные о SEO черновика поста' })
  seo: SEO;
  @ApiProperty({ description: 'Данные о SEO-предустановках категории' })
  seo_preset: SEOPreset
  @ApiProperty({ example: false, description: 'Признак ручного изменения SEO-параметров' })
  manual_seo: boolean;
}

export class PageByIdResponse {
  @ApiProperty({ example: 1, description: 'Уникальный идентификатор страницы' })
  id: number;
  @ApiProperty({ example: 'Новая страница', description: 'Заголовок страницы' })
  title: string;
  @ApiProperty({ example: '<p>Текст страницы</p>', description: 'Текст страницы' })
  text: string;
  @ApiProperty({ example: 'DRAFT | PUBLISHED | WAIT_FOR_PUBLISH', description: 'Статус страницы' })
  status: string;
  @ApiPropertyOptional({ description: 'Данные об изображении страницы' })
  image?: PageImage;
  @ApiProperty({ description: 'Данные о создателе / последнем редакторе страницы' })
  user: PageUser;
  @ApiProperty({ description: 'Данные о SEO черновика поста' })
  seo: SEO;
  @ApiPropertyOptional({ description: 'Данные о SEO-предустановках категории' })
  seo_preset?: SEOPreset
  @ApiProperty({ example: false, description: 'Признак ручного изменения SEO-параметров' })
  manual_seo: boolean;
  @ApiProperty({ description: 'Данные о черновике страницы' })
  draft: PageDraft
}

export class PagesDeletedResponse {
  @ApiProperty({ example: 'Удалено', description: 'Статус ответа' })
  status: 'Удалено';
  @ApiProperty({ example: [1, 2, 3], description: 'id удалённых страниц' })
  ids: number[];

  constructor(ids: number[]) {
    this.ids = ids
  }
}