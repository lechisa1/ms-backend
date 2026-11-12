import { ReportsService } from './reports.service';
import { QueryReportRequestsDto } from './reports.dto';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getSummary(query: QueryReportRequestsDto): Promise<{
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
    getRequests(query: QueryReportRequestsDto): Promise<import("../common/dto/paginated-result.dto").PaginatedResult<any>>;
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
}
