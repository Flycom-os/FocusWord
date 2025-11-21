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
import { GasBallonsService } from "./flowers_service";
import { JwtAuthGuard } from "../../../jwt-auth.guard";
import { BallonDto } from "../../../dto/ballons/ballon.dto";

@ApiTags("Flowers")
@ApiBearerAuth()
@Controller("flowers")
export class TechnicalGasBalloonController {
  constructor(private FlowersService: GasBallonsService) {
  }

  @UseGuards(JwtAuthGuard)
  @Post("register")
  @ApiOperation({ summary: "Газовый баллон успешно создан" })
  async register(
    @Req() req: Request,
    @Body() dto: BallonDto, // DTO для данных
  ) {
    const updatedDto: BallonDto = {
      ...dto,
    };
    const user = (req as any).user;
    return this.FlowersService.post(user, updatedDto);
  };

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Газовый баллон успешно обновлён" })

  @Put(":id")
  async update(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() dto: BallonDto,
  ) {

    const updatedDto: BallonDto = {
      ...dto,
    };
    const user = (req as any).user;
    return this.FlowersService.put(user, Number(id), updatedDto);
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

    const result = await this.FlowersService.get( pageNumber, pageSize);

    return {
      total: result.total,
      page: pageNumber,
      limit: pageSize,
      data: result.data.map(ballon => ({
        ...ballon,
      })),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(
      @Req() req: Request,
     @Param("id") id: string,) {
    const user = (req as any).user;
    return this.FlowersService.delete(user, Number(id));
  }


}
