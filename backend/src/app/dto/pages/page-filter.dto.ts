import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';


export class PageFilterDto {
  @IsString()
  @IsOptional()
  search?: string; // Search by title or content

  @IsString()
  @IsOptional()
  status?: string; // Filter by status (e.g., 'draft', 'published', 'pending')

  @IsInt()
  @IsOptional()
  authorId?: number; // Filter by author

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1; // Current page number for pagination

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10; // Number of items per page
}
