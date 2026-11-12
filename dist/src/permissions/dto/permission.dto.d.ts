export declare class CreatePermissionDto {
    name: string;
    resource?: string;
    description?: string;
}
declare const UpdatePermissionDto_base: import("@nestjs/common").Type<Partial<CreatePermissionDto>>;
export declare class UpdatePermissionDto extends UpdatePermissionDto_base {
}
export {};
