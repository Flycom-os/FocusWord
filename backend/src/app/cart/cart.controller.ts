import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  Body,
  Controller, Delete, Get,
  Param, Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../jwt-auth.guard";
import { GetUserId } from "../../user/auth/get-user-id.decorator";
import { AddToCartDto, UpdateCartItemDto } from "../../dto/cart.dto";
import { CartService } from "./cart.service";

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Получить корзину пользователя' })
  getCart(@GetUserId() userId: number) {
    return this.cartService.getCart(userId);
  }

  @Post('add')
  @ApiOperation({ summary: 'Добавить товар в корзину' })
  addToCart(@GetUserId() userId: number, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(userId, dto);
  }

  @Patch('item/:itemId')
  @ApiOperation({ summary: 'Обновить количество товара в корзине' })
  updateCartItem(
    @GetUserId() userId: number,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto
  ) {
    return this.cartService.updateCartItem(userId, parseInt(itemId), dto);
  }

  @Delete('item/:itemId')
  @ApiOperation({ summary: 'Удалить товар из корзины' })
  removeFromCart(@GetUserId() userId: number, @Param('itemId') itemId: string) {
    return this.cartService.removeFromCart(userId, parseInt(itemId));
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Очистить корзину' })
  clearCart(@GetUserId() userId: number) {
    return this.cartService.clearCart(userId);
  }
}
