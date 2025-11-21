import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  Body,
  Controller, Delete, Get,
  Param,
  Patch,
  Post,
  Put, Query,
  Req,
  UploadedFile,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../../jwt-auth.guard";
import { Express } from "express";
import {SizesService} from "./sizes_service";
import {ProductSizeDto, SizesProductDto} from "../../../dto/agzs.dto";


@ApiTags("Sizes")
@ApiBearerAuth()
@Controller("sizes")
export class SizesController {
  constructor(private gasBallonsService: SizesService) {
  }

  @UseGuards(JwtAuthGuard)
  @Post("register")
  @ApiOperation({ summary: "Газовый баллон успешно создан" })
  async register(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File, // Тип для файла
    @Body() dto: ProductSizeDto, // DTO для данных
  ) {

    const updatedDto: ProductSizeDto = dto;
    const user = (req as any).user;
    return this.gasBallonsService.post(user, updatedDto);
  };

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Газовый баллон успешно обновлён" })

  @Put(":id")
  async update(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
    @Param("id") id: string,
    @Body() dto: ProductSizeDto,
  ) {

    const updatedDto: ProductSizeDto = dto;
    const user = (req as any).user;
    return this.gasBallonsService.put(user, Number(id), updatedDto);
  }


  @Get()
  @ApiOperation({ summary: "Газовый баллоны успешно получены" })
  async filter(
    @Req() req: Request,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    const result = await this.gasBallonsService.get( pageNumber, pageSize);

    return {
      total: result.total,
      page: pageNumber,
      limit: pageSize,
      data: result.data.map(agz => ({
        ...agz
      })),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(
      @Req() req: Request,
     @Param("id") id: string,) {
    const user = (req as any).user;
    return this.gasBallonsService.delete(user, Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Post("connect/")
  @ApiOperation({ summary: "sizes register" })
  async registerConnect(
      @Req() req: Request,
      @UploadedFile() file: Express.Multer.File, // Тип для файла
      @Body() dto: SizesProductDto, // DTO для данных
  ) {

    const updatedDto: SizesProductDto = dto;
    const user = (req as any).user;
    return this.gasBallonsService.postConnect(user, updatedDto);
  };

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "sizes updated" })

  @Put("connect/:id")
  async updateConnect(
      @Req() req: Request,
      @UploadedFile() file: Express.Multer.File,
      @Param("id") id: string,
      @Body() dto: SizesProductDto,
  ) {

    const updatedDto: SizesProductDto = dto;
    const user = (req as any).user;
    return this.gasBallonsService.putConnect(user, Number(id), updatedDto);
  }


  @Get('connect/')
  @ApiOperation({ summary: "sizes get" })
  async filterConnect(
      @Req() req: Request,
      @Query('productId') productId: string,
      @Query('sizeId') sizeId: string,
  @Query('page') page: string = '1',
      @Query('limit') limit: string = '10',
  ) {
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    const result = await this.gasBallonsService.getConnect(productId, sizeId, pageNumber, pageSize);

    return {
      total: result.total,
      page: pageNumber,
      limit: pageSize,
      data: result.data.map(agz => ({
        ...agz
      })),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('connect/:id')
  async deleteConnect(
      @Req() req: Request,
      @Param("id") id: string,) {
    const user = (req as any).user;
    return this.gasBallonsService.deleteConnect(user, Number(id));
  }
  }
