import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Get,
  Req,
  Query,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from '../../../prisma/prisma.service';
import { RegisterDto } from '../../dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";
import { ApiOperation } from "@nestjs/swagger";
import { UpdateUserDto } from "../../dto/user.dro";
@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async register(dto: RegisterDto) {
    const userExists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (userExists) {
      throw new BadRequestException('Этот email уже зарегистрирован');
    }
    const userExistsPhone = await this.prisma.user.findUnique({
      where: { phone: dto.phone},
    });

    if (userExistsPhone) {
      throw new BadRequestException('Этот номер телефона уже зарегистрирован');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        surname: dto.surname,
        phone: dto.phone,
        permission: dto.permission,
        face: null,
        date_created: new Date().toISOString(),
        date_updated: new Date().toISOString(),
      },
    });

    return { message: 'Регистрация успешна', user: user };
  }
  async signIn(identifer:string, password:string) {

    const user = await this.prisma.user.findFirst({
      where: { OR:[{email:identifer}, {phone:identifer}] },
    })
    if(!user){
      throw new UnauthorizedException('User not found')
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid){
      throw new UnauthorizedException('password is incorrect')
    }

    const access_token = this.jwtService.sign({id:user.id, email:user.email, phone:user.phone, permissions:user.permission},
      {expiresIn: '15m'});
    const refreash_token = this.jwtService.sign({id:user.id, email:user.email, phone:user.phone, permissions:user.permission},
      {expiresIn: '15d'});

    return { message: 'Авторизация успешна', user: user, access_token: access_token, refreash_token: refreash_token };
  }
  async get(page:number, limit:number) {
    const skip = (page - 1) * limit;
    const total = await this.prisma.user.count({});
    const data = await this.prisma.user.findMany({
      where:{permission:2},
      skip,
      take:limit,
    });
    return {total, data };
  }
}