import { WorkLogStatus } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class QueryWorkLogDto extends PaginationDto {
    requestId?: string;
    technicianId?: string;
    status?: WorkLogStatus;
}
