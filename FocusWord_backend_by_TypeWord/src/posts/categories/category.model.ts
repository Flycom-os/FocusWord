import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { PostModel } from '../posts.model';
import { SEOPreset } from '../../seo/seo-presets/seo-presets.model';
import { ApiProperty } from '@nestjs/swagger';

export interface PostsCategoryCreationAttrs {
  name: string;
}

@Table({ tableName: 'posts_category' })
export class PostsCategory extends Model<PostsCategory, PostsCategoryCreationAttrs> {
  @ApiProperty({ example: 1, description: 'Уникальный идентификатор категории' })
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    unique: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({ example: 'Название категории' })
  @Column({ type: DataType.CHAR, unique: true })
  name: string;

  @ApiProperty({ example: false, description: 'Является эта категория системной?' })
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  system_category: boolean;

  @ApiProperty({ example: 1, description: 'id SEO пресета (если присвоен)' })
  @ForeignKey(() => SEOPreset)
  seo_preset_id: number;

  @ApiProperty({ type: SEOPreset, description: 'SEO пресет (если присвоен)' })
  @BelongsTo(() => SEOPreset)
  seo_preset: SEOPreset;

  @HasMany(() => PostModel, { onDelete: 'CASCADE' })
  posts: PostModel[];
}
