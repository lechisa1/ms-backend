import { RequestPriority, RequestStatus } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CreateSpecificationRequestDto } from './create-specification-request.dto';
declare const UpdateSpecificationRequestDto_base: import("@nestjs/common").Type<Partial<CreateSpecificationRequestDto>>;
export declare class UpdateSpecificationRequestDto extends UpdateSpecificationRequestDto_base {
}
export declare class QuerySpecificationRequestDto extends PaginationDto {
    requesterId?: string;
    organizationUnitId?: string;
    status?: RequestStatus;
    statuses?: string;
    priority?: RequestPriority;
    ticketNumber?: string;
}
export declare class ChangeSpecificationStatusDto {
    status: RequestStatus;
    reason?: string;
}
export declare class ApproveSpecificationRequestDto {
    notes?: string;
}
export declare class RejectSpecificationRequestDto {
    reason: string;
}
export {};
