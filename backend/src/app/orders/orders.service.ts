import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderDto, GetOrdersDto } from "../../dto/cart.dto";

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(userId: number, dto: CreateOrderDto) {
    const { address, date_delivery, total_service, items } = dto;

    // Проверяем существование всех товаров
    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        throw new NotFoundException(`Товар с ID ${item.productId} не найден`);
      }

      if (product.quantity < item.quantity) {
        throw new NotFoundException(`Недостаточно товара "${product.name}" на складе`);
      }
    }

    // Создаем заказ
    const order = await this.prisma.order.create({
      data: {
        userId,
        date: new Date().toISOString(),
        status: 'pending',
        date_delivery,
        address,
        total_service,
        count_product: items.reduce((sum, item) => sum + item.quantity, 0),
        date_created: new Date().toISOString(),
        date_updated: new Date().toISOString()
      }
    });

    // Добавляем товары к заказу
    for (const item of items) {
      await this.prisma.cartandAndOrdersOnProduct.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          date_created: new Date().toISOString(),
          date_updated: new Date().toISOString()
        }
      });

      // Уменьшаем количество товара на складе
      await this.prisma.product.update({
        where: { id: item.productId },
        data: {
          quantity: {
            decrement: item.quantity
          }
        }
      });
    }

    return this.getOrderById(order.id);
  }

  async getOrders(filters: GetOrdersDto) {
    const { userId, status, page = '0', limit = '10' } = filters;
    const skip = parseInt(page) * parseInt(limit);
    const take = parseInt(limit);

    const where: any = {};
    
    if (userId) {
      where.userId = parseInt(userId);
    }
    
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take,
        include: {
          User: {
            select: {
              id: true,
              name: true,
              surname: true,
              email: true,
              phone: true
            }
          },
          product: {
            include: {
              Product: {
                include: {
                  Category: true,
                  sizes: {
                    include: {
                      ProductSize: true
                    }
                  },
                  flowers: {
                    include: {
                      Flowers: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { date_created: 'desc' }
      }),
      this.prisma.order.count({ where })
    ]);

    return {
      orders,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    };
  }

  async getOrderById(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            surname: true,
            email: true,
            phone: true
          }
        },
        product: {
          include: {
            Product: {
              include: {
                Category: true,
                sizes: {
                  include: {
                    ProductSize: true
                  }
                },
                flowers: {
                  include: {
                    Flowers: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }

    return order;
  }

  async updateOrder(orderId: number, dto: UpdateOrderDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        ...dto,
        date_updated: new Date().toISOString()
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            surname: true,
            email: true,
            phone: true
          }
        },
        product: {
          include: {
            Product: {
              include: {
                Category: true,
                sizes: {
                  include: {
                    ProductSize: true
                  }
                },
                flowers: {
                  include: {
                    Flowers: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return updatedOrder;
  }

  async deleteOrder(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        product: true
      }
    });

    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }

    // Возвращаем товары на склад
    for (const item of order.product) {
      if (item.productId) {
        await this.prisma.product.update({
          where: { id: item.productId },
          data: {
            quantity: {
              increment: 1 // Предполагаем количество 1, можно добавить поле quantity в CartandAndOrdersOnProduct
            }
          }
        });
      }
    }

    // Удаляем связи товаров с заказом
    await this.prisma.cartandAndOrdersOnProduct.deleteMany({
      where: { orderId }
    });

    // Удаляем заказ
    await this.prisma.order.delete({
      where: { id: orderId }
    });

    return { message: 'Заказ успешно удален' };
  }
}
