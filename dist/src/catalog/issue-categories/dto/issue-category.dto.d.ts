import { PaginationDto } from '../../../common/dto/pagination.dto';
export declare class CreateIssueCategoryDto {
    name: string;
    slug?: string;
    description?: string;
    isActive?: boolean;
}
declare const UpdateIssueCategoryDto_base: import("@nestjs/common").Type<Partial<CreateIssueCategoryDto>>;
export declare class UpdateIssueCategoryDto extends UpdateIssueCategoryDto_base {
}
export declare class QueryIssueCategoryDto extends PaginationDto {
    isActive?: boolean;
}
export {};
