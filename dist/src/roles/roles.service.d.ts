import { PrismaService } from '../prisma/prisma.service';
import { AssignRolePermissionsDto, CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/dto/paginated-result.dto';
export declare class RolesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateRoleDto): Promise<{
        permissions: {
            permission: {
                id: string;
                name: string;
                resource: string | null;
            };
        }[];
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            users: number;
        };
        dashboardRoute: string | null;
        isActive: boolean;
    }>;
    findAll(query: PaginationDto): Promise<PaginatedResult<unknown>>;
    findOne(id: string): Promise<{
        permissions: {
            permission: {
                id: string;
                name: string;
                resource: string | null;
            };
        }[];
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            users: number;
        };
        dashboardRoute: string | null;
        isActive: boolean;
    }>;
    update(id: string, dto: UpdateRoleDto): Promise<{
        permissions: {
            permission: {
                id: string;
                name: string;
                resource: string | null;
            };
        }[];
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            users: number;
        };
        dashboardRoute: string | null;
        isActive: boolean;
    }>;
    assignPermissions(id: string, dto: AssignRolePermissionsDto): Promise<{
        permissions: {
            permission: {
                id: string;
                name: string;
                resource: string | null;
            };
        }[];
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            users: number;
        };
        dashboardRoute: string | null;
        isActive: boolean;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        dashboardRoute: string | null;
        isActive: boolean;
    }>;
}
