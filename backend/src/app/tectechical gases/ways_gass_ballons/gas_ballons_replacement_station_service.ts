// import { Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
// import { PrismaService } from '../../../../prisma/prisma/prisma.service';
// import { Gass_ballon_replacementDto } from "../../../dto/techical_gass/ways_ballons_replacement.dto";
//
//
// @Injectable()
// export class GasBallonsReplacementStationService {
//   constructor(private prisma:PrismaService) {}
//   async post(user,dto:Gass_ballon_replacementDto){
//
//     if (user.permission !< 2){
//       throw new UnauthorizedException('You haven`t privileges admin users');
//     }
//     const newGasBallon = await this.prisma.ways_replace_ballons.create({
//       data: {
//         name:dto.name,
//         ways:dto.ways,
//         description:dto.description,
//         date_created: new Date().toISOString(),
//         date_updated: new Date().toISOString(),
//       }
//     });
//     return newGasBallon;
//   }
//   async put(user, gas_ballon_id,dto:Gass_ballon_replacementDto){
//     if (user.permission !< 2){
//       throw new UnauthorizedException('You haven`t privileges users');
//     }
//     const updatedGasBallon = await this.prisma.ways_replace_ballons.update({where:{id:Number(gas_ballon_id)},
//     data: {
//       name:dto.name,
//       ways:dto.ways,
//       description:dto.description,
//       date_updated: new Date().toISOString(),
//     }})
//     return updatedGasBallon;
//   }
//   async get(page:number, limit:number) {
//     const skip = (page - 1) * limit;
//     const total = await this.prisma.ways_replace_ballons.count({});
//     const data = await this.prisma.ways_replace_ballons.findMany({
//       skip,
//       take:limit,
//     });
//     return {total, data };
//   }
//
//   async delete(user,id:number){
//     if (user.permission !< 2){
//       throw new UnauthorizedException('You haven`t privileges users');
//     }
//     const deleteRecord = await this.prisma.ways_replace_ballons.delete({where:{id:Number(id)}});
//     return deleteRecord;
//   }
// }