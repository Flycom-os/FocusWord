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
import { ForKeyService} from "./promocodes_service";
import { PromocodesDto } from "../../../dto/for_key.dto";

@ApiTags("Promocodes")
@ApiBearerAuth()
@Controller("promocode")
export class PromocodesController {
  constructor(private PromocodesService: ForKeyService) {
  }

  @UseGuards(JwtAuthGuard)
  @Post("register")
  @ApiOperation({ summary: "Promocode" })
  async register(
    @Req() req: Request,
    @Body() dto: PromocodesDto, // DTO для данных
  ) {

    const updatedDto: PromocodesDto= {
      ...dto,
    };
    const user = (req as any).user;
    return this.PromocodesService.post(user, updatedDto);
  };

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "update promocode" })
  @ApiConsumes("multipart/form-data")

  @Put(":id")
  async update(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() dto: PromocodesDto,
  ) {
    const updatedDto: PromocodesDto = {
      ...dto,
    };
    const user = (req as any).user;
    return this.PromocodesService.put(user, Number(id), updatedDto);
  }


  @Get()
  @ApiOperation({ summary: "get promocodes" })
  async filter(
    @Req() req: Request,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    const result = await this.PromocodesService.get(pageNumber, pageSize);

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
    return this.PromocodesService.delete(user, Number(id));
  }
}
