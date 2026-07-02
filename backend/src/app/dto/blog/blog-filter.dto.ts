import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class BlogFilterDto {
  @IsString() @IsOptional()
  search?: string;

  @IsString() @IsOptional()
  status?: string;

  @IsInt() @IsOptional()
  authorId?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  limit?: number = 10;
}
