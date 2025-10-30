import { BelongsToMany, Column, DataType, Model, Table } from 'sequelize-typescript';
import { CustomModuleModules } from './module-modules.model';
import { ApiProperty } from '@nestjs/swagger';

export interface ModuleCreationAttrs {
  name: string;
  dependencies?: string[];
  role_accesses?: Array<{ access_name: string; access_display: string }>;
}

@Table({ tableName: 'custom_module', createdAt: false, updatedAt: false })
export class CustomModule extends Model<CustomModule, ModuleCreationAttrs> {
  @ApiProperty({ description: 'Уникальный идентификатор' })
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    unique: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({ description: 'Название модуля' })
  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
    primaryKey: true,
  })
  name: string;

  @ApiProperty({ description: 'Зависимости модуля' })
  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
    defaultValue: null,
  })
  dependencies: [module_name: string];

  @ApiProperty({ description: 'Доступы ролей' })
  @Column({ type: DataType.ARRAY(DataType.JSON), allowNull: false, defaultValue: [] })
  role_accesses: Array<{ access_name: string; access_display: string }>;

  @BelongsToMany(() => CustomModule, () => CustomModuleModules, 'module_id', 'another_module_id')
  dependent_modules: CustomModule[];
}
