// import {
//   BadRequestException,
//   Injectable,
//   NotFoundException,
// } from "@nestjs/common";
// import { PrismaService } from '../../../../prisma/prisma/prisma.service';
// import { CreateProductDto } from "../../../dto/process.dto";
//
// @Injectable()
// export class ProcessService {
//   constructor(private prisma:PrismaService) {}
//   // cart.service.ts
//   async addToCart(userId: number, productData: CreateProductDto) {
//     const user = await this.prisma.user.findUnique({
//       where: { id: userId },
//     });
//
//     if (!user) throw new NotFoundException('User not found');
//
//     // Ищем активную корзину (например, по статусу "active" или последнюю)
//     let cart = await this.prisma.cart.findFirst({
//       where: {
//         userId,
//         status: 'active',
//       },
//     });
//
//     if (!cart) {
//       cart = await this.prisma.cart.create({
//         data: {
//           userId,
//           date: new Date().toISOString(),
//           date_delivery: '',
//           count_product: 0,
//           status: 'active',
//           date_updated: new Date().toISOString(),
//         },
//       });
//     }
//
//     const product = await this.prisma.product.create({
//       data: {
//         ...productData,
//         cartId: cart.id,
//         date_created: new Date().toISOString(),
//         date_updated: new Date().toISOString(),
//       },
//     });
//
//     // Обновим count_product в корзине
//     await this.prisma.cart.update({
//       where: { id: cart.id },
//       data: {
//         count_product: { increment: 1 },
//         date_updated: new Date().toISOString(),
//       },
//     });
//
//     return product;
//   }
// // order.service.ts
//   async createOrderFromCart(userId: number) {
//     const cart = await this.prisma.cart.findFirst({
//       where: {
//         userId,
//         status: 'active',
//       },
//       include: {
//         product: true,
//       },
//     });
//
//     if (!cart || cart.product.length === 0) {
//       throw new BadRequestException('Корзина пуста или не найдена');
//     }
//
//     // Создаем заказ
//     const order = await this.prisma.order.create({
//       data: {
//         userId,
//         date: new Date().toISOString(),
//         date_delivery: '',
//         count_product: cart.count_product,
//         status: '0',
//         total_service: '0',
//         date_created: new Date().toISOString(),
//         date_updated: new Date().toISOString(),
//         product: {
//           createMany: {
//             data: cart.product.map((p) => ({
//               image: p.image,
//               name: p.name,
//               volume: p.volume,
//               count: p.count,
//               quantity: p.quantity,
//               total_count: p.total_count,
//               date_created: new Date().toISOString(),
//               date_updated: new Date().toISOString(),
//             })),
//           },
//         },
//       },
//     });
//
//     // Очистим корзину
//     await this.prisma.product.deleteMany({
//       where: {
//         cartId: cart.id,
//       },
//     });
//
//     await this.prisma.cart.delete({
//       where: { id: cart.id },
//     });
//
//     return order;
//   }
// // order.service.ts
//   async updateOrderStatus(orderId: number) {
//     const order = await this.prisma.order.findUnique({
//       where: { id: orderId },
//     });
//
//     if (!order) throw new NotFoundException('Заказ не найден');
//
//     const newStatus = String(Number(order.status) + 1);
//
//     const updatedOrder = await this.prisma.order.update({
//       where: { id: orderId },
//       data: {
//         status: newStatus,
//         date_updated: new Date().toISOString(),
//       },
//     });
//
//
//     return updatedOrder;
//   }
//   async getCart(userId: number) {
//     const cart = await this.prisma.cart.findFirst({
//       where: {
//         userId,
//       },
//       include: {
//         product: true,
//       },
//     });
//
//     if (!cart) {
//       throw new NotFoundException('Корзина не найдена');
//     }
//
//     return cart;
//   }
//   async getOrdersByStatus(
//     userId: number,
//     comparator: 'lt' | 'gte',
//     value: number,
//   ) {
//     return this.prisma.order.findMany({
//       where: {
//         userId,
//         status: {
//           [comparator]: `${value}`, // status у тебя String в схеме
//         },
//       },
//       include: {
//         product: true,
//       },
//       orderBy: {
//         date_created: 'desc',
//       },
//     });
//   }
// }