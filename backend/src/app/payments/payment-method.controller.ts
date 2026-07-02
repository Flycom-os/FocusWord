import { Controller, Get, Post, Put, Delete, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { HasPermission } from '../../common/decorators/has-permission.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Payment Methods')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('payment-methods')
export class PaymentMethodController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @HasPermission('payment:0')
  @ApiOperation({ summary: 'Get all payment methods' })
  findAll() {
    return this.paymentsService.findAllMethods();
  }

  @Get(':id')
  @HasPermission('payment:0')
  @ApiOperation({ summary: 'Get payment method by ID' })
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOneMethod(+id);
  }

  @Post()
  @HasPermission('payment:2')
  @ApiOperation({ summary: 'Create payment method' })
  create(@Body() dto: any) {
    return this.paymentsService.createMethod(dto);
  }

  @Put(':id')
  @HasPermission('payment:2')
  @ApiOperation({ summary: 'Update payment method' })
  update(@Param('id') id: string, @Body() dto: any) {
    return this.paymentsService.updateMethod(+id, dto);
  }

  @Delete(':id')
  @HasPermission('payment:2')
  @ApiOperation({ summary: 'Delete payment method' })
  remove(@Param('id') id: string) {
    return this.paymentsService.deleteMethod(+id);
  }

  @Patch(':id/toggle')
  @HasPermission('payment:2')
  @ApiOperation({ summary: 'Toggle payment method status' })
  toggle(@Param('id') id: string, @Body('isEnabled') isEnabled: boolean) {
    return this.paymentsService.toggleMethod(+id, isEnabled);
  }
}
