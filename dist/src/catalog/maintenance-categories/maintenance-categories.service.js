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
exports.MaintenanceCategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const paginated_result_dto_1 = require("../../common/dto/paginated-result.dto");
const SELECT = {
    id: true,
    name: true,
    slug: true,
    description: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
    _count: { select: { requestItems: true } },
};
let MaintenanceCategoriesService = class MaintenanceCategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    slugify(name) {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    async create(dto) {
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
    async findAll(query) {
        const where = {
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
                orderBy: { [sortBy]: order },
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
        return paginated_result_dto_1.PaginatedResult.of(mapped, total, query.page, query.limit);
    }
    async findOne(id) {
        const item = await this.prisma.issueCategory.findFirst({
            where: { id, deletedAt: null },
            select: SELECT,
        });
        if (!item) {
            throw new common_1.NotFoundException(`Maintenance category ${id} not found`);
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
    async update(id, dto) {
        await this.findOne(id);
        const data = {
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
    async remove(id) {
        await this.findOne(id);
        return this.prisma.issueCategory.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
};
exports.MaintenanceCategoriesService = MaintenanceCategoriesService;
exports.MaintenanceCategoriesService = MaintenanceCategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MaintenanceCategoriesService);
//# sourceMappingURL=maintenance-categories.service.js.map