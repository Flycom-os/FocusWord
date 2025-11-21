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
//
// import { Gass_ballon_replacementDto } from "../../../dto/techical_gass/ways_ballons_replacement.dto";
// import { JwtAuthGuard } from "../../../jwt-auth.guard";
// import { FileInterceptor } from "@nestjs/platform-express";
// import { diskStorage } from "multer";
// import * as path from "node:path";
// import { Multer } from "multer";
// import { extname } from "node:path";
// import { Express } from "express";
// import { Gass_ballon_commentsDto } from "../../../dto/techical_gass/gas_ballon_comments.dto";
// import { GasBallonsReplacementStationService } from "./gas_ballons_replacement_station_service";
//
// @ApiTags("Technical_gas_balloon")
// @ApiBearerAuth()
// @Controller("techical_gas_balloon/replacement_sation")
// export class TechnicalGasBalloonReplacementStationController {
//   constructor(private gasBallonsService: GasBallonsReplacementStationService) {
//   }
//
//   @UseGuards(JwtAuthGuard)
//   @Post("register")
//   @ApiOperation({ summary: "Газовый баллон успешно создан" })
//   async register(
//     @Req() req: Request,
//     @Body() dto: Gass_ballon_replacementDto, // DTO для данных
//   ) {
//
//     const updatedDto: Gass_ballon_replacementDto = dto;
//     const user = (req as any).user;
//     return this.gasBallonsService.post(user, updatedDto);
//   };
//
//   @UseGuards(JwtAuthGuard)
//   @Put(":id")
//   async update(
//     @Req() req: Request,
//     @Param("id") id: string,
//     @Body() dto: Gass_ballon_replacementDto,
//   ) {
//
//     const updatedDto: Gass_ballon_replacementDto = dto;
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
//       data: result.data.map(ballon => ({
//         ...ballon
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
// }
