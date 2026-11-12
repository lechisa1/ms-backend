import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AssignTechnicianDto, CreateRequestItemDto, UpdateTechnicianAssignmentDto } from './dto/request-item.dto';
export declare class RequestItemsService {
    private readonly prisma;
    private readonly notifications;
    constructor(prisma: PrismaService, notifications: NotificationsService);
    private formatItem;
    findByRequest(requestId: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
    create(requestId: string, dto: CreateRequestItemDto): Promise<any>;
    update(id: string, dto: Partial<CreateRequestItemDto>): Promise<any>;
    remove(id: string): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        issueCategoryId: string | null;
        priority: import("@prisma/client").$Enums.RequestPriority;
        itemId: string;
        issueTypeId: string;
        maintenanceRequestId: string;
    }>;
    private assertRequest;
    assignTechnicians(itemId: string, dto: AssignTechnicianDto, assignedById?: string): Promise<any>;
    unassignTechnician(itemId: string, assignmentId: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.TechnicianAssignmentStatus;
        notes: string | null;
        technician: {
            id: string;
            fullName: string;
        };
        technicianId: string;
    }>;
    updateAssignment(assignmentId: string, dto: UpdateTechnicianAssignmentDto, userId?: string): Promise<{
        id: string;
        assignedAt: Date;
        status: import("@prisma/client").$Enums.TechnicianAssignmentStatus;
        isLead: boolean;
        roleInAssignment: import("@prisma/client").$Enums.AssignmentRole;
        notes: string | null;
        startedAt: Date | null;
        completedAt: Date | null;
        technician: {
            id: string;
            email: string;
            fullName: string;
        };
        assignedBy: {
            id: string;
            fullName: string;
        } | null;
        technicianId: string;
    }>;
    findByTechnician(technicianId: string): Promise<{
        id: string;
        assignedAt: Date;
        status: import("@prisma/client").$Enums.TechnicianAssignmentStatus;
        isLead: boolean;
        roleInAssignment: import("@prisma/client").$Enums.AssignmentRole;
        startedAt: Date | null;
        completedAt: Date | null;
        requestItem: {
            id: string;
            description: string | null;
            issueType: {
                id: string;
                name: string;
            };
            item: {
                id: string;
                name: string;
            };
            maintenanceRequest: {
                id: string;
                status: import("@prisma/client").$Enums.RequestStatus;
                ticketNumber: string;
                title: string | null;
            };
        };
    }[]>;
}
