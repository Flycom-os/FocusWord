import { ApiProperty } from '@nestjs/swagger';
import { Column, Model, Table, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { SliderGroupModel } from './sliderGroup.model';
import { User } from '../../users/user.model';
import { MiniatureModel } from '../../files/miniature.model';

interface SliderCreateAttr {
  sliderName: string;
  position: number;
  visibility: boolean;
  groupId: number;
  fileId: number;
  userId: number;
}

@Table({ tableName: 'slider' })
export class SliderModel extends Model<SliderModel, SliderCreateAttr> {
  @ApiProperty({
    example: '1',
    description: 'Уникальный айди слайдера',
  })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({
    example: '8 марта',
    description: 'Название слайдера',
  })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  sliderName: string;

  @ApiProperty({
    example: 0,
    description: 'На какой позиции слайд в группе',
  })
  @Column({ type: DataType.INTEGER, allowNull: false })
  position: number;

  @ApiProperty({
    example: true,
    description: 'Показывается слайдер или нет',
  })
  @Column({ type: DataType.BOOLEAN, allowNull: false })
  visibility: boolean;

  @BelongsTo(() => SliderGroupModel, { onDelete: 'CASCADE' })
  sliderGroup: SliderGroupModel;

  @ApiProperty({
    example: '1',
    description: 'Уникальный айди группы слайдера',
  })
  @ForeignKey(() => SliderGroupModel)
  @Column({ type: DataType.INTEGER })
  groupId: number;

  @BelongsTo(() => MiniatureModel)
  miniature: MiniatureModel;

  @ApiProperty({
    example: '1',
    description: 'Уникальный айди сжатого файла для слайдера',
  })
  @ForeignKey(() => MiniatureModel)
  @Column({ type: DataType.INTEGER })
  miniatureId: number;

  @BelongsTo(() => User)
  user: User;

  @ApiProperty({
    example: '1',
    description: 'Уникальный айди пользователя создавшего слайдера',
  })
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  userId: number;
}
