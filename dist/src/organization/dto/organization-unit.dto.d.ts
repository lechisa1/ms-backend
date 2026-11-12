export declare class CreateOrganizationUnitDto {
    name: string;
    code?: string;
    unitType?: string;
    description?: string;
    parentId?: string;
    isActive?: boolean;
    supervisorId?: string;
}
export declare class UpdateOrganizationUnitDto {
    name?: string;
    code?: string;
    unitType?: string;
    description?: string;
    isActive?: boolean;
}
export declare class MoveOrganizationUnitDto {
    parentId?: string | null;
}
export declare class AssignSupervisorDto {
    supervisorId?: string | null;
}
