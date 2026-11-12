import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { UnauthorizedException } from '@nestjs/common';

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'dev-secret'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.prisma.user.findFirst({
      where: { id: payload.sub, isActive: true, deletedAt: null },
      select: {
        id: true,
        email: true,
        organizationUnitId: true,
        membershipRole: true,
        permissionGrants: {
          select: { permission: { select: { name: true } } },
        },
        roleAssignments: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
                permissions: {
                  select: { permission: { select: { name: true } } },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Account is inactive or no longer exists',
      );
    }

    const rolePermissions = user.roleAssignments.flatMap((assignment) =>
      assignment.role.permissions.map((rp) => rp.permission.name),
    );
    const directPermissions = user.permissionGrants.map(
      (gp) => gp.permission.name,
    );

    const roles = user.roleAssignments.map((assignment) => assignment.role.name);
    const allPerms = [...new Set([...rolePermissions, ...directPermissions])];

    return {
      id: user.id,
      email: user.email,
      organizationUnitId: user.organizationUnitId,
      membershipRole: user.membershipRole,
      roles,
      permissions: allPerms,
    };
  }
}
