import { IssueCategoriesService } from './issue-categories.service';
import { CreateIssueCategoryDto, QueryIssueCategoryDto, UpdateIssueCategoryDto } from './dto/issue-category.dto';
export declare class IssueCategoriesController {
    private readonly service;
    constructor(service: IssueCategoriesService);
    create(dto: CreateIssueCategoryDto): import("@prisma/client").Prisma.Prisma__IssueCategoryClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(query: QueryIssueCategoryDto): Promise<import("../../common/dto/paginated-result.dto").PaginatedResult<unknown>>;
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
