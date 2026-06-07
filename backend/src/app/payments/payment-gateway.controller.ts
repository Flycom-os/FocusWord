import { Controller, Get, Post, Put, Delete, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { HasPermission } from '../../common/decorators/has-permission.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Payment Gateways')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('payment-gateways')
export class PaymentGatewayController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @HasPermission('payment:0')
  @ApiOperation({ summary: 'Получить все платежные шлюзы' })
  findAll() {
    return this.paymentsService.findAllGateways();
  }

  @Get(':id')
  @HasPermission('payment:0')
  @ApiOperation({ summary: 'Получить платежный шлюз по ID' })
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOneGateway(+id);
  }

  @Post()
  @HasPermission('payment:2')
  @ApiOperation({ summary: 'Создать платежный шлюз' })
  create(@Body() dto: any) {
    return this.paymentsService.createGateway(dto);
  }

  @Put(':id')
  @HasPermission('payment:2')
  @ApiOperation({ summary: 'Обновить платежный шлюз' })
  update(@Param('id') id: string, @Body() dto: any) {
    return this.paymentsService.updateGateway(+id, dto);
  }

  @Delete(':id')
  @HasPermission('payment:2')
  @ApiOperation({ summary: 'Удалить платежный шлюз' })
  remove(@Param('id') id: string) {
    return this.paymentsService.deleteGateway(+id);
  }

  @Patch(':id/toggle')
  @HasPermission('payment:2')
  @ApiOperation({ summary: 'Включить/выключить платежный шлюз' })
  toggle(@Param('id') id: string, @Body('isEnabled') isEnabled: boolean) {
    return this.paymentsService.toggleGateway(+id, isEnabled);
  }
}
