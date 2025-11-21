import { Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from '../../../../prisma/prisma.service';
import {ProductDto} from "../../../dto/agzs.dto";


@Injectable()
export class ProductService {
  constructor(private prisma:PrismaService) {}



  async post(user,dto:ProductDto){

    if (user.permission !< 2){
      throw new UnauthorizedException('You haven`t privileges admin users');
    }


    const newGasBallon = await this.prisma.product.create({
      data: {
        image:dto.image,
        name:dto.name,
        color:dto.color,
        volume:dto.volume,
        amount:Number(dto.amount),
        count:Number(dto.count),
        quantity:Number(dto.quantity),
        total_count:Number(dto.total_count),
        categoryId:Number(dto.categoryId),
        date_updated: new Date().toISOString(),
        date_created: new Date().toISOString(),
      }
    });
    return newGasBallon;
  }



  async put(user, gas_ballon_id,dto:ProductDto){
    if (user.permission !< 2){
      throw new UnauthorizedException('You haven`t privileges users');
    }

    const updatedGasBallon = await this.prisma.product.update({where:{id:Number(gas_ballon_id)},
    data: {
      image:dto.image,
      name:dto.name,
      color:dto.color,
      volume:dto.volume,
      amount:Number(dto.amount),
      count:Number(dto.count),
      quantity:Number(dto.quantity),
      total_count:Number(dto.total_count),
      categoryId:Number(dto.categoryId),
      date_updated: new Date().toISOString(),
    }})
    return updatedGasBallon;
  }

  async get(
      name?: string,
      categories?: number[],
      price_from?: number,
      price_to?: number,
      color?: string,
      flowers?: number[],   // массив id цветков
      sizes?: number[],
      page: number = 1,
      limit: number = 10
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    // Поиск по названию
    if (name) {
      where.name = {
        contains: name,
        mode: "insensitive",
      };
    }

    // Фильтр по категориям
    if (categories?.length) {
      where.categoryId = { in: categories };
    }

    // Фильтр по цене
    if (price_from !== undefined || price_to !== undefined) {
      where.amount = {};
      if (price_from !== undefined) where.amount.gte = price_from;
      if (price_to !== undefined) where.amount.lte = price_to;
    }

    // Фильтр по цвету (строка)
    if (color) {
      where.color = {
        equals: color,
        mode: "insensitive",
      };
    }

    // Фильтр по цветкам (массив id)
    if (flowers?.length) {
      where.flowers = {
        some: {
          flowersId: { in: flowers },
        },
      };
    }

    // Фильтр по размерам
    if (sizes?.length) {
      where.productSizeId = { in: sizes };
    }

    const total = await this.prisma.product.count({ where });

    const data = await this.prisma.product.findMany({
      where,
      skip,
      take: limit,
      include: {
        Category: true,
        sizes: true,
        flowers: {
          include: {
            Flowers: true,
          },
        },
      },
    });

    return { total, data };
  }



  async delete(user,id:number){
    if (user.permission !< 2){
      throw new UnauthorizedException('You haven`t privileges users');
    }

    const deleteRecord = await this.prisma.product.delete({where:{id:Number(id)}});
    return deleteRecord;
  }

}