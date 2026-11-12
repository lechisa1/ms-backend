import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePermissionDto, UpdatePermissionDto } from './dto/permission.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/dto/paginated-result.dto';

const PERMISSION_SELECT = {
  id: true,
  name: true,
  resource: true,
  description: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { roles: true, users: true } },
} satisfies Prisma.PermissionSelect;

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePermissionDto) {
    return this.prisma.permission.create({
      data: dto,
      select: PERMISSION_SELECT,
    });
  }

  async createMany(names: string[]) {
    return this.prisma.permission.createMany({
      data: names.map((name) => ({ name })),
      skipDuplicates: true,
    });
  }

  async findAll(query: PaginationDto): Promise<PaginatedResult<unknown>> {
    const where: Prisma.PermissionWhereInput = {
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search } },
              { resource: { contains: query.search } },
            ],
          }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.permission.count({ where }),
      this.prisma.permission.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: { [query.sortBy ?? 'name']: query.order },
        select: PERMISSION_SELECT,
      }),
    ]);

    return PaginatedResult.of(data, total, query.page, query.limit);
  }

  async findOne(id: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
      select: PERMISSION_SELECT,
    });
    if (!permission) {
      throw new NotFoundException(`Permission ${id} not found`);
    }
    return permission;
  }

  async update(id: string, dto: UpdatePermissionDto) {
    await this.findOne(id);
    return this.prisma.permission.update({
      where: { id },
      data: dto,
      select: PERMISSION_SELECT,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.permission.delete({ where: { id } });
  }
}
