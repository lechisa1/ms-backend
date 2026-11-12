import { OrganizationService } from './organization.service';
import { AssignSupervisorDto, CreateOrganizationUnitDto, MoveOrganizationUnitDto, UpdateOrganizationUnitDto } from './dto/organization-unit.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class OrganizationController {
    private readonly organizationService;
    constructor(organizationService: OrganizationService);
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
    findAll(query: PaginationDto): Promise<import("../common/dto/paginated-result.dto").PaginatedResult<unknown>>;
    tree(): Promise<unknown>;
    findTypes(): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        code: string | null;
    }[]>;
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
    members(id: string): Promise<{
        id: string;
        isActive: boolean;
        email: string;
        fullName: string;
        membershipRole: import("@prisma/client").$Enums.OrganizationMembershipRole;
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
