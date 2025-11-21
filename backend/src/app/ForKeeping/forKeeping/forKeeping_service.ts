// import { Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
// import { PrismaService } from '../../../../prisma/prisma/prisma.service';
// import { Gass_ballonDto } from "../../../dto/techical_gass/gass_ballon.dto";
// import { Gass_ballon_commentsDto } from "../../../dto/techical_gass/gas_ballon_comments.dto"
// import { AGZSDto, AGZSPhotoDto, ApplicationDto, MainPhotoGalaryDto } from "../../../dto/product.dto";
// import { CommentsDto } from "../../../dto/comments.dto";
// import { ForKeepingDto, ShopsDto } from "../../../dto/shops.dto";
//
// @Injectable()
// export class ForKeepingService {
//   constructor(private prisma:PrismaService) {}
//   // ЗАКОММЕНТИРОВАНО - метод обращается к несуществующим таблицам Prisma
//   /*
//   // ЗАКОММЕНТИРОВАНО - метод обращается к несуществующим таблицам Prisma
//   /*
//
//
//   async post(user,dto:ForKeepingDto){
//
//     if (user.permission !< 2){
//       throw new UnauthorizedException('You haven`t privileges admin users');
//     }
//   */
//   */
//     const newGasBallon = await this.prisma.for_keeping.create({
//       data: {
//         status:dto.status,
//         name:dto.name,
//         street:dto.street,
//         price:Number(dto.price),
//         price_in_offer:Number(dto.price_in_offer),
//         position1:dto.position1,
//         position2:dto.position2,
//         position3:dto.position3,
//         position4:dto.position4,
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
//   async put(user, gas_ballon_id,dto:ForKeepingDto){
//     if (user.permission !< 2){
//       throw new UnauthorizedException('You haven`t privileges users');
//     }
//   */
//   */
//     const updatedGasBallon = await this.prisma.for_keeping.update({where:{id:Number(gas_ballon_id)},
//     data: {
//       status:dto.status,
//       name:dto.name,
//       street:dto.street,
//       price:dto.price,
//       price_in_offer:dto.price_in_offer,
//       position1:dto.position1,
//       position2:dto.position2,
//       position3:dto.position3,
//       position4:dto.position4,
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
//   async get(page:number, limit:number) {
//     const skip = (page - 1) * limit;
//     const total = await this.prisma.eventAndOffers.count({});
//     const data = await this.prisma.for_keeping.findMany({
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
//     const deleteRecord = await this.prisma.for_keeping.delete({where:{id:Number(id)}});
//     return deleteRecord;
//   }
// }