import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  AssignRolePermissionsDto,
  CreateRoleDto,
  UpdateRoleDto,
} from './dto/role.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/dto/paginated-result.dto';

const ROLE_SELECT = {
  id: true,
  name: true,
  description: true,
  dashboardRoute: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  permissions: {
    select: {
      permission: { select: { id: true, name: true, resource: true } },
    },
  },
  _count: { select: { users: true } },
} satisfies Prisma.RoleSelect;

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRoleDto) {
    return this.prisma.role.create({
      data: {
        name: dto.name,
        description: dto.description,
        dashboardRoute: dto.dashboardRoute,
        isActive: dto.isActive ?? true,
        permissions: dto.permissionIds?.length
          ? {
              create: dto.permissionIds.map((permissionId) => ({
                permissionId,
              })),
            }
          : undefined,
      },
      select: ROLE_SELECT,
    });
  }

  async findAll(query: PaginationDto): Promise<PaginatedResult<unknown>> {
    const where: Prisma.RoleWhereInput = query.search
      ? { name: { contains: query.search } }
      : {};

    const [total, data] = await this.prisma.$transaction([
      this.prisma.role.count({ where }),
      this.prisma.role.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: { [query.sortBy ?? 'createdAt']: query.order },
        select: ROLE_SELECT,
      }),
    ]);

    return PaginatedResult.of(data, total, query.page, query.limit);
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      select: ROLE_SELECT,
    });
    if (!role) {
      throw new NotFoundException(`Role ${id} not found`);
    }
    return role;
  }

  async update(id: string, dto: UpdateRoleDto) {
    await this.findOne(id);
    return this.prisma.role.update({
      where: { id },
      data: dto,
      select: ROLE_SELECT,
    });
  }

  async assignPermissions(id: string, dto: AssignRolePermissionsDto) {
    await this.findOne(id);
    await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
    if (dto.permissionIds.length) {
      await this.prisma.rolePermission.createMany({
        data: dto.permissionIds.map((permissionId) => ({
          roleId: id,
          permissionId,
        })),
        skipDuplicates: true,
      });
    }
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.role.delete({ where: { id } });
  }
}
