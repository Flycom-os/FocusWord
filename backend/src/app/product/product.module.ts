
import { Module } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { JwtModule } from "@nestjs/jwt";
import {ProductController} from "./product/product.controller";
import {ProductService} from "./product/product_service";
import {CategoryController} from "./category/category.controller";
import {CategoryService} from "./category/category_service";
import {SizesController} from "./sizes/sizes.controller";
import {SizesService} from "./sizes/sizes_service";
import {ProductsCommentController} from "./product_comment/product.controller";
import {ProductCommenntService} from "./product_comment/product_service";


@Module({
  imports: [JwtModule.register({})],
  controllers: [ProductController, CategoryController, SizesController, ProductsCommentController ],
  providers:[ProductService, PrismaService, CategoryService, SizesService, ProductCommenntService ],
  exports: [ProductService, CategoryService, SizesService, ProductCommenntService ]
})
export class ProductModule {}