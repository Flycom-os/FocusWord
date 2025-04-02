import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FilesModel } from './files.model';
import { MiniatureModel } from './miniature.model';
import * as path from 'path';
import * as fs from 'fs';
import * as sharp from 'sharp';
import { CreateFilesDto } from './dto/create-files.dto';
import { FilesDto } from './dto/files.dto';
import { allowedFileMimeTypes, allowedImageMimeTypes, miniaturePath, miniatureSystemPath } from './const-files';
import { MiniatureDto } from './dto/miniature.dto';
import { DeleteFilePathDto, DeleteFilesDto } from './dto/delete-files.dto';
import { UpdateFilesDto } from './dto/update-files.dto';
import { FilterFileDto } from './dto/filter-file.dto';
import { Op } from 'sequelize';
import {
  FileCreateErrorResponse,
  FileCreateMiniatureErrorResponse,
  FileDeleteErrorResponse,
  FileUpdateErrorResponse,
  MiniatureUpdateErrorResponse,
} from './response-dto/error-Server';
import { FileDeleteIdExceptionResponse, FileIdExceptionResponse } from './response-dto/error-NotFound';
import { FileImageNotBool, FileNotBeCompressed } from './response-dto/error-BadRequest';
import * as process from 'process';
import { GetFileIntf, GetForPageIntf, MiniatureInfoIntf, WriteNewFileIntrf } from './interfaces/service.interfaces';

@Injectable()
export class FilesService {
  /**paths for saving downloaded and compressed images/files*/
  private _fileStaticOptPath: string;
  private _fileStaticPath: string;
  private static _fileOptPath: string = path.resolve('staticdata/optimized');
  private static _filePath: string = path.resolve('staticdata/uploaded');
  /**path to the system miniature*/
  private _minPath: string;
  private _minSystemPath: string = path.resolve(miniatureSystemPath);
  /**System errors*/
  private _err: string;
  constructor(
    @InjectModel(FilesModel) private filesRep: typeof FilesModel,
    @InjectModel(MiniatureModel) private miniatureRep: typeof MiniatureModel,
  ) {
    this._fileStaticOptPath = `http://localhost:${process.env.PORT}/staticdata/optimized/`;
    this._fileStaticPath = `http://localhost:${process.env.PORT}/staticdata/uploaded/`;
    this._minPath = `http://localhost:${process.env.PORT}/staticdata/${miniaturePath}`;
    if (!fs.existsSync(FilesService._fileOptPath) && !fs.existsSync(FilesService._filePath)) {
      fs.mkdirSync(FilesService._fileOptPath, { recursive: true });
      fs.mkdirSync(FilesService._filePath, { recursive: true });
    }
  }
  /**to display errors in the response to a query without showing system errors*/
  private _throwError(message: string): never {
    this._err = message;
    throw new Error(message);
  }

  /**returns a size up to Gigabytes*/
  private _generateFileSize(size: number): string {
    if (size < 1024) {
      return size + ' bytes';
    } else if (size < 1024 * 1024) {
      const kilobytes: string = (size / 1024).toFixed(2);
      return kilobytes + ' KB';
    } else if (size < 1024 * 1024 * 1024) {
      const megabytes: string = (size / (1024 * 1024)).toFixed(2);
      return megabytes + ' MB';
    } else {
      const gigabytes: string = (size / (1024 * 1024 * 1024)).toFixed(2);
      return gigabytes + ' GB';
    }
  }

