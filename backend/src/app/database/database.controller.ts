import {
  Controller,
  Get,
  Post,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { DatabaseService } from './database.service';
import { JwtAuthGuard } from '../../jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { HasPermission } from '../../common/decorators/has-permission.decorator';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Database')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('database')
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get('export')
  @HasPermission('settings:0')
  @ApiOperation({ summary: 'Export database and media to ZIP' })
  async exportDatabase(@Res() res: Response) {
    try {
      const zipBuffer = await this.databaseService.exportDatabase();
      res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="database-backup-${new Date().toISOString().split('T')[0]}.zip"`,
      });
      res.send(zipBuffer);
    } catch (error) {
      throw new HttpException(
        'Failed to export database',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('import')
  @HasPermission('settings:2')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Import database and media from ZIP' })
  async importDatabase(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('File is required', HttpStatus.BAD_REQUEST);
    }
    try {
      await this.databaseService.importDatabase(file.buffer);
      return { success: true, message: 'Database imported successfully' };
    } catch (error) {
      throw new HttpException(
        'Failed to import database',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
