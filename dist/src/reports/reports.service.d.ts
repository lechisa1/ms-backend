import { PrismaService } from '../prisma/prisma.service';
import { QueryReportRequestsDto } from './reports.dto';
import { PaginatedResult } from '../common/dto/paginated-result.dto';
export declare class ReportsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private getDateFilter;
    getSummary(query?: QueryReportRequestsDto): Promise<{
        totalRequests: number;
        maintenanceCount: number;
        specificationCount: number;
        inProgressCount: number;
        completedCount: number;
        unassignedCount: number;
        statusCounts: Record<string, number>;
        priorityCounts: Record<string, number>;
        averageResolutionMinutes: number;
    }>;
    getRequests(query: QueryReportRequestsDto): Promise<PaginatedResult<any>>;
    getTechniciansWorkload(): Promise<{
        id: string;
        fullName: string;
        email: string;
        phone: string | null;
        unit: string;
        unitCode: string;
        role: string;
        capacity: number;
        activeTasksCount: number;
        completedTasksCount: number;
        notFixedTasksCount: number;
        totalAssignedCount: number;
        totalMinutesLogged: number;
        utilization: number;
        assignedRequests: any[];
    }[]>;
    private formatMaintenanceRequest;
    private formatSpecificationRequest;
}
