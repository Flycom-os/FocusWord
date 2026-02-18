import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma, Slider, Slide } from '@prisma/client';
import { CreateSliderDto } from '../dto/sliders/create-slider.dto';
import { UpdateSliderDto } from '../dto/sliders/update-slider.dto';
import { CreateSlideDto } from '../dto/sliders/create-slide.dto';
import { UpdateSlideDto } from '../dto/sliders/update-slide.dto';
import { QuerySliderDto, SortOrder } from '../dto/sliders/query-slider.dto';
import IORedis from 'ioredis';
import { REDIS_CLIENT } from "../../redis/redis.module";

export interface PaginatedSliders {
  data: Slider[];
  total: number;
  page: number;
  limit: number;
}

export interface PaginatedSlides {
  data: Slide[];
  total: number;
  page: number;
  limit: number;
}
@Injectable()
export class SlidersService {
  private readonly logger = new Logger(SlidersService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redisClient: IORedis,
  ) {}

  // Slider CRUD operations
  async createSlider(data: CreateSliderDto): Promise<Slider> {
    const newSlider = await this.prisma.slider.create({ data });
    this.logger.log(`[INVALIDATE] Deleting cache for key: 'sliders'`);
    const keys = await this.redisClient.keys('sliders_*');
    if (keys.length > 0) {
      await this.redisClient.del(keys);
    }
    return newSlider;
  }

  async findAllSliders(query: QuerySliderDto): Promise<PaginatedSliders> {
    const cacheKey = `sliders_${JSON.stringify(query)}`;
    this.logger.log(`[GET] Checking cache for key: ${cacheKey}`);
    const cachedSliders = await this.redisClient.get(cacheKey);

    if (cachedSliders) {
      this.logger.log(`[HIT] Cache hit for key: ${cacheKey}`);
      return JSON.parse(cachedSliders);
    }

    this.logger.log(`[MISS] Cache miss for key: ${cacheKey}. Fetching from DB.`);
    const { page = 1, limit = 10, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.SliderWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.SliderOrderByWithRelationInput = {};
    if (sortBy) {
        orderBy[sortBy] = sortOrder || SortOrder.DESC;
    } else {
        orderBy.createdAt = SortOrder.DESC; // Default sort
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.slider.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.slider.count({ where }),
    ]);

    const result = {
      data,
      total,
      page,
      limit,
    };
    this.logger.log(`[SET] Setting cache for key: ${cacheKey}`);
    await this.redisClient.set(cacheKey, JSON.stringify(result), 'EX', 3600);
    return result;
  }

  async findOneSlider(id: number): Promise<Slider> {
    const cacheKey = `slider_${id}`;
    this.logger.log(`[GET] Checking cache for key: ${cacheKey}`);
    const cachedSlider = await this.redisClient.get(cacheKey);

    if (cachedSlider) {
      this.logger.log(`[HIT] Cache hit for key: ${cacheKey}`);
      return JSON.parse(cachedSlider);
    }

    this.logger.log(`[MISS] Cache miss for key: ${cacheKey}. Fetching from DB.`);
    const slider = await this.prisma.slider.findUnique({ where: { id } });
    if (!slider) {
      throw new NotFoundException(`Slider with ID ${id} not found`);
    }

    this.logger.log(`[SET] Setting cache for key: ${cacheKey}`);
    await this.redisClient.set(cacheKey, JSON.stringify(slider), 'EX', 3600);
    return slider;
  }

  async updateSlider(id: number, data: UpdateSliderDto): Promise<Slider> {
    const slider = await this.prisma.slider.update({
      where: { id },
      data,
    });
    if (!slider) {
        throw new NotFoundException(`Slider with ID ${id} not found`);
    }
    this.logger.log(`[INVALIDATE] Deleting cache for key: slider_${id}`);
    await this.redisClient.del(`slider_${id}`);
    this.logger.log(`[INVALIDATE] Deleting cache for key: 'sliders'`);
    const keys = await this.redisClient.keys('sliders_*');
    if (keys.length > 0) {
      await this.redisClient.del(keys);
    }
    return slider;
  }

  async removeSlider(id: number): Promise<Slider> {
    const slider = await this.prisma.slider.delete({ where: { id } });
    if (!slider) {
        throw new NotFoundException(`Slider with ID ${id} not found`);
    }
    this.logger.log(`[INVALIDATE] Deleting cache for key: slider_${id}`);
    await this.redisClient.del(`slider_${id}`);
    this.logger.log(`[INVALIDATE] Deleting cache for key: 'sliders'`);
    const keys = await this.redisClient.keys('sliders_*');
    if (keys.length > 0) {
      await this.redisClient.del(keys);
    }
    return slider;
  }

