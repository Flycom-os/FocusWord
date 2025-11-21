import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  Body,
  Controller, Delete, Get,
  Param, Patch,
  Post, Query,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../jwt-auth.guard";
import { GetUserId } from "../../user/auth/get-user-id.decorator";
import { CreateOrderDto, UpdateOrderDto, GetOrdersDto } from "../../dto/cart.dto";
import { OrdersService } from "./orders.service";

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новый заказ' })
  createOrder(@GetUserId() userId: number, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить заказы с фильтрацией' })
  getOrders(@Query() filters: GetOrdersDto) {
    return this.ordersService.getOrders(filters);
  }

  @Get('my')
  @ApiOperation({ summary: 'Получить заказы текущего пользователя' })
  getMyOrders(@GetUserId() userId: number, @Query() filters: Partial<GetOrdersDto>) {
    return this.ordersService.getOrders({ ...filters, userId: userId.toString() });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить заказ по ID' })
  getOrderById(@Param('id') id: string) {
    return this.ordersService.getOrderById(parseInt(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить заказ' })
  updateOrder(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.ordersService.updateOrder(parseInt(id), dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить заказ' })
  deleteOrder(@Param('id') id: string) {
    return this.ordersService.deleteOrder(parseInt(id));
  }
}
