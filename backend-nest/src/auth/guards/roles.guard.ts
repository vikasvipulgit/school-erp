import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, ROLE_LEVEL } from '../../common/enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { MIN_ROLE_KEY } from '../decorators/min-role.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const minRole = this.reflector.getAllAndOverride<Role>(MIN_ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles && !minRole) return true;

    const { user } = context.switchToHttp().getRequest();

    if (requiredRoles) {
      if (!requiredRoles.includes(user.role)) {
        throw new ForbiddenException('Insufficient permissions');
      }
      return true;
    }

    if (minRole) {
      const userLevel = ROLE_LEVEL[user.role as Role] ?? 0;
      const minLevel = ROLE_LEVEL[minRole] ?? 0;
      if (userLevel < minLevel) {
        throw new ForbiddenException('Insufficient permissions');
      }
      return true;
    }

    return false;
  }
}
