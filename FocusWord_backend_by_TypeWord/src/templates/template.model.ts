import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';

export interface TemplateModelCreationAttrs {
  name: string;
}

@Table({ tableName: 'template' })
export class TemplateModel extends Model<TemplateModel, TemplateModelCreationAttrs> {
  @Column({ type: DataType.INTEGER, unique: true, allowNull: false, autoIncrement: true, primaryKey: true })
  id: number;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  @ApiProperty({ example: 'Default', description: 'Название шаблона' })
  name: string;
}