  /**image compression*/
  private async _writeMiniature(compression: number, fileName: string, filePath: string): Promise<MiniatureInfoIntf> {
    try {
      const compressionNum = Number(compression);
      if (compressionNum < 0 || compressionNum > 100 || !Number.isInteger(compressionNum)) {
        this._throwError('Используйте compression от 0 до 100');
      }
      const miniatureFileName: string = path.parse(fileName).name + '.webp';
      const outFileOptPath: string = path.join(FilesService._fileOptPath, miniatureFileName);
      await sharp(filePath).webp({ quality: compressionNum }).toFile(outFileOptPath);
      //размер файла
      const fileStats = fs.statSync(outFileOptPath);
      const miniatureSize: string = this._generateFileSize(fileStats.size);
      //путь который будет на раздачу статики
      const miniatureStaticPath: string = this._fileStaticOptPath + miniatureFileName;

      return {
        miniaturePath: miniatureStaticPath,
        miniaturePathSystem: outFileOptPath,
        miniatureSize: miniatureSize,
      };
    } catch (error) {
      throw new FileCreateMiniatureErrorResponse(this._err);
    }
  }

  /**file writing*/
  private async _writeNewFiles(file: any, fileName: string, compression: number): Promise<WriteNewFileIntrf> {
    try {
      let image: boolean;
      let miniatureInfo: MiniatureInfoIntf = { miniaturePath: null, miniatureSize: null, miniaturePathSystem: null };

      //file information
      const fileOriginalInfo = path.parse(file.originalname);
      fileName = fileName + fileOriginalInfo.ext
      const outFilePath: string = path.join(FilesService._filePath, fileName);

      //check for allowed file types from const-files.ts
      if (
        allowedImageMimeTypes.includes(fileOriginalInfo.ext.toLowerCase()) &&
        compression
      ) {
        image = true;
      } else if (
        allowedFileMimeTypes.includes(fileOriginalInfo.ext.toLowerCase())
      ) {
        image = false;
      } else {
        this._throwError('Неверный формат файла');
      }

      fs.writeFileSync(outFilePath, file.buffer);

      if (image && compression !== undefined) {
        miniatureInfo = await this._writeMiniature(compression, fileName, outFilePath);
      } else if (image && !compression) {
        this._throwError('Укажите сжатие для файла');
      } else if (!image && compression) {
        this._throwError('Сжатие не поддерживается');
      }

      //the path that will be on the static distribution
      const fileStaticPath: string = this._fileStaticPath + fileName;
      return {
        image: image,
        filePath: fileStaticPath,
        filepathSystem: outFilePath,
        miniatureInfo: miniatureInfo,
      };
    } catch (error) {
      throw new FileCreateErrorResponse(this._err);
    }
  }

  private async _deleteFile(delFile: DeleteFilePathDto[]): Promise<void> {
    for (let i = 0; i < delFile.length; i++) {
      fs.unlinkSync(delFile[i].filepathSystem);
      if (delFile[i].image) {
        fs.unlinkSync(delFile[i].miniature.filepathSystem);
      }
    }
  }

  async getMiniatureById(id: number) {
    return await this.miniatureRep.findByPk(id);
  }

  /**POST'/new_file'*/
  async createFiles(fileUploaded: any, dto: CreateFilesDto): Promise<FilesModel> {
    const fileNameDb: string = dto.filename + Date.now()

    const newFileInfo: WriteNewFileIntrf = await this._writeNewFiles(fileUploaded, fileNameDb, dto.compression);
    const newFileDto: FilesDto = {
      image: newFileInfo.image,
      filename: dto.filename,
      size: this._generateFileSize(fileUploaded.size),
      filepath: newFileInfo.filePath,
      filepathSystem: newFileInfo.filepathSystem,
      alt: dto.alt,
    };
    const newMiniatureDto: MiniatureDto = {
      size: newFileInfo.miniatureInfo.miniatureSize,
      filepath: newFileInfo.miniatureInfo.miniaturePath || this._minPath,
      filepathSystem: newFileInfo.miniatureInfo.miniaturePathSystem || this._minSystemPath,
    };
    //one-to-one
    const new_file: FilesModel = await this.filesRep.create(newFileDto);
    await new_file.$create('miniature', newMiniatureDto);

    return new_file;
  }

