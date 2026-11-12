import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateIssueCategoryDto,
  QueryIssueCategoryDto,
  UpdateIssueCategoryDto,
} from './dto/issue-category.dto';
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
  _count: { select: { issueTypes: true } },
} satisfies Prisma.IssueCategorySelect;

@Injectable()
export class IssueCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  create(dto: CreateIssueCategoryDto) {
    const slug = dto.slug?.trim() || this.slugify(dto.name);
    return this.prisma.issueCategory.create({
      data: {
        ...dto,
        slug,
      },
      select: SELECT,
    });
  }

  async findAll(query: QueryIssueCategoryDto): Promise<PaginatedResult<unknown>> {
    const where: Prisma.IssueCategoryWhereInput = {
      deletedAt: null,
      ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { slug: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const allowedSort = ['name', 'slug', 'createdAt', 'updatedAt', 'isActive'];
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

    return PaginatedResult.of(data, total, query.page, query.limit);
  }

  async findOne(id: string) {
    const category = await this.prisma.issueCategory.findFirst({
      where: { id, deletedAt: null },
      select: SELECT,
    });
    if (!category) {
      throw new NotFoundException(`Issue category ${id} not found`);
    }
    return category;
  }

  async update(id: string, dto: UpdateIssueCategoryDto) {
    await this.findOne(id);
    return this.prisma.issueCategory.update({
      where: { id },
      data: dto,
      select: SELECT,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.issueCategory.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async restore(id: string) {
    return this.prisma.issueCategory.update({
      where: { id },
      data: { deletedAt: null, isActive: true },
    });
  }
}
