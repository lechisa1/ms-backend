import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateIssueTypeDto,
  QueryIssueTypeDto,
  UpdateIssueTypeDto,
} from './dto/issue-type.dto';
import { PaginatedResult } from '../../common/dto/paginated-result.dto';

const SELECT = {
  id: true,
  name: true,
  slug: true,
  description: true,
  isActive: true,
  needsApproval: true,
  issueCategoryId: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { id: true, name: true, slug: true } },
  _count: { select: { requestItems: true } },
} satisfies Prisma.IssueTypeSelect;

@Injectable()
export class IssueTypesService {
  constructor(private readonly prisma: PrismaService) {}

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  create(dto: CreateIssueTypeDto) {
    const slug = dto.slug?.trim() || this.slugify(dto.name);
    return this.prisma.issueType.create({
      data: {
        ...dto,
        slug,
      },
      select: SELECT,
    });
  }

  async findAll(query: QueryIssueTypeDto): Promise<PaginatedResult<unknown>> {
    const where: Prisma.IssueTypeWhereInput = {
      deletedAt: null,
      ...(query.issueCategoryId
        ? { issueCategoryId: query.issueCategoryId }
        : {}),
      ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
      ...(query.needsApproval === undefined
        ? {}
        : { needsApproval: query.needsApproval }),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { slug: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const allowedSort = ['name', 'slug', 'createdAt', 'updatedAt', 'isActive', 'needsApproval'];
    const sortBy = allowedSort.includes(query.sortBy || '') ? query.sortBy : 'name';
    const order = (query.sortOrder || query.order || 'asc').toLowerCase() === 'desc' ? 'desc' : 'asc';

    const [total, data] = await this.prisma.$transaction([
      this.prisma.issueType.count({ where }),
      this.prisma.issueType.findMany({
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
    const issueType = await this.prisma.issueType.findFirst({
      where: { id, deletedAt: null },
      select: SELECT,
    });
    if (!issueType) {
      throw new NotFoundException(`Issue type ${id} not found`);
    }
    return issueType;
  }

  async update(id: string, dto: UpdateIssueTypeDto) {
    await this.findOne(id);
    return this.prisma.issueType.update({
      where: { id },
      data: dto,
      select: SELECT,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.issueType.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async restore(id: string) {
    return this.prisma.issueType.update({
      where: { id },
      data: { deletedAt: null, isActive: true },
    });
  }
}
