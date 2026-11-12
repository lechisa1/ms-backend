import { RequestPriority, RequestStatus } from '@prisma/client';
export declare class QueryMyTasksDto {
    roleView?: 'SUPERVISOR' | 'ICT_DIRECTOR' | 'TECHNICIAN' | 'ALL';
    status?: RequestStatus;
    priority?: RequestPriority;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
