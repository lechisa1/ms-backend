export declare class CreateRoleDto {
    name: string;
    description?: string;
    dashboardRoute?: string;
    isActive?: boolean;
    permissionIds?: string[];
}
export declare class UpdateRoleDto {
    name?: string;
    description?: string;
    dashboardRoute?: string;
    isActive?: boolean;
}
export declare class AssignRolePermissionsDto {
    permissionIds: string[];
}