  //GET
  async getFileOrigin(id: number) {
    const file: FilesModel = await this.filesRep.findOne({ where: { id } });
    if (!file) {
      throw new FileIdExceptionResponse();
    }
    const filePath: GetFileIntf = { file_path: file.filepath };
    return filePath;
  }
  //необходимо ли получение файла при запросе миниатюры ?
  async getFileMiniature(id: number): Promise<GetFileIntf> {
    const file: FilesModel = await this.filesRep.findOne({
      where: { id },
      include: { model: MiniatureModel },
    });
    if (!file) {
      throw new FileIdExceptionResponse();
    } else if (!file.image) {
      throw new FileNotBeCompressed();
    }
    return { file_path: file.miniature.filepath };
  }

  /**get full information about file and miniature*/
  async getFileInfo(id: number): Promise<FilesModel> {
    const file: FilesModel = await this.filesRep.findOne({
      where: { id },
      include: { model: MiniatureModel },
    });
    if (!file) {
      throw new FileIdExceptionResponse();
    }
    return file;
  }

  /**get files for pagination*/
  async getForPage(
    page: number,
    per_page: number,
    fileFilter: FilterFileDto,
  ): Promise<FilesModel | GetForPageIntf<FilesModel>> {
    //boolean check
    if (fileFilter.image && fileFilter.image !== 'true' && fileFilter.image !== 'false') {
      throw new FileImageNotBool();
    }

    if (fileFilter.filename) {
      fileFilter.filename = { [Op.substring]: fileFilter.filename };
    }

    const offset: number = (page - 1) * per_page;
    return await this.filesRep
      .findAndCountAll({
        limit: per_page,
        offset: offset,
        where: { ...fileFilter },
        include: {
          model: MiniatureModel,
          as: 'miniature',
          attributes: ['size', 'filepath'],
        },
        order: ['createdAt'],
      })
      .then(({ rows, count }) => ({
        current_page: page,
        total_pages: Math.ceil(count / per_page),
        count: count,
        rows: rows,
      }));
  }

  //DELETE
  /**delete one or more files*/
  async delete(files: DeleteFilesDto): Promise<number[]> {
    const delFiles: FilesModel[] = await this.filesRep.findAll({
      where: { id: files.files_id },
      attributes: ['image', 'filepathSystem'],
      include: {
        model: MiniatureModel,
        as: 'miniature',
        attributes: ['filepathSystem'],
      },
    });
    if (delFiles.length === 0) {
      throw new FileDeleteIdExceptionResponse();
    }
    await this._deleteFile(delFiles);

    try {
      await this.filesRep.destroy({
        where: {
          id: files.files_id,
        },
      });

      return files.files_id;
    } catch (e) {
      throw new FileDeleteErrorResponse(e);
    }
  }

  //PATCH
  /**update seo attributes and compression file*/
  async updateFile(dto: UpdateFilesDto): Promise<FilesModel> {
    const file: FilesModel = await this.filesRep.findOne({
      where: { id: dto.file_id },
      include: { model: MiniatureModel },
    });
    //errors
    if (!file) {
      throw new FileIdExceptionResponse();
    }
    if (dto.compression && !file.image) {
      throw new FileNotBeCompressed();
    }

    //filename
    if (dto.filename) {
      file.filename = dto.filename
    }

    //seo attribute update
    if (dto.alt) {
      file.alt = dto.alt;
    }
    //compressed file update
    if (dto.compression && file.image) {
      const miniatureInfo: MiniatureInfoIntf = await this._writeMiniature(
        dto.compression,
        file.filename,
        file.filepathSystem,
      );
      file.miniature.size = miniatureInfo.miniatureSize;
      try {
        await file.miniature.save();
      } catch (e) {
        throw new MiniatureUpdateErrorResponse(e);
      }
    }
    try {
      await file.save();
      return file;
    } catch (e) {
      throw new FileUpdateErrorResponse(e);
    }
  }
}
