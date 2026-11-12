export declare class PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    constructor(data: T[], total: number, page: number, limit: number);
    static of<T>(data: T[], total: number, page: number, limit: number): PaginatedResult<T>;
}
