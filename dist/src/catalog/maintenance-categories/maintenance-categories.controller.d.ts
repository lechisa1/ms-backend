import { MaintenanceCategoriesService } from './maintenance-categories.service';
import { CreateMaintenanceCategoryDto, UpdateMaintenanceCategoryDto } from './dto/maintenance-category.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class MaintenanceCategoriesController {
    private readonly service;
    constructor(service: MaintenanceCategoriesService);
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
    findAll(query: PaginationDto): Promise<import("../../common/dto/paginated-result.dto").PaginatedResult<unknown>>;
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
