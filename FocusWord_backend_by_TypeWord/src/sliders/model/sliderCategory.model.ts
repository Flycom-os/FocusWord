import { ApiProperty } from '@nestjs/swagger';
import { Column, Model, Table, DataType, HasMany } from 'sequelize-typescript';
import { SliderGroupModel } from './sliderGroup.model';

interface SliderCategoryCreateAttr {
  sliderCategoryName: string;
  imageRation: number[];
  slideTime: number;
  shortcode: string;
}

@Table({ tableName: 'slider_category' })
export class SliderCategoryModel extends Model<SliderCategoryModel, SliderCategoryCreateAttr> {
  @ApiProperty({
    example: '1',
    description: 'Уникальный айди  категории слайдера',
  })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({
    example: 'Вессение акции',
    description: 'Название категории слайдеров',
  })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  sliderCategoryName: string;

  @ApiProperty({
    example: '[3, 2]',
    description: 'Cоотношение картинки, требуемое для корректного отображения в слайдере',
  })
  @Column({ type: DataType.ARRAY(DataType.INTEGER), allowNull: false })
  imageRation: number[];

  @ApiProperty({
    example: '100',
    description: 'Время смены слайда в миллисекндах',
  })
  @Column({ type: DataType.INTEGER, allowNull: false })
  slideTime: number;

  @ApiProperty({
    example: 'какой-то код',
    description: 'Код компонента слайдера',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  shortcode: string;

  @HasMany(() => SliderGroupModel)
  sliderGroup: SliderGroupModel[];
}
