import type { Prisma } from '@prisma/client';
import { NotificationsService } from './notifications.service';
import { QueryNotificationDto, SendNotificationDto } from './dto/notification.dto';
export declare class NotificationsController {
    private readonly service;
    constructor(service: NotificationsService);
    findAll(userId: string, query: QueryNotificationDto): Promise<import("../common/dto/paginated-result.dto").PaginatedResult<unknown>>;
    unreadCount(userId: string): Promise<{
        unread: number;
    }>;
    create(dto: SendNotificationDto): Prisma.Prisma__UserNotificationClient<{
        id: string;
        createdAt: Date;
        type: string;
        userId: string;
        payload: Prisma.JsonValue;
        readAt: Date | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    markRead(userId: string, id: string): Promise<{
        id: string;
        readAt: Date | null;
    }>;
    markAllRead(userId: string): Promise<{
        updated: number;
    }>;
    remove(userId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        userId: string;
        payload: Prisma.JsonValue;
        readAt: Date | null;
    }>;
}
