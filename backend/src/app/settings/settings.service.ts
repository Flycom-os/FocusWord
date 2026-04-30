import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSettingDto } from "../../dto/settings/create-setting.dto";
import { UpdateSettingDto } from "../../dto/settings/update-setting.dto";
import { SearchSettingsDto } from "../../dto/settings/search-settings.dto";
import { Prisma } from '@prisma/client';
import IORedis from 'ioredis';
import { REDIS_CLIENT } from "../../redis/redis.module";

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redisClient: IORedis,
  ) {}

  async create(createSettingDto: CreateSettingDto) {
    const setting = await this.prisma.setting.create({
      data: createSettingDto,
    });
    
    // Invalidate cache
    this.logger.log(`[INVALIDATE] Deleting cache for key: 'settings_*'`);
    const keys = await this.redisClient.keys('settings_*');
    if (keys.length > 0) {
      await this.redisClient.del(keys);
    }
    
    return setting;
  }

  async findAll(searchDto: SearchSettingsDto) {
    const cacheKey = `settings_${JSON.stringify(searchDto)}`;
    this.logger.log(`[GET] Checking cache for key: ${cacheKey}`);
    const cachedSettings = await this.redisClient.get(cacheKey);

    if (cachedSettings) {
      this.logger.log(`[HIT] Cache hit for key: ${cacheKey}`);
      return JSON.parse(cachedSettings);
    }

    this.logger.log(`[MISS] Cache miss for key: ${cacheKey}. Fetching from DB.`);
    const { search, sortBy, sortOrder, page = 1, limit = 10 } = searchDto;

    const skip = (page - 1) * limit;

    const where: Prisma.SettingWhereInput = {};

    if (search) {
      where.OR = [
        { key: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (searchDto.category) {
      where.category = searchDto.category;
    }

    const orderBy: Prisma.SettingOrderByWithRelationInput = sortBy
      ? { [sortBy]: sortOrder || 'asc' }
      : { key: 'asc' };

    const [settings, total] = await Promise.all([
      this.prisma.setting.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.setting.count({ where }),
    ]);

    const result = {
      settings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
    
    this.logger.log(`[SET] Setting cache for key: ${cacheKey}`);
    await this.redisClient.set(cacheKey, JSON.stringify(result), 'EX', 3600);
    return result;
  }

  async findByCategory(category: string) {
    const cacheKey = `settings_category_${category}`;
    this.logger.log(`[GET] Checking cache for key: ${cacheKey}`);
    const cachedSettings = await this.redisClient.get(cacheKey);

    if (cachedSettings) {
      this.logger.log(`[HIT] Cache hit for key: ${cacheKey}`);
      return JSON.parse(cachedSettings);
    }

    this.logger.log(`[MISS] Cache miss for key: ${cacheKey}. Fetching from DB.`);
    const settings = await this.prisma.setting.findMany({
      where: { category },
      orderBy: { key: 'asc' },
    });

    this.logger.log(`[SET] Setting cache for key: ${cacheKey}`);
    await this.redisClient.set(cacheKey, JSON.stringify(settings), 'EX', 3600);
    return settings;
  }

  async findOne(key: string) {
    const cacheKey = `setting_${key}`;
    this.logger.log(`[GET] Checking cache for key: ${cacheKey}`);
    const cachedSetting = await this.redisClient.get(cacheKey);

    if (cachedSetting) {
      this.logger.log(`[HIT] Cache hit for key: ${cacheKey}`);
      return JSON.parse(cachedSetting);
    }

    this.logger.log(`[MISS] Cache miss for key: ${cacheKey}. Fetching from DB.`);
    const setting = await this.prisma.setting.findUnique({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundException(`Setting with key ${key} not found`);
    }

    this.logger.log(`[SET] Setting cache for key: ${cacheKey}`);
    await this.redisClient.set(cacheKey, JSON.stringify(setting), 'EX', 3600);
    return setting;
  }

  async update(key: string, updateSettingDto: UpdateSettingDto) {
    const setting = await this.prisma.setting.update({
      where: { key },
      data: updateSettingDto,
    });

    // Invalidate caches
    this.logger.log(`[INVALIDATE] Deleting cache for key: setting_${key}`);
    await this.redisClient.del(`setting_${key}`);
    
    const keys = await this.redisClient.keys('settings_*');
    if (keys.length > 0) {
      await this.redisClient.del(keys);
    }

    return setting;
  }

  async updateMultiple(settings: { key: string; value: string }[]) {
    const updatePromises = settings.map(({ key, value }) =>
      this.prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value, type: 'string', category: 'general' },
      })
    );

    const results = await Promise.all(updatePromises);

    // Invalidate all settings caches
    this.logger.log(`[INVALIDATE] Deleting all settings caches`);
    const keys = await this.redisClient.keys('settings_*');
    if (keys.length > 0) {
      await this.redisClient.del(keys);
    }

    return results;
  }
}
