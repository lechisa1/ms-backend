import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateIssueCategoryDto, QueryIssueCategoryDto, UpdateIssueCategoryDto } from './dto/issue-category.dto';
import { PaginatedResult } from '../../common/dto/paginated-result.dto';
export declare class IssueCategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private slugify;
    create(dto: CreateIssueCategoryDto): Prisma.Prisma__IssueCategoryClient<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            issueTypes: number;
        };
        isActive: boolean;
        slug: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    findAll(query: QueryIssueCategoryDto): Promise<PaginatedResult<unknown>>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            issueTypes: number;
        };
        isActive: boolean;
        slug: string;
    }>;
    update(id: string, dto: UpdateIssueCategoryDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            issueTypes: number;
        };
        isActive: boolean;
        slug: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        deletedAt: Date | null;
        slug: string;
    }>;
    restore(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        deletedAt: Date | null;
        slug: string;
    }>;
}
