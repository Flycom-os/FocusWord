import { PartialType } from '@nestjs/swagger';
import { CreateSlideDto } from './create-slide.dto';

export class UpdateSlideDto extends PartialType(CreateSlideDto) {}
