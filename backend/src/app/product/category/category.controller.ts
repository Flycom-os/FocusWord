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
  UseInterceptors,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../../jwt-auth.guard";
import { Express } from "express";
import {CategoryDto, ProductDto} from "../../../dto/agzs.dto";
import {CategoryService} from "./category_service";
import {FileInterceptor} from "@nestjs/platform-express";
import {diskStorage} from "multer";
import {extname} from "node:path";

@ApiTags("Category")
@ApiBearerAuth()
@Controller("category")
export class CategoryController {
  constructor(private categoryService: CategoryService) {
  }

  @UseGuards(JwtAuthGuard)
  @Post("register")
  @ApiOperation({ summary: "create category" })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
      FileInterceptor("icon", {
        storage: diskStorage({
          destination: "./uploads", // Папка для сохранения изображений
          filename: (req, file, callback) => {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            const fileName = `${uniqueSuffix}${extname(file.originalname)}`; // Генерируем уникальное имя файла
            callback(null, fileName);
          },
        }),
      }),
  )
  async register(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File, // Тип для файла
    @Body() dto: CategoryDto, // DTO для данных
  ) {

    const imagePath = `/uploads/${file.filename}`;
    const updatedDto: CategoryDto = {
      ...dto,
      icon: imagePath,
    };
    const user = (req as any).user;
    return this.categoryService.post(user, updatedDto);
  };

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "update category" })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
      FileInterceptor("icon", {
        storage: diskStorage({
          destination: "./uploads", // Папка для сохранения изображений
          filename: (req, file, callback) => {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            const fileName = `${uniqueSuffix}${extname(file.originalname)}`; // Генерируем уникальное имя файла
            callback(null, fileName);
          },
        }),
      }),
  )
  @Put(":id")
  async update(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
    @Param("id") id: string,
    @Body() dto: CategoryDto,
  ) {

    const imagePath = `/uploads/${file.filename}`;
    const updatedDto: CategoryDto = {
      ...dto,
      icon: imagePath,
    };
    const user = (req as any).user;
    return this.categoryService.put(user, Number(id), updatedDto);
  }


  @Get()
  @ApiOperation({ summary: "get category" })
  async filter(
    @Req() req: Request,
    @Query('status') status: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    const result:any = await this.categoryService.get(status, pageNumber, pageSize);

    return {
      total: result.total,
      page: pageNumber,
      limit: pageSize,
      data: result.data.map(agz => ({
        ...agz,
        icon: `http://localhost:7000${agz.icon}`,
      })),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(
      @Req() req: Request,
     @Param("id") id: string,) {
    const user = (req as any).user;
    return this.categoryService.delete(user, Number(id));
  }
  }
