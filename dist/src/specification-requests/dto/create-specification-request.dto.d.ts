import { RequestPriority } from '@prisma/client';
export declare class CreateSpecificationItemDto {
    categoryId?: string;
    requestedItemName?: string;
    quantity: number;
    unitOfMeasure?: string;
    priority: RequestPriority;
    description?: string;
    itemCategoryId?: string;
    itemName?: string;
}
export declare class CreateSpecificationRequestDto {
    title: string;
    description?: string;
    priority?: RequestPriority;
    items?: CreateSpecificationItemDto[];
    specificationItems?: CreateSpecificationItemDto[];
}
