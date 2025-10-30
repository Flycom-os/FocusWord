import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PageBaseDto {
  @ApiProperty({ example: 1, description: 'Id страницы' })
  id: number
  @ApiProperty({ example: 'Новая страница', description: 'Заголовок страницы' })
  title: string
  @ApiProperty({ example: '<h1>Содержимое страницы</h1>', description: 'Контент страницы' })
  text: string
  @ApiProperty({ example: 'DRAFT', description: 'Статус страницы' })
  status: 'DRAFT' | 'WAIT_FOR_PUBLISH' | 'PUBLISHED'
  @ApiProperty({ example: false, description: 'Ручная модификация SEO-пресета' })
  manual_seo: boolean
  @ApiProperty({ example: '2023-08-17T01:23:08.069Z', description: 'Дата создания страницы' })
  createdAt: Date
  @ApiProperty({ example: '2023-08-17T01:23:08.069Z', description: 'Дата обновления страницы' })
  updatedAt: Date
  @ApiPropertyOptional( { example: 1, description: 'Id шаблона страницы' })
  template_id: number | null
  @ApiProperty({ example: 1, description: 'Id SEO страницы' })
  seo_id: number
  @ApiPropertyOptional({ example: 1, description: 'Id SEO-пресета страницы' })
  seo_preset_id: number | null
  @ApiProperty({ example: 1, description: 'Id создателя/последнего редактора страницы' })
  user_id: number
}