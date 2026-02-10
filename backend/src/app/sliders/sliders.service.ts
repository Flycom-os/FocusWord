import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Slider, Slide, Prisma } from '@prisma/client'; // Import Prisma
import { CreateSliderDto } from '../dto/sliders/create-slider.dto';
import { UpdateSliderDto } from '../dto/sliders/update-slider.dto';
import { CreateSlideDto } from '../dto/sliders/create-slide.dto';
import { UpdateSlideDto } from '../dto/sliders/update-slide.dto';
import { QuerySliderDto, SortOrder } from '../dto/sliders/query-slider.dto';

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
  constructor(private prisma: PrismaService) {}

  // Slider CRUD operations
  async createSlider(data: CreateSliderDto): Promise<Slider> {
    return this.prisma.slider.create({ data });
  }

  async findAllSliders(query: QuerySliderDto): Promise<PaginatedSliders> {
    const { page = 1, limit = 10, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
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

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOneSlider(id: number): Promise<Slider> {
    const slider = await this.prisma.slider.findUnique({ where: { id } });
    if (!slider) {
      throw new NotFoundException(`Slider with ID ${id} not found`);
    }
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
    return slider;
  }

  async removeSlider(id: number): Promise<Slider> {
    const slider = await this.prisma.slider.delete({ where: { id } });
    if (!slider) {
        throw new NotFoundException(`Slider with ID ${id} not found`);
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

    return this.prisma.slide.create({
      data: slideCreateInput,
    });
  }

  async findAllSlides(sliderId: number, query: QuerySliderDto): Promise<PaginatedSlides> {
    const { page = 1, limit = 10, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      sliderId,
    };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
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

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOneSlide(id: number): Promise<Slide> {
    const slide = await this.prisma.slide.findUnique({ where: { id } });
    if (!slide) {
      throw new NotFoundException(`Slide with ID ${id} not found`);
    }
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
    return slide;
  }

  async removeSlide(id: number): Promise<Slide> {
    const slide = await this.prisma.slide.delete({ where: { id } });
    if (!slide) {
        throw new NotFoundException(`Slide with ID ${id} not found`);
    }
    return slide;
  }
}
