"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const paginated_result_dto_1 = require("../common/dto/paginated-result.dto");
const SELECT = {
    id: true,
    maintenanceRequestId: true,
    maintenanceRequestItemId: true,
    technicianId: true,
    reviewedById: true,
    status: true,
    notes: true,
    forwardedAt: true,
    reviewedAt: true,
    createdAt: true,
    updatedAt: true,
    technician: { select: { id: true, fullName: true, email: true } },
    reviewer: { select: { id: true, fullName: true } },
    maintenanceRequest: {
        select: { id: true, ticketNumber: true, title: true, status: true },
    },
    requestItem: {
        select: {
            id: true,
            description: true,
            item: { select: { id: true, name: true } },
            issueType: { select: { id: true, name: true } },
        },
    },
};
let ApprovalsService = class ApprovalsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const request = await this.prisma.maintenanceRequest.findFirst({
            where: { id: dto.maintenanceRequestId, deletedAt: null },
            select: { id: true },
        });
        if (!request) {
            throw new common_1.NotFoundException(`Maintenance request ${dto.maintenanceRequestId} not found`);
        }
        const approval = await this.prisma.approvalRequest.create({
            data: {
                maintenanceRequestId: dto.maintenanceRequestId,
                maintenanceRequestItemId: dto.maintenanceRequestItemId,
                technicianId: dto.technicianId,
                notes: dto.notes,
            },
            select: SELECT,
        });
        await this.prisma.maintenanceRequest.update({
            where: { id: dto.maintenanceRequestId },
            data: { status: client_1.RequestStatus.WAITING_APPROVAL },
        });
        return approval;
    }
    async findAll(query) {
        const where = {
            deletedAt: null,
            ...(query.maintenanceRequestId
                ? { maintenanceRequestId: query.maintenanceRequestId }
                : {}),
            ...(query.technicianId ? { technicianId: query.technicianId } : {}),
            ...(query.status ? { status: query.status } : {}),
        };
        const [total, data] = await this.prisma.$transaction([
            this.prisma.approvalRequest.count({ where }),
            this.prisma.approvalRequest.findMany({
                where,
                skip: query.skip,
                take: query.limit,
                orderBy: { [query.sortBy ?? 'createdAt']: query.order },
                select: SELECT,
            }),
        ]);
        return paginated_result_dto_1.PaginatedResult.of(data, total, query.page, query.limit);
    }
    async findOne(id) {
        const approval = await this.prisma.approvalRequest.findFirst({
            where: { id, deletedAt: null },
            select: SELECT,
        });
        if (!approval) {
            throw new common_1.NotFoundException(`Approval request ${id} not found`);
        }
        return approval;
    }
    async forward(id) {
        const approval = await this.findOne(id);
        if (approval.status !== client_1.ApprovalStatus.PENDING) {
            throw new common_1.BadRequestException(`Only PENDING approvals can be forwarded, current status is ${approval.status}`);
        }
        return this.prisma.approvalRequest.update({
            where: { id },
            data: { status: client_1.ApprovalStatus.FORWARDED, forwardedAt: new Date() },
            select: SELECT,
        });
    }
    async review(id, dto, reviewerId) {
        const approval = await this.findOne(id);
        if (approval.status !== client_1.ApprovalStatus.PENDING &&
            approval.status !== client_1.ApprovalStatus.FORWARDED) {
            throw new common_1.BadRequestException(`Approval is already ${approval.status} and cannot be reviewed`);
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            const result = await tx.approvalRequest.update({
                where: { id },
                data: {
                    status: dto.status,
                    notes: dto.notes ?? approval.notes,
                    reviewedAt: new Date(),
                    reviewedById: reviewerId ?? null,
                },
                select: SELECT,
            });
            await tx.maintenanceRequest.update({
                where: { id: approval.maintenanceRequestId },
                data: {
                    status: dto.status === client_1.ApprovalStatus.APPROVED
                        ? client_1.RequestStatus.PENDING_APPROVAL_REVIEW
                        : client_1.RequestStatus.REJECTED,
                },
            });
            await tx.requestStatusHistory.create({
                data: {
                    maintenanceRequestId: approval.maintenanceRequestId,
                    fromStatus: approval.maintenanceRequest.status,
                    toStatus: dto.status === client_1.ApprovalStatus.APPROVED
                        ? client_1.RequestStatus.PENDING_APPROVAL_REVIEW
                        : client_1.RequestStatus.REJECTED,
                    changedById: reviewerId ?? null,
                    reason: dto.notes ?? null,
                },
            });
            return result;
        });
        return updated;
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.approvalRequest.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
};
exports.ApprovalsService = ApprovalsService;
exports.ApprovalsService = ApprovalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApprovalsService);
//# sourceMappingURL=approvals.service.js.map