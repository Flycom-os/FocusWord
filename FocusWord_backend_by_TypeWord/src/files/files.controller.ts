import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateFilesDto } from './dto/create-files.dto';
import { ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DeleteFilesDto } from './dto/delete-files.dto';
import { UpdateFilesDto } from './dto/update-files.dto';
import { FilesModel } from './files.model';
import { GetFileDto, GetFilePagination, GetMiniatureDto } from './response-dto/file-upload.dto';
import { FilterFileDto } from './dto/filter-file.dto';
import {
  FileDeleteErrorResponse,
  FileISEResponse,
  FileUpdateErrorResponse,
  MiniatureUpdateErrorResponse,
} from './response-dto/error-Server';
import { FileNotFoundResponse } from './response-dto/error-NotFound';
import { FileBadRequestResponse } from './response-dto/error-BadRequest';
import { RolesGuard } from '../roles/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RoleProperties } from '../roles/roles.decorator';
import { GetFileIntf, GetForPageIntf } from './interfaces/service.interfaces';

@ApiTags('Файлы')
@Controller('files')
export class FilesController {
  constructor(private filesService: FilesService) { }

  /**uploading/creating a new file*/
  @UsePipes(new ValidationPipe())
  @RoleProperties({ files_module_access: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Загрузка нового файла' })
  @ApiResponse({ status: 201, type: FilesModel })
  @ApiResponse({ status: 500, type: FileISEResponse })
  @Post('/new_file')
  @UseInterceptors(FileInterceptor('file')) //название элемента в объекте содержащий файл
  createMediaFiles(@Body() dto: CreateFilesDto, @UploadedFile() file: any): Promise<FilesModel> {
    return this.filesService.createFiles(file, dto);
  }

  //GET
  /**getting a static path to the original file*/
  @RoleProperties({ files_module_access: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Получение пути к оригинальному файлу' })
  @ApiResponse({ status: 200, type: GetFileDto })
  @ApiResponse({ status: 404, type: FileNotFoundResponse })
  @Get('/get_file_origin/:id')
  getMediaFileOrigin(@Param('id', new ParseIntPipe()) id: number): Promise<GetFileIntf> {
    return this.filesService.getFileOrigin(id);
  }

  /**getting a static path to the compressed file/miniature*/
  @RoleProperties({ files_module_access: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Получение пути к сжатому файлу ' })
  @ApiResponse({ status: 200, type: GetMiniatureDto })
  @ApiResponse({ status: 404, type: FileNotFoundResponse })
  @ApiResponse({ status: 400, type: FileBadRequestResponse })
  @Get('/get_file_miniature/:id')
  getFileMiniature(@Param('id', new ParseIntPipe()) id: number): Promise<GetFileIntf> {
    return this.filesService.getFileMiniature(id);
  }

  /**getting all information about the file*/
  @RoleProperties({ files_module_access: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Получение всей информации о файле' })
  @ApiResponse({ status: 200, type: FilesModel })
  @ApiResponse({ status: 404, type: FileNotFoundResponse })
  @Get('/get_file_info/:id')
  getFileInfo(@Param('id', new ParseIntPipe()) id: number): Promise<FilesModel> {
    return this.filesService.getFileInfo(id);
  }

  /**Getting files for pagination and search*/
  @UsePipes(new ValidationPipe())
  @RoleProperties({ files_module_access: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Получение файлов для пагинации и поиска' })
  @ApiResponse({ status: 200, type: GetFilePagination })
  @ApiResponse({ status: 400, type: FileBadRequestResponse })
  @Get('/search/:current_page/:per_page')
  getForPage(
    @Param('current_page', new ParseIntPipe()) current_page: number,
    @Param('per_page', new ParseIntPipe()) per_page: number,
    @Query() fileFilter: FilterFileDto,
  ): Promise<FilesModel | GetForPageIntf<FilesModel>> {
    return this.filesService.getForPage(current_page, per_page, fileFilter);
  }

  //DELETE
  /**deleting one or more files*/
  @UsePipes(new ValidationPipe())
  @RoleProperties({ files_module_access: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Удаление файла (-ов)' })
  @ApiResponse({ status: 200, type: GetFilePagination })
  @ApiResponse({ status: 404, type: FileNotFoundResponse })
  @ApiResponse({ status: 500, type: FileDeleteErrorResponse })
  @Delete('/delete')
  delete(@Body() dto: DeleteFilesDto): Promise<number[]> {
    return this.filesService.delete(dto);
  }

  //PATCH
  /**Updating seo attributes, file compression*/
  @UsePipes(new ValidationPipe())
  @RoleProperties({ files_module_access: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Обновление атрибутов, сжатия файла, имени' })
  @ApiResponse({ status: 200, type: FilesModel })
  @ApiResponse({ status: 404, type: FileNotFoundResponse })
  @ApiResponse({ status: 400, type: FileBadRequestResponse })
  @ApiResponse({ status: 500, type: MiniatureUpdateErrorResponse })
  @ApiResponse({ status: 500, type: FileUpdateErrorResponse })
  @Patch('/update')
  update(@Body() dto: UpdateFilesDto): Promise<FilesModel> {
    return this.filesService.updateFile(dto);
  }
}
