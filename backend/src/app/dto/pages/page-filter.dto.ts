import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';


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

  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1; // Current page number for pagination

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10; // Number of items per page
}
