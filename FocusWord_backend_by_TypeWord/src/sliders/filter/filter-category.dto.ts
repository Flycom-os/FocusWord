import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FilterCategoryDto {
	@ApiPropertyOptional({ example: 'Имя категории', type: String })
	@IsOptional()
	@IsString()
	sliderCategoryName?: object;
}