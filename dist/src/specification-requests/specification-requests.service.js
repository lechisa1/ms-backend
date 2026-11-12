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
var SpecificationRequestsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpecificationRequestsService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const paginated_result_dto_1 = require("../common/dto/paginated-result.dto");
const notifications_service_1 = require("../notifications/notifications.service");
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
let SpecificationRequestsService = SpecificationRequestsService_1 = class SpecificationRequestsService {
    prisma;
    notifications;
    logger = new common_1.Logger(SpecificationRequestsService_1.name);
    constructor(prisma, notifications) {
        this.prisma = prisma;
        this.notifications = notifications;
    }
    generateTicketNumber() {
        const now = new Date();
        const datePart = [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, '0'),
            String(now.getDate()).padStart(2, '0'),
        ].join('');
        const random = (0, crypto_1.randomBytes)(3).toString('hex').toUpperCase();
        return `SPEC-${datePart}-${random}`;
    }
    formatSpecificationRequest(raw) {
        if (!raw)
            return null;
        return {
            id: raw.id,
            ticketNumber: raw.ticketNumber,
            requestType: 'SPECIFICATION',
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
                downloadUrl: `/api/specification-requests/${raw.id}/files/${f.id}/download`,
                previewUrl: `/api/specification-requests/${raw.id}/files/${f.id}/download`,
            })) ?? [],
            statusHistory: [],
            updates: [],
            workLogs: [],
            approvalRequests: [],
            _count: { workLogs: 0, approvalRequests: 0, updates: 0 },
        };
    }
    async create(dto, currentUserId) {
        const requesterId = currentUserId ?? null;
        const ticketNumber = this.generateTicketNumber();
        const specItems = dto.items ?? dto.specificationItems ?? [];
        const request = await this.prisma.specificationRequest.create({
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
        return this.formatSpecificationRequest(request);
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
    async findOne(id) {
        const request = await this.prisma.specificationRequest.findFirst({
            where: { id, deletedAt: null },
            select: SPECIFICATION_SELECT,
        });
        if (!request) {
            throw new common_1.NotFoundException(`Specification request ${id} not found`);
        }
        return this.formatSpecificationRequest(request);
    }
    async findByTicketNumber(ticketNumber) {
        const request = await this.prisma.specificationRequest.findFirst({
            where: { ticketNumber, deletedAt: null },
            select: SPECIFICATION_SELECT,
        });
        if (!request) {
            throw new common_1.NotFoundException(`Specification request ${ticketNumber} not found`);
        }
        return this.formatSpecificationRequest(request);
    }
    async update(id, dto) {
        await this.findOne(id);
        const { items, specificationItems, ...rest } = dto;
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
            const newItems = items ?? specificationItems;
            if (newItems) {
                await tx.specificationItem.deleteMany({
                    where: { specificationRequestId: id },
                });
                if (newItems.length) {
                    await tx.specificationItem.createMany({
                        data: newItems.map((specItem) => ({
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
    async changeStatus(id, dto, changedById) {
        const current = await this.prisma.specificationRequest.findFirst({
            where: { id, deletedAt: null },
            select: { id: true, status: true, requesterId: true, ticketNumber: true },
        });
        if (!current) {
            throw new common_1.NotFoundException(`Specification request ${id} not found`);
        }
        if (dto.status === client_1.RequestStatus.REJECTED && !dto.reason?.trim()) {
            throw new common_1.BadRequestException('A rejection reason is required to reject a specification request');
        }
        await this.prisma.specificationRequest.update({
            where: { id },
            data: {
                status: dto.status,
                rejectionReason: dto.status === client_1.RequestStatus.REJECTED ? dto.reason?.trim() : null,
            },
        });
        if (current.requesterId && current.requesterId !== changedById) {
            await this.notifications
                .create({
                userId: current.requesterId,
                type: 'REQUEST_STATUS_CHANGED',
                payload: {
                    requestId: id,
                    ticketNumber: current.ticketNumber,
                    fromStatus: current.status,
                    toStatus: dto.status,
                    reason: dto.reason ?? null,
                },
            })
                .catch((error) => this.logger.warn(`Notification failed: ${error}`));
        }
        return this.findOne(id);
    }
    async approve(id, dto, changedById) {
        const spec = await this.prisma.specificationRequest.findFirst({
            where: { id, deletedAt: null },
            select: { id: true, requesterId: true },
        });
        if (spec && changedById && spec.requesterId === changedById) {
            throw new common_1.ForbiddenException('You cannot approve or reject your own request under any circumstance.');
        }
        return this.changeStatus(id, {
            status: client_1.RequestStatus.APPROVED,
            reason: dto?.notes,
        }, changedById);
    }
    async reject(id, dto, changedById) {
        if (!dto?.reason?.trim()) {
            throw new common_1.BadRequestException('A reason is required to reject a specification request');
        }
        const spec = await this.prisma.specificationRequest.findFirst({
            where: { id, deletedAt: null },
            select: { id: true, requesterId: true },
        });
        if (spec && changedById && spec.requesterId === changedById) {
            throw new common_1.ForbiddenException('You cannot approve or reject your own request under any circumstance.');
        }
        return this.changeStatus(id, {
            status: client_1.RequestStatus.REJECTED,
            reason: dto.reason.trim(),
        }, changedById);
    }
    async stats(query) {
        const where = {
            deletedAt: null,
            ...(query.organizationUnitId
                ? { requester: { organizationUnitId: query.organizationUnitId } }
                : {}),
        };
        const [byStatus, byPriority, total] = await this.prisma.$transaction([
            this.prisma.specificationRequest.groupBy({
                by: ['status'],
                where,
                _count: { _all: true },
                orderBy: { status: 'asc' },
            }),
            this.prisma.specificationRequest.groupBy({
                by: ['priority'],
                where,
                _count: { _all: true },
                orderBy: { priority: 'asc' },
            }),
            this.prisma.specificationRequest.count({ where }),
        ]);
        const getCount = (c) => {
            if (typeof c === 'number')
                return c;
            if (c && typeof c._all === 'number')
                return c._all;
            return 0;
        };
        return {
            total,
            byStatus: byStatus.map((row) => ({
                status: row.status,
                count: getCount(row._count),
            })),
            byPriority: byPriority.map((row) => ({
                priority: row.priority,
                count: getCount(row._count),
            })),
        };
    }
    async addFiles(requestId, userId, files) {
        await this.findOne(requestId);
        if (!files.length) {
            throw new common_1.BadRequestException('No files were uploaded');
        }
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
            downloadUrl: `/api/specification-requests/${requestId}/files/${f.id}/download`,
            previewUrl: `/api/specification-requests/${requestId}/files/${f.id}/download`,
        }));
    }
    async getFile(requestId, fileId) {
        const file = await this.prisma.specificationRequestFile.findFirst({
            where: { id: fileId, specificationRequestId: requestId },
        });
        if (file)
            return file;
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
            (await this.prisma.specificationItemFile.findUnique({ where: { id: fileId } })) ||
            (await this.prisma.maintenanceRequestFile.findUnique({ where: { id: fileId } }));
        if (fallback)
            return fallback;
        throw new common_1.NotFoundException(`File ${fileId} not found`);
    }
    async removeFile(requestId, fileId) {
        await this.findOne(requestId);
        return this.prisma.specificationRequestFile.deleteMany({
            where: { id: fileId, specificationRequestId: requestId },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.specificationRequest.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    async restore(id) {
        return this.prisma.specificationRequest.update({
            where: { id },
            data: { deletedAt: null },
        });
    }
};
exports.SpecificationRequestsService = SpecificationRequestsService;
exports.SpecificationRequestsService = SpecificationRequestsService = SpecificationRequestsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], SpecificationRequestsService);
//# sourceMappingURL=specification-requests.service.js.map