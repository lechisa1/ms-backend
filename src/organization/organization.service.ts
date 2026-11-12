import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  AssignSupervisorDto,
  CreateOrganizationUnitDto,
  MoveOrganizationUnitDto,
  UpdateOrganizationUnitDto,
} from './dto/organization-unit.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/dto/paginated-result.dto';

const UNIT_SELECT = {
  id: true,
  name: true,
  code: true,
  unitType: true,
  description: true,
  parentId: true,
  isActive: true,
  supervisorId: true,
  createdAt: true,
  updatedAt: true,
  parent: { select: { id: true, name: true, code: true } },
  supervisor: { select: { id: true, fullName: true, email: true } },
  _count: {
    select: { children: true, members: true },
  },
} satisfies Prisma.OrganizationUnitSelect;

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  async findTypes() {
    return this.prisma.organizationUnitType.findMany({
      orderBy: { name: 'asc' },
    });
  }

  private async generateCode(name: string): Promise<string> {
    const cleanName = name.trim();
    const words = cleanName.split(/[\s\-_]+/).filter(Boolean);
    let baseAcronym = '';

    if (words.length > 1) {
      baseAcronym = words
        .map((w) => w[0].toUpperCase())
        .join('')
        .replace(/[^A-Z0-9]/g, '');
    } else if (words.length === 1) {
      baseAcronym = words[0].slice(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, '');
    }

    if (!baseAcronym || baseAcronym.length < 2) {
      baseAcronym = 'ORG';
    }

    let counter = 1;
    let candidateCode = `${baseAcronym}-${String(counter).padStart(2, '0')}`;
    while (await this.prisma.organizationUnit.findFirst({ where: { code: candidateCode } })) {
      counter++;
      candidateCode = `${baseAcronym}-${String(counter).padStart(2, '0')}`;
    }

    return candidateCode;
  }

  async create(dto: CreateOrganizationUnitDto) {
    if (dto.parentId) {
      await this.findOne(dto.parentId);
    }

    if (dto.supervisorId) {
      const user = await this.prisma.user.findFirst({
        where: { id: dto.supervisorId, deletedAt: null },
        select: { id: true },
      });
      if (!user) {
        throw new NotFoundException(`User ${dto.supervisorId} not found`);
      }
      await this.prisma.organizationUnit.updateMany({
        where: { supervisorId: dto.supervisorId },
        data: { supervisorId: null },
      });
    }

    const code =
      dto.code && dto.code.trim().length > 0
        ? dto.code.trim().toUpperCase()
        : await this.generateCode(dto.name);

    return this.prisma.organizationUnit.create({
      data: {
        name: dto.name,
        code,
        unitType: dto.unitType,
        description: dto.description,
        parentId: dto.parentId,
        isActive: dto.isActive ?? true,
        supervisorId: dto.supervisorId,
      },
      select: UNIT_SELECT,
    });
  }

  async findAll(query: PaginationDto): Promise<PaginatedResult<unknown>> {
    const where: Prisma.OrganizationUnitWhereInput = {
      deletedAt: null,
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search } },
              { code: { contains: query.search } },
            ],
          }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.organizationUnit.count({ where }),
      this.prisma.organizationUnit.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: { [query.sortBy ?? 'name']: query.order },
        select: UNIT_SELECT,
      }),
    ]);

    return PaginatedResult.of(data, total, query.page, query.limit);
  }

  async findOne(id: string) {
    const unit = await this.prisma.organizationUnit.findFirst({
      where: { id, deletedAt: null },
      select: UNIT_SELECT,
    });

    if (!unit) {
      throw new NotFoundException(`Organization unit ${id} not found`);
    }

    return unit;
  }

  async tree(): Promise<unknown> {
    const units = await this.prisma.organizationUnit.findMany({
      where: { deletedAt: null },
      select: UNIT_SELECT,
      orderBy: { name: 'asc' },
    });

    const byId = new Map<string, Record<string, unknown>>();
    const roots: Record<string, unknown>[] = [];

    for (const unit of units) {
      const node = { ...unit, children: [] as Record<string, unknown>[] };
      byId.set(unit.id, node);
    }

    for (const node of byId.values()) {
      const parentId = node.parentId as string | null;
      const parent = parentId ? byId.get(parentId) : undefined;
      if (parent) {
        (parent.children as Record<string, unknown>[]).push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  async children(id: string) {
    await this.findOne(id);
    return this.prisma.organizationUnit.findMany({
      where: { parentId: id, deletedAt: null },
      select: UNIT_SELECT,
      orderBy: { name: 'asc' },
    });
  }

  async update(id: string, dto: UpdateOrganizationUnitDto) {
    await this.findOne(id);
    return this.prisma.organizationUnit.update({
      where: { id },
      data: dto,
      select: UNIT_SELECT,
    });
  }

  async move(id: string, dto: MoveOrganizationUnitDto) {
    await this.findOne(id);
    const parentId = dto.parentId ?? null;

    if (parentId) {
      if (parentId === id) {
        throw new BadRequestException('A unit cannot be its own parent');
      }
      if (await this.isDescendant(parentId, id)) {
        throw new BadRequestException(
          'Cannot move a unit under one of its own descendants',
        );
      }
      await this.findOne(parentId);
    }

    return this.prisma.organizationUnit.update({
      where: { id },
      data: { parentId },
      select: UNIT_SELECT,
    });
  }

  private async isDescendant(
    candidateId: string,
    ancestorId: string,
  ): Promise<boolean> {
    let current = await this.prisma.organizationUnit.findUnique({
      where: { id: candidateId },
      select: { parentId: true },
    });

    while (current?.parentId) {
      if (current.parentId === ancestorId) {
        return true;
      }
      current = await this.prisma.organizationUnit.findUnique({
        where: { id: current.parentId },
        select: { parentId: true },
      });
    }

    return false;
  }

  async assignSupervisor(id: string, dto: AssignSupervisorDto) {
    await this.findOne(id);
    const supervisorId = dto.supervisorId ?? null;

    if (supervisorId) {
      const user = await this.prisma.user.findFirst({
        where: { id: supervisorId, deletedAt: null },
        select: { id: true },
      });
      if (!user) {
        throw new NotFoundException(`User ${supervisorId} not found`);
      }

      // Clear supervisor from any previous unit to satisfy unique constraint
      await this.prisma.organizationUnit.updateMany({
        where: { supervisorId, id: { not: id } },
        data: { supervisorId: null },
      });
    }

    await this.prisma.organizationUnit.update({
      where: { id },
      data: { supervisorId },
    });

    return this.findOne(id);
  }

  async members(id: string) {
    await this.findOne(id);
    return this.prisma.user.findMany({
      where: { organizationUnitId: id, deletedAt: null },
      select: {
        id: true,
        fullName: true,
        email: true,
        membershipRole: true,
        isActive: true,
      },
      orderBy: { fullName: 'asc' },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.organizationUnit.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async restore(id: string) {
    return this.prisma.organizationUnit.update({
      where: { id },
      data: { deletedAt: null, isActive: true },
    });
  }
}
