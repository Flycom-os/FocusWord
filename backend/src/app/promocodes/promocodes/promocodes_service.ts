import { Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from '../../../../prisma/prisma.service';
import {PromocodesDto} from "../../../dto/for_key.dto";

@Injectable()
export class ForKeyService {
  constructor(private prisma:PrismaService) {}
  async post(user,dto:PromocodesDto){

    if (user.permission !< 2){
      throw new UnauthorizedException('You haven`t privileges admin users');
    }
    const newGasBallon = await this.prisma.promocodes.create({
      data: {
        address:dto.promocode,
        date_expired:dto.date_expired,
        date_created: new Date().toISOString(),
        date_updated: new Date().toISOString(),
      }
    });
    return newGasBallon;
  }
  async put(user, gas_ballon_id,dto:PromocodesDto){
    if (user.permission !< 2){
      throw new UnauthorizedException('You haven`t privileges users');
    }

    const updatedGasBallon = await this.prisma.promocodes.update({where:{id:Number(gas_ballon_id)},
    data: {
      address:dto.promocode,
      date_expired:dto.date_expired,
      date_updated: new Date().toISOString(),
    }})
    return updatedGasBallon;
  }

  async get(page:number, limit:number) {
    const skip = (page - 1) * limit;
    const total = await this.prisma.promocodes.count({});
    const data = await this.prisma.promocodes.findMany({
      skip,
      take:limit,
    }
  );
    return {total, data };
  }

  async delete(user,id:number){
    if (user.permission !< 2){
      throw new UnauthorizedException('You haven`t privileges users');
    }
    const deleteRecord = await this.prisma.promocodes.delete({where:{id:Number(id)}});
    return deleteRecord;
  }
}