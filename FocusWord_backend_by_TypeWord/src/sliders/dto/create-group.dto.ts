import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty({
    example: 'Март',
    description: 'Название группы слайдеров',
  })
  @IsString()
  sliderGroupName: string;

  @ApiProperty({
    example: true,
    description: 'Показывается группа в слайдере или нет',
  })
  @IsBoolean()
  visibility: boolean;

  @ApiProperty({
    example: '1',
    description: 'Уникальный айди категории слайдера',
  })
  @IsNumber()
  categoryId: number;
}
