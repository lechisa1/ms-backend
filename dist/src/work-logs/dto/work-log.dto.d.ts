import { WorkLogStatus } from '@prisma/client';
export declare class WorkLogItemInputDto {
    requestItemId: string;
    notes?: string;
}
export declare class WorkLogMaterialInputDto {
    id?: string;
    name: string;
    quantity?: number;
    unit?: string;
}
export declare class CreateWorkLogDto {
    requestId: string;
    technicianId?: string;
    workDone?: string;
    activity?: string;
    completionNotes?: string;
    additionalNotes?: string;
    timeSpentMinutes?: number;
    status?: string;
    assignmentId?: string;
    itemTechnicianId?: string;
    itemId?: string;
    items?: WorkLogItemInputDto[];
    materials?: WorkLogMaterialInputDto[];
}
export declare class ReviewWorkLogDto {
    status: WorkLogStatus;
    rejectionReason?: string;
}
