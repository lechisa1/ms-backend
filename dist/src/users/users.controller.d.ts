import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, ResetPasswordDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { AssignRolesDto, AssignPermissionsDto } from './dto/assign-roles.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
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
    findAll(query: QueryUserDto): Promise<import("../common/dto/paginated-result.dto").PaginatedResult<unknown>>;
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
}
