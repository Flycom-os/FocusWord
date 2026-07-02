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
// import { GasBallonsService } from "./gas_ballons_service";
// import { Gass_ballonDto } from "../../../dto/techical_gass/gass_ballon.dto";
// import { JwtAuthGuard } from "../../../jwt-auth.guard";
// import { FileInterceptor } from "@nestjs/platform-express";
// import { diskStorage } from "multer";
// import * as path from "node:path";
// import { Multer } from "multer";
// import { extname } from "node:path";
// import { Express } from "express";
// import { Gass_ballon_commentsDto } from "../../../dto/techical_gass/gas_ballon_comments.dto";
//
// @ApiTags("Technical_gas_balloon")
// @ApiBearerAuth()
// @Controller("techical_gas_balloon")
// export class TechnicalGasBalloonController {
//   constructor(private gasBallonsService: GasBallonsService) {
//   }
//
//   @UseGuards(JwtAuthGuard)
//   @Post("register")
//   @ApiOperation({ summary: "Gas cylinder successfully created" })
//   @ApiConsumes("multipart/form-data")
//   @UseInterceptors(
//     FileInterceptor("image", {
//       storage: diskStorage({
//         destination: "./uploads", // Folder for saving images
//         filename: (req, file, callback) => {
//           const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//           const fileName = `${uniqueSuffix}${extname(file.originalname)}`; // Generate unique file name
//           callback(null, fileName);
//         },
//       }),
//     }),
//   )
//   async register(
//     @Req() req: Request,
//     @UploadedFile() file: Express.Multer.File, // File type
//     @Body() dto: Gass_ballonDto, // DTO for data
//   ) {
//     if (!file) {
//       throw new Error("Image is required");
//     }
//     const imagePath = `/uploads/${file.filename}`;
//     const updatedDto: Gass_ballonDto = {
//       ...dto,
//       image: imagePath,
//     };
//     const user = (req as any).user;
//     return this.gasBallonsService.post(user, updatedDto);
//   };
//
//   @UseGuards(JwtAuthGuard)
//   @ApiOperation({ summary: "Gas cylinder successfully updated" })
//   @ApiConsumes("multipart/form-data")
//   @UseInterceptors(
//     FileInterceptor("image", {
//       storage: diskStorage({
//         destination: "./uploads",
//         filename: (req, file, callback) => {
//           const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//           const fileName = `${uniqueSuffix}${extname(file.originalname)}`;
//           callback(null, fileName);
//         },
//       }),
//     }),
//   )
//   @Put(":id")
//   async update(
//     @Req() req: Request,
//     @UploadedFile() file: Express.Multer.File,
//     @Param("id") id: string,
//     @Body() dto: Gass_ballonDto,
//   ) {
//     if (!file) {
//       throw new Error("Image is required");
//     }
//     const imagePath = `/uploads/${file.filename}`;
//     const updatedDto: Gass_ballonDto = {
//       ...dto,
//       image: imagePath,
//     };
//     const user = (req as any).user;
//     return this.gasBallonsService.put(user, Number(id), updatedDto);
//   }
//
//
//   @Get()
//   @ApiOperation({ summary: "Gas cylinders successfully retrieved" })
//   async filter(
//     @Req() req: Request,
//     @Query('volume') volume: string,
//     @Query('page') page: string = '1',
//     @Query('limit') limit: string = '10',
//   ) {
//     const pageNumber = parseInt(page, 10);
//     const pageSize = parseInt(limit, 10);
//
//     const result = await this.gasBallonsService.get(volume, pageNumber, pageSize);
//
//     return {
//       total: result.total,
//       page: pageNumber,
//       limit: pageSize,
//       data: result.data.map(ballon => ({
//         ...ballon,
//         image: `http://localhost:7000${ballon.image}`,
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
//   @UseGuards(JwtAuthGuard)
//   @Post(':id/comments')
//   postComment(
//     @Req() req: Request,
//     @Param('id') id: number,
//     @Body() dto: Gass_ballon_commentsDto,
//
//   ) {
//     const user = (req as any).user;
//     return this.gasBallonsService.postComment(user, id, dto);
//   }
//
//   @Get(':id/comments')
//   getComments(@Param('id') id: number) {
//     return this.gasBallonsService.getCommentsByBallonId(id);
//   }
//
// }