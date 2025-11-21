import { Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from '../../../../prisma/prisma.service';
import { BallonDto } from "../../../dto/ballons/ballon.dto";

@Injectable()
export class GasBallonsService {
  constructor(private prisma:PrismaService) {}
  async post(user,dto:BallonDto){

    if (user.permission !< 2){
      throw new UnauthorizedException('You haven`t privileges admin users');
    }
    const newGasBallon = await this.prisma.flowers.create({
      data: {
        name:dto.name,
        date_created: new Date().toISOString(),
        date_updated: new Date().toISOString(),
      }
    });
    return newGasBallon;
  }
  async put(user, gas_ballon_id,dto:BallonDto){
    if (user.permission !< 2){
      throw new UnauthorizedException('You haven`t privileges users');
    }
    const updatedGasBallon = await this.prisma.flowers.update({where:{id:Number(gas_ballon_id)},
    data: {
      name:dto.name,
      date_created: new Date().toISOString(),
    }})
    return updatedGasBallon;
  }
  async get(page:number, limit:number) {
    const skip = (page - 1) * limit;
    const total = await this.prisma.flowers.count({});
    const data = await this.prisma.flowers.findMany({
      skip,
      take:limit,
    });
    return {total, data };
  }

  async delete(user,id:number){
    if (user.permission !< 2){
      throw new UnauthorizedException('You haven`t privileges users');
    }
    const deleteRecord = await this.prisma.flowers.delete({where:{id:Number(id)}});
    return deleteRecord;
  }


}