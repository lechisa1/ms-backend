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
exports.ItemsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const paginated_result_dto_1 = require("../../common/dto/paginated-result.dto");
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
};
let ItemsService = class ItemsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(dto) {
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
    async findAll(query) {
        const where = {
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
                orderBy: { [sortBy]: order },
                select: SELECT,
            }),
        ]);
        return paginated_result_dto_1.PaginatedResult.of(data, total, query.page, query.limit);
    }
    async findOne(id) {
        const item = await this.prisma.item.findFirst({
            where: { id, deletedAt: null },
            select: SELECT,
        });
        if (!item) {
            throw new common_1.NotFoundException(`Item ${id} not found`);
        }
        return item;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.item.update({
            where: { id },
            data: dto,
            select: SELECT,
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.item.update({
            where: { id },
            data: { deletedAt: new Date(), status: 'INACTIVE' },
        });
    }
    async restore(id) {
        return this.prisma.item.update({
            where: { id },
            data: { deletedAt: null, status: 'ACTIVE' },
        });
    }
};
exports.ItemsService = ItemsService;
exports.ItemsService = ItemsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ItemsService);
//# sourceMappingURL=items.service.js.map