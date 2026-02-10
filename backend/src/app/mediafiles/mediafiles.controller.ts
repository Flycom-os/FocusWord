import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Query, Res } from '@nestjs/common';
import { MediafilesService } from './mediafiles.service';
import { CreateMediaFileDto } from '../dto/mediafiles/create-media-file.dto';
import { UpdateMediaFileDto } from '../dto/mediafiles/update-media-file.dto';
import { JwtAuthGuard } from '../../jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger'; // Added ApiQuery
import { MediafilesGuard } from "../common/guards/mediafiles.guard"; // Corrected path
import { MediafilesAccess } from "../common/decorators/mediafiles.decorator"; // Corrected path
import { ApiFileWithBody } from "../common/decorators/api-file.decorator"; // Corrected path
import { QueryMediaFileDto } from '../dto/mediafiles/query-media-file.dto'; // Import QueryMediaFileDto

@ApiBearerAuth()
@ApiTags('mediafiles')
@UseGuards(JwtAuthGuard, MediafilesGuard)
@Controller('mediafiles')
export class MediafilesController {
  constructor(private readonly mediafilesService: MediafilesService) {}

  @Post('upload')
  @MediafilesAccess(2)
  @ApiOperation({ summary: 'Upload a new media file' })
  @ApiFileWithBody('file', CreateMediaFileDto)
  @ApiResponse({ status: 201, description: 'The media file has been successfully uploaded.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './backend/uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() createMediafileDto: CreateMediaFileDto,
  ) {
    const newMediaFile = {
      filename: file.filename,
      filepath: file.path,
      mimetype: file.mimetype,
      fileSize: file.size,
      altText: createMediafileDto.altText,
      caption: createMediafileDto.caption,
      isImage: file.mimetype.startsWith('image'),
      isVideo: file.mimetype.startsWith('video'),
      isAudio: file.mimetype.startsWith('audio'),
      // uploadedById: req.user.id,
    };
    return this.mediafilesService.create(newMediaFile);
  }

  @Get('file/:filename')
  @MediafilesAccess(0)
  @ApiOperation({ summary: 'Serve a media file by filename' })
  @ApiResponse({ status: 200, description: 'The media file.' })
  @ApiResponse({ status: 404, description: 'File not found.' })
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    return res.sendFile(filename, { root: './backend/uploads' });
  }

  @Get()
  @MediafilesAccess(0)
  @ApiOperation({ summary: 'Retrieve all media files with pagination and filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term for filename or altText' })
  @ApiQuery({ name: 'mimetype', required: false, type: String, description: 'Filter by MIME type' })
  @ApiQuery({ name: 'isImage', required: false, type: Boolean, description: 'Filter for image files' })
  @ApiQuery({ name: 'isVideo', required: false, type: Boolean, description: 'Filter for video files' })
  @ApiQuery({ name: 'isAudio', required: false, type: Boolean, description: 'Filter for audio files' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Field to sort by' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of media files.',
    schema: {
      properties: {
        data: { type: 'array', items: { '$ref': '#/components/schemas/MediaFile' } }, // Assuming MediaFile is defined in global schema
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(@Query() query: QueryMediaFileDto) {
    return this.mediafilesService.findAll(query);
  }

  @Get(':id')
  @MediafilesAccess(0)
  @ApiOperation({ summary: 'Retrieve a single media file by ID' })
  @ApiResponse({ status: 200, description: 'The media file.' })
  @ApiResponse({ status: 404, description: 'Media file not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findOne(@Param('id') id: string) {
    return this.mediafilesService.findOne(+id);
  }

  @Patch(':id')
  @MediafilesAccess(1)
  @ApiOperation({ summary: 'Update a media file by ID' })
  @ApiResponse({ status: 200, description: 'The media file has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Media file not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  update(@Param('id') id: string, @Body() updateMediafileDto: UpdateMediaFileDto) {
    return this.mediafilesService.update(+id, updateMediafileDto);
  }

  @Delete(':id')
  @MediafilesAccess(2)
  @ApiOperation({ summary: 'Delete a media file by ID' })
  @ApiResponse({ status: 200, description: 'The media file has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Media file not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  remove(@Param('id') id: string) {
    return this.mediafilesService.remove(+id);
  }
}
