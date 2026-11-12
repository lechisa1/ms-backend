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
var RequestsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestsService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const create_request_dto_1 = require("./dto/create-request.dto");
const paginated_result_dto_1 = require("../common/dto/paginated-result.dto");
const notifications_service_1 = require("../notifications/notifications.service");
const MAINTENANCE_SELECT = {
    id: true,
    ticketNumber: true,
    priority: true,
    status: true,
    title: true,
    description: true,
    rejectionReason: true,
    requestedAt: true,
    createdAt: true,
    updatedAt: true,
    requesterId: true,
    requester: {
        select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            organizationUnitId: true,
            organizationUnit: { select: { id: true, name: true, code: true } },
        },
    },
    items: {
        where: { deletedAt: null },
        select: {
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
                    notes: true,
                    isLead: true,
                    roleInAssignment: true,
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
        },
    },
    files: {
        select: {
            id: true,
            fileName: true,
            originalName: true,
            mimeType: true,
            fileType: true,
            sizeBytes: true,
            createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
    },
    _count: { select: { workLogs: true, approvalRequests: true, updates: true } },
};
const SPECIFICATION_SELECT = {
    id: true,
    ticketNumber: true,
    priority: true,
    status: true,
    title: true,
    description: true,
    rejectionReason: true,
    requestedAt: true,
    createdAt: true,
    updatedAt: true,
    requesterId: true,
    requester: {
        select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            organizationUnitId: true,
            organizationUnit: { select: { id: true, name: true, code: true } },
        },
    },
    items: {
        where: { deletedAt: null },
        select: {
            id: true,
            specificationRequestId: true,
            categoryId: true,
            requestedItemName: true,
            quantity: true,
            unitOfMeasure: true,
            priority: true,
            description: true,
            createdAt: true,
            updatedAt: true,
            category: { select: { id: true, name: true } },
            files: {
                select: {
                    id: true,
                    fileName: true,
                    originalName: true,
                    mimeType: true,
                    sizeBytes: true,
                    createdAt: true,
                },
            },
        },
        orderBy: { createdAt: 'asc' },
    },
    files: {
        select: {
            id: true,
            fileName: true,
            originalName: true,
            mimeType: true,
            fileType: true,
            sizeBytes: true,
            createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
    },
};
let RequestsService = RequestsService_1 = class RequestsService {
    prisma;
    notifications;
    logger = new common_1.Logger(RequestsService_1.name);
    constructor(prisma, notifications) {
        this.prisma = prisma;
        this.notifications = notifications;
    }
    generateTicketNumber(prefix = 'MTN') {
        const now = new Date();
        const datePart = [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, '0'),
            String(now.getDate()).padStart(2, '0'),
        ].join('');
        const random = (0, crypto_1.randomBytes)(3).toString('hex').toUpperCase();
        return `${prefix}-${datePart}-${random}`;
    }
    formatMaintenanceRequest(raw) {
        if (!raw)
            return null;
        return {
            id: raw.id,
            ticketNumber: raw.ticketNumber,
            requestType: create_request_dto_1.RequestTypeEnum.MAINTENANCE,
            priority: raw.priority,
            status: raw.status,
            title: raw.title,
            description: raw.description,
            rejectionReason: raw.rejectionReason,
            requestedAt: raw.requestedAt,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
            requesterId: raw.requesterId,
            requester: raw.requester
                ? {
                    id: raw.requester.id,
                    fullName: raw.requester.fullName,
                    email: raw.requester.email,
                    phone: raw.requester.phone,
                    organizationUnit: raw.requester.organizationUnit,
                }
                : null,
            organizationUnitId: raw.requester?.organizationUnitId ?? null,
            organizationUnit: raw.requester?.organizationUnit ?? null,
            items: raw.items?.map((it) => ({
                id: it.id,
                maintenanceRequestId: it.maintenanceRequestId,
                itemId: it.itemId,
                issueCategoryId: it.issueCategoryId,
                issueTypeId: it.issueTypeId,
                priority: it.priority,
                description: it.description,
                createdAt: it.createdAt,
                updatedAt: it.updatedAt,
                item: it.item
                    ? {
                        id: it.item.id,
                        name: it.item.name,
                        code: it.item.id,
                        unitOfMeasure: it.item.unitOfMeasure,
                        status: it.item.status,
                        category: it.item.category,
                    }
                    : null,
                issueCategory: it.issueCategory ?? it.issueType?.category ?? null,
                issueType: it.issueType
                    ? {
                        id: it.issueType.id,
                        name: it.issueType.name,
                        slug: it.issueType.slug,
                        needsApproval: it.issueType.needsApproval,
                        category: it.issueType.category,
                    }
                    : null,
                technicians: it.technicians?.map((tech) => ({
                    id: tech.id,
                    technicianId: tech.technicianId,
                    assignedById: tech.assignedById,
                    status: tech.status,
                    notes: tech.notes,
                    isLead: tech.isLead,
                    roleInAssignment: tech.roleInAssignment,
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
            })) ?? [],
            specificationItems: [],
            files: raw.files?.map((f) => ({
                ...f,
                sizeBytes: Number(f.sizeBytes),
                downloadUrl: `/api/requests/${raw.id}/files/${f.id}/download`,
                previewUrl: `/api/requests/${raw.id}/files/${f.id}/download`,
            })) ?? [],
            statusHistory: raw.statusHistory ?? [],
            updates: raw.updates ?? [],
            workLogs: raw.workLogs ?? [],
            approvalRequests: raw.approvalRequests ?? [],
            _count: raw._count ?? { workLogs: 0, approvalRequests: 0, updates: 0 },
        };
    }
    formatSpecificationRequest(raw) {
        if (!raw)
            return null;
        return {
            id: raw.id,
            ticketNumber: raw.ticketNumber,
            requestType: create_request_dto_1.RequestTypeEnum.SPECIFICATION,
            priority: raw.priority,
            status: raw.status,
            title: raw.title,
            description: raw.description,
            rejectionReason: raw.rejectionReason,
            requestedAt: raw.requestedAt,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
            requesterId: raw.requesterId,
            requester: raw.requester
                ? {
                    id: raw.requester.id,
                    fullName: raw.requester.fullName,
                    email: raw.requester.email,
                    phone: raw.requester.phone,
                    organizationUnit: raw.requester.organizationUnit,
                }
                : null,
            organizationUnitId: raw.requester?.organizationUnitId ?? null,
            organizationUnit: raw.requester?.organizationUnit ?? null,
            items: [],
            specificationItems: raw.items?.map((it) => ({
                id: it.id,
                maintenanceRequestId: raw.id,
                specificationRequestId: raw.id,
                categoryId: it.categoryId,
                requestedItemName: it.requestedItemName,
                quantity: it.quantity,
                unitOfMeasure: it.unitOfMeasure,
                priority: it.priority,
                description: it.description,
                createdAt: it.createdAt,
                updatedAt: it.updatedAt,
                category: it.category,
                files: it.files?.map((f) => ({
                    ...f,
                    sizeBytes: Number(f.sizeBytes),
                    downloadUrl: `/api/specification-items/${it.id}/files/${f.id}/download`,
                    previewUrl: `/api/specification-items/${it.id}/files/${f.id}/download`,
                })) ?? [],
            })) ?? [],
            files: raw.files?.map((f) => ({
                ...f,
                sizeBytes: Number(f.sizeBytes),
                downloadUrl: `/api/requests/${raw.id}/files/${f.id}/download`,
                previewUrl: `/api/requests/${raw.id}/files/${f.id}/download`,
            })) ?? [],
            statusHistory: [],
            updates: [],
            workLogs: [],
            approvalRequests: [],
            _count: { workLogs: 0, approvalRequests: 0, updates: 0 },
        };
    }
    async create(dto, currentUserId) {
        const isSpecification = dto.requestType === 'SPECIFICATION';
        const requesterId = currentUserId ?? null;
        if (requesterId) {
            const requester = await this.prisma.user.findFirst({
                where: { id: requesterId, deletedAt: null },
                select: { id: true },
            });
            if (!requester) {
                throw new common_1.NotFoundException(`Requester ${requesterId} not found`);
            }
        }
        if (isSpecification) {
            const ticketNumber = this.generateTicketNumber('SPEC');
            const specItems = dto.specificationItems ?? dto.items ?? [];
            const specReq = await this.prisma.specificationRequest.create({
                data: {
                    ticketNumber,
                    requesterId,
                    priority: dto.priority ?? client_1.RequestPriority.MEDIUM,
                    status: client_1.RequestStatus.PENDING,
                    title: dto.title,
                    description: dto.description,
                    items: specItems.length
                        ? {
                            create: specItems.map((item) => ({
                                categoryId: item.categoryId ?? item.itemCategoryId ?? null,
                                requestedItemName: item.requestedItemName ?? item.itemName ?? 'Requested Item',
                                quantity: item.quantity ?? 1,
                                unitOfMeasure: item.unitOfMeasure ?? null,
                                priority: item.priority ?? dto.priority ?? client_1.RequestPriority.MEDIUM,
                                description: item.description ?? null,
                            })),
                        }
                        : undefined,
                },
                select: SPECIFICATION_SELECT,
            });
            if (requesterId) {
                await this.notifications.notifyUser(requesterId, 'REQUEST_CREATED', {
                    requestId: specReq.id,
                    ticketNumber: specReq.ticketNumber,
                    title: specReq.title ?? 'Specification Request',
                    message: `Your specification request ${specReq.ticketNumber} was submitted successfully.`,
                });
            }
            await this.notifications.notifyUsersWithPermissions(['tasks:ict-director', 'requests:assign-technicians'], 'REQUEST_CREATED', {
                requestId: specReq.id,
                ticketNumber: specReq.ticketNumber,
                title: specReq.title ?? 'Specification Request',
                message: `New specification request ${specReq.ticketNumber} submitted.`,
            }, requesterId ? [requesterId] : []);
            return this.formatSpecificationRequest(specReq);
        }
        const ticketNumber = this.generateTicketNumber('MTN');
        const maintItems = dto.items ?? dto.maintenanceItems ?? [];
        const issueTypeIds = maintItems.map((i) => i.issueTypeId).filter(Boolean);
        const approvalItem = issueTypeIds.length > 0
            ? await this.prisma.issueType.findFirst({
                where: {
                    id: { in: issueTypeIds },
                    needsApproval: true,
                    deletedAt: null,
                },
                select: { id: true, name: true },
            })
            : null;
        const initialStatus = approvalItem
            ? client_1.RequestStatus.WAITING_APPROVAL
            : client_1.RequestStatus.PENDING;
        const initialReason = approvalItem
            ? `Initial request submitted — requires supervisor approval due to issue type '${approvalItem.name}'`
            : 'Request created';
        const maintReq = await this.prisma.maintenanceRequest.create({
            data: {
                ticketNumber,
                requesterId,
                priority: dto.priority ?? client_1.RequestPriority.MEDIUM,
                status: initialStatus,
                title: dto.title,
                description: dto.description,
                items: maintItems.length
                    ? {
                        create: maintItems.map((item) => ({
                            itemId: item.itemId,
                            issueCategoryId: item.issueCategoryId ?? null,
                            issueTypeId: item.issueTypeId,
                            priority: item.priority ?? dto.priority ?? client_1.RequestPriority.MEDIUM,
                            description: item.description ?? null,
                        })),
                    }
                    : undefined,
                approvalRequests: approvalItem
                    ? {
                        create: {
                            status: client_1.ApprovalStatus.PENDING,
                            notes: `Supervisor approval required for issue: ${approvalItem.name}`,
                        },
                    }
                    : undefined,
                statusHistory: {
                    create: {
                        toStatus: initialStatus,
                        changedById: currentUserId ?? null,
                        reason: initialReason,
                    },
                },
            },
            select: MAINTENANCE_SELECT,
        });
        if (approvalItem) {
            const supervisorId = requesterId
                ? await this.resolveApprovingSupervisorId(requesterId)
                : null;
            if (supervisorId) {
                await this.notifications.notifyUser(supervisorId, 'APPROVAL_NEEDED', {
                    requestId: maintReq.id,
                    ticketNumber: maintReq.ticketNumber,
                    title: maintReq.title ?? 'Maintenance Request',
                    message: `New maintenance request ${maintReq.ticketNumber} requires your supervisor review and approval.`,
                });
            }
            if (requesterId) {
                await this.notifications.notifyUser(requesterId, 'REQUEST_CREATED', {
                    requestId: maintReq.id,
                    ticketNumber: maintReq.ticketNumber,
                    title: maintReq.title ?? 'Maintenance Request',
                    message: `Your maintenance request ${maintReq.ticketNumber} was submitted and is pending supervisor approval.`,
                });
            }
        }
        else {
            await this.notifications.notifyUsersWithPermissions(['tasks:ict-director', 'requests:assign-technicians'], 'REQUEST_CREATED', {
                requestId: maintReq.id,
                ticketNumber: maintReq.ticketNumber,
                title: maintReq.title ?? 'Maintenance Request',
                message: `New maintenance request ${maintReq.ticketNumber} submitted and ready for technician assignment.`,
            }, requesterId ? [requesterId] : []);
            if (requesterId) {
                await this.notifications.notifyUser(requesterId, 'REQUEST_CREATED', {
                    requestId: maintReq.id,
                    ticketNumber: maintReq.ticketNumber,
                    title: maintReq.title ?? 'Maintenance Request',
                    message: `Your maintenance request ${maintReq.ticketNumber} was submitted and queued for technician assignment.`,
                });
            }
        }
        return this.formatMaintenanceRequest(maintReq);
    }
    async findAll(query) {
        const statusList = query.statuses
            ? query.statuses
                .split(',')
                .map((status) => status.trim())
                .filter(Boolean)
            : query.status
                ? [query.status]
                : undefined;
        const allowedSort = ['createdAt', 'updatedAt', 'ticketNumber', 'priority', 'status', 'title'];
        const sortBy = allowedSort.includes(query.sortBy || '') ? query.sortBy : 'createdAt';
        const order = (query.sortOrder || query.order || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';
        if (query.requestType === create_request_dto_1.RequestTypeEnum.SPECIFICATION) {
            const where = {
                deletedAt: null,
                ...(query.requesterId ? { requesterId: query.requesterId } : {}),
                ...(query.organizationUnitId
                    ? { requester: { organizationUnitId: query.organizationUnitId } }
                    : {}),
                ...(statusList ? { status: { in: statusList } } : {}),
                ...(query.priority ? { priority: query.priority } : {}),
                ...(query.ticketNumber ? { ticketNumber: { contains: query.ticketNumber, mode: 'insensitive' } } : {}),
                ...(query.search
                    ? {
                        OR: [
                            { ticketNumber: { contains: query.search, mode: 'insensitive' } },
                            { title: { contains: query.search, mode: 'insensitive' } },
                            { description: { contains: query.search, mode: 'insensitive' } },
                        ],
                    }
                    : {}),
            };
            const [total, data] = await this.prisma.$transaction([
                this.prisma.specificationRequest.count({ where }),
                this.prisma.specificationRequest.findMany({
                    where,
                    skip: query.skip,
                    take: query.limit,
                    orderBy: { [sortBy]: order },
                    select: SPECIFICATION_SELECT,
                }),
            ]);
            const formatted = data.map((item) => this.formatSpecificationRequest(item));
            return paginated_result_dto_1.PaginatedResult.of(formatted, total, query.page, query.limit);
        }
        if (query.requestType === create_request_dto_1.RequestTypeEnum.MAINTENANCE) {
            const where = {
                deletedAt: null,
                ...(query.requesterId ? { requesterId: query.requesterId } : {}),
                ...(query.organizationUnitId
                    ? { requester: { organizationUnitId: query.organizationUnitId } }
                    : {}),
                ...(statusList ? { status: { in: statusList } } : {}),
                ...(query.priority ? { priority: query.priority } : {}),
                ...(query.ticketNumber ? { ticketNumber: { contains: query.ticketNumber, mode: 'insensitive' } } : {}),
                ...(query.search
                    ? {
                        OR: [
                            { ticketNumber: { contains: query.search, mode: 'insensitive' } },
                            { title: { contains: query.search, mode: 'insensitive' } },
                            { description: { contains: query.search, mode: 'insensitive' } },
                        ],
                    }
                    : {}),
            };
            const [total, data] = await this.prisma.$transaction([
                this.prisma.maintenanceRequest.count({ where }),
                this.prisma.maintenanceRequest.findMany({
                    where,
                    skip: query.skip,
                    take: query.limit,
                    orderBy: { [sortBy]: order },
                    select: MAINTENANCE_SELECT,
                }),
            ]);
            const formatted = data.map((item) => this.formatMaintenanceRequest(item));
            return paginated_result_dto_1.PaginatedResult.of(formatted, total, query.page, query.limit);
        }
        const maintWhere = {
            deletedAt: null,
            ...(query.requesterId ? { requesterId: query.requesterId } : {}),
            ...(query.organizationUnitId
                ? { requester: { organizationUnitId: query.organizationUnitId } }
                : {}),
            ...(statusList ? { status: { in: statusList } } : {}),
            ...(query.priority ? { priority: query.priority } : {}),
            ...(query.ticketNumber ? { ticketNumber: { contains: query.ticketNumber } } : {}),
            ...(query.search
                ? {
                    OR: [
                        { ticketNumber: { contains: query.search } },
                        { title: { contains: query.search } },
                        { description: { contains: query.search } },
                    ],
                }
                : {}),
        };
        const specWhere = {
            deletedAt: null,
            ...(query.requesterId ? { requesterId: query.requesterId } : {}),
            ...(query.organizationUnitId
                ? { requester: { organizationUnitId: query.organizationUnitId } }
                : {}),
            ...(statusList ? { status: { in: statusList } } : {}),
            ...(query.priority ? { priority: query.priority } : {}),
            ...(query.ticketNumber ? { ticketNumber: { contains: query.ticketNumber } } : {}),
            ...(query.search
                ? {
                    OR: [
                        { ticketNumber: { contains: query.search } },
                        { title: { contains: query.search } },
                        { description: { contains: query.search } },
                    ],
                }
                : {}),
        };
        const [maintTotal, specTotal, maintData, specData] = await this.prisma.$transaction([
            this.prisma.maintenanceRequest.count({ where: maintWhere }),
            this.prisma.specificationRequest.count({ where: specWhere }),
            this.prisma.maintenanceRequest.findMany({
                where: maintWhere,
                take: query.limit * 2,
                orderBy: { [sortBy]: order },
                select: MAINTENANCE_SELECT,
            }),
            this.prisma.specificationRequest.findMany({
                where: specWhere,
                take: query.limit * 2,
                orderBy: { [sortBy]: order },
                select: SPECIFICATION_SELECT,
            }),
        ]);
        const combined = [
            ...maintData.map((item) => this.formatMaintenanceRequest(item)),
            ...specData.map((item) => this.formatSpecificationRequest(item)),
        ];
        const sortField = query.sortBy ?? 'createdAt';
        const sortOrder = query.order ?? 'desc';
        combined.sort((a, b) => {
            const valA = new Date(a[sortField] || 0).getTime();
            const valB = new Date(b[sortField] || 0).getTime();
            return sortOrder === 'asc' ? valA - valB : valB - valA;
        });
        const paged = combined.slice(query.skip, query.skip + query.limit);
        return paginated_result_dto_1.PaginatedResult.of(paged, maintTotal + specTotal, query.page, query.limit);
    }
    async getMyTasks(userId, query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const skip = (page - 1) * limit;
        const user = await this.prisma.user.findFirst({
            where: { id: userId, deletedAt: null },
            select: {
                id: true,
                fullName: true,
                organizationUnitId: true,
                membershipRole: true,
                supervisedUnit: { select: { id: true, name: true } },
                roleAssignments: {
                    select: {
                        role: {
                            select: {
                                id: true,
                                name: true,
                                permissions: {
                                    select: { permission: { select: { name: true } } },
                                },
                            },
                        },
                    },
                },
                permissionGrants: {
                    select: { permission: { select: { name: true } } },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const rolePermissions = user.roleAssignments.flatMap((a) => a.role.permissions.map((p) => p.permission.name));
        const directPermissions = user.permissionGrants.map((p) => p.permission.name);
        const allPermissions = new Set([...rolePermissions, ...directPermissions]);
        const isIctDirector = allPermissions.has('tasks:ict-director') || allPermissions.has('*');
        const isTechnician = allPermissions.has('tasks:technician') || allPermissions.has('*');
        const supervisedUnits = await this.prisma.organizationUnit.findMany({
            where: {
                deletedAt: null,
                supervisorId: userId,
            },
            select: { id: true },
        });
        const isSupervisor = supervisedUnits.length > 0;
        let directUnitIds = [];
        let childSupervisorIds = [];
        if (isSupervisor) {
            const supervisedUnitIds = supervisedUnits.map((u) => u.id);
            const immediateChildUnits = await this.prisma.organizationUnit.findMany({
                where: { parentId: { in: supervisedUnitIds }, deletedAt: null },
                select: { id: true, supervisorId: true },
            });
            childSupervisorIds = immediateChildUnits
                .map((u) => u.supervisorId)
                .filter((id) => Boolean(id) && id !== userId);
            const unassignedChildUnitIds = immediateChildUnits
                .filter((u) => !u.supervisorId)
                .map((u) => u.id);
            directUnitIds = [...supervisedUnitIds, ...unassignedChildUnitIds];
        }
        const searchFilter = query.search
            ? {
                OR: [
                    { ticketNumber: { contains: query.search, mode: client_1.Prisma.QueryMode.insensitive } },
                    { title: { contains: query.search, mode: client_1.Prisma.QueryMode.insensitive } },
                    { description: { contains: query.search, mode: client_1.Prisma.QueryMode.insensitive } },
                    {
                        requester: {
                            fullName: { contains: query.search, mode: client_1.Prisma.QueryMode.insensitive },
                        },
                    },
                ],
            }
            : {};
        const supervisorRequesterFilter = {
            requesterId: { not: userId },
            OR: [
                {
                    requester: {
                        organizationUnitId: { in: directUnitIds },
                        id: { not: userId },
                    },
                },
                ...(childSupervisorIds.length > 0
                    ? [{ requesterId: { in: childSupervisorIds } }]
                    : []),
            ],
        };
        const supervisorMaintWhere = isSupervisor
            ? {
                deletedAt: null,
                status: client_1.RequestStatus.WAITING_APPROVAL,
                ...supervisorRequesterFilter,
                ...(query.priority ? { priority: query.priority } : {}),
                ...searchFilter,
            }
            : { id: '00000000-0000-0000-0000-000000000000' };
        const supervisorSpecWhere = isSupervisor
            ? {
                deletedAt: null,
                status: client_1.RequestStatus.WAITING_APPROVAL,
                ...supervisorRequesterFilter,
                ...(query.priority ? { priority: query.priority } : {}),
                ...searchFilter,
            }
            : { id: '00000000-0000-0000-0000-000000000000' };
        const ictMaintWhere = isIctDirector
            ? {
                deletedAt: null,
                requesterId: { not: userId },
                OR: [
                    {
                        approvalRequests: {
                            some: { status: client_1.ApprovalStatus.APPROVED },
                        },
                    },
                    {
                        approvalRequests: {
                            none: {},
                        },
                        status: { not: client_1.RequestStatus.WAITING_APPROVAL },
                    },
                ],
                ...(query.status ? { status: query.status } : {}),
                ...(query.priority ? { priority: query.priority } : {}),
                ...searchFilter,
            }
            : { id: '00000000-0000-0000-0000-000000000000' };
        const ictSpecWhere = isIctDirector
            ? {
                deletedAt: null,
                requesterId: { not: userId },
                status: query.status ? query.status : { in: [client_1.RequestStatus.PENDING, client_1.RequestStatus.APPROVED] },
                ...(query.priority ? { priority: query.priority } : {}),
                ...searchFilter,
            }
            : { id: '00000000-0000-0000-0000-000000000000' };
        const technicianMaintWhere = isTechnician
            ? {
                deletedAt: null,
                requesterId: { not: userId },
                items: {
                    some: {
                        technicians: {
                            some: { technicianId: userId },
                        },
                    },
                },
                ...(query.status ? { status: query.status } : {}),
                ...(query.priority ? { priority: query.priority } : {}),
                ...searchFilter,
            }
            : { id: '00000000-0000-0000-0000-000000000000' };
        const [supervisorCount, ictCount, technicianCount] = await Promise.all([
            isSupervisor
                ? Promise.all([
                    this.prisma.maintenanceRequest.count({
                        where: {
                            deletedAt: null,
                            status: client_1.RequestStatus.WAITING_APPROVAL,
                            ...supervisorRequesterFilter,
                        },
                    }),
                    this.prisma.specificationRequest.count({
                        where: {
                            deletedAt: null,
                            status: client_1.RequestStatus.WAITING_APPROVAL,
                            ...supervisorRequesterFilter,
                        },
                    }),
                ]).then(([m, s]) => m + s)
                : 0,
            isIctDirector
                ? Promise.all([
                    this.prisma.maintenanceRequest.count({
                        where: {
                            deletedAt: null,
                            requesterId: { not: userId },
                            status: { in: [client_1.RequestStatus.PENDING, client_1.RequestStatus.APPROVED] },
                            OR: [
                                { approvalRequests: { some: { status: client_1.ApprovalStatus.APPROVED } } },
                                { approvalRequests: { none: {} }, status: { not: client_1.RequestStatus.WAITING_APPROVAL } },
                            ],
                        },
                    }),
                    this.prisma.specificationRequest.count({
                        where: {
                            deletedAt: null,
                            requesterId: { not: userId },
                            status: { in: [client_1.RequestStatus.PENDING, client_1.RequestStatus.APPROVED] },
                        },
                    }),
                ]).then(([m, s]) => m + s)
                : 0,
            isTechnician
                ? this.prisma.maintenanceRequest.count({
                    where: {
                        deletedAt: null,
                        requesterId: { not: userId },
                        items: {
                            some: {
                                technicians: {
                                    some: {
                                        technicianId: userId,
                                        status: { not: client_1.TechnicianAssignmentStatus.COMPLETED },
                                    },
                                },
                            },
                        },
                    },
                })
                : 0,
        ]);
        let activeRoleView = query.roleView;
        if (!activeRoleView || activeRoleView === 'ALL') {
            if (isSupervisor && supervisorCount > 0) {
                activeRoleView = 'SUPERVISOR';
            }
            else if (isIctDirector && ictCount > 0) {
                activeRoleView = 'ICT_DIRECTOR';
            }
            else if (isTechnician && technicianCount > 0) {
                activeRoleView = 'TECHNICIAN';
            }
            else if (isSupervisor) {
                activeRoleView = 'SUPERVISOR';
            }
            else if (isIctDirector) {
                activeRoleView = 'ICT_DIRECTOR';
            }
            else if (isTechnician) {
                activeRoleView = 'TECHNICIAN';
            }
            else {
                activeRoleView = 'ALL';
            }
        }
        let items = [];
        let total = 0;
        if (activeRoleView === 'SUPERVISOR') {
            const [mCount, sCount, mData, sData] = await Promise.all([
                this.prisma.maintenanceRequest.count({ where: supervisorMaintWhere }),
                this.prisma.specificationRequest.count({ where: supervisorSpecWhere }),
                this.prisma.maintenanceRequest.findMany({
                    where: supervisorMaintWhere,
                    orderBy: { createdAt: 'desc' },
                    take: limit * 2,
                    select: MAINTENANCE_SELECT,
                }),
                this.prisma.specificationRequest.findMany({
                    where: supervisorSpecWhere,
                    orderBy: { createdAt: 'desc' },
                    take: limit * 2,
                    select: SPECIFICATION_SELECT,
                }),
            ]);
            total = mCount + sCount;
            const combined = [
                ...mData.map((it) => ({
                    ...this.formatMaintenanceRequest(it),
                    taskRole: 'SUPERVISOR',
                    taskActionRequired: 'Supervisor Approval',
                })),
                ...sData.map((it) => ({
                    ...this.formatSpecificationRequest(it),
                    taskRole: 'SUPERVISOR',
                    taskActionRequired: 'Supervisor Approval',
                })),
            ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            items = combined.slice(skip, skip + limit);
        }
        else if (activeRoleView === 'ICT_DIRECTOR') {
            const [mCount, sCount, mData, sData] = await Promise.all([
                this.prisma.maintenanceRequest.count({ where: ictMaintWhere }),
                this.prisma.specificationRequest.count({ where: ictSpecWhere }),
                this.prisma.maintenanceRequest.findMany({
                    where: ictMaintWhere,
                    orderBy: { createdAt: 'desc' },
                    take: limit * 2,
                    select: MAINTENANCE_SELECT,
                }),
                this.prisma.specificationRequest.findMany({
                    where: ictSpecWhere,
                    orderBy: { createdAt: 'desc' },
                    take: limit * 2,
                    select: SPECIFICATION_SELECT,
                }),
            ]);
            total = mCount + sCount;
            const combined = [
                ...mData.map((it) => {
                    const hadApproval = (it._count?.approvalRequests ?? 0) > 0;
                    return {
                        ...this.formatMaintenanceRequest(it),
                        taskRole: 'ICT_DIRECTOR',
                        taskActionRequired: it.status === client_1.RequestStatus.PENDING
                            ? 'Review & Approve / Assign'
                            : 'Manage Execution',
                        supervisorApproved: hadApproval,
                    };
                }),
                ...sData.map((it) => ({
                    ...this.formatSpecificationRequest(it),
                    taskRole: 'ICT_DIRECTOR',
                    taskActionRequired: 'Procurement Review',
                })),
            ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            items = combined.slice(skip, skip + limit);
        }
        else if (activeRoleView === 'TECHNICIAN') {
            const [mCount, mData] = await Promise.all([
                this.prisma.maintenanceRequest.count({ where: technicianMaintWhere }),
                this.prisma.maintenanceRequest.findMany({
                    where: technicianMaintWhere,
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit,
                    select: MAINTENANCE_SELECT,
                }),
            ]);
            total = mCount;
            items = mData.map((it) => {
                const myItems = (it.items || []).filter((item) => (item.technicians || []).some((t) => t.technicianId === userId));
                const myAssignment = myItems.flatMap((item) => (item.technicians || []).filter((t) => t.technicianId === userId))[0];
                return {
                    ...this.formatMaintenanceRequest(it),
                    taskRole: 'TECHNICIAN',
                    taskActionRequired: it.status === client_1.RequestStatus.IN_PROGRESS
                        ? 'In Progress (Log Work)'
                        : 'Work Required',
                    myAssignedItems: myItems.map((item) => ({
                        itemId: item.itemId,
                        itemName: item.item?.name,
                        issueType: item.issueType?.name,
                        priority: item.priority,
                    })),
                    myAssignmentRole: myAssignment?.roleInAssignment || 'ASSISTANT',
                    myAssignmentStatus: myAssignment?.status || 'ASSIGNED',
                    isLead: myAssignment?.isLead ?? false,
                };
            });
        }
        return {
            data: items,
            counts: {
                supervisorCount,
                ictCount,
                technicianCount,
                totalActiveCount: supervisorCount + ictCount + technicianCount,
            },
            activeRoleView,
            userRoles: {
                isSupervisor,
                isIctDirector,
                isTechnician,
            },
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit) || 1,
            },
        };
    }
    async findOne(id) {
        const maint = await this.prisma.maintenanceRequest.findFirst({
            where: { id, deletedAt: null },
            select: {
                ...MAINTENANCE_SELECT,
                statusHistory: {
                    select: {
                        id: true,
                        fromStatus: true,
                        toStatus: true,
                        reason: true,
                        createdAt: true,
                        changedBy: { select: { id: true, fullName: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                },
                updates: {
                    select: {
                        id: true,
                        updateType: true,
                        updateText: true,
                        createdAt: true,
                        user: { select: { id: true, fullName: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                },
                workLogs: {
                    select: {
                        id: true,
                        workDone: true,
                        completionNotes: true,
                        timeSpentMinutes: true,
                        logDate: true,
                        status: true,
                        rejectionReason: true,
                        technician: { select: { id: true, fullName: true } },
                    },
                    orderBy: { logDate: 'desc' },
                },
                approvalRequests: {
                    select: {
                        id: true,
                        status: true,
                        notes: true,
                        forwardedAt: true,
                        reviewedAt: true,
                        technician: { select: { id: true, fullName: true, email: true } },
                        reviewer: { select: { id: true, fullName: true, email: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (maint) {
            return this.formatMaintenanceRequest(maint);
        }
        const spec = await this.prisma.specificationRequest.findFirst({
            where: { id, deletedAt: null },
            select: SPECIFICATION_SELECT,
        });
        if (spec) {
            return this.formatSpecificationRequest(spec);
        }
        throw new common_1.NotFoundException(`Request ${id} not found`);
    }
    async findByTicketNumber(ticketNumber) {
        const maint = await this.prisma.maintenanceRequest.findFirst({
            where: { ticketNumber, deletedAt: null },
            select: MAINTENANCE_SELECT,
        });
        if (maint) {
            return this.formatMaintenanceRequest(maint);
        }
        const spec = await this.prisma.specificationRequest.findFirst({
            where: { ticketNumber, deletedAt: null },
            select: SPECIFICATION_SELECT,
        });
        if (spec) {
            return this.formatSpecificationRequest(spec);
        }
        throw new common_1.NotFoundException(`Request ${ticketNumber} not found`);
    }
    async update(id, dto) {
        const maint = await this.prisma.maintenanceRequest.findFirst({
            where: { id, deletedAt: null },
            select: { id: true },
        });
        if (maint) {
            const { items, maintenanceItems, ...rest } = dto;
            const updateData = {};
            if (rest.title !== undefined)
                updateData.title = rest.title;
            if (rest.description !== undefined)
                updateData.description = rest.description;
            if (rest.priority !== undefined)
                updateData.priority = rest.priority;
            await this.prisma.$transaction(async (tx) => {
                await tx.maintenanceRequest.update({
                    where: { id },
                    data: updateData,
                });
                const newItems = items ?? maintenanceItems;
                if (newItems) {
                    await tx.maintenanceRequestItem.deleteMany({
                        where: { maintenanceRequestId: id },
                    });
                    if (newItems.length) {
                        await tx.maintenanceRequestItem.createMany({
                            data: newItems.map((item) => ({
                                maintenanceRequestId: id,
                                itemId: item.itemId,
                                issueCategoryId: item.issueCategoryId ?? null,
                                issueTypeId: item.issueTypeId,
                                priority: item.priority ?? rest.priority ?? client_1.RequestPriority.MEDIUM,
                                description: item.description ?? null,
                            })),
                        });
                    }
                }
            });
            return this.findOne(id);
        }
        const spec = await this.prisma.specificationRequest.findFirst({
            where: { id, deletedAt: null },
            select: { id: true },
        });
        if (spec) {
            const { specificationItems, ...rest } = dto;
            const updateData = {};
            if (rest.title !== undefined)
                updateData.title = rest.title;
            if (rest.description !== undefined)
                updateData.description = rest.description;
            if (rest.priority !== undefined)
                updateData.priority = rest.priority;
            await this.prisma.$transaction(async (tx) => {
                await tx.specificationRequest.update({
                    where: { id },
                    data: updateData,
                });
                if (specificationItems) {
                    await tx.specificationItem.deleteMany({
                        where: { specificationRequestId: id },
                    });
                    if (specificationItems.length) {
                        await tx.specificationItem.createMany({
                            data: specificationItems.map((specItem) => ({
                                specificationRequestId: id,
                                categoryId: specItem.categoryId ?? specItem.itemCategoryId ?? null,
                                requestedItemName: specItem.requestedItemName ?? specItem.itemName ?? 'Requested Item',
                                quantity: specItem.quantity ?? 1,
                                unitOfMeasure: specItem.unitOfMeasure ?? null,
                                priority: specItem.priority ?? rest.priority ?? client_1.RequestPriority.MEDIUM,
                                description: specItem.description ?? null,
                            })),
                        });
                    }
                }
            });
            return this.findOne(id);
        }
        throw new common_1.NotFoundException(`Request ${id} not found`);
    }
    async changeStatus(id, dto, changedById) {
        const maint = await this.prisma.maintenanceRequest.findFirst({
            where: { id, deletedAt: null },
            select: { id: true, status: true, requesterId: true, ticketNumber: true },
        });
        if (maint) {
            await this.prisma.$transaction(async (tx) => {
                await tx.maintenanceRequest.update({
                    where: { id },
                    data: {
                        status: dto.status,
                        rejectionReason: dto.status === client_1.RequestStatus.REJECTED ? dto.reason : undefined,
                    },
                });
                await tx.requestStatusHistory.create({
                    data: {
                        maintenanceRequestId: id,
                        fromStatus: maint.status,
                        toStatus: dto.status,
                        changedById: changedById ?? null,
                        reason: dto.reason,
                    },
                });
            });
            if (maint.requesterId && maint.requesterId !== changedById) {
                await this.notifications
                    .create({
                    userId: maint.requesterId,
                    type: 'REQUEST_STATUS_CHANGED',
                    payload: {
                        requestId: id,
                        ticketNumber: maint.ticketNumber,
                        fromStatus: maint.status,
                        toStatus: dto.status,
                        reason: dto.reason ?? null,
                    },
                })
                    .catch((error) => this.logger.warn(`Notification failed: ${error}`));
            }
            return this.findOne(id);
        }
        const spec = await this.prisma.specificationRequest.findFirst({
            where: { id, deletedAt: null },
            select: { id: true, status: true, requesterId: true, ticketNumber: true },
        });
        if (spec) {
            if (dto.status === client_1.RequestStatus.REJECTED && !dto.reason?.trim()) {
                throw new common_1.BadRequestException('A reason is required to reject a request');
            }
            await this.prisma.specificationRequest.update({
                where: { id },
                data: {
                    status: dto.status,
                    rejectionReason: dto.status === client_1.RequestStatus.REJECTED ? dto.reason?.trim() : null,
                },
            });
            if (spec.requesterId && spec.requesterId !== changedById) {
                await this.notifications
                    .create({
                    userId: spec.requesterId,
                    type: 'REQUEST_STATUS_CHANGED',
                    payload: {
                        requestId: id,
                        ticketNumber: spec.ticketNumber,
                        fromStatus: spec.status,
                        toStatus: dto.status,
                        reason: dto.reason ?? null,
                    },
                })
                    .catch((error) => this.logger.warn(`Notification failed: ${error}`));
            }
            return this.findOne(id);
        }
        throw new common_1.NotFoundException(`Request ${id} not found`);
    }
    async resolveApprovingSupervisorId(requesterId) {
        const requester = await this.prisma.user.findUnique({
            where: { id: requesterId },
            select: { id: true, organizationUnitId: true },
        });
        if (!requester?.organizationUnitId) {
            return null;
        }
        const currentUnit = await this.prisma.organizationUnit.findUnique({
            where: { id: requester.organizationUnitId },
            select: { id: true, supervisorId: true, parentId: true },
        });
        if (!currentUnit) {
            return null;
        }
        let checkUnitId = null;
        if (currentUnit.supervisorId === requesterId) {
            checkUnitId = currentUnit.parentId;
        }
        else if (currentUnit.supervisorId) {
            return currentUnit.supervisorId;
        }
        else {
            checkUnitId = currentUnit.parentId;
        }
        while (checkUnitId) {
            const ancestor = await this.prisma.organizationUnit.findUnique({
                where: { id: checkUnitId },
                select: { id: true, supervisorId: true, parentId: true },
            });
            if (ancestor?.supervisorId && ancestor.supervisorId !== requesterId) {
                return ancestor.supervisorId;
            }
            checkUnitId = ancestor?.parentId ?? null;
        }
        return null;
    }
    async checkCanApproveOrReject(currentStatus, requesterId, userId) {
        if (!userId) {
            throw new common_1.ForbiddenException('User authentication required');
        }
        if (requesterId && requesterId === userId) {
            throw new common_1.ForbiddenException('You cannot approve or reject your own request under any circumstance. Your request must be reviewed by the supervisor above you.');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                roleAssignments: {
                    include: {
                        role: {
                            include: {
                                permissions: {
                                    include: { permission: true },
                                },
                            },
                        },
                    },
                },
                permissionGrants: {
                    include: { permission: true },
                },
            },
        });
        if (!user) {
            throw new common_1.ForbiddenException('User not found');
        }
        const allPermissions = new Set();
        user.roleAssignments.forEach((ra) => {
            ra.role.permissions.forEach((p) => allPermissions.add(p.permission.name));
        });
        user.permissionGrants.forEach((pg) => allPermissions.add(pg.permission.name));
        if (allPermissions.has('*')) {
            return;
        }
        if (currentStatus === client_1.RequestStatus.WAITING_APPROVAL) {
            if (allPermissions.has('approvals:review')) {
                return;
            }
            if (requesterId) {
                const approvingSupervisorId = await this.resolveApprovingSupervisorId(requesterId);
                if (approvingSupervisorId === userId) {
                    return;
                }
            }
            throw new common_1.ForbiddenException('You are not authorized to review this request. Only the assigned organization unit supervisor in the hierarchy or an authorized reviewer can review it.');
        }
        else {
            if (allPermissions.has('tasks:ict-director') ||
                allPermissions.has('approvals:review') ||
                allPermissions.has('requests:update-status')) {
                return;
            }
            throw new common_1.ForbiddenException('Only users with ICT Director permissions (tasks:ict-director) or status update permissions can approve/reject requests at this stage.');
        }
    }
    async approve(id, notes, changedById) {
        const maint = await this.prisma.maintenanceRequest.findFirst({
            where: { id, deletedAt: null },
            select: {
                id: true,
                status: true,
                requesterId: true,
                ticketNumber: true,
            },
        });
        if (maint) {
            await this.checkCanApproveOrReject(maint.status, maint.requesterId, changedById);
            if (maint.status === client_1.RequestStatus.WAITING_APPROVAL) {
                const fileCount = await this.prisma.maintenanceRequestFile.count({
                    where: { maintenanceRequestId: id },
                });
                if (fileCount === 0) {
                    throw new common_1.BadRequestException('Supervisor approval requires at least one attached procurement document instructing the ICT Director what to purchase');
                }
                await this.prisma.approvalRequest.updateMany({
                    where: {
                        maintenanceRequestId: id,
                        status: client_1.ApprovalStatus.PENDING,
                    },
                    data: {
                        status: client_1.ApprovalStatus.APPROVED,
                        reviewedById: changedById ?? null,
                        reviewedAt: new Date(),
                        notes: notes ?? 'Approved by supervisor with procurement attachment',
                    },
                });
                const res = await this.changeStatus(id, {
                    status: client_1.RequestStatus.PENDING,
                    reason: notes
                        ? `Approved by Organization Supervisor with procurement document: ${notes}`
                        : 'Approved by Organization Supervisor with procurement document for ICT Director review',
                }, changedById);
                if (maint.requesterId) {
                    await this.notifications.notifyUser(maint.requesterId, 'REQUEST_APPROVED', {
                        requestId: id,
                        ticketNumber: maint.ticketNumber,
                        message: `Your maintenance request ${maint.ticketNumber} was approved by supervisor and forwarded for technician assignment.`,
                        notes: notes ?? null,
                    });
                }
                await this.notifications.notifyUsersWithPermissions(['tasks:ict-director', 'requests:assign-technicians'], 'REQUEST_PENDING_ASSIGNMENT', {
                    requestId: id,
                    ticketNumber: maint.ticketNumber,
                    message: `Maintenance request ${maint.ticketNumber} was approved by supervisor and is ready for technician assignment.`,
                    notes: notes ?? null,
                }, changedById ? [changedById] : []);
                return res;
            }
            const res = await this.changeStatus(id, {
                status: client_1.RequestStatus.APPROVED,
                reason: notes ?? 'Approved by ICT Director for maintenance servicing',
            }, changedById);
            if (maint.requesterId) {
                await this.notifications.notifyUser(maint.requesterId, 'REQUEST_APPROVED', {
                    requestId: id,
                    ticketNumber: maint.ticketNumber,
                    message: `Your maintenance request ${maint.ticketNumber} has been approved for maintenance servicing.`,
                    notes: notes ?? null,
                });
            }
            return res;
        }
        const spec = await this.prisma.specificationRequest.findFirst({
            where: { id, deletedAt: null },
            select: { id: true, status: true },
        });
        if (spec) {
            return this.changeStatus(id, {
                status: client_1.RequestStatus.APPROVED,
                reason: notes,
            }, changedById);
        }
        throw new common_1.NotFoundException(`Request ${id} not found`);
    }
    async reject(id, reason, changedById) {
        if (!reason?.trim()) {
            throw new common_1.BadRequestException('A reason is required to reject a request');
        }
        const maint = await this.prisma.maintenanceRequest.findFirst({
            where: { id, deletedAt: null },
            select: { id: true, status: true, requesterId: true, ticketNumber: true },
        });
        if (maint) {
            await this.checkCanApproveOrReject(maint.status, maint.requesterId, changedById);
            if (maint.status === client_1.RequestStatus.WAITING_APPROVAL) {
                await this.prisma.approvalRequest.updateMany({
                    where: {
                        maintenanceRequestId: id,
                        status: client_1.ApprovalStatus.PENDING,
                    },
                    data: {
                        status: client_1.ApprovalStatus.REJECTED,
                        reviewedById: changedById ?? null,
                        reviewedAt: new Date(),
                        notes: reason.trim(),
                    },
                });
                const res = await this.changeStatus(id, {
                    status: client_1.RequestStatus.REJECTED,
                    reason: `Rejected by Organization Supervisor: ${reason.trim()}`,
                }, changedById);
                if (maint.requesterId) {
                    await this.notifications.notifyUser(maint.requesterId, 'REQUEST_REJECTED', {
                        requestId: id,
                        ticketNumber: maint.ticketNumber,
                        reason: reason.trim(),
                        message: `Your maintenance request ${maint.ticketNumber} was rejected by supervisor: "${reason.trim()}".`,
                    });
                }
                return res;
            }
            const res = await this.changeStatus(id, {
                status: client_1.RequestStatus.REJECTED,
                reason: reason.trim(),
            }, changedById);
            if (maint.requesterId) {
                await this.notifications.notifyUser(maint.requesterId, 'REQUEST_REJECTED', {
                    requestId: id,
                    ticketNumber: maint.ticketNumber,
                    reason: reason.trim(),
                    message: `Maintenance request ${maint.ticketNumber} was rejected: "${reason.trim()}".`,
                });
            }
            return res;
        }
        throw new common_1.NotFoundException(`Request ${id} not found`);
    }
    async confirmCompletion(id, notes, userId) {
        if (!userId) {
            throw new common_1.ForbiddenException('User authentication required');
        }
        const maint = await this.prisma.maintenanceRequest.findFirst({
            where: { id, deletedAt: null },
            include: {
                items: {
                    include: {
                        technicians: true,
                    },
                },
            },
        });
        if (!maint) {
            throw new common_1.NotFoundException(`Maintenance request ${id} not found`);
        }
        const isOwner = maint.requesterId === userId;
        if (!isOwner) {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    roleAssignments: {
                        include: {
                            role: {
                                include: {
                                    permissions: { include: { permission: true } },
                                },
                            },
                        },
                    },
                    permissionGrants: { include: { permission: true } },
                },
            });
            const allPermissions = new Set();
            user?.roleAssignments.forEach((ra) => {
                ra.role.permissions.forEach((p) => allPermissions.add(p.permission.name));
            });
            user?.permissionGrants.forEach((pg) => allPermissions.add(pg.permission.name));
            if (!allPermissions.has('*') && !allPermissions.has('requests:update-status')) {
                throw new common_1.ForbiddenException('Only the request owner (requester) can verify and confirm completion of this work.');
            }
        }
        const confirmationReason = notes?.trim()
            ? `Confirmed by requester: ${notes.trim()}`
            : 'Requester inspected the equipment and confirmed maintenance completed satisfactorily';
        await this.prisma.$transaction(async (tx) => {
            await tx.maintenanceRequest.update({
                where: { id },
                data: {
                    status: client_1.RequestStatus.COMPLETED,
                    rejectionReason: null,
                },
            });
            const assignmentIds = maint.items.flatMap((i) => i.technicians.map((t) => t.id));
            if (assignmentIds.length > 0) {
                await tx.itemTechnician.updateMany({
                    where: {
                        id: { in: assignmentIds },
                        status: { not: client_1.TechnicianAssignmentStatus.COMPLETED },
                    },
                    data: {
                        status: client_1.TechnicianAssignmentStatus.COMPLETED,
                        completedAt: new Date(),
                    },
                });
            }
            await tx.requestStatusHistory.create({
                data: {
                    maintenanceRequestId: id,
                    fromStatus: maint.status,
                    toStatus: client_1.RequestStatus.COMPLETED,
                    changedById: userId,
                    reason: confirmationReason,
                },
            });
            await tx.requestUpdate.create({
                data: {
                    maintenanceRequestId: id,
                    userId,
                    updateType: 'STATUS_CHANGE',
                    updateText: confirmationReason,
                },
            });
        });
        const technicianIds = Array.from(new Set(maint.items.flatMap((i) => i.technicians.map((t) => t.technicianId).filter(Boolean))));
        for (const techId of technicianIds) {
            if (techId !== userId) {
                await this.notifications
                    .create({
                    userId: techId,
                    type: 'REQUEST_CONFIRMED',
                    payload: {
                        requestId: id,
                        ticketNumber: maint.ticketNumber,
                        message: `Requester has confirmed and accepted completion of maintenance request ${maint.ticketNumber}.`,
                        notes: notes?.trim() ?? null,
                    },
                })
                    .catch((error) => this.logger.warn(`Notification failed: ${error}`));
            }
        }
        await this.notifications.notifyUsersWithPermissions(['tasks:ict-director', 'requests:assign-technicians'], 'REQUEST_CONFIRMED', {
            requestId: id,
            ticketNumber: maint.ticketNumber,
            message: `Requester confirmed completion of maintenance request ${maint.ticketNumber}. Ticket is now successfully closed.`,
            notes: notes?.trim() ?? null,
        }, [userId, ...technicianIds]);
        return this.findOne(id);
    }
    async rejectWork(id, reason, userId) {
        if (!userId) {
            throw new common_1.ForbiddenException('User authentication required');
        }
        if (!reason || !reason.trim()) {
            throw new common_1.BadRequestException('Please provide a reason explaining what is not working properly and why rework is required.');
        }
        const maint = await this.prisma.maintenanceRequest.findFirst({
            where: { id, deletedAt: null },
            include: {
                items: {
                    include: {
                        technicians: true,
                    },
                },
            },
        });
        if (!maint) {
            throw new common_1.NotFoundException(`Maintenance request ${id} not found`);
        }
        const isOwner = maint.requesterId === userId;
        if (!isOwner) {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    roleAssignments: {
                        include: {
                            role: {
                                include: {
                                    permissions: { include: { permission: true } },
                                },
                            },
                        },
                    },
                    permissionGrants: { include: { permission: true } },
                },
            });
            const allPermissions = new Set();
            user?.roleAssignments.forEach((ra) => {
                ra.role.permissions.forEach((p) => allPermissions.add(p.permission.name));
            });
            user?.permissionGrants.forEach((pg) => allPermissions.add(pg.permission.name));
            if (!allPermissions.has('*') && !allPermissions.has('requests:update-status')) {
                throw new common_1.ForbiddenException('Only the request owner (requester) can reject technician work.');
            }
        }
        const rejectionReason = reason.trim();
        const historyReason = `Requester rejected technician work (Needs Rework): ${rejectionReason}`;
        await this.prisma.$transaction(async (tx) => {
            await tx.maintenanceRequest.update({
                where: { id },
                data: {
                    status: client_1.RequestStatus.IN_PROGRESS,
                    rejectionReason: rejectionReason,
                },
            });
            const assignmentIds = maint.items.flatMap((i) => i.technicians.map((t) => t.id));
            if (assignmentIds.length > 0) {
                await tx.itemTechnician.updateMany({
                    where: {
                        id: { in: assignmentIds },
                    },
                    data: {
                        status: client_1.TechnicianAssignmentStatus.IN_PROGRESS,
                        completedAt: null,
                    },
                });
            }
            await tx.requestStatusHistory.create({
                data: {
                    maintenanceRequestId: id,
                    fromStatus: maint.status,
                    toStatus: client_1.RequestStatus.IN_PROGRESS,
                    changedById: userId,
                    reason: historyReason,
                },
            });
            await tx.requestUpdate.create({
                data: {
                    maintenanceRequestId: id,
                    userId,
                    updateType: 'STATUS_CHANGE',
                    updateText: `Requester inspected the equipment and reported it is not fixed properly. Feedback: "${rejectionReason}". Technicians must rework the task.`,
                },
            });
        });
        const technicianIds = Array.from(new Set(maint.items.flatMap((i) => i.technicians.map((t) => t.technicianId).filter(Boolean))));
        for (const techId of technicianIds) {
            if (techId !== userId) {
                await this.notifications
                    .create({
                    userId: techId,
                    type: 'WORK_REJECTED',
                    payload: {
                        requestId: id,
                        ticketNumber: maint.ticketNumber,
                        reason: rejectionReason,
                        message: `The requester reported that maintenance request ${maint.ticketNumber} is not fixed properly and requires rework: "${rejectionReason}".`,
                    },
                })
                    .catch((error) => this.logger.warn(`Notification failed: ${error}`));
            }
        }
        await this.notifications.notifyUsersWithPermissions(['tasks:ict-director', 'requests:assign-technicians'], 'WORK_REJECTED', {
            requestId: id,
            ticketNumber: maint.ticketNumber,
            reason: rejectionReason,
            message: `Requester reported equipment on ticket ${maint.ticketNumber} still faulty and requested rework: "${rejectionReason}".`,
        }, [userId, ...technicianIds]);
        return this.findOne(id);
    }
    async addUpdate(id, dto) {
        const maint = await this.prisma.maintenanceRequest.findFirst({
            where: { id, deletedAt: null },
            select: { id: true },
        });
        if (!maint) {
            throw new common_1.NotFoundException(`Maintenance request ${id} not found`);
        }
        return this.prisma.requestUpdate.create({
            data: {
                maintenanceRequestId: id,
                userId: dto.userId,
                updateType: dto.updateType,
                updateText: dto.updateText,
            },
            select: {
                id: true,
                updateType: true,
                updateText: true,
                createdAt: true,
                user: { select: { id: true, fullName: true } },
            },
        });
    }
    async statusHistory(id) {
        const maint = await this.prisma.maintenanceRequest.findFirst({
            where: { id, deletedAt: null },
            select: { id: true },
        });
        if (maint) {
            return this.prisma.requestStatusHistory.findMany({
                where: { maintenanceRequestId: id },
                select: {
                    id: true,
                    fromStatus: true,
                    toStatus: true,
                    reason: true,
                    createdAt: true,
                    changedBy: { select: { id: true, fullName: true } },
                },
                orderBy: { createdAt: 'desc' },
            });
        }
        return [];
    }
    async stats(query) {
        const maintWhere = {
            deletedAt: null,
            ...(query.organizationUnitId
                ? { requester: { organizationUnitId: query.organizationUnitId } }
                : {}),
        };
        const specWhere = {
            deletedAt: null,
            ...(query.organizationUnitId
                ? { requester: { organizationUnitId: query.organizationUnitId } }
                : {}),
        };
        const [maintByStatus, maintByPriority, maintTotal, specByStatus, specByPriority, specTotal,] = await this.prisma.$transaction([
            this.prisma.maintenanceRequest.groupBy({
                by: ['status'],
                where: maintWhere,
                _count: { _all: true },
                orderBy: { status: 'asc' },
            }),
            this.prisma.maintenanceRequest.groupBy({
                by: ['priority'],
                where: maintWhere,
                _count: { _all: true },
                orderBy: { priority: 'asc' },
            }),
            this.prisma.maintenanceRequest.count({ where: maintWhere }),
            this.prisma.specificationRequest.groupBy({
                by: ['status'],
                where: specWhere,
                _count: { _all: true },
                orderBy: { status: 'asc' },
            }),
            this.prisma.specificationRequest.groupBy({
                by: ['priority'],
                where: specWhere,
                _count: { _all: true },
                orderBy: { priority: 'asc' },
            }),
            this.prisma.specificationRequest.count({ where: specWhere }),
        ]);
        const getCount = (c) => {
            if (typeof c === 'number')
                return c;
            if (c && typeof c._all === 'number')
                return c._all;
            return 0;
        };
        const statusCounts = new Map();
        for (const row of maintByStatus) {
            statusCounts.set(row.status, (statusCounts.get(row.status) ?? 0) + getCount(row._count));
        }
        for (const row of specByStatus) {
            statusCounts.set(row.status, (statusCounts.get(row.status) ?? 0) + getCount(row._count));
        }
        const priorityCounts = new Map();
        for (const row of maintByPriority) {
            priorityCounts.set(row.priority, (priorityCounts.get(row.priority) ?? 0) + getCount(row._count));
        }
        for (const row of specByPriority) {
            priorityCounts.set(row.priority, (priorityCounts.get(row.priority) ?? 0) + getCount(row._count));
        }
        return {
            total: maintTotal + specTotal,
            byStatus: Array.from(statusCounts.entries()).map(([status, count]) => ({
                status,
                count,
            })),
            byPriority: Array.from(priorityCounts.entries()).map(([priority, count]) => ({
                priority,
                count,
            })),
        };
    }
    async addFiles(requestId, userId, files) {
        if (!files.length) {
            throw new common_1.BadRequestException('No files were uploaded');
        }
        const maint = await this.prisma.maintenanceRequest.findFirst({
            where: { id: requestId, deletedAt: null },
            select: { id: true },
        });
        if (maint) {
            const data = files.map((file) => ({
                maintenanceRequestId: requestId,
                uploadedById: userId,
                fileName: file.filename,
                originalName: file.originalname,
                mimeType: file.mimetype,
                storageKey: `requests/${file.filename}`,
                fileType: 'ATTACHMENT',
                sizeBytes: BigInt(file.size),
            }));
            await this.prisma.maintenanceRequestFile.createMany({ data });
            const created = await this.prisma.maintenanceRequestFile.findMany({
                where: {
                    maintenanceRequestId: requestId,
                    fileName: { in: files.map((f) => f.filename) },
                },
                select: {
                    id: true,
                    fileName: true,
                    originalName: true,
                    mimeType: true,
                    fileType: true,
                    sizeBytes: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'asc' },
            });
            return created.map((f) => ({
                ...f,
                sizeBytes: Number(f.sizeBytes),
                downloadUrl: `/api/requests/${requestId}/files/${f.id}/download`,
                previewUrl: `/api/requests/${requestId}/files/${f.id}/download`,
            }));
        }
        const spec = await this.prisma.specificationRequest.findFirst({
            where: { id: requestId, deletedAt: null },
            select: { id: true },
        });
        if (spec) {
            const data = files.map((file) => ({
                specificationRequestId: requestId,
                uploadedById: userId,
                fileName: file.filename,
                originalName: file.originalname,
                mimeType: file.mimetype,
                storageKey: `spec-requests/${file.filename}`,
                fileType: 'ATTACHMENT',
                sizeBytes: BigInt(file.size),
            }));
            await this.prisma.specificationRequestFile.createMany({ data });
            const created = await this.prisma.specificationRequestFile.findMany({
                where: {
                    specificationRequestId: requestId,
                    fileName: { in: files.map((f) => f.filename) },
                },
                select: {
                    id: true,
                    fileName: true,
                    originalName: true,
                    mimeType: true,
                    fileType: true,
                    sizeBytes: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'asc' },
            });
            return created.map((f) => ({
                ...f,
                sizeBytes: Number(f.sizeBytes),
                downloadUrl: `/api/requests/${requestId}/files/${f.id}/download`,
                previewUrl: `/api/requests/${requestId}/files/${f.id}/download`,
            }));
        }
        throw new common_1.NotFoundException(`Request ${requestId} not found`);
    }
    async getFile(requestId, fileId) {
        const file = await this.prisma.maintenanceRequestFile.findFirst({
            where: { id: fileId, maintenanceRequestId: requestId },
        });
        if (file)
            return file;
        const specFile = await this.prisma.specificationRequestFile.findFirst({
            where: { id: fileId, specificationRequestId: requestId },
        });
        if (specFile)
            return specFile;
        const specItemFile = await this.prisma.specificationItemFile.findFirst({
            where: {
                id: fileId,
                OR: [
                    { specificationItemId: requestId },
                    { specificationItem: { specificationRequestId: requestId } },
                ],
            },
        });
        if (specItemFile)
            return specItemFile;
        const fallback = (await this.prisma.specificationRequestFile.findUnique({ where: { id: fileId } })) ||
            (await this.prisma.maintenanceRequestFile.findUnique({ where: { id: fileId } })) ||
            (await this.prisma.specificationItemFile.findUnique({ where: { id: fileId } }));
        if (fallback)
            return fallback;
        throw new common_1.NotFoundException(`File ${fileId} not found`);
    }
    async removeFile(requestId, fileId) {
        await this.prisma.maintenanceRequestFile.deleteMany({
            where: { id: fileId, maintenanceRequestId: requestId },
        });
        await this.prisma.specificationRequestFile.deleteMany({
            where: { id: fileId, specificationRequestId: requestId },
        });
    }
    async remove(id) {
        const maint = await this.prisma.maintenanceRequest.findFirst({
            where: { id, deletedAt: null },
            select: { id: true },
        });
        if (maint) {
            await this.prisma.maintenanceRequest.update({
                where: { id },
                data: { deletedAt: new Date() },
            });
            return { success: true };
        }
        const spec = await this.prisma.specificationRequest.findFirst({
            where: { id, deletedAt: null },
            select: { id: true },
        });
        if (spec) {
            await this.prisma.specificationRequest.update({
                where: { id },
                data: { deletedAt: new Date() },
            });
            return { success: true };
        }
        throw new common_1.NotFoundException(`Request ${id} not found`);
    }
    async restore(id) {
        const maint = await this.prisma.maintenanceRequest.findFirst({
            where: { id },
            select: { id: true },
        });
        if (maint) {
            await this.prisma.maintenanceRequest.update({
                where: { id },
                data: { deletedAt: null },
            });
            return this.findOne(id);
        }
        const spec = await this.prisma.specificationRequest.findFirst({
            where: { id },
            select: { id: true },
        });
        if (spec) {
            await this.prisma.specificationRequest.update({
                where: { id },
                data: { deletedAt: null },
            });
            return this.findOne(id);
        }
        throw new common_1.NotFoundException(`Request ${id} not found`);
    }
};
exports.RequestsService = RequestsService;
exports.RequestsService = RequestsService = RequestsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], RequestsService);
//# sourceMappingURL=requests.service.js.map