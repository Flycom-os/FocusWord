import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';

export interface SeoCreationAttrs {
  seo_title?: string;
  seo_label?: string;
  seo_keywords?: string[];
  seo_description?: string;
}

@Table({ tableName: 'seo', createdAt: false, updatedAt: false })
export class SEO extends Model<SEO, SeoCreationAttrs> {
  @ApiProperty({ example: 1, description: 'уникальный идентификатор' })
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true })
  id: number;

  @ApiProperty({ example: 'SEO заголовок' })
  @Column({ type: DataType.STRING, allowNull: true, defaultValue: null })
  seo_title: string;

  @ApiProperty({ example: 'SEO ярлык' })
  @Column({ type: DataType.STRING, allowNull: true, defaultValue: null })
  seo_label: string;

  @ApiProperty({ example: ['ключевое слово 1'] })
  @Column({ type: DataType.ARRAY(DataType.STRING), defaultValue: [] })
  seo_keywords: string[];

  @ApiProperty({ example: 'SEO описание' })
  @Column({ type: DataType.STRING, allowNull: true, defaultValue: null })
  seo_description: string;
}
