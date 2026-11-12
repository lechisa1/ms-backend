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
exports.IssueCategoriesService = void 0;
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
    _count: { select: { issueTypes: true } },
};
let IssueCategoriesService = class IssueCategoriesService {
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
    create(dto) {
        const slug = dto.slug?.trim() || this.slugify(dto.name);
        return this.prisma.issueCategory.create({
            data: {
                ...dto,
                slug,
            },
            select: SELECT,
        });
    }
    async findAll(query) {
        const where = {
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
                orderBy: { [sortBy]: order },
                select: SELECT,
            }),
        ]);
        return paginated_result_dto_1.PaginatedResult.of(data, total, query.page, query.limit);
    }
    async findOne(id) {
        const category = await this.prisma.issueCategory.findFirst({
            where: { id, deletedAt: null },
            select: SELECT,
        });
        if (!category) {
            throw new common_1.NotFoundException(`Issue category ${id} not found`);
        }
        return category;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.issueCategory.update({
            where: { id },
            data: dto,
            select: SELECT,
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.issueCategory.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false },
        });
    }
    async restore(id) {
        return this.prisma.issueCategory.update({
            where: { id },
            data: { deletedAt: null, isActive: true },
        });
    }
};
exports.IssueCategoriesService = IssueCategoriesService;
exports.IssueCategoriesService = IssueCategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IssueCategoriesService);
//# sourceMappingURL=issue-categories.service.js.map