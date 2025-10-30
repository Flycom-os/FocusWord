import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/user.model';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import {
  FullLogoutOkResponse,
  LoginOkResponse,
  LogoutOkResponse,
  RefreshOkResponse,
  RegistrationOkResponse,
  RequestResetEmail,
} from './responses/auth.ok.responses';
import { AuthUserDto } from '../users/dto/auth-user.dto';
import { UnauthorizedExceptionResponse } from './responses/auth.unauthorized.responses';
import { RegisterUserDto } from '../users/dto/register-user.dto';
import { createTransport, Transporter } from 'nodemailer';
import * as process from 'process';

@Injectable()
export class AuthService {
  private transporter: Transporter; //email trasport object
  constructor(private userService: UsersService, private jwtService: JwtService, private configService: ConfigService) {
    const emailConfig = this.configService.get('email');
    this.transporter = createTransport(emailConfig.transport);
  }

  /**sets cookies with tokens*/
  private _setCookiesToken(res: Response, access_token?: string, refresh_token?: string): void {
    const currentDate: Date = new Date();
    if (access_token) {
      res.cookie('access_token', access_token, {
        sameSite: 'lax',
        expires: new Date(currentDate.getTime() + 30 * 60 * 1000),
      });
    }
    if (refresh_token) {
      res.cookie('refresh_token', refresh_token, {
        sameSite: 'lax',
        expires: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000),
      });
    }
  }

  private async _generateAccessToken(user: User): Promise<string> {
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      superuser: user.superuser,
      role: user.role,
    };
    return await this.jwtService.signAsync(
      { payload },
      { secret: this.configService.get('JWT_ACCESS_KEY'), expiresIn: '30m' },
    );
  }

  private async _generateRefreshToken(id: number): Promise<string> {
    const payload = { id };
    return await this.jwtService.signAsync(
      { payload },
      { secret: this.configService.get('JWT_REFRESH_KEY'), expiresIn: '7d' },
    );
  }

  private async _sendEmail(token: string, to: string, subject: string, text: string, subUrl: string): Promise<void> {
    const url = `http://localhost:${process.env.PORT}/auth/email/${subUrl}/${token}`; //сделать динамический домен

    const mailOptions = {
      from: 'invite4googl@gmail.com', //вынести в отдельную константу
      to,
      subject,
      text: `${text} ${url}`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.log('Email send error| ' + error);
    }
  }

  /**verification of mail, token and password in the database*/
  private async _validateUser(user_email: string | number, password: string): Promise<User> {
    let user: undefined | User;
    if (typeof user_email === 'string') {
      user = await this.userService.getUserByEmailToken(user_email);
    } else {
      user = await this.userService.getUserByIdToken(user_email);
    }
    if (!user) {
      throw new UnauthorizedExceptionResponse();
    }
    const passwordEquals = await bcrypt.compare(password, user.password);
    if (!passwordEquals) {
      throw new UnauthorizedExceptionResponse();
    }
    return user;
  }

  /**user login and assigning access and refresh tokens*/
  async login(userDTO: AuthUserDto, req: Request, res: Response): Promise<Response> {
    const user: User = await this._validateUser(userDTO.email, userDTO.password);
    if (user.is_banned) {
      throw new UnauthorizedExceptionResponse();
    }
    const refresh_token: string = await this._generateRefreshToken(user.id);
    const access_token: string = await this._generateAccessToken(user);
    await this.userService.updateUserRefreshTokenByEmail(user.id, refresh_token);
    this._setCookiesToken(res, access_token, refresh_token);
    return res.send(new LoginOkResponse());
  }

  /**user registration*/
  async registration(registerUserDTO: RegisterUserDto): Promise<RegistrationOkResponse> {
    const userId: number = await this.userService.registerUser(registerUserDTO);
    await this.requestConfirm(userId); //send email for confirm
    return new RegistrationOkResponse();
  }

  /**user logout from a single session*/
  async logoutUser(req: Request, res: Response): Promise<Response> {
    res.clearCookie('access_token');
    return res.send(new LogoutOkResponse());
  }

  /**user logout from all sessions*/
  async fullLogoutUser(id: number | number[], req: Request, res: Response): Promise<Response> {
    await this.userService.updateUserRefreshTokenById(id, null);
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return res.send(new FullLogoutOkResponse());
  }

  async updateAccessToken(id: number, req: Request, res: Response): Promise<Response> {
    const user: User = await this.userService.getUserByIdToken(id);
    if (
      !user ||
      !(req.cookies['refresh_token'] === user.refresh_token)
    ) {
      throw new UnauthorizedExceptionResponse();
    }
    const refresh_token: string = await this._generateRefreshToken(user.id);
    const access_token: string = await this._generateAccessToken(user);
    await this.userService.updateUserRefreshTokenByEmail(user.id, refresh_token);
    this._setCookiesToken(res, access_token, refresh_token);
    return res.send(new RefreshOkResponse());
  }

  //PASSWORD RESET BY EMAIL
  /**password reset request and sending a link to the email*/
  async requestReset(email: string): Promise<RequestResetEmail> {
    const user: User = await this.userService.getUserByEmailToken(email);
    if (!user) {
      return new RequestResetEmail(email);
    }
    const userId: number = user.id;
    const token: string = this.jwtService.sign({ userId }, { expiresIn: '10m' });
    //Sending token to user's email
    await this._sendEmail(
      token,
      email,
      'Восстановление доступа к аккаунта',
      'Для сброса пароля перейдите по ссылке:',
      'form-reset',
    );
    return new RequestResetEmail(email);
  }

  /**database password reset*/
  async resetPassword(token: string, newPassword: string): Promise<string> {
    try {
      const payload = this.jwtService.verify(token);
      const user: User = await this.userService.getUserById(payload.userId);
      if (!user) {
        return 'Пароль успешно сменён';
      }
      user.password = await bcrypt.hash(newPassword, 5);
      await user.save();
      return 'Пароль успешно сменён';
    } catch (error) {
      return 'Пароль успешно сменён';
    }
  }

  /**request for email verification and send a link with a token*/
  async requestConfirm(userId: number): Promise<string> {
    const user: User = await this.userService.getUserById(userId);
    if (!user) {
      return 'Ссылка для подтверждения отправлена на почту';
    }
    const token: string = this.jwtService.sign({ userId }, { expiresIn: '10m' });
    await this._sendEmail(
      token,
      user.email,
      'Подтверждение почты',
      'Для подтверждения адресса перейдите по ссылке: ',
      'confirm-email',
    );
    return `Ссылка для подтверждения отправлена на почту`;
  }

  /**email confirmation in the database*/
  async confirmEmail(token: string): Promise<string> {
    const payload = this.jwtService.verify(token);
    const user: User = await this.userService.getUserById(payload.userId);
    if (!user) {
      return 'Почта подтверждена';
    }
    await user.update({ is_verified: true });
    return 'Почта подтверждена';
  }
}
