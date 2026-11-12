import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePermissionDto, UpdatePermissionDto } from './dto/permission.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/dto/paginated-result.dto';
export declare class PermissionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
    createMany(names: string[]): Promise<Prisma.BatchPayload>;
    findAll(query: PaginationDto): Promise<PaginatedResult<unknown>>;
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
