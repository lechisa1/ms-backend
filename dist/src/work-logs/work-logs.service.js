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
exports.WorkLogsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const paginated_result_dto_1 = require("../common/dto/paginated-result.dto");
const SELECT = {
    id: true,
    requestId: true,
    technicianId: true,
    workDone: true,
    completionNotes: true,
    timeSpentMinutes: true,
    logDate: true,
    status: true,
    rejectedAt: true,
    rejectedById: true,
    rejectionReason: true,
    createdAt: true,
    updatedAt: true,
    itemTechnicianId: true,
    technician: { select: { id: true, fullName: true, email: true } },
    rejectedBy: { select: { id: true, fullName: true } },
    request: {
        select: { id: true, ticketNumber: true, title: true, status: true },
    },
    items: {
        select: {
            requestItemId: true,
            notes: true,
            item: {
                select: {
                    id: true,
                    item: { select: { id: true, name: true } },
                    issueType: { select: { id: true, name: true } },
                },
            },
        },
    },
    materials: {
        select: { id: true, name: true, quantity: true, unit: true },
    },
};
let WorkLogsService = class WorkLogsService {
    prisma;
    notifications;
    constructor(prisma, notifications) {
        this.prisma = prisma;
        this.notifications = notifications;
    }
    formatWorkLog(raw) {
        if (!raw)
            return null;
        return {
            ...raw,
            activity: raw.workDone,
            additionalNotes: raw.completionNotes,
            materials: raw.materials?.map((m) => ({
                id: m.id,
                name: m.name,
                quantity: m.quantity != null ? Number(m.quantity) : undefined,
                unit: m.unit,
            })) ?? [],
        };
    }
    async create(dto, currentUserId) {
        const request = await this.prisma.maintenanceRequest.findFirst({
            where: { id: dto.requestId, deletedAt: null },
            select: { id: true, status: true, ticketNumber: true },
        });
        if (!request) {
            throw new common_1.NotFoundException(`Maintenance request ${dto.requestId} not found`);
        }
        const technicianId = dto.technicianId ?? currentUserId;
        if (!technicianId) {
            throw new common_1.BadRequestException('technicianId is required');
        }
        const workDone = dto.workDone?.trim() ||
            dto.activity?.trim() ||
            'Maintenance work performed';
        const completionNotes = dto.completionNotes?.trim() ||
            dto.additionalNotes?.trim() ||
            null;
        const assignmentId = dto.itemTechnicianId ?? dto.assignmentId;
        let itemTechnician = assignmentId
            ? await this.prisma.itemTechnician.findUnique({
                where: { id: assignmentId },
                include: { requestItem: true },
            })
            : null;
        const targetItemId = dto.itemId ?? dto.items?.[0]?.requestItemId;
        if (!itemTechnician && targetItemId) {
            itemTechnician = await this.prisma.itemTechnician.findFirst({
                where: {
                    requestItemId: targetItemId,
                    technicianId,
                },
                include: { requestItem: true },
            });
        }
        if (!itemTechnician) {
            itemTechnician = await this.prisma.itemTechnician.findFirst({
                where: {
                    technicianId,
                    requestItem: {
                        maintenanceRequestId: dto.requestId,
                        deletedAt: null,
                    },
                },
                include: { requestItem: true },
            });
        }
        let itemsToCreate = [];
        if (dto.items?.length) {
            const count = await this.prisma.maintenanceRequestItem.count({
                where: {
                    id: { in: dto.items.map((item) => item.requestItemId) },
                    maintenanceRequestId: dto.requestId,
                },
            });
            if (count !== dto.items.length) {
                throw new common_1.BadRequestException('One or more request items do not belong to this request');
            }
            itemsToCreate = dto.items.map((it) => ({
                requestItemId: it.requestItemId,
                notes: it.notes ?? completionNotes ?? undefined,
            }));
        }
        else if (itemTechnician) {
            itemsToCreate = [
                {
                    requestItemId: itemTechnician.requestItemId,
                    notes: completionNotes ?? undefined,
                },
            ];
        }
        else if (targetItemId) {
            itemsToCreate = [
                {
                    requestItemId: targetItemId,
                    notes: completionNotes ?? undefined,
                },
            ];
        }
        const materialsCreate = dto.materials?.length
            ? dto.materials
                .filter((m) => m.name && m.name.trim().length > 0)
                .map((m) => ({
                name: m.name.trim(),
                quantity: m.quantity != null ? new client_1.Prisma.Decimal(m.quantity) : null,
                unit: m.unit?.trim() || 'pcs',
            }))
            : undefined;
        const workLog = await this.prisma.workLog.create({
            data: {
                requestId: dto.requestId,
                technicianId,
                workDone,
                completionNotes,
                timeSpentMinutes: dto.timeSpentMinutes ?? null,
                itemTechnicianId: itemTechnician?.id ?? null,
                items: itemsToCreate.length
                    ? {
                        create: itemsToCreate,
                    }
                    : undefined,
                materials: materialsCreate?.length
                    ? {
                        create: materialsCreate,
                    }
                    : undefined,
            },
            select: SELECT,
        });
        if (itemTechnician) {
            const targetStatus = dto.status === 'NOT_FIXED'
                ? client_1.TechnicianAssignmentStatus.NOT_FIXED
                : client_1.TechnicianAssignmentStatus.COMPLETED;
            await this.prisma.itemTechnician.update({
                where: { id: itemTechnician.id },
                data: {
                    status: targetStatus,
                    completedAt: new Date(),
                },
            });
            const allAssignments = await this.prisma.itemTechnician.findMany({
                where: {
                    requestItem: {
                        maintenanceRequestId: dto.requestId,
                        deletedAt: null,
                    },
                },
                select: { id: true, status: true },
            });
            const allDone = allAssignments.length > 0 &&
                allAssignments.every((a) => a.id === itemTechnician.id
                    ? true
                    : a.status === client_1.TechnicianAssignmentStatus.COMPLETED ||
                        a.status === client_1.TechnicianAssignmentStatus.NOT_FIXED);
            if (allDone) {
                const hasNotFixed = allAssignments.some((a) => a.id === itemTechnician.id
                    ? targetStatus === client_1.TechnicianAssignmentStatus.NOT_FIXED
                    : a.status === client_1.TechnicianAssignmentStatus.NOT_FIXED);
                const nextStatus = hasNotFixed
                    ? client_1.RequestStatus.WAITING_CONFIRMATION
                    : client_1.RequestStatus.WAITING_CONFIRMATION;
                if (request.status === client_1.RequestStatus.IN_PROGRESS ||
                    request.status === client_1.RequestStatus.ASSIGNED) {
                    await this.prisma.$transaction([
                        this.prisma.maintenanceRequest.update({
                            where: { id: dto.requestId },
                            data: { status: nextStatus },
                        }),
                        this.prisma.requestStatusHistory.create({
                            data: {
                                maintenanceRequestId: dto.requestId,
                                fromStatus: request.status,
                                toStatus: nextStatus,
                                changedById: technicianId,
                                reason: hasNotFixed
                                    ? 'Diagnostic reports filed for all affected items'
                                    : `All items serviced and confirmed completed (${workDone})`,
                            },
                        }),
                    ]);
                    const reqData = await this.prisma.maintenanceRequest.findUnique({
                        where: { id: dto.requestId },
                        select: { ticketNumber: true, requesterId: true },
                    });
                    if (reqData?.requesterId) {
                        await this.notifications.notifyUser(reqData.requesterId, 'WAITING_CONFIRMATION', {
                            requestId: dto.requestId,
                            ticketNumber: reqData.ticketNumber,
                            message: `Technicians finished servicing ticket ${reqData.ticketNumber}. Please inspect equipment and confirm completion or report rework.`,
                        });
                    }
                }
            }
        }
        return this.formatWorkLog(workLog);
    }
    async findAll(query) {
        const where = {
            ...(query.requestId ? { requestId: query.requestId } : {}),
            ...(query.technicianId ? { technicianId: query.technicianId } : {}),
            ...(query.status ? { status: query.status } : {}),
            ...(query.search ? { workDone: { contains: query.search } } : {}),
        };
        const [total, data] = await this.prisma.$transaction([
            this.prisma.workLog.count({ where }),
            this.prisma.workLog.findMany({
                where,
                skip: query.skip,
                take: query.limit,
                orderBy: { [query.sortBy ?? 'logDate']: query.order },
                select: SELECT,
            }),
        ]);
        const formatted = data.map((item) => this.formatWorkLog(item));
        return paginated_result_dto_1.PaginatedResult.of(formatted, total, query.page, query.limit);
    }
    async findOne(id) {
        const workLog = await this.prisma.workLog.findUnique({
            where: { id },
            select: SELECT,
        });
        if (!workLog) {
            throw new common_1.NotFoundException(`Work log ${id} not found`);
        }
        return this.formatWorkLog(workLog);
    }
    async review(id, dto, reviewerId) {
        const workLog = await this.prisma.workLog.findUnique({
            where: { id },
            select: { id: true, status: true, itemTechnicianId: true, requestId: true },
        });
        if (!workLog) {
            throw new common_1.NotFoundException(`Work log ${id} not found`);
        }
        if (workLog.status !== client_1.WorkLogStatus.PENDING) {
            throw new common_1.BadRequestException(`Work log is already ${workLog.status}`);
        }
        if (dto.status === client_1.WorkLogStatus.REJECTED && !dto.rejectionReason?.trim()) {
            throw new common_1.BadRequestException('A rejection reason is required when rejecting a work log');
        }
        const updated = await this.prisma.workLog.update({
            where: { id },
            data: {
                status: dto.status,
                rejectionReason: dto.rejectionReason,
                rejectedAt: dto.status === client_1.WorkLogStatus.REJECTED ? new Date() : null,
                rejectedById: dto.status === client_1.WorkLogStatus.REJECTED ? (reviewerId ?? null) : null,
            },
            select: SELECT,
        });
        if (dto.status === client_1.WorkLogStatus.REJECTED && workLog.itemTechnicianId) {
            await this.prisma.itemTechnician.update({
                where: { id: workLog.itemTechnicianId },
                data: { status: client_1.TechnicianAssignmentStatus.IN_PROGRESS },
            });
            await this.prisma.maintenanceRequest.update({
                where: { id: workLog.requestId },
                data: { status: client_1.RequestStatus.IN_PROGRESS },
            });
            const fullLog = await this.prisma.workLog.findUnique({
                where: { id },
                select: {
                    technicianId: true,
                    request: { select: { ticketNumber: true } },
                },
            });
            if (fullLog?.technicianId) {
                await this.notifications.notifyUser(fullLog.technicianId, 'WORK_LOG_REJECTED', {
                    requestId: workLog.requestId,
                    ticketNumber: fullLog.request?.ticketNumber ?? '',
                    reason: dto.rejectionReason,
                    message: `Your work log for ticket ${fullLog.request?.ticketNumber ?? ''} was rejected: "${dto.rejectionReason}". Please update and resubmit.`,
                });
            }
        }
        return this.formatWorkLog(updated);
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.workLog.delete({ where: { id } });
    }
};
exports.WorkLogsService = WorkLogsService;
exports.WorkLogsService = WorkLogsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], WorkLogsService);
//# sourceMappingURL=work-logs.service.js.map