import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateOrganizationUnitDto {
  @ApiProperty({ example: 'Maintenance Workshop' })
  @IsString()
  @MaxLength(160)
  name: string;

  @ApiPropertyOptional({ example: 'MW-01' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  code?: string;

  @ApiPropertyOptional({ example: 'DEPARTMENT' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  unitType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Parent unit id (null = root)' })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  supervisorId?: string;
}

export class UpdateOrganizationUnitDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  unitType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class MoveOrganizationUnitDto {
  @ApiPropertyOptional({ description: 'New parent id, null to move to root' })
  @IsOptional()
  @IsUUID()
  parentId?: string | null;
}

export class AssignSupervisorDto {
  @ApiPropertyOptional({ description: 'Supervisor user id, null to clear' })
  @IsOptional()
  @IsUUID()
  supervisorId?: string | null;
}
