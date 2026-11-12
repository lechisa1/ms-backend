import { OrganizationMembershipRole } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class QueryUserDto extends PaginationDto {
    organizationUnitId?: string;
    membershipRole?: OrganizationMembershipRole;
    isActive?: boolean;
    roleId?: string;
}
