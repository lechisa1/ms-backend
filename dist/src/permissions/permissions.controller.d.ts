import { PermissionsService } from './permissions.service';
import { CreatePermissionDto, UpdatePermissionDto } from './dto/permission.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class PermissionsController {
    private readonly permissionsService;
    constructor(permissionsService: PermissionsService);
    create(dto: CreatePermissionDto): Promise<{
        id: string;
        name: string;
        resource: string | null;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            users: number;
            roles: number;
        };
    }>;
    createMany(body: {
        names: string[];
    }): Promise<import("@prisma/client").Prisma.BatchPayload>;
    findAll(query: PaginationDto): Promise<import("../common/dto/paginated-result.dto").PaginatedResult<unknown>>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        resource: string | null;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            users: number;
            roles: number;
        };
    }>;
    update(id: string, dto: UpdatePermissionDto): Promise<{
        id: string;
        name: string;
        resource: string | null;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            users: number;
            roles: number;
        };
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        resource: string | null;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
