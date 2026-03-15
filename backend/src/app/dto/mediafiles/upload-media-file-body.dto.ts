import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SwaggerSchemaProperty } from '../../../common/interfaces/swagger-schema-property.interface';

export class UploadMediaFileBodyDto {
  @ApiProperty({ description: 'Alternative text for the media file', required: false })
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiProperty({ description: 'Caption for the media file', required: false })
  @IsOptional()
  @IsString()
  caption?: string;

  // Static property for Swagger schema when used with ApiFileWithBody
  static swaggerSchema: Record<string, SwaggerSchemaProperty> = {
    altText: { type: 'string', required: false, description: 'Alternative text for the media file' },
    caption: { type: 'string', required: false, description: 'Caption for the media file' },
  };
}



