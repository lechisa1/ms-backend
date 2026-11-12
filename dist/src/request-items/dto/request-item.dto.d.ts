import { AssignmentRole, RequestPriority, TechnicianAssignmentStatus } from '@prisma/client';
export declare class CreateRequestItemDto {
    itemId: string;
    issueCategoryId?: string;
    issueTypeId: string;
    priority?: RequestPriority;
    description?: string;
}
export declare class AssignTechnicianDto {
    technicianIds: string[];
    leadTechnicianId?: string;
    isLead?: boolean;
    roleInAssignment?: AssignmentRole;
    notes?: string;
}
export declare class UpdateTechnicianAssignmentDto {
    status?: TechnicianAssignmentStatus;
    isLead?: boolean;
    roleInAssignment?: AssignmentRole;
    notes?: string;
}
