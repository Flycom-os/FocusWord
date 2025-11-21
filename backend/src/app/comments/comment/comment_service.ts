// import { Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
// import { PrismaService } from '../../../../prisma/prisma/prisma.service';
// import { Gass_ballonDto } from "../../../dto/techical_gass/gass_ballon.dto";
// import { Gass_ballon_commentsDto } from "../../../dto/techical_gass/gas_ballon_comments.dto"
// import { AGZSDto, AGZSPhotoDto, ApplicationDto, MainPhotoGalaryDto } from "../../../dto/agzs.dto";
// import { CommentsDto } from "../../../dto/comments.dto";
//
// @Injectable()
// export class CommentsService {
//   constructor(private prisma:PrismaService) {}
//   async post(user,dto:CommentsDto){
//
//     if (user.permission !< 2){
//       throw new UnauthorizedException('You haven`t privileges admin users');
//     }
//     const newGasBallon = await this.prisma.comments.create({
//       data: {
//         name:dto.name,
//         image:dto.image,
//         description:dto.description,
//         about:dto.about,
//         date_created: new Date().toISOString(),
//         date_updated: new Date().toISOString(),
//       }
//     });
//     return newGasBallon;
//   }
//   async put(user, gas_ballon_id,dto:CommentsDto){
//     if (user.permission !< 2){
//       throw new UnauthorizedException('You haven`t privileges users');
//     }
//     const updatedGasBallon = await this.prisma.comments.update({where:{id:Number(gas_ballon_id)},
//     data: {
//       name:dto.name,
//       image:dto.image,
//       description:dto.description,
//       about:dto.about,
//       date_updated: new Date().toISOString(),
//     }})
//     return updatedGasBallon;
//   }
//   async get(status:string,page:number, limit:number) {
//     const skip = (page - 1) * limit;
//     const filterCondition = status ? {
//       description:{
//         contains: `${status}`,
//       },
//     }:{};
//     const total = await this.prisma.comments.count({where:filterCondition});
//     const data = await this.prisma.comments.findMany({
//       where:filterCondition,
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
//     const deleteRecord = await this.prisma.comments.delete({where:{id:Number(id)}});
//     return deleteRecord;
//   }
// }