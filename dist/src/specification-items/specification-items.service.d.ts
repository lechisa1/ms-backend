import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSpecificationItemDto, UpdateSpecificationItemDto } from './dto/specification-item.dto';
export declare class SpecificationItemsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
    addFiles(itemId: string, userId: string, files: Express.Multer.File[]): Promise<{
        id: string;
        createdAt: Date;
        fileName: string;
        originalName: string;
        mimeType: string;
        sizeBytes: bigint;
    }[]>;
    getFile(itemId: string, fileId: string): Promise<{
        id: string;
        createdAt: Date;
        maintenanceRequestId: string;
        uploadedById: string | null;
        fileName: string;
        originalName: string;
        mimeType: string;
        storageKey: string;
        fileType: string;
        sizeBytes: bigint;
    } | {
        id: string;
        createdAt: Date;
        uploadedById: string | null;
        fileName: string;
        originalName: string;
        mimeType: string;
        storageKey: string;
        fileType: string;
        sizeBytes: bigint;
        specificationRequestId: string;
    } | {
        id: string;
        createdAt: Date;
        uploadedById: string | null;
        fileName: string;
        originalName: string;
        mimeType: string;
        storageKey: string;
        sizeBytes: bigint;
        specificationItemId: string;
    }>;
    removeFile(itemId: string, fileId: string): Promise<Prisma.BatchPayload>;
}
