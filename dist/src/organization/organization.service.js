"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const paginated_result_dto_1 = require("../common/dto/paginated-result.dto");
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
};
let OrganizationService = class OrganizationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findTypes() {
        return this.prisma.organizationUnitType.findMany({
            orderBy: { name: 'asc' },
        });
    }
    async generateCode(name) {
        const cleanName = name.trim();
        const words = cleanName.split(/[\s\-_]+/).filter(Boolean);
        let baseAcronym = '';
        if (words.length > 1) {
            baseAcronym = words
                .map((w) => w[0].toUpperCase())
                .join('')
                .replace(/[^A-Z0-9]/g, '');
        }
        else if (words.length === 1) {
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
    async create(dto) {
        if (dto.parentId) {
            await this.findOne(dto.parentId);
        }
        if (dto.supervisorId) {
            const user = await this.prisma.user.findFirst({
                where: { id: dto.supervisorId, deletedAt: null },
                select: { id: true },
            });
            if (!user) {
                throw new common_1.NotFoundException(`User ${dto.supervisorId} not found`);
            }
            await this.prisma.organizationUnit.updateMany({
                where: { supervisorId: dto.supervisorId },
                data: { supervisorId: null },
            });
        }
        const code = dto.code && dto.code.trim().length > 0
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
    async findAll(query) {
        const where = {
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
        return paginated_result_dto_1.PaginatedResult.of(data, total, query.page, query.limit);
    }
    async findOne(id) {
        const unit = await this.prisma.organizationUnit.findFirst({
            where: { id, deletedAt: null },
            select: UNIT_SELECT,
        });
        if (!unit) {
            throw new common_1.NotFoundException(`Organization unit ${id} not found`);
        }
        return unit;
    }
    async tree() {
        const units = await this.prisma.organizationUnit.findMany({
            where: { deletedAt: null },
            select: UNIT_SELECT,
            orderBy: { name: 'asc' },
        });
        const byId = new Map();
        const roots = [];
        for (const unit of units) {
            const node = { ...unit, children: [] };
            byId.set(unit.id, node);
        }
        for (const node of byId.values()) {
            const parentId = node.parentId;
            const parent = parentId ? byId.get(parentId) : undefined;
            if (parent) {
                parent.children.push(node);
            }
            else {
                roots.push(node);
            }
        }
        return roots;
    }
    async children(id) {
        await this.findOne(id);
        return this.prisma.organizationUnit.findMany({
            where: { parentId: id, deletedAt: null },
            select: UNIT_SELECT,
            orderBy: { name: 'asc' },
        });
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.organizationUnit.update({
            where: { id },
            data: dto,
            select: UNIT_SELECT,
        });
    }
    async move(id, dto) {
        await this.findOne(id);
        const parentId = dto.parentId ?? null;
        if (parentId) {
            if (parentId === id) {
                throw new common_1.BadRequestException('A unit cannot be its own parent');
            }
            if (await this.isDescendant(parentId, id)) {
                throw new common_1.BadRequestException('Cannot move a unit under one of its own descendants');
            }
            await this.findOne(parentId);
        }
        return this.prisma.organizationUnit.update({
            where: { id },
            data: { parentId },
            select: UNIT_SELECT,
        });
    }
    async isDescendant(candidateId, ancestorId) {
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
    async assignSupervisor(id, dto) {
        await this.findOne(id);
        const supervisorId = dto.supervisorId ?? null;
        if (supervisorId) {
            const user = await this.prisma.user.findFirst({
                where: { id: supervisorId, deletedAt: null },
                select: { id: true },
            });
            if (!user) {
                throw new common_1.NotFoundException(`User ${supervisorId} not found`);
            }
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
    async members(id) {
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
    async remove(id) {
        await this.findOne(id);
        return this.prisma.organizationUnit.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false },
        });
    }
    async restore(id) {
        return this.prisma.organizationUnit.update({
            where: { id },
            data: { deletedAt: null, isActive: true },
        });
    }
};
exports.OrganizationService = OrganizationService;
exports.OrganizationService = OrganizationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrganizationService);
//# sourceMappingURL=organization.service.js.map