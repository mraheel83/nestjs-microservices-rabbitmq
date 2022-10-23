import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../users/schemas/user.schema';

export const CurrentUser = createParamDecorator(
  (_: unknown, context: ExecutionContext): User => {
    if (context.getType() === 'http') {
      return context.switchToHttp().getRequest().user;
    }

    if (context.getType() === 'rpc') {
      return context.switchToRpc().getData().user;
    }
  },
);
