import { Controller, Post, Body, Get, Req, Query, UseGuards, Patch, Delete } from "@nestjs/common";
import { AuthService } from './signup-service';
import { RegisterDto } from '../../dto/register.dto';
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { LoginDto } from "../../dto/login.dto";
import { JwtAuthGuard } from "../../jwt-auth.guard";
import { GetUserId } from "./get-user-id.decorator";
import { UpdateUserDto } from "../../dto/user.dro";
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Авторизация пользователя' })
  @ApiResponse({ status: 200, description: 'Успешная авторизация' })
  @ApiResponse({ status: 401, description: 'Неверные учетные данные' })
  async login(@Body() dto: LoginDto) {
    return this.authService.signIn(dto.identifier, dto.password);
  }


  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiResponse({ status: 201, description: 'Пользователь успешно зарегистрирован' })
  @ApiResponse({ status: 400, description: 'Ошибка: email уже используется' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
  @Get()
  @ApiOperation({ summary: "Работники" })
  async filter(
    @Req() req: Request,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    const result = await this.authService.get( pageNumber, pageSize);

    return {
      total: result.total,
      page: pageNumber,
      limit: pageSize,
      data: result.data.map(agz => ({
        ...agz
      })),
    };
  }
}
