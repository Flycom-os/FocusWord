import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateAddressDto, UpdateAddressDto, GetAddressesDto } from "../../dto/address.dto";

@Injectable()
export class AddressService {
  constructor(private prisma: PrismaService) {}

  async createAddress(dto: CreateAddressDto) {
    const address = await this.prisma.address.create({
      data: {
        userId:dto.userId,
        address: dto.address,
        date_created: new Date().toISOString(),
        date_updated: new Date().toISOString()
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            surname: true,
            email: true,
            phone: true
          }
        }
      }
    });

    return address;
  }

  async getAddresses(filters: GetAddressesDto) {
    const { userId, page = '0', limit = '10' } = filters;
    const skip = parseInt(page) * parseInt(limit);
    const take = parseInt(limit);

    const where: any = {};
    
    if (userId) {
      where.userId = parseInt(userId);
    }

    const [addresses, total] = await Promise.all([
      this.prisma.address.findMany({
        where,
        skip,
        take,
        include: {
          User: {
            select: {
              id: true,
              name: true,
              surname: true,
              email: true,
              phone: true
            }
          }
        },
        orderBy: { date_created: 'desc' }
      }),
      this.prisma.address.count({ where })
    ]);

    return {
      addresses,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    };
  }

  async getAddressById(addressId: number) {
    const address = await this.prisma.address.findUnique({
      where: { id: addressId },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            surname: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!address) {
      throw new NotFoundException('Адрес не найден');
    }

    return address;
  }

  async getMyAddresses(userId: number, page = '0', limit = '10') {
    const skip = parseInt(page) * parseInt(limit);
    const take = parseInt(limit);

    const [addresses, total] = await Promise.all([
      this.prisma.address.findMany({
        where: { userId },
        skip,
        take,
        include: {
          User: {
            select: {
              id: true,
              name: true,
              surname: true,
              email: true,
              phone: true
            }
          }
        },
        orderBy: { date_created: 'desc' }
      }),
      this.prisma.address.count({ where: { userId } })
    ]);

    return {
      addresses,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    };
  }

  async updateAddress(addressId: number, dto: UpdateAddressDto) {
    const address = await this.prisma.address.findUnique({
      where: { id: addressId }
    });

    if (!address) {
      throw new NotFoundException('Адрес не найден');
    }

    const updatedAddress = await this.prisma.address.update({
      where: { id: addressId },
      data: {
        ...dto,
        date_updated: new Date().toISOString()
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            surname: true,
            email: true,
            phone: true
          }
        }
      }
    });

    return updatedAddress;
  }

  async deleteAddress(addressId: number) {
    const address = await this.prisma.address.findUnique({
      where: { id: addressId }
    });

    if (!address) {
      throw new NotFoundException('Адрес не найден');
    }

    await this.prisma.address.delete({
      where: { id: addressId }
    });

    return { message: 'Адрес успешно удален' };
  }
}
