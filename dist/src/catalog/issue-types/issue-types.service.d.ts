import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateIssueTypeDto, QueryIssueTypeDto, UpdateIssueTypeDto } from './dto/issue-type.dto';
import { PaginatedResult } from '../../common/dto/paginated-result.dto';
export declare class IssueTypesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private slugify;
    create(dto: CreateIssueTypeDto): Prisma.Prisma__IssueTypeClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    findAll(query: QueryIssueTypeDto): Promise<PaginatedResult<unknown>>;
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
