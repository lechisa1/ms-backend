import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QueryNotificationDto } from './dto/notification.dto';
import { PaginatedResult } from '../common/dto/paginated-result.dto';
export interface CreateNotificationInput {
    userId: string;
    type: string;
    payload: Prisma.InputJsonValue;
}
export declare class NotificationsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(dto: CreateNotificationInput): Prisma.Prisma__UserNotificationClient<{
        id: string;
        createdAt: Date;
        type: string;
        userId: string;
        payload: Prisma.JsonValue;
        readAt: Date | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    createManyForUsers(userIds: string[], type: string, payload: Prisma.InputJsonValue): Promise<Prisma.BatchPayload>;
    notifyUser(userId: string | null | undefined, type: string, payload: Prisma.InputJsonValue): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        userId: string;
        payload: Prisma.JsonValue;
        readAt: Date | null;
    } | null>;
    notifyUsers(userIds: string[], type: string, payload: Prisma.InputJsonValue): Promise<Prisma.BatchPayload>;
    notifyUsersWithPermissions(permissionNames: string[], type: string, payload: Prisma.InputJsonValue, excludeUserIds?: string[]): Promise<Prisma.BatchPayload>;
    findForUser(userId: string, query: QueryNotificationDto): Promise<PaginatedResult<unknown>>;
    unreadCount(userId: string): Promise<{
        unread: number;
    }>;
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
    private assertOwner;
}
