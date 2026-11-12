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
exports.SpecificationItemsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const SELECT = {
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
};
let SpecificationItemsService = class SpecificationItemsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByRequest(requestId) {
        const request = await this.prisma.specificationRequest.findFirst({
            where: { id: requestId, deletedAt: null },
            select: { id: true },
        });
        if (!request) {
            return [];
        }
        const items = await this.prisma.specificationItem.findMany({
            where: { specificationRequestId: requestId, deletedAt: null },
            select: SELECT,
            orderBy: { createdAt: 'asc' },
        });
        return items.map((it) => ({
            ...it,
            maintenanceRequestId: it.specificationRequestId,
        }));
    }
    async findOne(id) {
        const item = await this.prisma.specificationItem.findFirst({
            where: { id, deletedAt: null },
            select: SELECT,
        });
        if (!item) {
            throw new common_1.NotFoundException(`Specification item ${id} not found`);
        }
        return {
            ...item,
            maintenanceRequestId: item.specificationRequestId,
        };
    }
    async create(requestId, dto) {
        const request = await this.prisma.specificationRequest.findFirst({
            where: { id: requestId, deletedAt: null },
            select: { id: true, priority: true },
        });
        if (!request) {
            throw new common_1.NotFoundException(`Specification request ${requestId} not found`);
        }
        const item = await this.prisma.specificationItem.create({
            data: {
                specificationRequestId: requestId,
                requestedItemName: dto.requestedItemName,
                quantity: dto.quantity ?? 1,
                unitOfMeasure: dto.unitOfMeasure,
                priority: dto.priority ?? request.priority ?? client_1.RequestPriority.MEDIUM,
                categoryId: dto.categoryId,
                description: dto.description,
            },
            select: SELECT,
        });
        return {
            ...item,
            maintenanceRequestId: item.specificationRequestId,
        };
    }
    async update(id, dto) {
        await this.findOne(id);
        const item = await this.prisma.specificationItem.update({
            where: { id },
            data: dto,
            select: SELECT,
        });
        return {
            ...item,
            maintenanceRequestId: item.specificationRequestId,
        };
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.specificationItem.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    async addFiles(itemId, userId, files) {
        await this.findOne(itemId);
        if (!files.length) {
            throw new common_1.BadRequestException('No files were uploaded');
        }
        const data = files.map((file) => ({
            specificationItemId: itemId,
            uploadedById: userId,
            fileName: file.filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
            storageKey: `specifications/${file.filename}`,
            sizeBytes: BigInt(file.size),
        }));
        await this.prisma.specificationItemFile.createMany({ data });
        return this.prisma.specificationItemFile.findMany({
            where: {
                specificationItemId: itemId,
                fileName: { in: files.map((file) => file.filename) },
            },
            select: {
                id: true,
                fileName: true,
                originalName: true,
                mimeType: true,
                sizeBytes: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'asc' },
        });
    }
    async getFile(itemId, fileId) {
        const file = await this.prisma.specificationItemFile.findFirst({
            where: { id: fileId, specificationItemId: itemId },
        });
        if (file)
            return file;
        const fallback = (await this.prisma.specificationItemFile.findUnique({ where: { id: fileId } })) ||
            (await this.prisma.specificationRequestFile.findUnique({ where: { id: fileId } })) ||
            (await this.prisma.maintenanceRequestFile.findUnique({ where: { id: fileId } }));
        if (fallback)
            return fallback;
        throw new common_1.NotFoundException(`File ${fileId} not found`);
    }
    async removeFile(itemId, fileId) {
        await this.findOne(itemId);
        return this.prisma.specificationItemFile.deleteMany({
            where: { id: fileId, specificationItemId: itemId },
        });
    }
};
exports.SpecificationItemsService = SpecificationItemsService;
exports.SpecificationItemsService = SpecificationItemsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SpecificationItemsService);
//# sourceMappingURL=specification-items.service.js.map