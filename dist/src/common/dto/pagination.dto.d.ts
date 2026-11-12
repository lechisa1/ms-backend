export declare class PaginationDto {
    page: number;
    limit: number;
    sortBy?: string;
    order: 'asc' | 'desc';
    sortOrder?: 'asc' | 'desc';
    search?: string;
    get skip(): number;
}
