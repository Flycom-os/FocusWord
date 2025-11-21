import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from '../../../../prisma/prisma.service';
import { UpdateUserDto, SearchUsersDto } from "../../../dto/user.dro";

@Injectable()
export class UserService {
  constructor(private prisma:PrismaService) {}
  
  async getUserInfo(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        cart: {
          include: {
            product: {
              include: {
                Product: {
                  include: {
                    Category: true,
                    sizes: {
                      include: {
                        ProductSize: true
                      }
                    },
                    flowers: {
                      include: {
                        Flowers: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        history_orders: {
          include: {
            product: {
              include: {
                Product: {
                  include: {
                    Category: true,
                    sizes: {
                      include: {
                        ProductSize: true
                      }
                    },
                    flowers: {
                      include: {
                        Flowers: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        comments: {
          include: {
            Product: true,
            Shops: true
          }
        },
        address: true
      },
    });

    if (!user) throw new NotFoundException('Пользователь не найден');

    // Не возвращаем пароль
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async updateUser(userId: number, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...dto,
        date_updated: new Date().toISOString(),
      },
      include: {
        cart: {
          include: {
            product: {
              include: {
                Product: {
                  include: {
                    Category: true,
                    sizes: {
                      include: {
                        ProductSize: true
                      }
                    },
                    flowers: {
                      include: {
                        Flowers: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        history_orders: {
          include: {
            product: {
              include: {
                Product: {
                  include: {
                    Category: true,
                    sizes: {
                      include: {
                        ProductSize: true
                      }
                    },
                    flowers: {
                      include: {
                        Flowers: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        comments: {
          include: {
            Product: true,
            Shops: true
          }
        },
        address: true
      },
    });

    const { password, ...safeUser } = user;
    return safeUser;
  }

  async deleteUser(userId: number) {
    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'Пользователь успешно удалён' };
  }

  async getAllUsers(searchDto: SearchUsersDto) {
    const { name, page = '0', limit = '10' } = searchDto;
    const skip = parseInt(page) * parseInt(limit);
    const take = parseInt(limit);

    const where = name ? {
      OR: [
        { name: { contains: name, mode: 'insensitive' as const } },
        { surname: { contains: name, mode: 'insensitive' as const } },
        { email: { contains: name, mode: 'insensitive' as const } }
      ]
    } : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        include: {
          cart: true,
          history_orders: true,
          comments: true,
          address: true
        },
        orderBy: { date_created: 'desc' }
      }),
      this.prisma.user.count({ where })
    ]);

    // Убираем пароли из всех пользователей
    const safeUsers = users.map(({ password, ...user }) => user);

    return {
      users: safeUsers,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    };
  }
}