import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateMaintenanceCategoryDto,
  UpdateMaintenanceCategoryDto,
} from './dto/maintenance-category.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PaginatedResult } from '../../common/dto/paginated-result.dto';

const SELECT = {
  id: true,
  name: true,
  slug: true,
  description: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { requestItems: true } },
} satisfies Prisma.IssueCategorySelect;

@Injectable()
export class MaintenanceCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(dto: CreateMaintenanceCategoryDto) {
    const slug = this.slugify(dto.name);
    const item = await this.prisma.issueCategory.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
      },
      select: SELECT,
    });
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      _count: { requests: item._count.requestItems },
    };
  }

  async findAll(query: PaginationDto): Promise<PaginatedResult<unknown>> {
    const where: Prisma.IssueCategoryWhereInput = {
      deletedAt: null,
      ...(query.search ? { name: { contains: query.search, mode: 'insensitive' } } : {}),
    };

    const allowedSort = ['name', 'createdAt', 'updatedAt'];
    const sortBy = allowedSort.includes(query.sortBy || '') ? query.sortBy : 'name';
    const order = (query.sortOrder || query.order || 'asc').toLowerCase() === 'desc' ? 'desc' : 'asc';

    const [total, data] = await this.prisma.$transaction([
      this.prisma.issueCategory.count({ where }),
      this.prisma.issueCategory.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: { [sortBy as string]: order },
        select: SELECT,
      }),
    ]);

    const mapped = data.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      _count: { requests: item._count.requestItems },
    }));

    return PaginatedResult.of(mapped, total, query.page, query.limit);
  }

  async findOne(id: string) {
    const item = await this.prisma.issueCategory.findFirst({
      where: { id, deletedAt: null },
      select: SELECT,
    });
    if (!item) {
      throw new NotFoundException(`Maintenance category ${id} not found`);
    }
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      _count: { requests: item._count.requestItems },
    };
  }

  async update(id: string, dto: UpdateMaintenanceCategoryDto) {
    await this.findOne(id);
    const data: Prisma.IssueCategoryUpdateInput = {
      ...dto,
      ...(dto.name ? { slug: this.slugify(dto.name) } : {}),
    };
    const item = await this.prisma.issueCategory.update({
      where: { id },
      data,
      select: SELECT,
    });
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      _count: { requests: item._count.requestItems },
    };
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.issueCategory.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
