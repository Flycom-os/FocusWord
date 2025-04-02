import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'role_roles', createdAt: false, updatedAt: false })
export class RoleRoles extends Model<RoleRoles> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.INTEGER })
  role_id: number;

  @Column({ type: DataType.INTEGER })
  another_role_id: number;
}
