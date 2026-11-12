"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../prisma/prisma.service");
const paginated_result_dto_1 = require("../common/dto/paginated-result.dto");
const user_select_1 = require("../common/utils/user-select");
const USER_DETAIL_SELECT = {
    ...user_select_1.USER_PUBLIC_SELECT,
    organizationUnit: { select: { id: true, name: true, code: true } },
    supervisedUnit: { select: { id: true, name: true } },
    roleAssignments: {
        select: {
            assignedAt: true,
            role: { select: { id: true, name: true, dashboardRoute: true } },
        },
    },
    permissionGrants: {
        select: {
            grantedAt: true,
            permission: { select: { id: true, name: true } },
        },
    },
};
let UsersService = class UsersService {
    prisma;
    configService;
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
    }
    get saltRounds() {
        return Number(this.configService.get('BCRYPT_SALT_ROUNDS', 10));
    }
    async create(dto) {
        const email = dto.email.toLowerCase().trim();
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing) {
            throw new common_1.ConflictException('A user with this email already exists');
        }
        const passwordHash = await bcrypt.hash(dto.password, this.saltRounds);
        const user = await this.prisma.user.create({
            data: {
                fullName: dto.fullName,
                email,
                phone: dto.phone,
                passwordHash,
                isActive: dto.isActive ?? true,
                organizationUnitId: dto.organizationUnitId,
                membershipRole: dto.membershipRole,
                roleAssignments: dto.roleIds?.length
                    ? { create: dto.roleIds.map((roleId) => ({ roleId })) }
                    : undefined,
                permissionGrants: dto.permissionNames?.length
                    ? {
                        create: await this.resolvePermissionNames(dto.permissionNames),
                    }
                    : undefined,
            },
            select: USER_DETAIL_SELECT,
        });
        return user;
    }
    async resolvePermissionNames(names) {
        const permissions = await this.prisma.permission.findMany({
            where: { name: { in: names } },
            select: { id: true, name: true },
        });
        const missing = names.filter((name) => !permissions.some((permission) => permission.name === name));
        if (missing.length) {
            throw new common_1.NotFoundException(`Unknown permissions: ${missing.join(', ')}`);
        }
        return permissions.map((permission) => ({ permissionId: permission.id }));
    }
    async findAll(query) {
        const where = {
            deletedAt: null,
            ...(query.organizationUnitId
                ? { organizationUnitId: query.organizationUnitId }
                : {}),
            ...(query.membershipRole ? { membershipRole: query.membershipRole } : {}),
            ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
            ...(query.roleId
                ? { roleAssignments: { some: { roleId: query.roleId } } }
                : {}),
            ...(query.search
                ? {
                    OR: [
                        { fullName: { contains: query.search } },
                        { email: { contains: query.search } },
                        { phone: { contains: query.search } },
                    ],
                }
                : {}),
        };
        const [total, data] = await this.prisma.$transaction([
            this.prisma.user.count({ where }),
            this.prisma.user.findMany({
                where,
                skip: query.skip,
                take: query.limit,
                orderBy: { [query.sortBy ?? 'createdAt']: query.order },
                select: USER_DETAIL_SELECT,
            }),
        ]);
        return paginated_result_dto_1.PaginatedResult.of(data, total, query.page, query.limit);
    }
    async findOne(id) {
        const user = await this.prisma.user.findFirst({
            where: { id, deletedAt: null },
            select: USER_DETAIL_SELECT,
        });
        if (!user) {
            throw new common_1.NotFoundException(`User ${id} not found`);
        }
        return user;
    }
    async findOneByEmail(email) {
        return this.prisma.user.findFirst({
            where: { email: email.toLowerCase().trim(), deletedAt: null },
            select: USER_DETAIL_SELECT,
        });
    }
    async update(id, dto) {
        await this.findOne(id);
        const { email, ...rest } = dto;
        return this.prisma.user.update({
            where: { id },
            data: {
                ...rest,
                ...(email ? { email: email.toLowerCase().trim() } : {}),
            },
            select: USER_DETAIL_SELECT,
        });
    }
    async resetPassword(id, dto) {
        await this.findOne(id);
        const passwordHash = await bcrypt.hash(dto.newPassword, this.saltRounds);
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (user) {
            await this.prisma.passwordHistory.create({
                data: { userId: id, passwordHash: user.passwordHash },
            });
        }
        await this.prisma.user.update({ where: { id }, data: { passwordHash } });
        return { success: true };
    }
    async assignRoles(id, dto) {
        await this.findOne(id);
        await this.prisma.userRole.deleteMany({ where: { userId: id } });
        if (dto.roleIds.length) {
            await this.prisma.userRole.createMany({
                data: dto.roleIds.map((roleId) => ({ userId: id, roleId })),
                skipDuplicates: true,
            });
        }
        return this.findOne(id);
    }
    async assignPermissions(id, dto) {
        await this.findOne(id);
        const ids = new Set(dto.permissionIds ?? []);
        if (dto.permissionNames?.length) {
            const resolved = await this.resolvePermissionNames(dto.permissionNames);
            resolved.forEach((item) => ids.add(item.permissionId));
        }
        await this.prisma.userPermission.deleteMany({ where: { userId: id } });
        if (ids.size) {
            await this.prisma.userPermission.createMany({
                data: [...ids].map((permissionId) => ({ userId: id, permissionId })),
                skipDuplicates: true,
            });
        }
        return this.findOne(id);
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.user.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false },
        });
    }
    async restore(id) {
        return this.prisma.user.update({
            where: { id },
            data: { deletedAt: null, isActive: true },
        });
    }
    async technicians() {
        return this.prisma.user.findMany({
            where: {
                deletedAt: null,
                isActive: true,
                OR: [
                    {
                        roleAssignments: {
                            some: {
                                role: {
                                    permissions: {
                                        some: {
                                            permission: {
                                                name: 'tasks:technician',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    {
                        permissionGrants: {
                            some: {
                                permission: {
                                    name: 'tasks:technician',
                                },
                            },
                        },
                    },
                ],
            },
            select: user_select_1.USER_PUBLIC_SELECT,
            orderBy: { fullName: 'asc' },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], UsersService);
//# sourceMappingURL=users.service.js.map