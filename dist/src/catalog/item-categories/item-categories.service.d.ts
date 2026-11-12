import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateItemCategoryDto, UpdateItemCategoryDto } from './dto/item-category.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PaginatedResult } from '../../common/dto/paginated-result.dto';
export declare class ItemCategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateItemCategoryDto): Prisma.Prisma__ItemCategoryClient<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            items: number;
            specificationItems: number;
        };
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    findAll(query: PaginationDto): Promise<PaginatedResult<unknown>>;
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
