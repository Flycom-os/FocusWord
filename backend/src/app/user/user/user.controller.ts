import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  Body,
  Controller, Delete, Get,
  Param, Patch,
  Post,
  Put, Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../../jwt-auth.guard";
import { GetUserId } from "../../../user/auth/get-user-id.decorator";
import { UpdateUserDto, SearchUsersDto } from "../../../dto/user.dro";
import { UserService } from "./user_service";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "node:path";
import { Express } from "express";

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Получить информацию о текущем пользователе' })
  getMe(@GetUserId() userId: number) {
    return this.userService.getUserInfo(userId);
  }

  @Get('all')
  @ApiOperation({ summary: 'Получить всех пользователей с поиском' })
  getAllUsers(@Query() searchDto: SearchUsersDto) {
    return this.userService.getAllUsers(searchDto);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Обновить данные текущего пользователя' })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileInterceptor("face", {
      storage: diskStorage({
        destination: "./uploads", // Папка для сохранения изображений
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
          const fileName = `${uniqueSuffix}${extname(file.originalname)}`; // Генерируем уникальное имя файла
          callback(null, fileName);
        },
      }),
    }),
  )
  async updateMe(
    @GetUserId() userId: number,
    @UploadedFile() file: Express.Multer.File, // Тип для файла
    @Body() dto: UpdateUserDto // DTO для данных
  ) {
    let updatedDto = { ...dto };
    
    if (file) {
      const imagePath = `/uploads/${file.filename}`;
      updatedDto.face = imagePath;
    }
    
    return this.userService.updateUser(userId, updatedDto);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Удалить текущего пользователя' })
  deleteMe(@GetUserId() userId: number) {
    return this.userService.deleteUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить пользователя по ID' })
  getUserById(@Param('id') id: string) {
    return this.userService.getUserInfo(parseInt(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить пользователя по ID' })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileInterceptor("face", {
      storage: diskStorage({
        destination: "./uploads",
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
          const fileName = `${uniqueSuffix}${extname(file.originalname)}`;
          callback(null, fileName);
        },
      }),
    }),
  )
  async updateUser(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UpdateUserDto
  ) {
    let updatedDto = { ...dto };
    
    if (file) {
      const imagePath = `/uploads/${file.filename}`;
      updatedDto.face = imagePath;
    }
    
    return this.userService.updateUser(parseInt(id), updatedDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить пользователя по ID' })
  deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(parseInt(id));
  }
}