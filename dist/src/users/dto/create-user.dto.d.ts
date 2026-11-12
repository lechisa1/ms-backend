import { OrganizationMembershipRole } from '@prisma/client';
export declare class CreateUserDto {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    isActive?: boolean;
    organizationUnitId?: string;
    membershipRole?: OrganizationMembershipRole;
    roleIds?: string[];
    permissionNames?: string[];
}
