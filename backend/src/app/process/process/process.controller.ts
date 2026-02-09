// import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
// import {
//   Body,
//   Controller, Get,
//   Param, Patch,
//   Post,
//   UseGuards,
// } from "@nestjs/common";
// import { JwtAuthGuard } from "../../../jwt-auth.guard";
// import { ProcessService } from "./process_service";
// import { CreateProductDto } from "../../../dto/process.dto";
// import { GetUserId } from "../../../user/auth/get-user-id.decorator";
//
// @UseGuards(JwtAuthGuard)
// @ApiTags("Process")
// @ApiBearerAuth()
// @Controller("process")
// export class ProcessController {
//   constructor(private cartService: ProcessService) {
//   }
//   @Post('add')
//   async addProductToCart(
//     @GetUserId() userId: number,
//     @Body() productDto: CreateProductDto,
//   ) {
//     return this.cartService.addToCart(userId, productDto);
//   }
//   @Post('create')
//   async createOrder(@GetUserId() userId: number) {
//     return this.cartService.createOrderFromCart(userId);
//   }
//
//   @Patch(':orderId/status')
//   async updateStatus(@Param('orderId') orderId: string) {
//     return this.cartService.updateOrderStatus(+orderId);
//   }
//   @Get('/cart')
//   async getCartWithProducts(@GetUserId() userId: number) {
//     return this.cartService.getCart(userId);
//   }
//
//   @Get('active')
//   async getActiveOrders(@GetUserId() userId: number) {
//     return this.cartService.getOrdersByStatus(userId, 'lt', 4);
//   }
//
//   @Get('history')
//   async getCompletedOrders(@GetUserId() userId: number) {
//     return this.cartService.getOrdersByStatus(userId, 'gte', 4);
//   }
//
// }
