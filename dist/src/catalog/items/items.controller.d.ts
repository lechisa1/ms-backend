import { ItemsService } from './items.service';
import { CreateItemDto, QueryItemDto, UpdateItemDto } from './dto/item.dto';
export declare class ItemsController {
    private readonly service;
    constructor(service: ItemsService);
    create(dto: CreateItemDto): import("@prisma/client").Prisma.Prisma__ItemClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(query: QueryItemDto): Promise<import("../../common/dto/paginated-result.dto").PaginatedResult<unknown>>;
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
