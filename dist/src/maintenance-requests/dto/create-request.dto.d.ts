import { RequestPriority } from '@prisma/client';
export declare enum RequestTypeEnum {
    MAINTENANCE = "MAINTENANCE",
    SPECIFICATION = "SPECIFICATION",
    OTHER = "OTHER"
}
export declare class CreateMaintenanceItemDto {
    itemId: string;
    issueCategoryId: string;
    issueTypeId: string;
    priority: RequestPriority;
    description?: string;
}
export declare class CreateMaintenanceRequestDto {
    title: string;
    description?: string;
    priority?: RequestPriority;
    items: CreateMaintenanceItemDto[];
    maintenanceItems?: CreateMaintenanceItemDto[];
}
export { CreateMaintenanceItemDto as CreateRequestItemDto };
