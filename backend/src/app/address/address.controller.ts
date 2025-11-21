import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  Body,
  Controller, Delete, Get,
  Param, Patch,
  Post, Query,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../jwt-auth.guard";
import { CreateAddressDto, UpdateAddressDto, GetAddressesDto } from "../../dto/address.dto";
import { AddressService } from "./address.service";

@ApiTags('Address')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новый адрес' })
  createAddress( @Body() dto: CreateAddressDto) {
    return this.addressService.createAddress(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить адреса с фильтрацией' })
  getAddresses(@Query() filters: GetAddressesDto) {
    return this.addressService.getAddresses(filters);
  }

  @Get('my')
  @ApiOperation({ summary: 'Получить адреса текущего пользователя' })
  getMyAddresses(
    @Query('userId') userId: number,
    @Query('page') page: string = '0',
    @Query('limit') limit: string = '10'
  ) {
    return this.addressService.getMyAddresses(userId, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить адрес по ID' })
  getAddressById(@Param('id') id: string) {
    return this.addressService.getAddressById(parseInt(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить адрес' })
  updateAddress(@Param('id') id: string, @Body() dto: UpdateAddressDto) {
    return this.addressService.updateAddress(parseInt(id), dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить адрес' })
  deleteAddress(@Param('id') id: string) {
    return this.addressService.deleteAddress(parseInt(id));
  }
}
