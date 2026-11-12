export declare class QueryReportRequestsDto {
    search?: string;
    requestType?: string;
    status?: string;
    priority?: string;
    departmentId?: string;
    technicianId?: string;
    taskStatus?: string;
    timeframe?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    get skip(): number;
}
