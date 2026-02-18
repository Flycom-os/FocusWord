import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { SwaggerSchema } from "../../../common/interfaces/swagger-schema.interface";

export function ApiFile(fileName = 'file'): MethodDecorator {
  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          [fileName]: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    }),
  );
}

export function ApiFileWithBody(fileName = 'file', bodyDto: SwaggerSchema): MethodDecorator {

  return applyDecorators(
      ApiConsumes('multipart/form-data'),
      ApiBody({
        schema: {
          type: 'object', // Add type: 'object'
          properties: {
            [fileName]: {
              type: "string",
              format: "binary",
            },
            ...bodyDto.swaggerSchema, // Access swaggerSchema statically
          },
        },
      }),
    );
  }