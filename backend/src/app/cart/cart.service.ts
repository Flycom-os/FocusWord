import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from '../../../prisma/prisma.service';
import { AddToCartDto, UpdateCartItemDto } from "../../dto/cart.dto";

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async addToCart(userId: number, dto: AddToCartDto) {
    const { productId, quantity } = dto;

    // Проверяем существование товара
    const product = await this.prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new NotFoundException('Товар не найден');
    }

    // Проверяем количество товара
    if (product.quantity < quantity) {
      throw new NotFoundException('Недостаточно товара на складе');
    }

    // Ищем существующую корзину пользователя
    let cart = await this.prisma.cart.findFirst({
      where: { 
        userId,
        status: 'active'
      }
    });

    // Если корзины нет, создаем новую
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          userId,
          date: new Date().toISOString(),
          status: 'active',
          date_delivery: '',
          count_product: 0,
          date_updated: new Date().toISOString()
        }
      });
    }

    // Проверяем, есть ли уже этот товар в корзине
    const existingItem = await this.prisma.cartandAndOrdersOnProduct.findFirst({
      where: {
        cartId: cart.id,
        productId
      }
    });

    if (existingItem) {
      // Обновляем количество
      await this.prisma.cartandAndOrdersOnProduct.update({
        where: { id: existingItem.id },
        data: {
          date_updated: new Date().toISOString()
        }
      });
    } else {
      // Добавляем новый товар
      await this.prisma.cartandAndOrdersOnProduct.create({
        data: {
          cartId: cart.id,
          productId,
          date_created: new Date().toISOString(),
          date_updated: new Date().toISOString()
        }
      });
    }

    // Обновляем общее количество товаров в корзине
    const totalItems = await this.prisma.cartandAndOrdersOnProduct.count({
      where: { cartId: cart.id }
    });

    await this.prisma.cart.update({
      where: { id: cart.id },
      data: {
        count_product: totalItems,
        date_updated: new Date().toISOString()
      }
    });

    return this.getCart(userId);
  }

  async getCart(userId: number) {
    const cart = await this.prisma.cart.findFirst({
      where: { 
        userId,
        status: 'active'
      },
      include: {
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

    if (!cart) {
      return {
        id: null,
        items: [],
        totalItems: 0,
        totalPrice: 0
      };
    }

    return cart;
  }

  async updateCartItem(userId: number, itemId: number, dto: UpdateCartItemDto) {
    const cart = await this.prisma.cart.findFirst({
      where: { 
        userId,
        status: 'active'
      }
    });

    if (!cart) {
      throw new NotFoundException('Корзина не найдена');
    }

    const cartItem = await this.prisma.cartandAndOrdersOnProduct.findFirst({
      where: {
        id: itemId,
        cartId: cart.id
      },
      include: {
        Product: true
      }
    });

    if (!cartItem) {
      throw new NotFoundException('Товар в корзине не найден');
    }

    // Проверяем количество товара на складе
    if (cartItem.Product && cartItem.Product.quantity < dto.quantity) {
      throw new NotFoundException('Недостаточно товара на складе');
    }

    await this.prisma.cartandAndOrdersOnProduct.update({
      where: { id: itemId },
      data: {
        date_updated: new Date().toISOString()
      }
    });

    return this.getCart(userId);
  }

  async removeFromCart(userId: number, itemId: number) {
    const cart = await this.prisma.cart.findFirst({
      where: { 
        userId,
        status: 'active'
      }
    });

    if (!cart) {
      throw new NotFoundException('Корзина не найдена');
    }

    const cartItem = await this.prisma.cartandAndOrdersOnProduct.findFirst({
      where: {
        id: itemId,
        cartId: cart.id
      }
    });

    if (!cartItem) {
      throw new NotFoundException('Товар в корзине не найден');
    }

    await this.prisma.cartandAndOrdersOnProduct.delete({
      where: { id: itemId }
    });

    // Обновляем общее количество товаров в корзине
    const totalItems = await this.prisma.cartandAndOrdersOnProduct.count({
      where: { cartId: cart.id }
    });

    await this.prisma.cart.update({
      where: { id: cart.id },
      data: {
        count_product: totalItems,
        date_updated: new Date().toISOString()
      }
    });

    return this.getCart(userId);
  }

  async clearCart(userId: number) {
    const cart = await this.prisma.cart.findFirst({
      where: { 
        userId,
        status: 'active'
      }
    });

    if (!cart) {
      throw new NotFoundException('Корзина не найдена');
    }

    // Удаляем все товары из корзины
    await this.prisma.cartandAndOrdersOnProduct.deleteMany({
      where: { cartId: cart.id }
    });

    // Обновляем корзину
    await this.prisma.cart.update({
      where: { id: cart.id },
      data: {
        count_product: 0,
        date_updated: new Date().toISOString()
      }
    });

    return { message: 'Корзина очищена' };
  }
}
