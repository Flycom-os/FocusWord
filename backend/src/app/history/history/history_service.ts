// import { Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
// import { PrismaService } from '../../../../prisma/prisma/prisma.service';
// import { Gass_ballonDto } from "../../../dto/techical_gass/gass_ballon.dto";
// import { Gass_ballon_commentsDto } from "../../../dto/techical_gass/gas_ballon_comments.dto"
// import { AGZSDto, AGZSPhotoDto, ApplicationDto, MainPhotoGalaryDto } from "../../../dto/product.dto";
// import { CommentsDto } from "../../../dto/comments.dto";
// import { NewsDto } from "../../../dto/news.dto";
// import { HistoryDto } from "../../../dto/history.dto";
//
// @Injectable()
// export class HistoryService {
//   constructor(private prisma:PrismaService) {}
//   // ЗАКОММЕНТИРОВАНО - метод обращается к несуществующим таблицам Prisma
//   /*
//   // ЗАКОММЕНТИРОВАНО - метод обращается к несуществующим таблицам Prisma
//   /*
//
//
//   async post(user,dto:HistoryDto){
//
//     if (user.permission !< 2){
//       throw new UnauthorizedException('You haven`t privileges admin users');
//     }
//   */
//   */
//     const newGasBallon = await this.prisma.history_company.create({
//       data: {
//         image:dto.image,
//         description:dto.description,
//         year:dto.year,
//         date_created: new Date().toISOString(),
//         date_updated: new Date().toISOString(),
//       }
//     });
//     return newGasBallon;
//   }
//   // ЗАКОММЕНТИРОВАНО - метод обращается к несуществующим таблицам Prisma
//   /*
//   // ЗАКОММЕНТИРОВАНО - метод обращается к несуществующим таблицам Prisma
//   /*
//
//
//   async put(user, gas_ballon_id,dto:HistoryDto){
//     if (user.permission !< 2){
//       throw new UnauthorizedException('You haven`t privileges users');
//     }
//   */
//   */
//     const updatedGasBallon = await this.prisma.history_company.update({where:{id:Number(gas_ballon_id)},
//     data: {
//       image:dto.image,
//       description:dto.description,
//       year:dto.year,
//       date_updated: new Date().toISOString(),
//     }})
//     return updatedGasBallon;
//   }
//   // ЗАКОММЕНТИРОВАНО - метод обращается к несуществующим таблицам Prisma
//   /*
//   // ЗАКОММЕНТИРОВАНО - метод обращается к несуществующим таблицам Prisma
//   /*
//
//
//   async get(status:string,page:number, limit:number) {
//     const skip = (page - 1) * limit;
//     const total = await this.prisma.news.count({});
//     const data = await this.prisma.history_company.findMany({
//       skip,
//       take:limit,
//     }
//   */
//   */);
//     return {total, data };
//   }
//   // ЗАКОММЕНТИРОВАНО - метод обращается к несуществующим таблицам Prisma
//   /*
//   // ЗАКОММЕНТИРОВАНО - метод обращается к несуществующим таблицам Prisma
//   /*
//
//
//
//   async delete(user,id:number){
//     if (user.permission !< 2){
//       throw new UnauthorizedException('You haven`t privileges users');
//     }
//   */
//   */
//     const deleteRecord = await this.prisma.history_company.delete({where:{id:Number(id)}});
//     return deleteRecord;
//   }
// }