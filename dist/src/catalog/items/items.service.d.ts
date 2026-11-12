import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateItemDto, QueryItemDto, UpdateItemDto } from './dto/item.dto';
import { PaginatedResult } from '../../common/dto/paginated-result.dto';
export declare class ItemsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateItemDto): Prisma.Prisma__ItemClient<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            requestItems: number;
        };
        category: {
            id: string;
            name: string;
        } | null;
        categoryId: string | null;
        unitOfMeasure: string;
        status: import("@prisma/client").$Enums.ItemStatus;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    findAll(query: QueryItemDto): Promise<PaginatedResult<unknown>>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            requestItems: number;
        };
        category: {
            id: string;
            name: string;
        } | null;
        categoryId: string | null;
        unitOfMeasure: string;
        status: import("@prisma/client").$Enums.ItemStatus;
    }>;
    update(id: string, dto: UpdateItemDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            requestItems: number;
        };
        category: {
            id: string;
            name: string;
        } | null;
        categoryId: string | null;
        unitOfMeasure: string;
        status: import("@prisma/client").$Enums.ItemStatus;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        categoryId: string | null;
        unitOfMeasure: string;
        status: import("@prisma/client").$Enums.ItemStatus;
    }>;
    restore(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        categoryId: string | null;
        unitOfMeasure: string;
        status: import("@prisma/client").$Enums.ItemStatus;
    }>;
}
