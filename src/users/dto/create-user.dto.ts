import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationMembershipRole } from '@prisma/client';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  IsBoolean,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
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
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  organizationUnitId?: string;

  @ApiPropertyOptional({ enum: OrganizationMembershipRole })
  @IsOptional()
  membershipRole?: OrganizationMembershipRole;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsUUID('4', { each: true })
  roleIds?: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Direct permission names',
  })
  @IsOptional()
  @IsString({ each: true })
  permissionNames?: string[];
}
