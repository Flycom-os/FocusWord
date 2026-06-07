import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard } from '../../jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { HasPermission } from '../../common/decorators/has-permission.decorator';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  create(@Body() dto: any) {
    return this.feedbackService.create(dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Get()
  @HasPermission('feedback:0')
  findAll() {
    return this.feedbackService.findAll();
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Get(':id')
  @HasPermission('feedback:0')
  findOne(@Param('id') id: string) {
    return this.feedbackService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Delete(':id')
  @HasPermission('feedback:2')
  remove(@Param('id') id: string) {
    return this.feedbackService.delete(+id);
  }
}
