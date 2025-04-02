import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGroupDto {
  @ApiProperty({
    example: '1',
    description: 'Уникальный айди группы слайдера',
  })
  @IsNumber()
  groupId: number;

  @ApiPropertyOptional({
    example: 'Март',
    description: 'Название группы слайдеров',
  })
  @IsOptional()
  @IsString()
  sliderGroupName: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Показывается группа в слайдере или нет',
  })
  @IsOptional()
  @IsBoolean()
  visibility: boolean;

  @ApiPropertyOptional({
    example: '1',
    description: 'Уникальный айди категории слайдера',
  })
  @IsOptional()
  @IsNumber()
  categoryId: number;
}
