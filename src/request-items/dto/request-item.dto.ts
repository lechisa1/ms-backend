import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AssignmentRole, RequestPriority, TechnicianAssignmentStatus } from '@prisma/client';
import { IsArray, IsBoolean, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateRequestItemDto {
  @ApiProperty()
  @IsUUID()
  itemId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  issueCategoryId?: string;

  @ApiProperty()
  @IsUUID()
  issueTypeId: string;

  @ApiPropertyOptional({ enum: RequestPriority })
  @IsOptional()
  @IsEnum(RequestPriority)
  priority?: RequestPriority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class AssignTechnicianDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  technicianIds: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  leadTechnicianId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isLead?: boolean;

  @ApiPropertyOptional({ enum: AssignmentRole })
  @IsOptional()
  @IsEnum(AssignmentRole)
  roleInAssignment?: AssignmentRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateTechnicianAssignmentDto {
  @ApiPropertyOptional({ enum: TechnicianAssignmentStatus })
  @IsOptional()
  @IsEnum(TechnicianAssignmentStatus)
  status?: TechnicianAssignmentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isLead?: boolean;

  @ApiPropertyOptional({ enum: AssignmentRole })
  @IsOptional()
  @IsEnum(AssignmentRole)
  roleInAssignment?: AssignmentRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
