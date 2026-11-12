import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, ResetPasswordDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { AssignRolesDto, AssignPermissionsDto } from './dto/assign-roles.dto';
import { PaginatedResult } from '../common/dto/paginated-result.dto';
export declare class UsersService {
    private readonly prisma;
    private readonly configService;
    constructor(prisma: PrismaService, configService: ConfigService);
    private get saltRounds();
    create(dto: CreateUserDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        email: string;
        fullName: string;
        phone: string | null;
        emailVerifiedAt: Date | null;
        lastLoginAt: Date | null;
        lastLoginIp: string | null;
        organizationUnitId: string | null;
        membershipRole: import("@prisma/client").$Enums.OrganizationMembershipRole;
        organizationUnit: {
            id: string;
            name: string;
            code: string | null;
        } | null;
        supervisedUnit: {
            id: string;
            name: string;
        } | null;
        roleAssignments: {
            role: {
                id: string;
                name: string;
                dashboardRoute: string | null;
            };
            assignedAt: Date;
        }[];
        permissionGrants: {
            permission: {
                id: string;
                name: string;
            };
            grantedAt: Date;
        }[];
    }>;
    private resolvePermissionNames;
    findAll(query: QueryUserDto): Promise<PaginatedResult<unknown>>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        email: string;
        fullName: string;
        phone: string | null;
        emailVerifiedAt: Date | null;
        lastLoginAt: Date | null;
        lastLoginIp: string | null;
        organizationUnitId: string | null;
        membershipRole: import("@prisma/client").$Enums.OrganizationMembershipRole;
        organizationUnit: {
            id: string;
            name: string;
            code: string | null;
        } | null;
        supervisedUnit: {
            id: string;
            name: string;
        } | null;
        roleAssignments: {
            role: {
                id: string;
                name: string;
                dashboardRoute: string | null;
            };
            assignedAt: Date;
        }[];
        permissionGrants: {
            permission: {
                id: string;
                name: string;
            };
            grantedAt: Date;
        }[];
    }>;
    findOneByEmail(email: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        email: string;
        fullName: string;
        phone: string | null;
        emailVerifiedAt: Date | null;
        lastLoginAt: Date | null;
        lastLoginIp: string | null;
        organizationUnitId: string | null;
        membershipRole: import("@prisma/client").$Enums.OrganizationMembershipRole;
        organizationUnit: {
            id: string;
            name: string;
            code: string | null;
        } | null;
        supervisedUnit: {
            id: string;
            name: string;
        } | null;
        roleAssignments: {
            role: {
                id: string;
                name: string;
                dashboardRoute: string | null;
            };
            assignedAt: Date;
        }[];
        permissionGrants: {
            permission: {
                id: string;
                name: string;
            };
            grantedAt: Date;
        }[];
    } | null>;
    update(id: string, dto: UpdateUserDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        email: string;
        fullName: string;
        phone: string | null;
        emailVerifiedAt: Date | null;
        lastLoginAt: Date | null;
        lastLoginIp: string | null;
        organizationUnitId: string | null;
        membershipRole: import("@prisma/client").$Enums.OrganizationMembershipRole;
        organizationUnit: {
            id: string;
            name: string;
            code: string | null;
        } | null;
        supervisedUnit: {
            id: string;
            name: string;
        } | null;
        roleAssignments: {
            role: {
                id: string;
                name: string;
                dashboardRoute: string | null;
            };
            assignedAt: Date;
        }[];
        permissionGrants: {
            permission: {
                id: string;
                name: string;
            };
            grantedAt: Date;
        }[];
    }>;
    resetPassword(id: string, dto: ResetPasswordDto): Promise<{
        success: boolean;
    }>;
    assignRoles(id: string, dto: AssignRolesDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        email: string;
        fullName: string;
        phone: string | null;
        emailVerifiedAt: Date | null;
        lastLoginAt: Date | null;
        lastLoginIp: string | null;
        organizationUnitId: string | null;
        membershipRole: import("@prisma/client").$Enums.OrganizationMembershipRole;
        organizationUnit: {
            id: string;
            name: string;
            code: string | null;
        } | null;
        supervisedUnit: {
            id: string;
            name: string;
        } | null;
        roleAssignments: {
            role: {
                id: string;
                name: string;
                dashboardRoute: string | null;
            };
            assignedAt: Date;
        }[];
        permissionGrants: {
            permission: {
                id: string;
                name: string;
            };
            grantedAt: Date;
        }[];
    }>;
    assignPermissions(id: string, dto: AssignPermissionsDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        email: string;
        fullName: string;
        phone: string | null;
        emailVerifiedAt: Date | null;
        lastLoginAt: Date | null;
        lastLoginIp: string | null;
        organizationUnitId: string | null;
        membershipRole: import("@prisma/client").$Enums.OrganizationMembershipRole;
        organizationUnit: {
            id: string;
            name: string;
            code: string | null;
        } | null;
        supervisedUnit: {
            id: string;
            name: string;
        } | null;
        roleAssignments: {
            role: {
                id: string;
                name: string;
                dashboardRoute: string | null;
            };
            assignedAt: Date;
        }[];
        permissionGrants: {
            permission: {
                id: string;
                name: string;
            };
            grantedAt: Date;
        }[];
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        email: string;
        fullName: string;
        phone: string | null;
        passwordHash: string;
        emailVerifiedAt: Date | null;
        lastLoginAt: Date | null;
        lastLoginIp: string | null;
        deletedAt: Date | null;
        organizationUnitId: string | null;
        membershipRole: import("@prisma/client").$Enums.OrganizationMembershipRole;
    }>;
    restore(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        email: string;
        fullName: string;
        phone: string | null;
        passwordHash: string;
        emailVerifiedAt: Date | null;
        lastLoginAt: Date | null;
        lastLoginIp: string | null;
        deletedAt: Date | null;
        organizationUnitId: string | null;
        membershipRole: import("@prisma/client").$Enums.OrganizationMembershipRole;
    }>;
    technicians(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        email: string;
        fullName: string;
        phone: string | null;
        emailVerifiedAt: Date | null;
        lastLoginAt: Date | null;
        lastLoginIp: string | null;
        organizationUnitId: string | null;
        membershipRole: import("@prisma/client").$Enums.OrganizationMembershipRole;
    }[]>;
}
