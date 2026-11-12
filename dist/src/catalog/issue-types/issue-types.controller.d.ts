import { IssueTypesService } from './issue-types.service';
import { CreateIssueTypeDto, QueryIssueTypeDto, UpdateIssueTypeDto } from './dto/issue-type.dto';
export declare class IssueTypesController {
    private readonly service;
    constructor(service: IssueTypesService);
    create(dto: CreateIssueTypeDto): import("@prisma/client").Prisma.Prisma__IssueTypeClient<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            requestItems: number;
        };
        isActive: boolean;
        slug: string;
        issueCategoryId: string | null;
        needsApproval: boolean;
        category: {
            id: string;
            name: string;
            slug: string;
        } | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(query: QueryIssueTypeDto): Promise<import("../../common/dto/paginated-result.dto").PaginatedResult<unknown>>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            requestItems: number;
        };
        isActive: boolean;
        slug: string;
        issueCategoryId: string | null;
        needsApproval: boolean;
        category: {
            id: string;
            name: string;
            slug: string;
        } | null;
    }>;
    update(id: string, dto: UpdateIssueTypeDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            requestItems: number;
        };
        isActive: boolean;
        slug: string;
        issueCategoryId: string | null;
        needsApproval: boolean;
        category: {
            id: string;
            name: string;
            slug: string;
        } | null;
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
        issueCategoryId: string | null;
        needsApproval: boolean;
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
        issueCategoryId: string | null;
        needsApproval: boolean;
    }>;
}
