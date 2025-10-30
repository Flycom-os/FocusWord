import { createParamDecorator, ExecutionContext } from '@nestjs/common';
//is used to get the ID of an authorized user 
export const UserId = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user.id;
});
