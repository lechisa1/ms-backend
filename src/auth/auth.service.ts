import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthUser } from '../common/interfaces/auth-user.interface';
import { USER_PUBLIC_SELECT } from '../common/utils/user-select';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface AuthResult {
  user: Record<string, unknown>;
  tokens: AuthTokens;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private get saltRounds(): number {
    return Number(this.configService.get('BCRYPT_SALT_ROUNDS', 10));
  }

  private toSeconds(value: string): number {
    const match = /^(\d+)\s*([smhd])?$/.exec(value.trim());
    if (!match) {
      return 900;
    }

    const amount = Number(match[1]);
    const unit = match[2] ?? 's';
    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    return amount * (multipliers[unit] ?? 1);
  }

  private async signTokens(userId: string, email: string): Promise<AuthTokens> {
    const payload = { sub: userId, email };
    const accessExpiration = this.configService.get<string>(
      'JWT_ACCESS_EXPIRATION',
      '15m',
    );
    const refreshExpiration = this.configService.get<string>(
      'JWT_REFRESH_EXPIRATION',
      '7d',
    );

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: this.toSeconds(accessExpiration),
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: this.toSeconds(refreshExpiration),
      }),
    ]);

    return { accessToken, refreshToken, expiresIn: accessExpiration };
  }

  async register(dto: RegisterDto): Promise<AuthResult> {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, this.saltRounds);

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email,
        phone: dto.phone,
        passwordHash,
        organizationUnitId: dto.organizationUnitId,
        membershipRole: dto.membershipRole,
        roleAssignments: dto.roleIds?.length
          ? { create: dto.roleIds.map((roleId) => ({ roleId })) }
          : undefined,
      },
      select: USER_PUBLIC_SELECT,
    });

    const tokens = await this.signTokens(user.id, user.email);
    return { user, tokens };
  }

  async login(dto: LoginDto, ip?: string): Promise<AuthResult> {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        passwordHash: true,
        deletedAt: true,
        roleAssignments: {
          select: {
            role: { select: { id: true, name: true, dashboardRoute: true } },
          },
        },
        permissionGrants: {
          select: { permission: { select: { name: true } } },
        },
        organizationUnit: { select: { id: true, name: true, code: true } },
        supervisedUnit: { select: { id: true, name: true } },
        ...USER_PUBLIC_SELECT,
      },
    });

    if (!user || user.deletedAt || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const matches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!matches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), lastLoginIp: ip ?? null },
    });

    const safeUser: Record<string, unknown> = { ...user };
    delete safeUser.passwordHash;
    delete safeUser.deletedAt;

    const tokens = await this.signTokens(user.id, user.email);
    return { user: safeUser, tokens };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
      }>(refreshToken);
      return await this.signTokens(payload.sub, payload.email);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async profile(userId: string): Promise<Record<string, unknown>> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: {
        ...USER_PUBLIC_SELECT,
        roleAssignments: {
          select: {
            role: { select: { id: true, name: true, dashboardRoute: true } },
          },
        },
        permissionGrants: {
          select: { permission: { select: { name: true } } },
        },
        organizationUnit: { select: { id: true, name: true, code: true } },
        supervisedUnit: { select: { id: true, name: true } },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const matches = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!matches) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, this.saltRounds);

    await this.prisma.$transaction([
      this.prisma.passwordHistory.create({
        data: { userId, passwordHash: user.passwordHash },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      }),
    ]);

    this.logger.log(`Password changed for user ${userId}`);
  }

  permissions(user: AuthUser): string[] {
    return user.permissions;
  }
}
