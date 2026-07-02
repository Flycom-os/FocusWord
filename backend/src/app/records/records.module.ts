import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RecordsController } from './records.controller';
import { PublicRecordsController } from './public-records.controller';
import { RecordsService } from './records.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'kkll',
    }),
  ],
  controllers: [RecordsController, PublicRecordsController],
  providers: [RecordsService],
  exports: [RecordsService],
})
export class RecordsModule {}
