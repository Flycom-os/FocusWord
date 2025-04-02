import { BelongsTo, Column, DataType, ForeignKey, HasOne, Model, Table } from 'sequelize-typescript';
import { User } from '../users/user.model';
import { SEO } from '../seo/seo.model';
import { SEOPreset } from '../seo/seo-presets/seo-presets.model';
import { PageDraft } from './drafts.model';
import { ApiProperty } from '@nestjs/swagger';
import { TemplateModel } from '../templates/template.model';
import { FilesModel } from '../files/files.model';

export interface PageCreationAttrs {
  title: string;
  text: string;
  status: 'DRAFT' | 'PUBLISHED' | 'WAIT_FOR_PUBLISH';
  draft_id: number;
  seo_id: number;
  seo_preset_id?: number;
  template_id?: number;
  user_id: number;
  manual_seo: boolean;
}

@Table({ tableName: 'page' })
export class Page extends Model<Page, PageCreationAttrs> {
  @ApiProperty({ example: 1, description: 'id страницы' })
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

  @ApiProperty({ example: 1, description: 'id SEO' })
  @ForeignKey(() => SEO)
  seo_id: number;

  @ApiProperty({ type: SEO, description: 'объект SEO' })
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

  @ApiProperty({ type: PageDraft, description: 'объект черновика страницы' })
  @HasOne(() => PageDraft, { onDelete: 'CASCADE' })
  draft: PageDraft;
}
