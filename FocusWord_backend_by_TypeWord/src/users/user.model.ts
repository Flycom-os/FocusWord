import { BelongsTo, Column, DataType, ForeignKey, HasMany, Max, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../roles/role.model';
import { SliderModel } from '../sliders/model/slide.model';

interface UserCreationAttrs {
  name: string;
  email: string;
  password: string;
  superuser?: boolean;
}

@Table({ tableName: 'user' })
export class User extends Model<User, UserCreationAttrs> {
  @ApiProperty({ example: 1, description: 'уникальный идентификатор' })
  @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
  id: number;

  @ApiProperty({ example: 'Имя Фамилия', description: 'имя пользователя (не уникальное)' })
  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @ApiProperty({ example: 'test@email.com', description: 'уникальная почта' })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  email: string;

  @ApiProperty({ example: '1234qwerty', description: 'пароль' })
  @Column({ type: DataType.STRING, allowNull: false })
  password: string;

  @Column({ type: DataType.STRING, allowNull: true, unique: true })
  refresh_token: string;

  @ApiProperty({ example: false, description: 'подтверждена почта пользователя? (по умолчанию false)' })
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  is_verified: boolean;

  @ApiProperty({ example: false, description: 'забанен пользователь? (по умолчанию false)' })
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  is_banned: boolean;

  @ApiProperty({ example: 'за хулиганство', description: 'Причина блокировки (может быть пустым)' })
  @Max(256)
  @Column({ type: DataType.STRING })
  ban_reason: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  superuser: boolean;

  @ApiProperty({ example: 1, description: 'id роли' })
  @ForeignKey(() => Role)
  @Column({ type: DataType.INTEGER })
  role_id: number;

  @BelongsTo(() => Role)
  created_roles_id: number[];

  @HasMany(() => Role, { as: 'created_roles' })
  created_roles: Role[];

  @BelongsTo(() => Role)
  role: Role;

  @HasMany(() => SliderModel)
  slider: SliderModel;
}
