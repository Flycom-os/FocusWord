import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  Body,
  Controller, Delete, Get,
  Param,
  Post,
  Put, Query,
  Req,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../../jwt-auth.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "node:path";
import {ShopoCommenntService} from "./shops_service";
import {ShopoCommentDto} from "../../../dto/shops.dto";

@ApiTags("Offers")
@ApiBearerAuth()
@Controller("shops_comment")
export class ShopsCommentController {
  constructor(private shopsService: ShopoCommenntService) {
  }

  @UseGuards(JwtAuthGuard)
  @Post("register/:shop_id")
  @ApiOperation({ summary: "new shop comment" })
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
    @Body() dto: ShopoCommentDto, // DTO для данных
    @Param("shop_id") shop_id: string,

  ) {
    const updatedDto: ShopoCommentDto = {
      ...dto,
    };
    const user = (req as any).user;
    return this.shopsService.post(user,shop_id, updatedDto);
  };

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "update shop comment" })

  @Put(":id/:shop_id")
  async update(
    @Req() req: Request,
    @Param("id") id: string,
    @Param("shopId") shopId: string,
    @Body() dto: ShopoCommentDto,
  ) {
    const updatedDto: ShopoCommentDto = {
      ...dto,
    };
    const user = (req as any).user;
    return this.shopsService.put(user, Number(id), shopId, updatedDto);
  }


  @Get()
  @ApiOperation({ summary: "get shop comment" })
  async filter(
    @Req() req: Request,
    @Param("/shopId") shopId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const user = (req as any).user;
    const result = await this.shopsService.get( pageNumber,shopId,user, pageSize);

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
    return this.shopsService.delete(user, Number(id));
  }


}
