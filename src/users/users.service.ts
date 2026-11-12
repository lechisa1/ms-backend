import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, ResetPasswordDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { AssignRolesDto, AssignPermissionsDto } from './dto/assign-roles.dto';
import { PaginatedResult } from '../common/dto/paginated-result.dto';
import { USER_PUBLIC_SELECT } from '../common/utils/user-select';

const USER_DETAIL_SELECT = {
  ...USER_PUBLIC_SELECT,
  organizationUnit: { select: { id: true, name: true, code: true } },
  supervisedUnit: { select: { id: true, name: true } },
  roleAssignments: {
    select: {
      assignedAt: true,
      role: { select: { id: true, name: true, dashboardRoute: true } },
    },
  },
  permissionGrants: {
    select: {
      grantedAt: true,
      permission: { select: { id: true, name: true } },
    },
  },
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private get saltRounds(): number {
    return Number(this.configService.get('BCRYPT_SALT_ROUNDS', 10));
  }

  async create(dto: CreateUserDto) {
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
        isActive: dto.isActive ?? true,
        organizationUnitId: dto.organizationUnitId,
        membershipRole: dto.membershipRole,
        roleAssignments: dto.roleIds?.length
          ? { create: dto.roleIds.map((roleId) => ({ roleId })) }
          : undefined,
        permissionGrants: dto.permissionNames?.length
          ? {
              create: await this.resolvePermissionNames(dto.permissionNames),
            }
          : undefined,
      },
      select: USER_DETAIL_SELECT,
    });

    return user;
  }

  private async resolvePermissionNames(
    names: string[],
  ): Promise<{ permissionId: string }[]> {
    const permissions = await this.prisma.permission.findMany({
      where: { name: { in: names } },
      select: { id: true, name: true },
    });

    const missing = names.filter(
      (name) => !permissions.some((permission) => permission.name === name),
    );
    if (missing.length) {
      throw new NotFoundException(`Unknown permissions: ${missing.join(', ')}`);
    }

    return permissions.map((permission) => ({ permissionId: permission.id }));
  }

  async findAll(query: QueryUserDto): Promise<PaginatedResult<unknown>> {
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(query.organizationUnitId
        ? { organizationUnitId: query.organizationUnitId }
        : {}),
      ...(query.membershipRole ? { membershipRole: query.membershipRole } : {}),
      ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
      ...(query.roleId
        ? { roleAssignments: { some: { roleId: query.roleId } } }
        : {}),
      ...(query.search
        ? {
            OR: [
              { fullName: { contains: query.search } },
              { email: { contains: query.search } },
              { phone: { contains: query.search } },
            ],
          }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: { [query.sortBy ?? 'createdAt']: query.order },
        select: USER_DETAIL_SELECT,
      }),
    ]);

    return PaginatedResult.of(data, total, query.page, query.limit);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: USER_DETAIL_SELECT,
    });

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return user;
  }

  async findOneByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: { email: email.toLowerCase().trim(), deletedAt: null },
      select: USER_DETAIL_SELECT,
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);

    const { email, ...rest } = dto;

    return this.prisma.user.update({
      where: { id },
      data: {
        ...rest,
        ...(email ? { email: email.toLowerCase().trim() } : {}),
      },
      select: USER_DETAIL_SELECT,
    });
  }

  async resetPassword(id: string, dto: ResetPasswordDto) {
    await this.findOne(id);
    const passwordHash = await bcrypt.hash(dto.newPassword, this.saltRounds);
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (user) {
      await this.prisma.passwordHistory.create({
        data: { userId: id, passwordHash: user.passwordHash },
      });
    }

    await this.prisma.user.update({ where: { id }, data: { passwordHash } });
    return { success: true };
  }

  async assignRoles(id: string, dto: AssignRolesDto) {
    await this.findOne(id);

    await this.prisma.userRole.deleteMany({ where: { userId: id } });
    if (dto.roleIds.length) {
      await this.prisma.userRole.createMany({
        data: dto.roleIds.map((roleId) => ({ userId: id, roleId })),
        skipDuplicates: true,
      });
    }

    return this.findOne(id);
  }

  async assignPermissions(id: string, dto: AssignPermissionsDto) {
    await this.findOne(id);

    const ids = new Set<string>(dto.permissionIds ?? []);
    if (dto.permissionNames?.length) {
      const resolved = await this.resolvePermissionNames(dto.permissionNames);
      resolved.forEach((item) => ids.add(item.permissionId));
    }

    await this.prisma.userPermission.deleteMany({ where: { userId: id } });
    if (ids.size) {
      await this.prisma.userPermission.createMany({
        data: [...ids].map((permissionId) => ({ userId: id, permissionId })),
        skipDuplicates: true,
      });
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async restore(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: null, isActive: true },
    });
  }

  async technicians() {
    return this.prisma.user.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        OR: [
          {
            roleAssignments: {
              some: {
                role: {
                  permissions: {
                    some: {
                      permission: {
                        name: 'tasks:technician',
                      },
                    },
                  },
                },
              },
            },
          },
          {
            permissionGrants: {
              some: {
                permission: {
                  name: 'tasks:technician',
                },
              },
            },
          },
        ],
      },
      select: USER_PUBLIC_SELECT,
      orderBy: { fullName: 'asc' },
    });
  }
}
