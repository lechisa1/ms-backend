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
exports.RequestItemsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const ITEM_SELECT = {
    id: true,
    maintenanceRequestId: true,
    itemId: true,
    issueCategoryId: true,
    issueTypeId: true,
    priority: true,
    description: true,
    createdAt: true,
    updatedAt: true,
    item: {
        select: {
            id: true,
            name: true,
            unitOfMeasure: true,
            status: true,
            category: { select: { id: true, name: true } },
        },
    },
    issueCategory: { select: { id: true, name: true, slug: true } },
    issueType: {
        select: {
            id: true,
            name: true,
            slug: true,
            needsApproval: true,
            category: { select: { id: true, name: true, slug: true } },
        },
    },
    technicians: {
        select: {
            id: true,
            technicianId: true,
            assignedById: true,
            status: true,
            isLead: true,
            roleInAssignment: true,
            notes: true,
            assignedAt: true,
            startedAt: true,
            completedAt: true,
            technician: { select: { id: true, fullName: true, email: true } },
            assignedBy: { select: { id: true, fullName: true } },
            workLogs: {
                select: {
                    id: true,
                    workDone: true,
                    completionNotes: true,
                    timeSpentMinutes: true,
                    logDate: true,
                    status: true,
                    materials: { select: { id: true, name: true, quantity: true, unit: true } },
                },
                orderBy: { logDate: 'desc' },
                take: 1,
            },
        },
    },
};
let RequestItemsService = class RequestItemsService {
    prisma;
    notifications;
    constructor(prisma, notifications) {
        this.prisma = prisma;
        this.notifications = notifications;
    }
    formatItem(raw) {
        if (!raw)
            return null;
        return {
            ...raw,
            issueCategory: raw.issueCategory ?? raw.issueType?.category ?? null,
            technicians: raw.technicians?.map((tech) => ({
                id: tech.id,
                technicianId: tech.technicianId,
                assignedById: tech.assignedById,
                status: tech.status,
                isLead: tech.isLead,
                roleInAssignment: tech.roleInAssignment,
                notes: tech.notes,
                assignedAt: tech.assignedAt,
                startedAt: tech.startedAt,
                completedAt: tech.completedAt,
                technician: tech.technician,
                assignedBy: tech.assignedBy,
                workLog: tech.workLogs?.[0]
                    ? {
                        id: tech.workLogs[0].id,
                        activity: tech.workLogs[0].workDone,
                        timeSpentMinutes: tech.workLogs[0].timeSpentMinutes,
                        additionalNotes: tech.workLogs[0].completionNotes,
                        materials: tech.workLogs[0].materials?.map((m) => ({
                            id: m.id,
                            name: m.name,
                            quantity: m.quantity != null ? Number(m.quantity) : undefined,
                            unit: m.unit,
                        })),
                        status: tech.status === 'NOT_FIXED' ? 'NOT_FIXED' : 'COMPLETED',
                        loggedAt: tech.workLogs[0].logDate,
                    }
                    : undefined,
            })) ?? [],
        };
    }
    async findByRequest(requestId) {
        await this.assertRequest(requestId);
        const items = await this.prisma.maintenanceRequestItem.findMany({
            where: { maintenanceRequestId: requestId, deletedAt: null },
            select: ITEM_SELECT,
            orderBy: { createdAt: 'asc' },
        });
        return items.map((it) => this.formatItem(it));
    }
    async findOne(id) {
        const item = await this.prisma.maintenanceRequestItem.findFirst({
            where: { id, deletedAt: null },
            select: ITEM_SELECT,
        });
        if (!item) {
            throw new common_1.NotFoundException(`Request item ${id} not found`);
        }
        return this.formatItem(item);
    }
    async create(requestId, dto) {
        await this.assertRequest(requestId);
        const existing = await this.prisma.maintenanceRequestItem.findFirst({
            where: {
                maintenanceRequestId: requestId,
                itemId: dto.itemId,
                issueTypeId: dto.issueTypeId,
                deletedAt: null,
            },
            select: { id: true },
        });
        if (existing) {
            throw new common_1.BadRequestException('This item/issue type combination already exists on the request');
        }
        const item = await this.prisma.maintenanceRequestItem.create({
            data: {
                maintenanceRequestId: requestId,
                itemId: dto.itemId,
                issueCategoryId: dto.issueCategoryId,
                issueTypeId: dto.issueTypeId,
                priority: dto.priority ?? client_1.RequestPriority.MEDIUM,
                description: dto.description,
            },
            select: ITEM_SELECT,
        });
        const issueType = await this.prisma.issueType.findUnique({
            where: { id: dto.issueTypeId },
            select: { needsApproval: true, name: true },
        });
        if (issueType?.needsApproval) {
            const parentReq = await this.prisma.maintenanceRequest.findUnique({
                where: { id: requestId },
                select: { status: true },
            });
            if (parentReq?.status === client_1.RequestStatus.PENDING) {
                await this.prisma.$transaction([
                    this.prisma.maintenanceRequest.update({
                        where: { id: requestId },
                        data: { status: client_1.RequestStatus.WAITING_APPROVAL },
                    }),
                    this.prisma.approvalRequest.create({
                        data: {
                            maintenanceRequestId: requestId,
                            maintenanceRequestItemId: item.id,
                            status: client_1.ApprovalStatus.PENDING,
                            notes: `Supervisor approval required for issue: ${issueType.name}`,
                        },
                    }),
                    this.prisma.requestStatusHistory.create({
                        data: {
                            maintenanceRequestId: requestId,
                            fromStatus: client_1.RequestStatus.PENDING,
                            toStatus: client_1.RequestStatus.WAITING_APPROVAL,
                            reason: `Item added requiring supervisor approval (${issueType.name})`,
                        },
                    }),
                ]);
            }
        }
        return this.formatItem(item);
    }
    async update(id, dto) {
        await this.findOne(id);
        const item = await this.prisma.maintenanceRequestItem.update({
            where: { id },
            data: dto,
            select: ITEM_SELECT,
        });
        return this.formatItem(item);
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.maintenanceRequestItem.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    async assertRequest(requestId) {
        const request = await this.prisma.maintenanceRequest.findFirst({
            where: { id: requestId, deletedAt: null },
            select: { id: true },
        });
        if (!request) {
            throw new common_1.NotFoundException(`Maintenance request ${requestId} not found`);
        }
    }
    async assignTechnicians(itemId, dto, assignedById) {
        await this.findOne(itemId);
        const technicians = await this.prisma.user.findMany({
            where: {
                id: { in: dto.technicianIds },
                deletedAt: null,
                isActive: true,
                OR: [
                    {
                        roleAssignments: {
                            some: {
                                role: {
                                    permissions: {
                                        some: {
                                            permission: {
                                                name: 'tasks:technician',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    {
                        permissionGrants: {
                            some: {
                                permission: {
                                    name: 'tasks:technician',
                                },
                            },
                        },
                    },
                ],
            },
            select: { id: true },
        });
        if (technicians.length !== dto.technicianIds.length) {
            throw new common_1.NotFoundException('One or more selected technicians were not found or do not have the tasks:technician permission');
        }
        const effectiveLeadId = dto.leadTechnicianId ||
            (dto.isLead ? dto.technicianIds[0] : dto.technicianIds[0]);
        if (effectiveLeadId) {
            await this.prisma.itemTechnician.updateMany({
                where: {
                    requestItemId: itemId,
                    technicianId: { not: effectiveLeadId },
                    isLead: true,
                },
                data: {
                    isLead: false,
                    roleInAssignment: client_1.AssignmentRole.ASSISTANT,
                },
            });
        }
        for (let i = 0; i < dto.technicianIds.length; i++) {
            const techId = dto.technicianIds[i];
            const isLead = techId === effectiveLeadId;
            const roleInAssignment = dto.roleInAssignment ??
                (isLead ? client_1.AssignmentRole.LEAD : client_1.AssignmentRole.ASSISTANT);
            await this.prisma.itemTechnician.upsert({
                where: {
                    requestItemId_technicianId: {
                        requestItemId: itemId,
                        technicianId: techId,
                    },
                },
                create: {
                    requestItemId: itemId,
                    technicianId: techId,
                    assignedById: assignedById ?? null,
                    status: client_1.TechnicianAssignmentStatus.ASSIGNED,
                    isLead,
                    roleInAssignment,
                    notes: dto.notes,
                },
                update: {
                    status: client_1.TechnicianAssignmentStatus.ASSIGNED,
                    isLead,
                    roleInAssignment,
                    notes: dto.notes,
                },
            });
        }
        const itemRecord = await this.prisma.maintenanceRequestItem.findUnique({
            where: { id: itemId },
            select: {
                maintenanceRequestId: true,
                maintenanceRequest: { select: { status: true } },
            },
        });
        if (itemRecord &&
            (itemRecord.maintenanceRequest.status === client_1.RequestStatus.PENDING ||
                itemRecord.maintenanceRequest.status === client_1.RequestStatus.APPROVED)) {
            await this.prisma.$transaction([
                this.prisma.maintenanceRequest.update({
                    where: { id: itemRecord.maintenanceRequestId },
                    data: { status: client_1.RequestStatus.ASSIGNED },
                }),
                this.prisma.requestStatusHistory.create({
                    data: {
                        maintenanceRequestId: itemRecord.maintenanceRequestId,
                        fromStatus: itemRecord.maintenanceRequest.status,
                        toStatus: client_1.RequestStatus.ASSIGNED,
                        changedById: assignedById ?? null,
                        reason: dto.notes
                            ? `Assigned team: ${dto.notes}`
                            : `Assigned ${dto.technicianIds.length} engineer(s) to affected asset`,
                    },
                }),
            ]);
        }
        if (itemRecord) {
            const requestInfo = await this.prisma.maintenanceRequest.findUnique({
                where: { id: itemRecord.maintenanceRequestId },
                select: { id: true, ticketNumber: true, requesterId: true },
            });
            if (requestInfo) {
                await this.notifications.notifyUsers(dto.technicianIds, 'REQUEST_ASSIGNED', {
                    requestId: requestInfo.id,
                    ticketNumber: requestInfo.ticketNumber,
                    itemId,
                    message: `You have been assigned to maintenance ticket ${requestInfo.ticketNumber}.`,
                });
                if (requestInfo.requesterId && requestInfo.requesterId !== assignedById) {
                    await this.notifications.notifyUser(requestInfo.requesterId, 'REQUEST_ASSIGNED', {
                        requestId: requestInfo.id,
                        ticketNumber: requestInfo.ticketNumber,
                        message: `Technicians have been assigned to your maintenance request ${requestInfo.ticketNumber}.`,
                    });
                }
            }
        }
        return this.findOne(itemId);
    }
    async unassignTechnician(itemId, assignmentId) {
        await this.findOne(itemId);
        return this.prisma.itemTechnician.update({
            where: { id: assignmentId },
            data: { status: client_1.TechnicianAssignmentStatus.CANCELLED },
            select: {
                id: true,
                technicianId: true,
                status: true,
                notes: true,
                technician: { select: { id: true, fullName: true } },
            },
        });
    }
    async updateAssignment(assignmentId, dto, userId) {
        const assignment = await this.prisma.itemTechnician.findUnique({
            where: { id: assignmentId },
            select: {
                id: true,
                status: true,
                requestItemId: true,
                technicianId: true,
                requestItem: {
                    select: {
                        maintenanceRequestId: true,
                        maintenanceRequest: { select: { status: true } },
                    },
                },
            },
        });
        if (!assignment) {
            throw new common_1.NotFoundException(`Assignment ${assignmentId} not found`);
        }
        if (userId && assignment.technicianId !== userId) {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    permissionGrants: { include: { permission: true } },
                    roleAssignments: {
                        include: {
                            role: {
                                include: {
                                    permissions: { include: { permission: true } },
                                },
                            },
                        },
                    },
                },
            });
            const perms = new Set();
            user?.permissionGrants.forEach((pg) => perms.add(pg.permission.name));
            user?.roleAssignments.forEach((ra) => ra.role.permissions.forEach((p) => perms.add(p.permission.name)));
            if (!perms.has('*') &&
                !perms.has('tasks:ict-director') &&
                !perms.has('requests:assign-technicians')) {
                throw new common_1.ForbiddenException('You can only update your own assigned technician tasks.');
            }
        }
        const data = { notes: dto.notes };
        if (dto.status) {
            data.status = dto.status;
            if (dto.status === client_1.TechnicianAssignmentStatus.IN_PROGRESS) {
                data.startedAt = new Date();
            }
            if (dto.status === client_1.TechnicianAssignmentStatus.COMPLETED ||
                dto.status === client_1.TechnicianAssignmentStatus.NOT_FIXED) {
                data.completedAt = new Date();
            }
        }
        if (dto.isLead !== undefined) {
            data.isLead = dto.isLead;
            data.roleInAssignment = dto.isLead
                ? client_1.AssignmentRole.LEAD
                : client_1.AssignmentRole.ASSISTANT;
        }
        if (dto.roleInAssignment) {
            data.roleInAssignment = dto.roleInAssignment;
            data.isLead = dto.roleInAssignment === client_1.AssignmentRole.LEAD;
        }
        const updated = await this.prisma.itemTechnician.update({
            where: { id: assignmentId },
            data,
            select: {
                id: true,
                technicianId: true,
                status: true,
                isLead: true,
                roleInAssignment: true,
                notes: true,
                assignedAt: true,
                startedAt: true,
                completedAt: true,
                technician: { select: { id: true, fullName: true, email: true } },
                assignedBy: { select: { id: true, fullName: true } },
            },
        });
        const requestId = assignment.requestItem.maintenanceRequestId;
        const currentReqStatus = assignment.requestItem.maintenanceRequest.status;
        if (dto.status === client_1.TechnicianAssignmentStatus.IN_PROGRESS) {
            if (currentReqStatus === client_1.RequestStatus.ASSIGNED ||
                currentReqStatus === client_1.RequestStatus.PENDING ||
                currentReqStatus === client_1.RequestStatus.APPROVED) {
                await this.prisma.$transaction([
                    this.prisma.maintenanceRequest.update({
                        where: { id: requestId },
                        data: { status: client_1.RequestStatus.IN_PROGRESS },
                    }),
                    this.prisma.requestStatusHistory.create({
                        data: {
                            maintenanceRequestId: requestId,
                            fromStatus: currentReqStatus,
                            toStatus: client_1.RequestStatus.IN_PROGRESS,
                            changedById: userId ?? assignment.technicianId,
                            reason: 'Technician commenced physical inspection & diagnosis',
                        },
                    }),
                ]);
            }
            const req = await this.prisma.maintenanceRequest.findUnique({
                where: { id: requestId },
                select: { ticketNumber: true, requesterId: true },
            });
            if (req?.requesterId && req.requesterId !== (userId ?? assignment.technicianId)) {
                const techName = updated.technician?.fullName ?? 'A technician';
                await this.notifications.notifyUser(req.requesterId, 'WORK_STARTED', {
                    requestId,
                    ticketNumber: req.ticketNumber,
                    message: `${techName} started diagnostic/maintenance work on your request ${req.ticketNumber}.`,
                });
            }
        }
        if (dto.status === client_1.TechnicianAssignmentStatus.COMPLETED ||
            dto.status === client_1.TechnicianAssignmentStatus.NOT_FIXED) {
            const allAssignments = await this.prisma.itemTechnician.findMany({
                where: {
                    requestItem: { maintenanceRequestId: requestId, deletedAt: null },
                },
                select: { id: true, status: true },
            });
            const allResolved = allAssignments.length > 0 &&
                allAssignments.every((a) => a.id === assignmentId
                    ? dto.status === client_1.TechnicianAssignmentStatus.COMPLETED ||
                        dto.status === client_1.TechnicianAssignmentStatus.NOT_FIXED
                    : a.status === client_1.TechnicianAssignmentStatus.COMPLETED ||
                        a.status === client_1.TechnicianAssignmentStatus.NOT_FIXED);
            if (allResolved && currentReqStatus === client_1.RequestStatus.IN_PROGRESS) {
                const hasNotFixed = allAssignments.some((a) => a.id === assignmentId
                    ? dto.status === client_1.TechnicianAssignmentStatus.NOT_FIXED
                    : a.status === client_1.TechnicianAssignmentStatus.NOT_FIXED);
                const nextStatus = client_1.RequestStatus.WAITING_CONFIRMATION;
                await this.prisma.$transaction([
                    this.prisma.maintenanceRequest.update({
                        where: { id: requestId },
                        data: { status: nextStatus },
                    }),
                    this.prisma.requestStatusHistory.create({
                        data: {
                            maintenanceRequestId: requestId,
                            fromStatus: currentReqStatus,
                            toStatus: nextStatus,
                            changedById: userId ?? assignment.technicianId,
                            reason: hasNotFixed
                                ? 'Diagnostic reports filed for all affected items'
                                : 'All items serviced and confirmed completed',
                        },
                    }),
                ]);
                const req = await this.prisma.maintenanceRequest.findUnique({
                    where: { id: requestId },
                    select: { ticketNumber: true, requesterId: true },
                });
                if (req?.requesterId) {
                    await this.notifications.notifyUser(req.requesterId, 'WAITING_CONFIRMATION', {
                        requestId,
                        ticketNumber: req.ticketNumber,
                        message: `Technicians have finished servicing ticket ${req.ticketNumber}. Please inspect equipment and confirm completion or report rework.`,
                    });
                }
            }
        }
        return updated;
    }
    async findByTechnician(technicianId) {
        return this.prisma.itemTechnician.findMany({
            where: {
                technicianId,
                requestItem: { maintenanceRequest: { deletedAt: null } },
            },
            select: {
                id: true,
                status: true,
                isLead: true,
                roleInAssignment: true,
                assignedAt: true,
                startedAt: true,
                completedAt: true,
                requestItem: {
                    select: {
                        id: true,
                        description: true,
                        item: { select: { id: true, name: true } },
                        issueType: { select: { id: true, name: true } },
                        maintenanceRequest: {
                            select: {
                                id: true,
                                ticketNumber: true,
                                title: true,
                                status: true,
                            },
                        },
                    },
                },
            },
            orderBy: { assignedAt: 'desc' },
        });
    }
};
exports.RequestItemsService = RequestItemsService;
exports.RequestItemsService = RequestItemsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], RequestItemsService);
//# sourceMappingURL=request-items.service.js.map