import { PartialType } from '@nestjs/mapped-types';
import { CreateMediaFileDto } from './create-media-file.dto';

export class UpdateMediaFileDto extends PartialType(CreateMediaFileDto) {
  // All fields are optional because PartialType makes them so.
  // Add any specific validation or new fields if necessary for updates.
}
