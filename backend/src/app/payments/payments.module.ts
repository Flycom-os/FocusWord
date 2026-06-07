import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentGatewayController } from './payment-gateway.controller';
import { PaymentMethodController } from './payment-method.controller';
import { PaymentsController } from './payments.controller';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuthModule } from '../../user/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [
    PaymentGatewayController,
    PaymentMethodController,
    PaymentsController,
  ],
  providers: [PaymentsService, PrismaService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
