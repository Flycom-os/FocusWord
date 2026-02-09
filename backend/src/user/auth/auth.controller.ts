import { Controller, Post, Body, Get, Req, Query, UseGuards, Patch, Delete } from "@nestjs/common";
import { AuthService } from './signup-service';
import { RegisterDto } from '../../dto/register.dto';
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { LoginDto } from "../../dto/login.dto";
import { JwtAuthGuard } from "../../jwt-auth.guard";
import { GetUserId } from "./get-user-id.decorator";
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Authorization user' })
  @ApiResponse({ status: 200, description: 'Authorization success' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto) {
    return this.authService.signIn(dto.identifier, dto.password);
  }


  @Post('register')
  @ApiOperation({ summary: 'Registration new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Error: Email is already in use' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
}
