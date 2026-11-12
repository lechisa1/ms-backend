export declare class CreateMaintenanceCategoryDto {
    name: string;
    description?: string;
}
declare const UpdateMaintenanceCategoryDto_base: import("@nestjs/common").Type<Partial<CreateMaintenanceCategoryDto>>;
export declare class UpdateMaintenanceCategoryDto extends UpdateMaintenanceCategoryDto_base {
}
export {};
