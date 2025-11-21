// import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
// import {
//   Body,
//   Controller, Delete, Get,
//   Param,
//   Patch,
//   Post,
//   Put, Query,
//   Req,
//   UploadedFile,
//   UseGuards,
//   UseInterceptors,
// } from "@nestjs/common";
// import { JwtAuthGuard } from "../../../jwt-auth.guard";
// import { ForKeepingService} from "./forKeeping_service";
// import { ForKeepingDto, ShopsDto } from "../../../dto/shops.dto";
//
// @ApiTags("For_Keeping")
// @ApiBearerAuth()
// @Controller("for_keeping/auto")
// export class ForKeepingController {
//   constructor(private gasBallonsService: ForKeepingService) {
//   }
//
//   @UseGuards(JwtAuthGuard)
//   @Post("register")
//   @ApiOperation({ summary: "Газовый баллон успешно создан" })
//
//
//   async register(
//     @Req() req: Request,
//     @Body() dto: ForKeepingDto, // DTO для данных
//   ) {
//
//     const updatedDto: ForKeepingDto = dto;
//     const user = (req as any).user;
//     return this.gasBallonsService.post(user, updatedDto);
//   };
//
//   @UseGuards(JwtAuthGuard)
//   @ApiOperation({ summary: "Газовый баллон успешно обновлён" })
//
//   @Put(":id")
//   async update(
//     @Req() req: Request,
//     @Param("id") id: string,
//     @Body() dto: ForKeepingDto,
//   ) {
//     const updatedDto: ForKeepingDto = dto;
//     const user = (req as any).user;
//     return this.gasBallonsService.put(user, Number(id), updatedDto);
//   }
//
//
//   @Get()
//   @ApiOperation({ summary: "Газовый баллоны успешно получены" })
//   async filter(
//     @Req() req: Request,
//     @Query('page') page: string = '1',
//     @Query('limit') limit: string = '10',
//   ) {
//     const pageNumber = parseInt(page, 10);
//     const pageSize = parseInt(limit, 10);
//
//     const result = await this.gasBallonsService.get( pageNumber, pageSize);
//
//     return {
//       total: result.total,
//       page: pageNumber,
//       limit: pageSize,
//       data: result.data.map(agz => ({
//         ...agz
//       })),
//     };
//   }
//
//   @UseGuards(JwtAuthGuard)
//   @Delete(':id')
//   async delete(
//       @Req() req: Request,
//      @Param("id") id: string,) {
//     const user = (req as any).user;
//     return this.gasBallonsService.delete(user, Number(id));
//   }
//
//
// }
