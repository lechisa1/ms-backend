import { OrganizationMembershipRole } from '@prisma/client';
export declare class RegisterDto {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    organizationUnitId?: string;
    membershipRole?: OrganizationMembershipRole;
    roleIds?: string[];
}
