import { ApiProperty } from '@nestjs/swagger';
import { Column, Model, Table, DataType, HasOne } from 'sequelize-typescript';
import { MiniatureModel } from './miniature.model';

interface FilesCreateAttr {
  name: string;
  filename: string;
  filepath: string;
  filepathSystem: string;
}

@Table({ tableName: 'files' })
export class FilesModel extends Model<FilesModel, FilesCreateAttr> {
  @ApiProperty({ example: '1', description: 'Уникальный айди файла' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  image: boolean;

  @ApiProperty({ example: 'file', description: 'Имя файла' })
  @Column({ type: DataType.STRING, allowNull: false })
  filename: string;

  @ApiProperty({
    example: '2131Кб',
    description: 'Размер загруженного файла в гигабайтах/мегабайтах/килобайтах/',
  })
  @Column({ type: DataType.STRING, defaultValue: 'unknown' })
  size: string;

  @ApiProperty({
    example: 'http://localhost:5000/staticdata/uploaded/file34.png',
    description: 'Полный путь к файлу',
  })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  filepath: string;

  @ApiProperty({
    example: '...staticdata/uploaded/file34.png',
    description: 'Путь файла на диске',
  })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  filepathSystem: string;

  @ApiProperty({
    example: 'атрибуты',
    description: 'Атрибуты для сео. Если отсутсвует значение Null',
  })
  @Column({ type: DataType.STRING, allowNull: true })
  alt: string | null;

  @HasOne(() => MiniatureModel)
  miniature: MiniatureModel;
}
