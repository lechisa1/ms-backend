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
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const paginated_result_dto_1 = require("../common/dto/paginated-result.dto");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    prisma;
    logger = new common_1.Logger(NotificationsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(dto) {
        return this.prisma.userNotification.create({
            data: {
                userId: dto.userId,
                type: dto.type,
                payload: dto.payload,
            },
            select: {
                id: true,
                userId: true,
                type: true,
                payload: true,
                readAt: true,
                createdAt: true,
            },
        });
    }
    async createManyForUsers(userIds, type, payload) {
        if (!userIds.length) {
            return { count: 0 };
        }
        return this.prisma.userNotification.createMany({
            data: userIds.map((userId) => ({ userId, type, payload })),
        });
    }
    async notifyUser(userId, type, payload) {
        if (!userId)
            return null;
        try {
            return await this.create({ userId, type, payload });
        }
        catch (error) {
            this.logger.warn(`Failed to notify user ${userId} of ${type}: ${error}`);
            return null;
        }
    }
    async notifyUsers(userIds, type, payload) {
        const validIds = [...new Set(userIds.filter(Boolean))];
        if (!validIds.length)
            return { count: 0 };
        try {
            return await this.createManyForUsers(validIds, type, payload);
        }
        catch (error) {
            this.logger.warn(`Failed to notify users of ${type}: ${error}`);
            return { count: 0 };
        }
    }
    async notifyUsersWithPermissions(permissionNames, type, payload, excludeUserIds = []) {
        try {
            const targets = [...new Set([...permissionNames, '*'])];
            const users = await this.prisma.user.findMany({
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
                                                    name: { in: targets },
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
                                        name: { in: targets },
                                    },
                                },
                            },
                        },
                    ],
                },
                select: { id: true },
            });
            const userIds = users
                .map((u) => u.id)
                .filter((id) => !excludeUserIds.includes(id));
            return await this.notifyUsers(userIds, type, payload);
        }
        catch (error) {
            this.logger.warn(`Failed to notify users with permissions [${permissionNames.join(', ')}]: ${error}`);
            return { count: 0 };
        }
    }
    async findForUser(userId, query) {
        const where = {
            userId,
            ...(query.unreadOnly === 'true' ? { readAt: null } : {}),
            ...(query.search ? { type: { contains: query.search } } : {}),
        };
        const [total, data] = await this.prisma.$transaction([
            this.prisma.userNotification.count({ where }),
            this.prisma.userNotification.findMany({
                where,
                skip: query.skip,
                take: query.limit,
                orderBy: { createdAt: query.order },
                select: {
                    id: true,
                    type: true,
                    payload: true,
                    readAt: true,
                    createdAt: true,
                },
            }),
        ]);
        return paginated_result_dto_1.PaginatedResult.of(data, total, query.page, query.limit);
    }
    async unreadCount(userId) {
        const count = await this.prisma.userNotification.count({
            where: { userId, readAt: null },
        });
        return { unread: count };
    }
    async markRead(userId, id) {
        await this.assertOwner(userId, id);
        return this.prisma.userNotification.update({
            where: { id },
            data: { readAt: new Date() },
            select: { id: true, readAt: true },
        });
    }
    async markAllRead(userId) {
        const { count } = await this.prisma.userNotification.updateMany({
            where: { userId, readAt: null },
            data: { readAt: new Date() },
        });
        return { updated: count };
    }
    async remove(userId, id) {
        await this.assertOwner(userId, id);
        return this.prisma.userNotification.delete({ where: { id } });
    }
    async assertOwner(userId, id) {
        const notification = await this.prisma.userNotification.findFirst({
            where: { id, userId },
            select: { id: true },
        });
        if (!notification) {
            throw new common_1.NotFoundException(`Notification ${id} not found`);
        }
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map