import { PaginationDto } from '../../../common/dto/pagination.dto';
export declare class CreateIssueTypeDto {
    name: string;
    slug?: string;
    issueCategoryId?: string;
    description?: string;
    isActive?: boolean;
    needsApproval?: boolean;
}
declare const UpdateIssueTypeDto_base: import("@nestjs/common").Type<Partial<CreateIssueTypeDto>>;
export declare class UpdateIssueTypeDto extends UpdateIssueTypeDto_base {
}
export declare class QueryIssueTypeDto extends PaginationDto {
    issueCategoryId?: string;
    isActive?: boolean;
    needsApproval?: boolean;
}
export {};
