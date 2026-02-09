import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from '../../../prisma/prisma.service';
import { RegisterDto } from '../../dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";
@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async register(dto: RegisterDto) {
    const userExists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (userExists) {
      throw new BadRequestException('Email is already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.name,
        lastName: dto.surname,
      },
    });

    return { message: 'Registration success', user: user };
  }
  async signIn(identifer:string, password:string) {

    const user = await this.prisma.user.findFirst({
      where: { OR:[{email:identifer}] },
    })
    if(!user){
      throw new UnauthorizedException('User not found')
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid){
      throw new UnauthorizedException('password is incorrect')
    }

    const access_token = this.jwtService.sign({id:user.id, email:user.email, role:user.roleId, firstName:user.firstName, lastName:user.lastName, username:user.username},
      {expiresIn: '15h'});
    const refreash_token = this.jwtService.sign({id:user.id, email:user.email, role:user.roleId, firstName:user.firstName, lastName:user.lastName, username:user.username},
      {expiresIn: '15d'});

    return { message: 'Authorization success', user: user, access_token: access_token, refreash_token: refreash_token };
  }
}