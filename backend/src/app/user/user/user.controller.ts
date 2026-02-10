import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags, ApiBody } from "@nestjs/swagger";
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
import { UpdateUserDto, SearchUsersDto } from "../../../dto/user.dto";
import { CreateUserDto } from "../../../dto/create-user.dto"; // Import CreateUserDto
import { UserService } from "./user_service";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "node:path";
import { Express } from "express";
import { Roles } from "../../common/decorators/roles.decorator";
import { UsersGuard } from "../../../common/guards/users.guard"; // Import RolesGuard

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, UsersGuard) // Apply both guards at the controller level
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/')
  @Roles('users:2') // Full access (level 2) required for creating users
  @ApiOperation({ summary: 'Создать нового пользователя (только для администраторов)' })
  @ApiBody({ type: CreateUserDto })
  async createUser(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard) // Only JwtAuthGuard needed for self-operations
  @ApiOperation({ summary: 'Получить информацию о текущем пользователе' })
  getMe(@GetUserId() userId: number) {
    return this.userService.getUserInfo(userId);
  }

  @Get('all')
  @Roles('users:0') // Read access (level 0) required for viewing all users
  @ApiOperation({ summary: 'Получить всех пользователей с поиском' })
  getAllUsers(@Query() searchDto: SearchUsersDto) {
    return this.userService.getAllUsers(searchDto);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard) // Only JwtAuthGuard needed for self-operations
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
      updatedDto.avatarUrl = imagePath;
    }
    
    return this.userService.updateUser(userId, updatedDto);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard) // Only JwtAuthGuard needed for self-operations
  @ApiOperation({ summary: 'Удалить текущего пользователя' })
  deleteMe(@GetUserId() userId: number) {
    return this.userService.deleteUser(userId);
  }

  @Get(':id')
  @Roles('users:0') // Read access (level 0) required for viewing a user by ID
  @ApiOperation({ summary: 'Получить пользователя по ID' })
  getUserById(@Param('id') id: string) {
    return this.userService.getUserInfo(parseInt(id));
  }

  @Patch(':id')
  @Roles('users:1') // Read/Update access (level 1) required for updating users
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
      updatedDto.avatarUrl = imagePath;
    }
    
    return this.userService.updateUser(parseInt(id), updatedDto);
  }

  @Delete(':id')
  @Roles('users:2') // Full access (level 2) required for deleting users
  @ApiOperation({ summary: 'Удалить пользователя по ID (требует user:delete разрешение)' })
  deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(parseInt(id));
  }
}