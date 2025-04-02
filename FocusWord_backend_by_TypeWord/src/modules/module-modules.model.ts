import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'custom_module_modules',
  createdAt: false,
  updatedAt: false,
})
export class CustomModuleModules extends Model<CustomModuleModules> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.INTEGER })
  module_id: number;

  @Column({ type: DataType.INTEGER })
  another_module_id: number;
}
