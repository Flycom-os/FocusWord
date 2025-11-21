import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user || typeof user.id !== 'number') {
      throw new Error('User ID не найден в токене');
    }

    return user.id;
  },
);
