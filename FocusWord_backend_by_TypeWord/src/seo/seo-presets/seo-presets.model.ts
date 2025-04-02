import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';

export interface SeoPresetsCreationAttrs {
  name: string;
  seo_title?: string;
  seo_description?: string;
  system_preset?: boolean;
}

@Table({ tableName: 'seo_preset', createdAt: false, updatedAt: false })
export class SEOPreset extends Model<SEOPreset, SeoPresetsCreationAttrs> {
  @ApiProperty({ example: 1, description: 'уникальный идентификатор' })
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true })
  id: number;

  @ApiProperty({ example: 'Новый SEO пресет' })
  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  name: string;

  @ApiProperty({ example: 'SEO заголовок' })
  @Column({ type: DataType.STRING, allowNull: true, defaultValue: null })
  seo_title: string;

  @ApiProperty({ example: 'SEO описание' })
  @Column({ type: DataType.STRING, allowNull: true, defaultValue: null })
  seo_description: string;

  @ApiProperty({ example: false, description: 'Является этот SEO пресет системным?' })
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  system_preset: boolean;
}
