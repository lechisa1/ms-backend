import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QueryNotificationDto } from './dto/notification.dto';
import { PaginatedResult } from '../common/dto/paginated-result.dto';

export interface CreateNotificationInput {
  userId: string;
  type: string;
  payload: Prisma.InputJsonValue;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateNotificationInput) {
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

  async createManyForUsers(
    userIds: string[],
    type: string,
    payload: Prisma.InputJsonValue,
  ) {
    if (!userIds.length) {
      return { count: 0 };
    }

    return this.prisma.userNotification.createMany({
      data: userIds.map((userId) => ({ userId, type, payload })),
    });
  }

  async notifyUser(
    userId: string | null | undefined,
    type: string,
    payload: Prisma.InputJsonValue,
  ) {
    if (!userId) return null;
    try {
      return await this.create({ userId, type, payload });
    } catch (error) {
      this.logger.warn(`Failed to notify user ${userId} of ${type}: ${error}`);
      return null;
    }
  }

  async notifyUsers(
    userIds: string[],
    type: string,
    payload: Prisma.InputJsonValue,
  ) {
    const validIds = [...new Set(userIds.filter(Boolean))];
    if (!validIds.length) return { count: 0 };
    try {
      return await this.createManyForUsers(validIds, type, payload);
    } catch (error) {
      this.logger.warn(`Failed to notify users of ${type}: ${error}`);
      return { count: 0 };
    }
  }

  async notifyUsersWithPermissions(
    permissionNames: string[],
    type: string,
    payload: Prisma.InputJsonValue,
    excludeUserIds: string[] = [],
  ) {
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
    } catch (error) {
      this.logger.warn(
        `Failed to notify users with permissions [${permissionNames.join(', ')}]: ${error}`,
      );
      return { count: 0 };
    }
  }

  async findForUser(
    userId: string,
    query: QueryNotificationDto,
  ): Promise<PaginatedResult<unknown>> {
    const where: Prisma.UserNotificationWhereInput = {
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

    return PaginatedResult.of(data, total, query.page, query.limit);
  }

  async unreadCount(userId: string) {
    const count = await this.prisma.userNotification.count({
      where: { userId, readAt: null },
    });
    return { unread: count };
  }

  async markRead(userId: string, id: string) {
    await this.assertOwner(userId, id);
    return this.prisma.userNotification.update({
      where: { id },
      data: { readAt: new Date() },
      select: { id: true, readAt: true },
    });
  }

  async markAllRead(userId: string) {
    const { count } = await this.prisma.userNotification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { updated: count };
  }

  async remove(userId: string, id: string) {
    await this.assertOwner(userId, id);
    return this.prisma.userNotification.delete({ where: { id } });
  }

  private async assertOwner(userId: string, id: string) {
    const notification = await this.prisma.userNotification.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!notification) {
      throw new NotFoundException(`Notification ${id} not found`);
    }
  }
}
