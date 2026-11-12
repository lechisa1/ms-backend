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
exports.PermissionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const paginated_result_dto_1 = require("../common/dto/paginated-result.dto");
const PERMISSION_SELECT = {
    id: true,
    name: true,
    resource: true,
    description: true,
    createdAt: true,
    updatedAt: true,
    _count: { select: { roles: true, users: true } },
};
let PermissionsService = class PermissionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        return this.prisma.permission.create({
            data: dto,
            select: PERMISSION_SELECT,
        });
    }
    async createMany(names) {
        return this.prisma.permission.createMany({
            data: names.map((name) => ({ name })),
            skipDuplicates: true,
        });
    }
    async findAll(query) {
        const where = {
            ...(query.search
                ? {
                    OR: [
                        { name: { contains: query.search } },
                        { resource: { contains: query.search } },
                    ],
                }
                : {}),
        };
        const [total, data] = await this.prisma.$transaction([
            this.prisma.permission.count({ where }),
            this.prisma.permission.findMany({
                where,
                skip: query.skip,
                take: query.limit,
                orderBy: { [query.sortBy ?? 'name']: query.order },
                select: PERMISSION_SELECT,
            }),
        ]);
        return paginated_result_dto_1.PaginatedResult.of(data, total, query.page, query.limit);
    }
    async findOne(id) {
        const permission = await this.prisma.permission.findUnique({
            where: { id },
            select: PERMISSION_SELECT,
        });
        if (!permission) {
            throw new common_1.NotFoundException(`Permission ${id} not found`);
        }
        return permission;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.permission.update({
            where: { id },
            data: dto,
            select: PERMISSION_SELECT,
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.permission.delete({ where: { id } });
    }
};
exports.PermissionsService = PermissionsService;
exports.PermissionsService = PermissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PermissionsService);
//# sourceMappingURL=permissions.service.js.map