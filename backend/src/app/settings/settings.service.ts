import { Injectable, NotFoundException, Inject, Logger, OnModuleInit, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSettingDto } from "../../dto/settings/create-setting.dto";
import { UpdateSettingDto } from "../../dto/settings/update-setting.dto";
import { SearchSettingsDto } from "../../dto/settings/search-settings.dto";
import { Prisma } from '@prisma/client';
import IORedis from 'ioredis';
import { REDIS_CLIENT } from "../../redis/redis.module";

@Injectable()
export class SettingsService implements OnModuleInit {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redisClient: IORedis,
  ) {}

  // Keys that are considered protected defaults and require explicit force to overwrite
  private readonly PROTECTED_DEFAULT_KEYS = [
    'theme_mode',
    'theme',
    'site_name',
    'site_description',
    'site_url',
    'maintenance_mode',
    'auto_backup',
    'backup_frequency',
    'max_backups',
  ];

  async onModuleInit() {
    const defaults = [
      { key: 'theme_mode', value: 'light', type: 'string', category: 'appearance', description: 'Theme mode (light/dark)' },
      { key: 'theme', value: 'default', type: 'string', category: 'appearance', description: 'Color theme' },
      { key: 'site_name', value: 'FocusWord', type: 'string', category: 'general', description: 'Site name' },
      { key: 'site_description', value: '', type: 'string', category: 'general', description: 'Site description' },
      { key: 'site_url', value: 'https://focusword.com', type: 'string', category: 'general', description: 'Site URL' },
      { key: 'maintenance_mode', value: 'false', type: 'boolean', category: 'general', description: 'Maintenance mode' },
      { key: 'auto_backup', value: 'true', type: 'boolean', category: 'database', description: 'Automatic backup' },
      { key: 'backup_frequency', value: 'daily', type: 'string', category: 'database', description: 'Backup frequency' },
      { key: 'max_backups', value: '7', type: 'number', category: 'database', description: 'Maximum number of backups' }
    ];

    for (const item of defaults) {
      try {
        const existing = await this.prisma.setting.findUnique({
          where: { key: item.key }
        });
        if (!existing) {
          await this.prisma.setting.create({
            data: item
          });
          this.logger.log(`Seeded default setting: ${item.key} = ${item.value}`);
        }
      } catch (err) {
        this.logger.error(`Error seeding default setting ${item.key}:`, err);
      }
    }
  }

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
    // legacy signature: update(key, dto) — keep compatibility but allow callers
    // to pass force via a separate parameter from the controller. If a
    // caller wants to force update, it should call the service with the
    // third arg `force = true` (controller routes expose `?force=true`).
    return this._update(key, updateSettingDto, false);
  }

  private async _update(key: string, updateSettingDto: UpdateSettingDto, force = false) {
    if (this.PROTECTED_DEFAULT_KEYS.includes(key) && !force) {
      throw new ForbiddenException(`Setting "${key}" is protected. Use ?force=true to override.`);
    }

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

  async updateMultiple(settings: { key: string; value: string }[], force = false) {
    const blocked = settings
      .map(s => s.key)
      .filter(k => this.PROTECTED_DEFAULT_KEYS.includes(k));

    if (blocked.length > 0 && !force) {
      throw new ForbiddenException(
        `The following settings are protected and cannot be updated without force: ${blocked.join(', ')}`,
      );
    }

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
