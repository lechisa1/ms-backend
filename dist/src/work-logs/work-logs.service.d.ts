import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateWorkLogDto, ReviewWorkLogDto } from './dto/work-log.dto';
import { PaginatedResult } from '../common/dto/paginated-result.dto';
import { QueryWorkLogDto } from './dto/query-work-log.dto';
export declare class WorkLogsService {
    private readonly prisma;
    private readonly notifications;
    constructor(prisma: PrismaService, notifications: NotificationsService);
    private formatWorkLog;
    create(dto: CreateWorkLogDto, currentUserId?: string): Promise<any>;
    findAll(query: QueryWorkLogDto): Promise<PaginatedResult<unknown>>;
    findOne(id: string): Promise<any>;
    review(id: string, dto: ReviewWorkLogDto, reviewerId?: string): Promise<any>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.WorkLogStatus;
        rejectionReason: string | null;
        technicianId: string;
        requestId: string;
        workDone: string;
        completionNotes: string | null;
        timeSpentMinutes: number | null;
        logDate: Date;
        rejectedAt: Date | null;
        rejectedById: string | null;
        itemTechnicianId: string | null;
    }>;
}
