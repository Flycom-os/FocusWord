import { Module } from '@nestjs/common';
import { RecordCategoriesController } from './record-categories.controller';
import { RecordCategoriesService } from './record-categories.service';

@Module({
  controllers: [RecordCategoriesController],
  providers: [RecordCategoriesService],
  exports: [RecordCategoriesService],
})
export class RecordCategoriesModule {}
