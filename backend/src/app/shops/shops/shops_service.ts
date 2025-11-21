import { Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from '../../../../prisma/prisma.service';
import { ShopsDto } from "../../../dto/shops.dto";

@Injectable()
export class OffersService {
  constructor(private prisma:PrismaService) {}



  async post(user,dto:ShopsDto){

    if (user.permission !< 2){
      throw new UnauthorizedException('You haven`t privileges admin users');
    }

    const newGasBallon = await this.prisma.shops.create({
      data: {
        locate: dto.locate,
        name : dto.name,
        abount: dto.abount,
        stats: dto.stats,
        date_created: new Date().toISOString(),
        date_updated: new Date().toISOString(),
      }
    });
    return newGasBallon;
  }



  async put(user, gas_ballon_id,dto:ShopsDto){
    if (user.permission !< 2){
      throw new UnauthorizedException('You haven`t privileges users');
    }

    const updatedGasBallon = await this.prisma.shops.update({where:{id:Number(gas_ballon_id)},
    data: {
      locate: dto.locate,
      name : dto.name,
      abount: dto.abount,
      stats: dto.stats,
      date_updated: new Date().toISOString(),
    }})
    return updatedGasBallon;
  }



  async get(page:number, limit:number) {
    const skip = (page - 1) * limit;
    const total = await this.prisma.shops.count({});
    const data = await this.prisma.shops.findMany({
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

    const deleteRecord = await this.prisma.shops.delete({where:{id:Number(id)}});
    return deleteRecord;
  }
}