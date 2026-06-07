import { Controller, Post, Body } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Public } from '../../common/decorators/public.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Payments Operations')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Public()
  @Post('yoomoney/create')
  @ApiOperation({ summary: 'Создать платежную сессию ЮMoney' })
  async createYooMoneyPayment(
    @Body() dto: { amount: number; description: string; email: string; name?: string }
  ) {
    return this.paymentsService.createYooMoneyPayment({
      amount: dto.amount,
      description: dto.description,
      email: dto.email,
      customerName: dto.name,
    });
  }
}
