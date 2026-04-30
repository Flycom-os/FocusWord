import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Param, 
  Body, 
  Query,
  Patch,
  HttpStatus,
  HttpException
} from '@nestjs/common';
import { RecordsService } from './records.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Controller('api/records')
export class RecordsController {
  constructor(
    private readonly recordsService: RecordsService,
    private readonly prisma: PrismaService
  ) {}

  @Get()
  async getAllRecords(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string
  ) {
    try {
      return await this.recordsService.findAll(page, limit, search);
    } catch (error) {
      throw new HttpException('Failed to fetch records', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async getRecordById(@Param('id') id: string) {
    try {
      const record = await this.recordsService.findById(parseInt(id));
      if (!record) {
        throw new HttpException('Record not found', HttpStatus.NOT_FOUND);
      }
      return record;
    } catch (error) {
      throw new HttpException('Failed to fetch record', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  async createRecord(@Body() createRecordDto: any) {
    try {
      return await this.recordsService.create(createRecordDto);
    } catch (error) {
      throw new HttpException('Failed to create record', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async updateRecord(@Param('id') id: string, @Body() updateRecordDto: any) {
    try {
      return await this.recordsService.update(parseInt(id), updateRecordDto);
    } catch (error) {
      throw new HttpException('Failed to update record', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async deleteRecord(@Param('id') id: string) {
    try {
      await this.recordsService.delete(parseInt(id));
      return { message: 'Record deleted successfully' };
    } catch (error) {
      throw new HttpException('Failed to delete record', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':id/status')
  async changeStatus(
    @Param('id') id: string,
    @Body('status') status: 'draft' | 'published'
  ) {
    try {
      return await this.recordsService.changeStatus(parseInt(id), status);
    } catch (error) {
      throw new HttpException('Failed to change record status', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
