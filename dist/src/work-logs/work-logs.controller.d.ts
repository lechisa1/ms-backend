import { WorkLogsService } from './work-logs.service';
import { CreateWorkLogDto, ReviewWorkLogDto } from './dto/work-log.dto';
import { QueryWorkLogDto } from './dto/query-work-log.dto';
export declare class WorkLogsController {
    private readonly service;
    constructor(service: WorkLogsService);
    create(dto: CreateWorkLogDto, userId?: string): Promise<any>;
    findAll(query: QueryWorkLogDto): Promise<import("../common/dto/paginated-result.dto").PaginatedResult<unknown>>;
    findOne(id: string): Promise<any>;
    review(id: string, dto: ReviewWorkLogDto, userId?: string): Promise<any>;
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
