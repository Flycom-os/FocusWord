import {ApiBearerAuth, ApiConsumes, ApiOperation, ApiQuery, ApiTags} from "@nestjs/swagger";
import {
  Body,
  Controller, Delete, Get,
  Param,
  Post,
  Put, Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../../jwt-auth.guard";
import { Express } from "express";
import {ProductDto} from "../../../dto/agzs.dto";
import {ProductService} from "./product_service";
import {FileInterceptor} from "@nestjs/platform-express";
import {diskStorage} from "multer";
import {extname} from "node:path";

@ApiBearerAuth()
@Controller("product")
export class ProductController {
  constructor(private productService: ProductService) {
  }
  @UseGuards(JwtAuthGuard)
  @Post("register")
  @ApiOperation({ summary: "register product" })
  @ApiTags("Product")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
      FileInterceptor("image", {
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
    @Body() dto: ProductDto, // DTO для данных
  ) {

    const imagePath = `/uploads/${file.filename}`;
    const updatedDto: ProductDto = {
      ...dto,
      image: imagePath,
    };
    const user = (req as any).user;
    return this.productService.post(user, updatedDto);
  };

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "update product" })

  @Put(":id")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
      FileInterceptor("image", {
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
  async update(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
    @Param("id") id: string,
    @Body() dto: ProductDto,
  ) {

    const imagePath = `/uploads/${file.filename}`;
    const updatedDto: ProductDto = {
      ...dto,
      image: imagePath,
    };
    const user = (req as any).user;
    return this.productService.put(user, Number(id), updatedDto);
  }

  @Get()
  @ApiOperation({ summary: "get category" })
  @ApiQuery({ name: 'name', required: false, type: String, description: 'Название товара' })
  @ApiQuery({ name: 'categories', required: false, type: String, description: 'Категории, через запятую, например "1,2,3"' })
  @ApiQuery({ name: 'price_from', required: false, type: Number, description: 'Минимальная цена' })
  @ApiQuery({ name: 'price_to', required: false, type: Number, description: 'Максимальная цена' })
  @ApiQuery({ name: 'color', required: false, type: String, description: 'Цвет' })
  @ApiQuery({ name: 'flowers', required: false, type: String, description: 'Цветы' }) // если тип неизвестен, можно указать String или any
  @ApiQuery({ name: 'sizes', required: false, type: String, description: 'Размеры, через запятую, например "1,2,3"' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Номер страницы', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Лимит на страницу', example: 10 })

  async filter(
      @Query('name') name?: string,
      @Query('categories') categories?: string, // ожидаем строку "1,2,3"
      @Query('price_from') price_from?: string,
      @Query('price_to') price_to?: string,
      @Query('color') color?: string,
      @Query('flowers') flowers?: any,
      @Query('sizes') sizes?: string, // "1,2,3"
      @Query('page') page: string = '1',
      @Query('limit') limit: string = '10',
  ) {
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    const result = await this.productService.get(
        name,
        categories ? categories.split(',').map(id => parseInt(id)) : undefined,
        price_from ? parseInt(price_from) : undefined,
        price_to ? parseInt(price_to) : undefined,
        color,
        flowers,
        sizes ? sizes.split(',').map(id => parseInt(id)) : undefined,
        pageNumber,
        pageSize
    );

    return {
      total: result.total,
      page: pageNumber,
      limit: pageSize,
      data: result.data.map(ballon => ({
        ...ballon,
        image: `http://localhost:7000${ballon.image}`,
      })),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(
      @Req() req: Request,
     @Param("id") id: string,) {
    const user = (req as any).user;
    return this.productService.delete(user, Number(id));
  }
 }
