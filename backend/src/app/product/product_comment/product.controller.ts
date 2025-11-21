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
import { Express } from "express";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "node:path";
import {ShopoCommentDto} from "../../../dto/shops.dto";
import {ProductCommenntService} from "./product_service";

@ApiTags("ProductComment")
@ApiBearerAuth()
@Controller("products_comment")
export class ProductsCommentController {
    constructor(private gasBallonsService: ProductCommenntService) {
    }

    @UseGuards(JwtAuthGuard)
    @Post("register/:shop_id")
    @ApiOperation({ summary: "create product" })
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
        @Param("product_id") product_id: string,

    ) {
        const updatedDto: ShopoCommentDto = {
            ...dto,
        };
        const user = (req as any).user;
        return this.gasBallonsService.post(user,product_id, updatedDto);
    };

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "update product" })

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
        return this.gasBallonsService.put(user, Number(id), shopId, updatedDto);
    }


    @Get(":shopId/:productId")
    @ApiOperation({ summary: "get product" })
    async filter(
        @Req() req: Request,
        @Param("shopId") shopId: string,
        @Param("productId") productId: string,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
    ) {
        const pageNumber = parseInt(page, 10);
        const pageSize = parseInt(limit, 10);
        const shopIdT = parseInt(shopId, 10);
        const productIdT = parseInt(productId, 10); // Предполагаем, что shopId - это числовой productId
        const user = (req as any).user;
        const result = await this.gasBallonsService.get(pageNumber, productIdT,shopIdT, pageSize);

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


}
