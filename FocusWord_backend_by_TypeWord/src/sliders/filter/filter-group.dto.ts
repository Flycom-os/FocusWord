import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class FilterGroupDto {
	@ApiPropertyOptional({ example: 'Имя группы', type: String })
	@IsOptional()
	@IsString()
	sliderGroupName?: object;

	@ApiProperty({
		example: 1,
		description: 'Айди категории слайдеров',
	  })
	  @IsNumber()
	  @Type(() => Number)
	  categoryId: number;
}