  // Slide CRUD operations
  async createSlide(sliderId: number, data: CreateSlideDto): Promise<Slide> {
    const slideCreateInput: Prisma.SlideCreateInput = {
      title: data.title,
      description: data.description,
      linkUrl: data.linkUrl,
      sortOrder: data.sortOrder,
      slider: { connect: { id: sliderId } },
    };

    if (data.imageId) {
      slideCreateInput.image = { connect: { id: data.imageId } };
    }

    const newSlide = await this.prisma.slide.create({
      data: slideCreateInput,
    });

    this.logger.log(`[INVALIDATE] Deleting cache for key: 'slides_in_slider_${sliderId}'`);
    const keys = await this.redisClient.keys(`slides_${sliderId}_*`);
    if (keys.length > 0) {
      await this.redisClient.del(keys);
    }
    return newSlide;
  }

  async findAllSlides(sliderId: number, query: QuerySliderDto): Promise<PaginatedSlides> {
    const cacheKey = `slides_${sliderId}_${JSON.stringify(query)}`;
    this.logger.log(`[GET] Checking cache for key: ${cacheKey}`);
    const cachedSlides = await this.redisClient.get(cacheKey);

    if (cachedSlides) {
      this.logger.log(`[HIT] Cache hit for key: ${cacheKey}`);
      return JSON.parse(cachedSlides);
    }

    this.logger.log(`[MISS] Cache miss for key: ${cacheKey}. Fetching from DB.`);
    const { page = 1, limit = 10, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.SlideWhereInput = {
      sliderId,
    };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.SlideOrderByWithRelationInput = {};
    if (sortBy) {
        orderBy[sortBy] = sortOrder || SortOrder.ASC;
    } else {
        orderBy.sortOrder = SortOrder.ASC; // Default sort for slides
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.slide.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.slide.count({ where }),
    ]);

    const result = {
      data,
      total,
      page,
      limit,
    };
    this.logger.log(`[SET] Setting cache for key: ${cacheKey}`);
    await this.redisClient.set(cacheKey, JSON.stringify(result), 'EX', 3600);
    return result;
  }

  async findOneSlide(id: number): Promise<Slide> {
    const cacheKey = `slide_${id}`;
    this.logger.log(`[GET] Checking cache for key: ${cacheKey}`);
    const cachedSlide = await this.redisClient.get(cacheKey);

    if (cachedSlide) {
      this.logger.log(`[HIT] Cache hit for key: ${cacheKey}`);
      return JSON.parse(cachedSlide);
    }

    this.logger.log(`[MISS] Cache miss for key: ${cacheKey}. Fetching from DB.`);
    const slide = await this.prisma.slide.findUnique({ where: { id } });
    if (!slide) {
      throw new NotFoundException(`Slide with ID ${id} not found`);
    }

    this.logger.log(`[SET] Setting cache for key: ${cacheKey}`);
    await this.redisClient.set(cacheKey, JSON.stringify(slide), 'EX', 3600);
    return slide;
  }

  async updateSlide(id: number, data: UpdateSlideDto): Promise<Slide> {
    const slide = await this.prisma.slide.update({
      where: { id },
      data,
    });
    if (!slide) {
        throw new NotFoundException(`Slide with ID ${id} not found`);
    }
    this.logger.log(`[INVALIDATE] Deleting cache for key: slide_${id}`);
    await this.redisClient.del(`slide_${id}`);
    this.logger.log(`[INVALIDATE] Deleting cache for key: 'slides_in_slider_${slide.sliderId}'`);
    const keys = await this.redisClient.keys(`slides_${slide.sliderId}_*`);
    if (keys.length > 0) {
      await this.redisClient.del(keys);
    }
    return slide;
  }

  async removeSlide(id: number): Promise<Slide> {
    const slide = await this.prisma.slide.findUnique({ where: { id } });
    if (!slide) {
      throw new NotFoundException(`Slide with ID ${id} not found`);
    }
    await this.prisma.slide.delete({ where: { id } });

    this.logger.log(`[INVALIDATE] Deleting cache for key: slide_${id}`);
    await this.redisClient.del(`slide_${id}`);
    this.logger.log(`[INVALIDATE] Deleting cache for key: 'slides_in_slider_${slide.sliderId}'`);
    const keys = await this.redisClient.keys(`slides_${slide.sliderId}_*`);
    if (keys.length > 0) {
      await this.redisClient.del(keys);
    }
    return slide;
  }
}
