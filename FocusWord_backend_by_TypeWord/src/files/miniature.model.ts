import { ApiProperty } from '@nestjs/swagger';
import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { FilesModel } from './files.model';
import { SliderModel } from '../sliders/model/slide.model';

interface MiniatureAttr {
  name: string;
  filename: string;
  filepath: string;
  filepathSystem: string;
}

@Table({ tableName: 'miniature' })
export class MiniatureModel extends Model<MiniatureModel, MiniatureAttr> {
  @ApiProperty({ example: '1', description: 'Уникальный айди миниатюры' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({
    example: '12.11Кб',
    description: 'Размер сжатого файла',
  })
  @Column({ type: DataType.STRING, defaultValue: 'unknown', allowNull: true })
  size: string | null;

  @ApiProperty({
    example: 'http://localhost:5000/staticdata/uploaded/file34.webp',
    description: 'Полный путь к сжатому файлу',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  filepath: string;

  @ApiProperty({
    example: '...staticdata/optimized/file34.webp',
    description: 'Путь сжатого файла на диске',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  filepathSystem: string;

  @BelongsTo(() => FilesModel, { onDelete: 'CASCADE' })
  file: FilesModel;

  @ApiProperty({
    example: '1',
    description: 'Id оригинального файла',
  })
  @ForeignKey(() => FilesModel)
  fileId: number;

  @HasMany(() => SliderModel)
  slider: SliderModel;
}
