import { Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from '../../../../prisma/prisma.service';
import {CategoryDto} from "../../../dto/agzs.dto";


@Injectable()
export class CategoryService {
  constructor(private prisma:PrismaService) {}



  async post(user,dto:CategoryDto){

    if (user.permission !< 2){
      throw new UnauthorizedException('You haven`t privileges admin users');
    }

    const newGasBallon = await this.prisma.category.create({
      data: {
        name:dto.name,
        icon:dto.icon,
        date_created: new Date().toISOString(),
        date_updated: new Date().toISOString(),
      }
    });
    return newGasBallon;
  }


  async put(user, gas_ballon_id,dto:CategoryDto){
    if (user.permission !< 2){
      throw new UnauthorizedException('You haven`t privileges users');
    }

    const updatedGasBallon = await this.prisma.category.update({where:{id:Number(gas_ballon_id)},
    data: {
      name:dto.name,
      icon:dto.icon,
      date_updated: new Date().toISOString(),
    }})
    return updatedGasBallon;
  }



  async get(status:string,page:number, limit:number) {
    const skip = (page - 1) * limit;
    const filterCondition = status ? {
      status:{
        contains: `${status}`,
      }

    }:{};
    const total = await this.prisma.product.count({});
    const data = await this.prisma.product.findMany({
      skip,
      take:limit,
    });
    return {total, data };
  }




  async delete(user,id:number){
    if (user.permission !< 2){
      throw new UnauthorizedException('You haven`t privileges users');
    }

    const deleteRecord = await this.prisma.product.delete({where:{id:Number(id)}});
    return deleteRecord;
  }
}