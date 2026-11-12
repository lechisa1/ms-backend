import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import type {
  AuthenticatedRequest,
  AuthUser,
} from '../interfaces/auth-user.interface';

export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user: AuthUser | undefined = request.user;
    return data ? user?.[data] : user;
  },
);
