import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

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

export function ApiFileWithBody(fileName = 'file', bodyDto: any): MethodDecorator { // Changed Function to any for simpler static access

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