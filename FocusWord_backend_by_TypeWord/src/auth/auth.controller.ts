import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import {
  ConfirmEmailOkresponse,
  FullLogoutOkResponse,
  LoginOkResponse,
  LogoutOkResponse,
  RefreshOkResponse,
  RegistrationOkResponse,
  RequestConfirmOkresponse,
  ResetOkresponse,
  ResetPasswordOkresponse,
} from './responses/auth.ok.responses';
import { UnauthorizedExceptionResponse } from './responses/auth.unauthorized.responses';
import { AuthUserDto } from '../users/dto/auth-user.dto';
import {
  fullLogoutDescription,
  loginDescription,
  logoutDescription,
  passwordReset,
  refreshDescription,
  requestConfirm,
  requestReset,
} from './api.descriptions';
import { ConflictExceptionResponse } from '../users/responses/users.conflict.responses';
import { RegisterUserDto } from '../users/dto/register-user.dto';
import { UserId } from '../decorators/user-id.decorator';
import { RequestResetDto } from './dto-email/auth.request-reset.dto';
import { ResetPasswordDto } from './dto-email/auth.reset-password.dto';
import { UserInternalServerError } from 'src/users/responses/users.internal-servere-error';
import { UnprocessableEntityResponse } from '../responses/validation.response';

@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  //POST
  /**user authorization*/
  @UsePipes(new ValidationPipe())
  @ApiOperation({
    summary: 'Авторизация пользователя',
    description: loginDescription,
  })
  @ApiCreatedResponse({ description: 'Success', type: LoginOkResponse })
  @ApiBadRequestResponse({ description: 'Error: Validation', type: UnprocessableEntityResponse })
  @ApiUnauthorizedResponse({
    description: 'Error: Unauthorized (если логин или пароль неверны)',
    type: UnauthorizedExceptionResponse,
  })
  @Post('/login')
  async login(@Body() userDto: AuthUserDto, @Req() req: Request, @Res() res: Response): Promise<Response> {
    return this.authService.login(userDto, req, res);
  }

  //user registration*/
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Регистрация пользователя' })
  @ApiCreatedResponse({ description: 'Success', type: RegistrationOkResponse })
  @ApiBadRequestResponse({ status: 400, description: 'Error: Validation', type: UnprocessableEntityResponse })
  @ApiConflictResponse({ description: 'Error: Conflict', type: ConflictExceptionResponse })
  @ApiConflictResponse({ description: 'Error: Create', type: UserInternalServerError })
  @Post('/registration')
  registration(@Body() registerUserDTO: RegisterUserDto): Promise<RegistrationOkResponse> {
    return this.authService.registration(registerUserDTO);
  }

  /**password reset email*/
  @ApiOperation({
    summary: 'Отправка письма о сбросе на почту',
    description: requestReset,
  })
  @ApiOkResponse({ description: 'Success', type: ResetOkresponse })
  @Post('email/request-reset')
  async requestPasswordReset(@Body() requstDto: RequestResetDto) {
    return await this.authService.requestReset(requstDto.email);
  }

  //PATCH
  /**update password in database */
  @ApiOperation({
    summary: 'Обновление пароля в бд',
    description: passwordReset,
  })
  @ApiOkResponse({ description: 'Success', type: ResetPasswordOkresponse })
  @Patch('email/reset-password')
  async resetPassword(@Body() resetDto: ResetPasswordDto) {
    return await this.authService.resetPassword(resetDto.token, resetDto.newPassword);
  }

  /**access-token update */
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({
    summary: 'Обновление access-token',
    description: refreshDescription,
  })
  @ApiCreatedResponse({ description: 'Success', type: RefreshOkResponse })
  @ApiUnauthorizedResponse({
    description: 'Error: Unauthorized',
    type: UnauthorizedExceptionResponse,
  })
  @Patch('/refresh-token')
  async refreshToken(@UserId() id: number, @Req() req: Request, @Res() res: Response): Promise<Response> {
    return await this.authService.updateAccessToken(id, req, res);
  }

  //GET
  /**user session closing*/
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({
    summary: 'Закрытие сессии пользователя',
    description: logoutDescription,
  })
  @ApiOkResponse({ description: 'Success', type: LogoutOkResponse })
  @Get('/logout')
  async logOut(@Req() req: Request, @Res() res: Response): Promise<Response> {
    return await this.authService.logoutUser(req, res);
  }

  /**close all user sessions */
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({
    summary: 'Закрытие всех сессий пользователя',
    description: fullLogoutDescription,
  })
  @ApiOkResponse({ description: 'Success', type: FullLogoutOkResponse })
  @ApiUnauthorizedResponse({
    description: 'Error: Unauthorized',
    type: UnauthorizedExceptionResponse,
  })
  @Get('/full-logout')
  async fullLogOut(@UserId() id: number, @Req() req: Request, @Res() res: Response): Promise<Response> {
    return await this.authService.fullLogoutUser(id, req, res);
  }

  /**mail confirmation*/
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({
    summary: 'Отправка письма о подтверждение на почту',
    description: requestConfirm,
  })
  @ApiOkResponse({ description: 'Success', type: RequestConfirmOkresponse })
  @ApiUnauthorizedResponse({
    description: 'Error: Unauthorized',
    type: UnauthorizedExceptionResponse,
  })
  @Get('email/request-confirm')
  async requestConfirm(@UserId() id: number): Promise<string> {
    return await this.authService.requestConfirm(id);
  }

  //mail confirmation in database*/
  @ApiOperation({
    summary: 'Подтверждение на почты',
  })
  @ApiOkResponse({ description: 'Success', type: ConfirmEmailOkresponse })
  @Get('email/confirm-email/:token')
  async confirmEmail(@Param('token') token: string): Promise<string> {
    return await this.authService.confirmEmail(token);
  }
}
