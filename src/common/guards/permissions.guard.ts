import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { AuthUser } from '../interfaces/auth-user.interface';
import type { AuthenticatedRequest } from '../interfaces/auth-user.interface';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user: AuthUser | undefined = request.user;

    if (!user) {
      throw new ForbiddenException('No authenticated user found');
    }

    const granted = new Set(user.permissions ?? []);
    if (granted.has('*')) {
      return true;
    }
    const allowed = required.some((permission) => granted.has(permission));

    if (!allowed) {
      throw new ForbiddenException(
        `Missing required permission: ${required.join(', ')}`,
      );
    }

    return true;
  }
}
