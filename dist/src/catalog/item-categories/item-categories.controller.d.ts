import { ItemCategoriesService } from './item-categories.service';
import { CreateItemCategoryDto, UpdateItemCategoryDto } from './dto/item-category.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class ItemCategoriesController {
    private readonly service;
    constructor(service: ItemCategoriesService);
    create(dto: CreateItemCategoryDto): import("@prisma/client").Prisma.Prisma__ItemCategoryClient<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            items: number;
            specificationItems: number;
        };
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(query: PaginationDto): Promise<import("../../common/dto/paginated-result.dto").PaginatedResult<unknown>>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            items: number;
            specificationItems: number;
        };
    }>;
    update(id: string, dto: UpdateItemCategoryDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            items: number;
            specificationItems: number;
        };
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
