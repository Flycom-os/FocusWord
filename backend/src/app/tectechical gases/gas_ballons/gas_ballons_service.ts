// import { Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
// import { PrismaService } from '../../../../prisma/prisma/prisma.service';
// import { Gass_ballonDto } from "../../../dto/techical_gass/gass_ballon.dto";
// import { Gass_ballon_commentsDto } from "../../../dto/techical_gass/gas_ballon_comments.dto"
//
// @Injectable()
// export class GasBallonsService {
//   constructor(private prisma:PrismaService) {}
//   async post(user,dto:Gass_ballonDto){
//
//     if (user.permission !< 2){
//       throw new UnauthorizedException('You haven`t privileges admin users');
//     }
//     const newGasBallon = await this.prisma.technical_gass.create({
//       data: {
//         image:dto.image,
//         name:dto.name,
//         volume:dto.volume,
//         description:dto.description,
//         date_created: new Date().toISOString(),
//         date_updated: new Date().toISOString(),
//       }
//     });
//     return newGasBallon;
//   }
//   async put(user, gas_ballon_id,dto:Gass_ballonDto){
//     if (user.permission !< 2){
//       throw new UnauthorizedException('You haven`t privileges users');
//     }
//     const updatedGasBallon = await this.prisma.technical_gass.update({where:{id:Number(gas_ballon_id)},
//     data: {
//       image:dto.image,
//       name:dto.name,
//       volume:dto.volume,
//       description:dto.description,
//       date_updated: new Date().toISOString(),
//     }})
//     return updatedGasBallon;
//   }
//   async get(volume:string,page:number, limit:number) {
//     const skip = (page - 1) * limit;
//     const filterCondition = volume ? {
//       volume:{
//         contains: `${volume}`,
//       },
//     }:{};
//     const total = await this.prisma.technical_gass.count({where:filterCondition});
//     const data = await this.prisma.technical_gass.findMany({
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
//     const deleteRecord = await this.prisma.technical_gass.delete({where:{id:Number(id)}});
//     return deleteRecord;
//   }
//   // Создание комментария
//   async postComment(user, technical_gass_id: number, dto: Gass_ballon_commentsDto) {
//     if (user.permission < 1) {
//       throw new UnauthorizedException('You unauthorized');
//     }
//
//     try {
//       const newComment = await this.prisma.comment.create({
//         data: {
//           name: String(user.email), // ✅ исправлено
//           text: dto.text,
//           raiting: dto.raiting,
//           technical_gassId: Number(technical_gass_id),
//           date_created: new Date().toISOString(),
//           date_updated: new Date().toISOString(),
//         },
//       });
//
//       return newComment;
//
//     } catch (error) {
//       console.error('🔥 Ошибка при создании комментария:', error);
//       throw new InternalServerErrorException('Что-то пошло не так при создании комментария');
//     }
//   }
//
//
//   async getCommentsByBallonId(technical_gass_id: number) {
//     return await this.prisma.comment.findMany({
//       where: {
//         technical_gassId: Number(technical_gass_id),
//       },
//       orderBy: {
//         date_created: 'desc',
//       }
//     });
//   }
//
// }