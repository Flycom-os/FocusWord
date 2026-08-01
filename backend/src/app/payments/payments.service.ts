import {
  Injectable,
  OnModuleInit,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PaymentsService implements OnModuleInit {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    this.logger.log('Initializing default payment gateways and methods...');
    await this.seedDefaultPayments();
  }

  private async seedDefaultPayments() {
    try {
      // 1. Seed YooMoney Gateway
      let yoomoneyGateway = await this.prisma.paymentGateway.findUnique({
        where: { slug: 'yoomoney' },
      });

      if (!yoomoneyGateway) {
        yoomoneyGateway = await this.prisma.paymentGateway.create({
          data: {
            name: 'YooMoney',
            slug: 'yoomoney',
            description:
              'Popular Russian payment service for accepting card and wallet payments.',
            isEnabled: true,
            displayOrder: 1,
            settings: {
              shopId: '324890',
              secretKey: 'test_sec_key_yoomoney_1234567890',
              testMode: true,
            },
          },
        });
        this.logger.log('Payment Gateway "YooMoney" seeded successfully.');
      }

      // 2. Seed YooMoney Card Payment Method
      const cardMethod = await this.prisma.paymentMethod.findUnique({
        where: { slug: 'yoomoney-card' },
      });

      if (!cardMethod) {
        await this.prisma.paymentMethod.create({
          data: {
            name: 'Bank Card',
            slug: 'yoomoney-card',
            description:
              'Payment by debit or credit card via YooMoney (Visa, Mastercard, MIR)',
            isEnabled: true,
            type: 'card',
            paymentGatewayId: yoomoneyGateway.id,
          },
        });
        this.logger.log('Payment Method "Bank Card" seeded successfully.');
      }

      // 3. Seed YooMoney Wallet Payment Method
      const walletMethod = await this.prisma.paymentMethod.findUnique({
        where: { slug: 'yoomoney-wallet' },
      });

      if (!walletMethod) {
        await this.prisma.paymentMethod.create({
          data: {
            name: 'YooMoney Wallet',
            slug: 'yoomoney-wallet',
            description: 'Payment from YooMoney wallet',
            isEnabled: true,
            type: 'other',
            paymentGatewayId: yoomoneyGateway.id,
          },
        });
        this.logger.log(
          'Payment Method "YooMoney Wallet" seeded successfully.',
        );
      }
    } catch (error) {
      this.logger.error('Failed to seed default payments', error);
    }
  }

  // === Gateways CRUD ===
  async findAllGateways() {
    return this.prisma.paymentGateway.findMany({
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findOneGateway(id: number) {
    const gateway = await this.prisma.paymentGateway.findUnique({
      where: { id },
      include: { paymentMethods: true },
    });
    if (!gateway)
      throw new NotFoundException(`Payment gateway #${id} not found`);
    return gateway;
  }

  async createGateway(dto: any) {
    return this.prisma.paymentGateway.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        isEnabled: dto.isEnabled ?? false,
        settings: dto.settings || {},
        displayOrder: dto.displayOrder ?? 0,
      },
    });
  }

  async updateGateway(id: number, dto: any) {
    await this.findOneGateway(id);
    return this.prisma.paymentGateway.update({
      where: { id },
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        isEnabled: dto.isEnabled,
        settings: dto.settings,
        displayOrder: dto.displayOrder,
      },
    });
  }

  async deleteGateway(id: number) {
    await this.findOneGateway(id);
    return this.prisma.paymentGateway.delete({
      where: { id },
    });
  }

  async toggleGateway(id: number, isEnabled: boolean) {
    await this.findOneGateway(id);
    return this.prisma.paymentGateway.update({
      where: { id },
      data: { isEnabled },
    });
  }

  // === Methods CRUD ===
  async findAllMethods() {
    return this.prisma.paymentMethod.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async findOneMethod(id: number) {
    const method = await this.prisma.paymentMethod.findUnique({
      where: { id },
      include: { gateway: true },
    });
    if (!method) throw new NotFoundException(`Payment method #${id} not found`);
    return method;
  }

  async createMethod(dto: any) {
    return this.prisma.paymentMethod.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        isEnabled: dto.isEnabled ?? false,
        type: dto.type ?? 'card',
        paymentGatewayId: dto.paymentGatewayId,
      },
    });
  }

  async updateMethod(id: number, dto: any) {
    await this.findOneMethod(id);
    return this.prisma.paymentMethod.update({
      where: { id },
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        isEnabled: dto.isEnabled,
        type: dto.type,
        paymentGatewayId: dto.paymentGatewayId,
      },
    });
  }

  async deleteMethod(id: number) {
    await this.findOneMethod(id);
    return this.prisma.paymentMethod.delete({
      where: { id },
    });
  }

  async toggleMethod(id: number, isEnabled: boolean) {
    await this.findOneMethod(id);
    return this.prisma.paymentMethod.update({
      where: { id },
      data: { isEnabled },
    });
  }

  // === YooMoney Integration Process ===
  async createYooMoneyPayment(dto: {
    amount: number;
    description: string;
    email: string;
    customerName?: string;
  }) {
    const gateway = await this.prisma.paymentGateway.findUnique({
      where: { slug: 'yoomoney' },
    });

    if (!gateway || !gateway.isEnabled) {
      throw new BadRequestException(
        'YooMoney payment gateway is disabled or does not exist.',
      );
    }

    const { shopId } = (gateway.settings as any) || {};
    if (!shopId) {
      throw new BadRequestException(
        'Incorrect YooMoney gateway configuration.',
      );
    }

    // Build the mock checkout redirect URL pointing to the Next.js client yoomoney page
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const params = new URLSearchParams({
      amount: dto.amount.toString(),
      description: dto.description,
      email: dto.email,
      name: dto.customerName || '',
      shopId: shopId,
    });

    const redirectUrl = `${clientUrl}/checkout/yoomoney?${params.toString()}`;
    return {
      success: true,
      redirectUrl,
    };
  }
}
