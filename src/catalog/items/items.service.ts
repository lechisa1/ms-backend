import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateItemDto, QueryItemDto, UpdateItemDto } from './dto/item.dto';
import { PaginatedResult } from '../../common/dto/paginated-result.dto';

const SELECT = {
  id: true,
  name: true,
  unitOfMeasure: true,
  status: true,
  categoryId: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { id: true, name: true } },
  _count: { select: { requestItems: true } },
} satisfies Prisma.ItemSelect;

@Injectable()
export class ItemsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateItemDto) {
    return this.prisma.item.create({
      data: {
        name: dto.name,
        unitOfMeasure: dto.unitOfMeasure,
        categoryId: dto.categoryId,
        status: dto.status,
      },
      select: SELECT,
    });
  }

  async findAll(query: QueryItemDto): Promise<PaginatedResult<unknown>> {
    const where: Prisma.ItemWhereInput = {
      deletedAt: null,
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search ? { name: { contains: query.search, mode: 'insensitive' } } : {}),
    };

    const allowedSort = ['name', 'unitOfMeasure', 'status', 'createdAt', 'updatedAt'];
    const sortBy = allowedSort.includes(query.sortBy || '') ? query.sortBy : 'createdAt';
    const order = (query.sortOrder || query.order || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';

    const [total, data] = await this.prisma.$transaction([
      this.prisma.item.count({ where }),
      this.prisma.item.findMany({
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
    const item = await this.prisma.item.findFirst({
      where: { id, deletedAt: null },
      select: SELECT,
    });
    if (!item) {
      throw new NotFoundException(`Item ${id} not found`);
    }
    return item;
  }

  async update(id: string, dto: UpdateItemDto) {
    await this.findOne(id);
    return this.prisma.item.update({
      where: { id },
      data: dto,
      select: SELECT,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.item.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
    });
  }

  async restore(id: string) {
    return this.prisma.item.update({
      where: { id },
      data: { deletedAt: null, status: 'ACTIVE' },
    });
  }
}
