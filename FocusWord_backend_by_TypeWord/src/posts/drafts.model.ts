import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { SEO } from '../seo/seo.model';
import { PostsCategory } from './categories/category.model';
import { User } from '../users/user.model';
import { PostModel } from './posts.model';
import { FilesModel } from '../files/files.model';

export interface PostDraftCreationAttrs {
  title: string;
  announcement?: string;
  text?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'WAIT_FOR_PUBLISH';
  visibility: boolean;
  date_to_publish?: Date;
  manual_seo: boolean;
}

@Table({ tableName: 'post_draft' })
export class PostDraft extends Model<PostDraft, PostDraftCreationAttrs> {
  @Column({ type: DataType.INTEGER, autoIncrement: true, unique: true, primaryKey: true })
  id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  title: string;

  @Column({ type: DataType.STRING, allowNull: true, defaultValue: '' })
  announcement: string;

  @Column({ type: DataType.TEXT, allowNull: true, defaultValue: '' })
  text: string;

  @Column({ type: DataType.STRING, allowNull: false, defaultValue: 'DRAFT' })
  status: 'DRAFT' | 'PUBLISHED' | 'WAIT_FOR_PUBLISH';

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  visibility: boolean;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  date_to_publish: Date;

  @ForeignKey(() => FilesModel)
  image_id: number;

  @BelongsTo(() => FilesModel, { onDelete: 'SET NULL' })
  image: FilesModel;

  @ForeignKey(() => SEO)
  seo_id: number;

  @BelongsTo(() => SEO)
  seo: SEO;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  manual_seo: boolean;

  @ForeignKey(() => PostsCategory)
  category_id: number;

  @BelongsTo(() => PostsCategory)
  category: PostsCategory;

  @ForeignKey(() => User)
  user_id: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => PostModel)
  post_id: number;

  @BelongsTo(() => PostModel, { onDelete: 'CASCADE' })
  post: PostModel;
}
