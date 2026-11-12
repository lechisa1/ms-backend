import { ItemStatus } from '@prisma/client';
import { PaginationDto as PaginationQuery } from '../../../common/dto/pagination.dto';
export declare class CreateItemDto {
    name: string;
    unitOfMeasure: string;
    categoryId?: string;
    status?: ItemStatus;
}
declare const UpdateItemDto_base: import("@nestjs/common").Type<Partial<CreateItemDto>>;
export declare class UpdateItemDto extends UpdateItemDto_base {
}
export declare class QueryItemDto extends PaginationQuery {
    categoryId?: string;
    status?: ItemStatus;
}
export {};
