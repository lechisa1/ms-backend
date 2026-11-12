import { RequestPriority, RequestStatus } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CreateMaintenanceRequestDto } from './create-request.dto';
declare const UpdateMaintenanceRequestDto_base: import("@nestjs/common").Type<Partial<CreateMaintenanceRequestDto>>;
export declare class UpdateMaintenanceRequestDto extends UpdateMaintenanceRequestDto_base {
}
export declare class QueryMaintenanceRequestDto extends PaginationDto {
    requesterId?: string;
    organizationUnitId?: string;
    status?: RequestStatus;
    statuses?: string;
    priority?: RequestPriority;
    requestType?: string;
    ticketNumber?: string;
}
export declare class ChangeStatusDto {
    status: RequestStatus;
    reason?: string;
}
export declare class AddRequestUpdateDto {
    updateType: string;
    updateText: string;
    userId?: string;
}
export {};
