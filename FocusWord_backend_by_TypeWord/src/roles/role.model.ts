import { BelongsTo, BelongsToMany, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../users/user.model';
import { RoleRoles } from './role-roles.model';
import { RoleAccessPropertiesInterface } from './interfaces/role-access-properties.interface';

interface RoleCreationAttrs {
  name: string;
  accesses?: RoleAccessPropertiesInterface;
  system_role: boolean;
  role_creator_id?: number;
  roles_accessed: number[];
  files_module_access: boolean;
}

@Table({ tableName: 'role' })
export class Role extends Model<Role, RoleCreationAttrs> {
  @ApiProperty({ example: 1, description: 'уникальный идентификатор' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({ example: 'SMM-менеджер', description: 'название роли' })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  name: string;

  @Column({ type: DataType.JSON, allowNull: false, defaultValue: {} })
  accesses: RoleAccessPropertiesInterface;

  @ApiProperty({ example: false, description: 'Является ли роль системной?' })
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  system_role: boolean;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  role_creator_id: number;

  @BelongsTo(() => User, { onDelete: 'NO ACTION', as: 'role_creator' })
  role_creator: User;

  @HasMany(() => User, { onDelete: 'RESTRICT', as: 'users' })
  users: User[];

  @BelongsToMany(() => Role, () => RoleRoles, 'role_id', 'another_role_id')
  roles_accessed: Role[];
}
