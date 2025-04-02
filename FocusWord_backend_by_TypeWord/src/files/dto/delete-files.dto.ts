import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsNumber } from 'class-validator';
import { FilesModel } from '../files.model';
import { MiniatureModel } from '../miniature.model';

export class DeleteFilesDto {
  @ApiPropertyOptional({
    example: [1],
    description: 'Удаляемые айди файлов(-а)',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  readonly files_id: number[];
}

export class DeleteFilePathDto extends FilesModel {
  readonly filepath: string;
  readonly image: boolean;
  readonly miniature: MiniatureModel;
}
