import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  Body,
  Controller, Delete, Get,
  Param,
  Post,
  Put, Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../../jwt-auth.guard";
import { OffersService } from "./shops_service";
import { ShopsDto } from "../../../dto/shops.dto";

@ApiTags("Shops")
@ApiBearerAuth()
@Controller("shops")
export class ShopsController {
  constructor(private ShopsService: OffersService) {
  }

  @UseGuards(JwtAuthGuard)
  @Post("register")
  @ApiOperation({ summary: "new shop" })
  async register(
    @Req() req: Request,
    @Body() dto: ShopsDto, // DTO для данных
  ) {
    const updatedDto: ShopsDto = {
      ...dto,
    };
    const user = (req as any).user;
    return this.ShopsService.post(user, updatedDto);
  };

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "update shops" })

  @Put(":id")
  async update(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() dto: ShopsDto,
  ) {
    const updatedDto: ShopsDto = {
      ...dto,
    };
    const user = (req as any).user;
    return this.ShopsService.put(user, Number(id), updatedDto);
  }


  @Get()
  @ApiOperation({ summary: "get shops" })
  async filter(
    @Req() req: Request,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    const result = await this.ShopsService.get( pageNumber, pageSize);

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
    return this.ShopsService.delete(user, Number(id));
  }


}
