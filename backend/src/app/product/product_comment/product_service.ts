import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

import { ShopoCommentDto, ShopsDto } from '../../../dto/shops.dto';

@Injectable()
export class ProductCommenntService {
  constructor(private prisma: PrismaService) {}

  async post(user, shop_id, dto: ShopoCommentDto) {
    if (user.permission! < 2) {
      throw new UnauthorizedException('You haven`t privileges admin users');
    }

    const newGasBallon = await this.prisma.comments.create({
      data: {
        name: dto.name,
        description: dto.description,
        image:'dto.image',
        about: dto.about,
        productId: shop_id,
        userId: Number(user.id),
        date_created: new Date().toISOString(),
        date_updated: new Date().toISOString(),
      },
    });
    return newGasBallon;
  }

  async put(user, gas_ballon_id, shop_id, dto: ShopoCommentDto) {
    const comment = await this.prisma.comments.findUnique({
      where: { id: Number(gas_ballon_id) },
    });
    if (user.permission! < 2 || user.id != comment?.userId) {
      throw new UnauthorizedException('You can not update this comment');
    }

    const updatedGasBallon = await this.prisma.comments.update({
      where: { id: Number(gas_ballon_id) },
      data: {
        name: dto.name,
        description: dto.description,
        image: dto.image,
        about: dto.about,
        productId: shop_id,
        userId: Number(user.id),
        date_updated: new Date().toISOString(),
      },
    });
    return updatedGasBallon;
  }

  async get(page: number, productId:number,shopId:number, limit: number) {
    const skip = (page - 1) * limit;
    const total = await this.prisma.comments.count({where: { productId:productId,shopsId:shopId }});
    const data = await this.prisma.comments.findMany({
      skip,
      take: limit,
      where: { productId,shopsId:shopId },
    });
    return { total, data };
  }

  async delete(user, id: number) {
    const comment = await this.prisma.comments.findUnique({
      where: { id: Number(id) },
    });
    if (user.permission! < 2 || user.id != comment?.userId) {
      throw new UnauthorizedException('You haven`t privileges users');
    }

    const deleteRecord = await this.prisma.comments.delete({
      where: { id: Number(id) },
    });
    return deleteRecord;
  }
}
