import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SlidersService } from './sliders.service';

@ApiTags('public sliders')
@Controller('public/sliders')
export class PublicSlidersController {
  constructor(private readonly slidersService: SlidersService) {}

  @Get('slug/:slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a slider by slug for public pages' })
  @ApiOkResponse({ description: 'Slider with slides.' })
  findBySlug(@Param('slug') slug: string) {
    return this.slidersService.findOneSliderBySlug(slug);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a slider with slides for public pages' })
  @ApiOkResponse({ description: 'Slider with slides.' })
  findOne(@Param('id') id: string) {
    return this.slidersService.findOneSlider(+id);
  }
}
