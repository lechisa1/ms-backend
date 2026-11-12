import { RequestPriority } from '@prisma/client';
export declare class CreateSpecificationItemDto {
    requestedItemName: string;
    quantity?: number;
    unitOfMeasure?: string;
    categoryId?: string;
    priority?: RequestPriority;
    description?: string;
}
declare const UpdateSpecificationItemDto_base: import("@nestjs/common").Type<Partial<CreateSpecificationItemDto>>;
export declare class UpdateSpecificationItemDto extends UpdateSpecificationItemDto_base {
}
export {};
