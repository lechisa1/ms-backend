import { PrismaService } from '../../prisma/prisma.service';
import { CreateMaintenanceCategoryDto, UpdateMaintenanceCategoryDto } from './dto/maintenance-category.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PaginatedResult } from '../../common/dto/paginated-result.dto';
export declare class MaintenanceCategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private slugify;
    create(dto: CreateMaintenanceCategoryDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            requests: number;
        };
    }>;
    findAll(query: PaginationDto): Promise<PaginatedResult<unknown>>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            requests: number;
        };
    }>;
    update(id: string, dto: UpdateMaintenanceCategoryDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            requests: number;
        };
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
}
