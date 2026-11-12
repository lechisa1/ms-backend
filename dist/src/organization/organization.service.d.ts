import { PrismaService } from '../prisma/prisma.service';
import { AssignSupervisorDto, CreateOrganizationUnitDto, MoveOrganizationUnitDto, UpdateOrganizationUnitDto } from './dto/organization-unit.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/dto/paginated-result.dto';
export declare class OrganizationService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findTypes(): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        code: string | null;
    }[]>;
    private generateCode;
    create(dto: CreateOrganizationUnitDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            children: number;
            members: number;
        };
        isActive: boolean;
        code: string | null;
        unitType: string | null;
        parentId: string | null;
        supervisorId: string | null;
        parent: {
            id: string;
            name: string;
            code: string | null;
        } | null;
        supervisor: {
            id: string;
            email: string;
            fullName: string;
        } | null;
    }>;
    findAll(query: PaginationDto): Promise<PaginatedResult<unknown>>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            children: number;
            members: number;
        };
        isActive: boolean;
        code: string | null;
        unitType: string | null;
        parentId: string | null;
        supervisorId: string | null;
        parent: {
            id: string;
            name: string;
            code: string | null;
        } | null;
        supervisor: {
            id: string;
            email: string;
            fullName: string;
        } | null;
    }>;
    tree(): Promise<unknown>;
    children(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            children: number;
            members: number;
        };
        isActive: boolean;
        code: string | null;
        unitType: string | null;
        parentId: string | null;
        supervisorId: string | null;
        parent: {
            id: string;
            name: string;
            code: string | null;
        } | null;
        supervisor: {
            id: string;
            email: string;
            fullName: string;
        } | null;
    }[]>;
    update(id: string, dto: UpdateOrganizationUnitDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            children: number;
            members: number;
        };
        isActive: boolean;
        code: string | null;
        unitType: string | null;
        parentId: string | null;
        supervisorId: string | null;
        parent: {
            id: string;
            name: string;
            code: string | null;
        } | null;
        supervisor: {
            id: string;
            email: string;
            fullName: string;
        } | null;
    }>;
    move(id: string, dto: MoveOrganizationUnitDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            children: number;
            members: number;
        };
        isActive: boolean;
        code: string | null;
        unitType: string | null;
        parentId: string | null;
        supervisorId: string | null;
        parent: {
            id: string;
            name: string;
            code: string | null;
        } | null;
        supervisor: {
            id: string;
            email: string;
            fullName: string;
        } | null;
    }>;
    private isDescendant;
    assignSupervisor(id: string, dto: AssignSupervisorDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            children: number;
            members: number;
        };
        isActive: boolean;
        code: string | null;
        unitType: string | null;
        parentId: string | null;
        supervisorId: string | null;
        parent: {
            id: string;
            name: string;
            code: string | null;
        } | null;
        supervisor: {
            id: string;
            email: string;
            fullName: string;
        } | null;
    }>;
    members(id: string): Promise<{
        id: string;
        isActive: boolean;
        email: string;
        fullName: string;
        membershipRole: import("@prisma/client").$Enums.OrganizationMembershipRole;
    }[]>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        deletedAt: Date | null;
        code: string | null;
        unitType: string | null;
        parentId: string | null;
        supervisorId: string | null;
    }>;
    restore(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        deletedAt: Date | null;
        code: string | null;
        unitType: string | null;
        parentId: string | null;
        supervisorId: string | null;
    }>;
}
