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
  @ApiOperation({ summary: 'Get all payment gateways' })
  findAll() {
    return this.paymentsService.findAllGateways();
  }

  @Get(':id')
  @HasPermission('payment:0')
  @ApiOperation({ summary: 'Get payment gateway by ID' })
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOneGateway(+id);
  }

  @Post()
  @HasPermission('payment:2')
  @ApiOperation({ summary: 'Create payment gateway' })
  create(@Body() dto: any) {
    return this.paymentsService.createGateway(dto);
  }

  @Put(':id')
  @HasPermission('payment:2')
  @ApiOperation({ summary: 'Update payment gateway' })
  update(@Param('id') id: string, @Body() dto: any) {
    return this.paymentsService.updateGateway(+id, dto);
  }

  @Delete(':id')
  @HasPermission('payment:2')
  @ApiOperation({ summary: 'Delete payment gateway' })
  remove(@Param('id') id: string) {
    return this.paymentsService.deleteGateway(+id);
  }

  @Patch(':id/toggle')
  @HasPermission('payment:2')
  @ApiOperation({ summary: 'Toggle payment gateway status' })
  toggle(@Param('id') id: string, @Body('isEnabled') isEnabled: boolean) {
    return this.paymentsService.toggleGateway(+id, isEnabled);
  }
}
