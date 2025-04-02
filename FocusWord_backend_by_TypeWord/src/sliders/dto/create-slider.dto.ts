import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSliderDto {
  @ApiProperty({
    example: '8 марта',
    description: 'Название слайдера',
  })
  @IsString()
  sliderName: string;

  @ApiProperty({
    example: 0,
    description: 'На какой позиции слайд в группе. Уникальное для группы слайдеров',
  })
  @IsNumber()
  position: number;

  @ApiProperty({
    example: true,
    description: 'Показывается слайдер или нет',
  })
  @IsBoolean()
  visibility: boolean;

  @ApiProperty({
    example: 1,
    description: 'Уникальный айди группы слайдера',
  })
  @IsNumber()
  groupId: number;

  @ApiProperty({
    example: 1,
    description: 'Уникальный айди сжатого файла для слайдера',
  })
  @IsNumber()
  miniatureId: number;

  @ApiProperty({
    example: 1,
    description: 'Уникальный айди пользователя создавшего слайдера',
  })
  @IsNumber()
  userId: number;
}
