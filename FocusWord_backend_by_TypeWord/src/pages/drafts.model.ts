import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Page } from './pages.model';
import { SEOPreset } from '../seo/seo-presets/seo-presets.model';
import { User } from '../users/user.model';
import { ApiProperty } from '@nestjs/swagger';
import { TemplateModel } from '../templates/template.model';
import { SEO } from '../seo/seo.model';
import { FilesModel } from '../files/files.model';

interface PageDraftCreationAttrs {
  title: string;
  text: string;
  status: 'DRAFT' | 'PUBLISHED' | 'WAIT_FOR_PUBLISH';
  page_id: number;
  date_to_publish: Date;
  template_id: number;
  user_id: number;
  seo_id: number;
  manual_seo: boolean;
}

@Table({ tableName: 'page_draft' })
export class PageDraft extends Model<PageDraft, PageDraftCreationAttrs> {
  @ApiProperty({ example: 1, description: 'id черновика страницы' })
  @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
  id: number;

  @ApiProperty({ example: 'Новая страница', description: 'заголовок страницы' })
  @Column({ type: DataType.STRING, allowNull: false })
  title: string;

  @ApiProperty({ example: '<h1>содержание</h1>>', description: 'содержание страницы' })
  @Column({ type: DataType.STRING })
  text: string;

  @ApiProperty({ example: 'DRAFT | PUBLISHED | WAIT_FOR_PUBLISH', description: 'Статус поста' })
  @Column({ type: DataType.STRING, allowNull: false, defaultValue: 'DRAFT' })
  status: string;

  @ApiProperty({
    example: '2023-08-17T01:23:08.069Z',
    description: 'Дата, когда опубликуется или применятся изменения поста',
  })
  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  date_to_publish: Date;

  @ApiProperty({ example: 1, description: 'id шаблона' })
  @ForeignKey(() => TemplateModel)
  template_id: number;

  @ApiProperty({ type: TemplateModel, description: 'объект шаблона' })
  @BelongsTo(() => TemplateModel)
  template: TemplateModel;

  @ForeignKey(() => FilesModel)
  image_id: number;

  @BelongsTo(() => FilesModel, { onDelete: 'SET NULL' })
  image: FilesModel;

  @ApiProperty({ example: 1, description: 'id страницы' })
  @ForeignKey(() => Page)
  page_id: number;

  @ApiProperty({ type: () => Page, description: 'объект страницы' })
  @BelongsTo(() => Page, { onDelete: 'CASCADE' })
  page: Page;

  @ForeignKey(() => SEO)
  seo_id: number;

  @BelongsTo(() => SEO)
  seo: SEO;

  @ApiProperty({ example: false })
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  manual_seo: boolean;

  @ApiProperty({ example: 1, description: 'id SEO-пресета' })
  @ForeignKey(() => SEOPreset)
  seo_preset_id: number;

  @ApiProperty({ type: SEOPreset, description: 'объект SEO-пресета' })
  @BelongsTo(() => SEOPreset)
  seo_preset: SEOPreset;

  @ApiProperty({ example: 1, description: 'id создателя/последнего редактора' })
  @ForeignKey(() => User)
  user_id: number;

  @ApiProperty({ type: User, description: 'объект создателя/последнего редактора' })
  @BelongsTo(() => User)
  user: User;
}
