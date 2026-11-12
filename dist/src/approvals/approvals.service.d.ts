import { PrismaService } from '../prisma/prisma.service';
import { CreateApprovalRequestDto, QueryApprovalRequestDto, ReviewApprovalDto } from './dto/approval.dto';
import { PaginatedResult } from '../common/dto/paginated-result.dto';
export declare class ApprovalsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateApprovalRequestDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.ApprovalStatus;
        notes: string | null;
        technician: {
            id: string;
            email: string;
            fullName: string;
        } | null;
        technicianId: string | null;
        maintenanceRequest: {
            id: string;
            status: import("@prisma/client").$Enums.RequestStatus;
            ticketNumber: string;
            title: string | null;
        };
        forwardedAt: Date | null;
        reviewedAt: Date | null;
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
        } | null;
        reviewer: {
            id: string;
            fullName: string;
        } | null;
        maintenanceRequestItemId: string | null;
        reviewedById: string | null;
        maintenanceRequestId: string;
    }>;
    findAll(query: QueryApprovalRequestDto): Promise<PaginatedResult<unknown>>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.ApprovalStatus;
        notes: string | null;
        technician: {
            id: string;
            email: string;
            fullName: string;
        } | null;
        technicianId: string | null;
        maintenanceRequest: {
            id: string;
            status: import("@prisma/client").$Enums.RequestStatus;
            ticketNumber: string;
            title: string | null;
        };
        forwardedAt: Date | null;
        reviewedAt: Date | null;
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
        } | null;
        reviewer: {
            id: string;
            fullName: string;
        } | null;
        maintenanceRequestItemId: string | null;
        reviewedById: string | null;
        maintenanceRequestId: string;
    }>;
    forward(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.ApprovalStatus;
        notes: string | null;
        technician: {
            id: string;
            email: string;
            fullName: string;
        } | null;
        technicianId: string | null;
        maintenanceRequest: {
            id: string;
            status: import("@prisma/client").$Enums.RequestStatus;
            ticketNumber: string;
            title: string | null;
        };
        forwardedAt: Date | null;
        reviewedAt: Date | null;
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
        } | null;
        reviewer: {
            id: string;
            fullName: string;
        } | null;
        maintenanceRequestItemId: string | null;
        reviewedById: string | null;
        maintenanceRequestId: string;
    }>;
    review(id: string, dto: ReviewApprovalDto, reviewerId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.ApprovalStatus;
        notes: string | null;
        technician: {
            id: string;
            email: string;
            fullName: string;
        } | null;
        technicianId: string | null;
        maintenanceRequest: {
            id: string;
            status: import("@prisma/client").$Enums.RequestStatus;
            ticketNumber: string;
            title: string | null;
        };
        forwardedAt: Date | null;
        reviewedAt: Date | null;
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
        } | null;
        reviewer: {
            id: string;
            fullName: string;
        } | null;
        maintenanceRequestItemId: string | null;
        reviewedById: string | null;
        maintenanceRequestId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        status: import("@prisma/client").$Enums.ApprovalStatus;
        notes: string | null;
        technicianId: string | null;
        forwardedAt: Date | null;
        reviewedAt: Date | null;
        maintenanceRequestItemId: string | null;
        reviewedById: string | null;
        maintenanceRequestId: string;
    }>;
}
