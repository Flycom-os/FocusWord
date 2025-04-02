import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FilesModel } from '../files.model';
//Dto for files
export class GetFileDto {
  @ApiProperty({
    example: 'E:\\project\\admin-panel\\staticdata\\uploaded\\новый5634534.png',
    description: 'Полный путь к оригинальному файлу',
  })
  readonly file_path: string;
}

export class GetMiniatureDto {
  @ApiProperty({
    example: 'E:\\project\\admin-panel\\staticdata\\optimized\\новый5634534.webp',
    description: 'Полный путь к сжатому файлу',
  })
  readonly file_path: string;
}

export class GetFilePagination {
  @ApiPropertyOptional({
    example: 2,
    description: 'Номер подгружаемой страницы',
  })
  total_page: number;

  @ApiPropertyOptional({
    example: ['files will be here'],
    description: 'Файл для подгрузки',
  })
  rows: FilesModel[];
}
