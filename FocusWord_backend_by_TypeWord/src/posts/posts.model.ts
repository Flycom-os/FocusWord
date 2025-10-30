import { BelongsTo, Column, DataType, ForeignKey, HasOne, Model, Table } from 'sequelize-typescript';
import { PostsCategory } from './categories/category.model';
import { User } from '../users/user.model';
import { SEO } from '../seo/seo.model';
import { ApiProperty } from '@nestjs/swagger';
import { PostDraft } from './drafts.model';
import { FilesModel } from '../files/files.model';

export interface PostCreationAttrs {
  title: string;
  announce?: string;
  text?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'WAIT_FOR_PUBLISH';
  visibility: boolean;
  seo_id: number;
  manual_seo: boolean;
}

@Table({ tableName: 'post' })
export class PostModel extends Model<PostModel, PostCreationAttrs> {
  @ApiProperty({ example: 1, description: 'id страницы' })
  @Column({ type: DataType.INTEGER, autoIncrement: true, unique: true, primaryKey: true })
  id: number;

  @ApiProperty({ example: 'Новый пост', description: 'Название поста' })
  @Column({ type: DataType.STRING, allowNull: false })
  title: string;

  @ApiProperty({ example: 'Анонс', description: 'Анонс поста' })
  @Column({ type: DataType.STRING, allowNull: true, defaultValue: '' })
  announcement: string;

  @ApiProperty({ example: '<p>Текст поста</p>', description: 'Текст поста' })
  @Column({ type: DataType.TEXT, allowNull: false, defaultValue: '' })
  text: string;

  @ApiProperty({ example: 'DRAFT | PUBLISHED | WAIT_FOR_PUBLISH', description: 'Статус поста' })
  @Column({ type: DataType.STRING, allowNull: false, defaultValue: 'DRAFT' })
  status: string;

  @ApiProperty({ example: false, description: 'Видимость поста (true = открыт / false = скрыт)' })
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  visibility: boolean;

  @ForeignKey(() => FilesModel)
  image_id: number;

  @BelongsTo(() => FilesModel, { onDelete: 'SET NULL' })
  image: FilesModel;

  @ApiProperty({ example: 1, description: 'id SEO' })
  @ForeignKey(() => SEO)
  seo_id: number;

  @BelongsTo(() => SEO)
  seo: SEO;

  @ApiProperty({ example: false, description: 'Признак ручного изменения SEO-параметров' })
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  manual_seo: boolean;

  @ApiProperty({ example: 1, description: 'Уникальный идентификатор присущей посту категории' })
  @ForeignKey(() => PostsCategory)
  category_id: number;

  @BelongsTo(() => PostsCategory, { onDelete: 'CASCADE' })
  category: PostsCategory;

  @ApiProperty({ example: 1, description: 'Уникальный идентификатор создателя/последнего редактора поста' })
  @ForeignKey(() => User)
  user_id: number;

  @BelongsTo(() => User)
  user: User;

  @HasOne(() => PostDraft, { onDelete: 'CASCADE' })
  draft: PostDraft;
}
