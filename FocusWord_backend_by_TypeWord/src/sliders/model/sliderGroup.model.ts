import { ApiProperty } from '@nestjs/swagger';
import { Column, Model, Table, DataType, BelongsTo, HasMany, ForeignKey } from 'sequelize-typescript';
import { SliderCategoryModel } from './sliderCategory.model';
import { SliderModel } from './slide.model';

interface SliderGroupCreateAttr {
  sliderGroupName: string;
  visibility: boolean;
  sliderCategoryId: number;
}

@Table({ tableName: 'slider_group' })
export class SliderGroupModel extends Model<SliderGroupModel, SliderGroupCreateAttr> {
  @ApiProperty({
    example: '1',
    description: 'Уникальный айди группы слайдера',
  })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({
    example: 'Март',
    description: 'Название группы слайдеров',
  })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  sliderGroupName: string;

  @ApiProperty({
    example: true,
    description: 'Показывается группа в слайдере или нет',
  })
  @Column({ type: DataType.BOOLEAN, allowNull: false })
  visibility: boolean;

  @BelongsTo(() => SliderCategoryModel, { onDelete: 'CASCADE' })
  sliderCategory: SliderCategoryModel;

  @ApiProperty({
    example: '1',
    description: 'Уникальный айди категории слайдера',
  })
  @ForeignKey(() => SliderCategoryModel)
  @Column({ type: DataType.INTEGER })
  categoryId: number;

  @HasMany(() => SliderModel)
  slider: SliderModel[];
}
