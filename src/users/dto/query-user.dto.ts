import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationMembershipRole } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryUserDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  organizationUnitId?: string;

  @ApiPropertyOptional({ enum: OrganizationMembershipRole })
  @IsOptional()
  @IsEnum(OrganizationMembershipRole)
  membershipRole?: OrganizationMembershipRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Filter by role id' })
  @IsOptional()
  @IsUUID()
  roleId?: string;
}
