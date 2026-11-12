import { ApprovalStatus } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class CreateApprovalRequestDto {
    maintenanceRequestId: string;
    maintenanceRequestItemId?: string;
    technicianId?: string;
    notes?: string;
}
export declare class ReviewApprovalDto {
    status: ApprovalStatus;
    notes?: string;
}
export declare class QueryApprovalRequestDto extends PaginationDto {
    maintenanceRequestId?: string;
    technicianId?: string;
    status?: ApprovalStatus;
}
