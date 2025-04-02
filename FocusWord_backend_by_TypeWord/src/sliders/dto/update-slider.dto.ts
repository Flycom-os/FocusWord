import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSliderDto {
  @ApiProperty({
    example: '1',
    description: 'Уникальный айди слайдера',
  })
  @IsNumber()
  id: number;

  @ApiPropertyOptional({
    example: '8 марта',
    description: 'Название слайдера',
  })
  @IsOptional()
  @IsString()
  sliderName: string;

  @ApiPropertyOptional({
    example: 0,
    description: 'На какой позиции слайд в группе',
  })
  @IsOptional()
  @IsNumber()
  position: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Показывается слайдер или нет',
  })
  @IsOptional()
  @IsBoolean()
  visibility: boolean;

  @ApiPropertyOptional({
    example: '1',
    description: 'Уникальный айди группы слайдера',
  })
  @IsOptional()
  @IsNumber()
  groupId: number;

  @ApiPropertyOptional({
    example: '1',
    description: 'Уникальный айди сжатого файла для слайдера',
  })
  @IsOptional()
  @IsNumber()
  fileId: number;

  @ApiPropertyOptional({
    example: '1',
    description: 'Уникальный айди пользователя обновившего слайдер',
  })
  @IsOptional()
  @IsNumber()
  userId: number;
}
