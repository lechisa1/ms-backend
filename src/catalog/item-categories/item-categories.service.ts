import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateItemCategoryDto,
  UpdateItemCategoryDto,
} from './dto/item-category.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PaginatedResult } from '../../common/dto/paginated-result.dto';

const SELECT = {
  id: true,
  name: true,
  description: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { items: true, specificationItems: true } },
} satisfies Prisma.ItemCategorySelect;

@Injectable()
export class ItemCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateItemCategoryDto) {
    return this.prisma.itemCategory.create({ data: dto, select: SELECT });
  }

  async findAll(query: PaginationDto): Promise<PaginatedResult<unknown>> {
    const where: Prisma.ItemCategoryWhereInput = query.search
      ? { name: { contains: query.search, mode: 'insensitive' } }
      : {};

    const allowedSort = ['name', 'createdAt', 'updatedAt'];
    const sortBy = allowedSort.includes(query.sortBy || '') ? query.sortBy : 'name';
    const order = (query.sortOrder || query.order || 'asc').toLowerCase() === 'desc' ? 'desc' : 'asc';

    const [total, data] = await this.prisma.$transaction([
      this.prisma.itemCategory.count({ where }),
      this.prisma.itemCategory.findMany({
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
    const category = await this.prisma.itemCategory.findUnique({
      where: { id },
      select: SELECT,
    });
    if (!category) {
      throw new NotFoundException(`Item category ${id} not found`);
    }
    return category;
  }

  async update(id: string, dto: UpdateItemCategoryDto) {
    await this.findOne(id);
    return this.prisma.itemCategory.update({
      where: { id },
      data: dto,
      select: SELECT,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.itemCategory.delete({ where: { id } });
  }
}
