export declare class CreateItemCategoryDto {
    name: string;
    description?: string;
}
declare const UpdateItemCategoryDto_base: import("@nestjs/common").Type<Partial<CreateItemCategoryDto>>;
export declare class UpdateItemCategoryDto extends UpdateItemCategoryDto_base {
}
export {};
