import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { OrganizationMembershipRole } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MaxLength(255)
  fullName: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+8801700000000' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  organizationUnitId?: string;

  @ApiPropertyOptional({ enum: OrganizationMembershipRole })
  @IsOptional()
  membershipRole?: OrganizationMembershipRole;

  @ApiPropertyOptional({ type: [String], description: 'Role ids' })
  @IsOptional()
  @IsUUID('4', { each: true })
  roleIds?: string[];
}
