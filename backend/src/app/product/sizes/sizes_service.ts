import { Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from '../../../../prisma/prisma.service';
import {ProductSizeDto, SizesProductDto} from "../../../dto/agzs.dto";

@Injectable()
export class SizesService {
  constructor(private prisma:PrismaService) {}
  async post(user,dto:ProductSizeDto){

    if (user.permission !< 2){
      throw new UnauthorizedException('You haven`t privileges admin users');
    }
    const newGasBallon = await this.prisma.productSize.create({
      data: {
        name:dto.name,
        size:dto.size,
        date_created: new Date().toISOString(),
        date_updated: new Date().toISOString(),
      }
    });
    return newGasBallon;
  }

  async put(user, gas_ballon_id,dto:ProductSizeDto){
    if (user.permission !< 2){
      throw new UnauthorizedException('You haven`t privileges users');
    }
    const updatedGasBallon = await this.prisma.productSize.update({where:{id:Number(gas_ballon_id)},
    data: {
      name:dto.name,
      size:dto.size,
      date_updated: new Date().toISOString(),
    }})
    return updatedGasBallon;
  }


  async get(page:number, limit:number) {
    const skip = (page - 1) * limit;
    const total = await this.prisma.product.count({});
    const data = await this.prisma.productSize.findMany({
      skip,
      take:limit,
    });
    return {total, data };
  }


  async delete(user,id:number){
    if (user.permission !< 2){
      throw new UnauthorizedException('You haven`t privileges users');
    }

    const deleteRecord = await this.prisma.productSize.delete({where:{id:Number(id)}});
    return deleteRecord;
  }
  async postConnect(user,dto:SizesProductDto){

    if (user.permission !< 2){
      throw new UnauthorizedException('You haven`t privileges admin users');
    }
    const newGasBallon = await this.prisma.sizesProduct.create({
      data: {
        productSizeId:dto.productSizeId,
        productId:dto.productId,
        date_created: new Date().toISOString(),
        date_updated: new Date().toISOString(),
      }
    });
    return newGasBallon;
  }

  async putConnect(user, gas_ballon_id,dto:SizesProductDto){
    if (user.permission !< 2){
      throw new UnauthorizedException('You haven`t privileges users');
    }
    const updatedGasBallon = await this.prisma.sizesProduct.update({where:{id:Number(gas_ballon_id)},
      data: {
        productSizeId:dto.productSizeId,
        productId:dto.productId,
        date_updated: new Date().toISOString(),
      }})
    return updatedGasBallon;
  }


  async getConnect(productId, sizeId,page:number, limit:number) {
    const skip = (page - 1) * limit;
    const total = await this.prisma.product.count({});
    const data = await this.prisma.sizesProduct.findMany({
      where:{productId:Number(productId), productSizeId:Number(sizeId)},
      skip,
      take:limit,
    });
    return {total, data };
  }


  async deleteConnect(user,id:number){
    if (user.permission !< 2){
      throw new UnauthorizedException('You haven`t privileges users');
    }

    const deleteRecord = await this.prisma.sizesProduct.delete({where:{id:Number(id)}});
    return deleteRecord;
  }
}