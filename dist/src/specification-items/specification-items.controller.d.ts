import type { Response } from 'express';
import { SpecificationItemsService } from './specification-items.service';
import { CreateSpecificationItemDto, UpdateSpecificationItemDto } from './dto/specification-item.dto';
export declare class SpecificationItemsController {
    private readonly service;
    constructor(service: SpecificationItemsService);
    create(requestId: string, dto: CreateSpecificationItemDto): Promise<{
        maintenanceRequestId: string;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        category: {
            id: string;
            name: string;
        } | null;
        categoryId: string | null;
        unitOfMeasure: string | null;
        priority: import("@prisma/client").$Enums.RequestPriority;
        files: {
            id: string;
            createdAt: Date;
            fileName: string;
            originalName: string;
            mimeType: string;
            sizeBytes: bigint;
        }[];
        requestedItemName: string;
        quantity: number;
        specificationRequestId: string;
    }>;
    findByRequest(requestId: string): Promise<{
        maintenanceRequestId: string;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        category: {
            id: string;
            name: string;
        } | null;
        categoryId: string | null;
        unitOfMeasure: string | null;
        priority: import("@prisma/client").$Enums.RequestPriority;
        files: {
            id: string;
            createdAt: Date;
            fileName: string;
            originalName: string;
            mimeType: string;
            sizeBytes: bigint;
        }[];
        requestedItemName: string;
        quantity: number;
        specificationRequestId: string;
    }[]>;
    findOne(id: string): Promise<{
        maintenanceRequestId: string;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        category: {
            id: string;
            name: string;
        } | null;
        categoryId: string | null;
        unitOfMeasure: string | null;
        priority: import("@prisma/client").$Enums.RequestPriority;
        files: {
            id: string;
            createdAt: Date;
            fileName: string;
            originalName: string;
            mimeType: string;
            sizeBytes: bigint;
        }[];
        requestedItemName: string;
        quantity: number;
        specificationRequestId: string;
    }>;
    update(id: string, dto: UpdateSpecificationItemDto): Promise<{
        maintenanceRequestId: string;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        category: {
            id: string;
            name: string;
        } | null;
        categoryId: string | null;
        unitOfMeasure: string | null;
        priority: import("@prisma/client").$Enums.RequestPriority;
        files: {
            id: string;
            createdAt: Date;
            fileName: string;
            originalName: string;
            mimeType: string;
            sizeBytes: bigint;
        }[];
        requestedItemName: string;
        quantity: number;
        specificationRequestId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        categoryId: string | null;
        unitOfMeasure: string | null;
        priority: import("@prisma/client").$Enums.RequestPriority;
        requestedItemName: string;
        quantity: number;
        specificationRequestId: string;
    }>;
    uploadFiles(id: string, userId: string, files?: Express.Multer.File[]): Promise<{
        id: string;
        createdAt: Date;
        fileName: string;
        originalName: string;
        mimeType: string;
        sizeBytes: bigint;
    }[]>;
    downloadFile(id: string, fileId: string, res: Response): Promise<void>;
    downloadFileDirect(fileId: string, res: Response): Promise<void>;
    removeFile(id: string, fileId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
