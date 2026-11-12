import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WorkLogStatus } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class WorkLogItemInputDto {
  @ApiProperty({ description: 'Maintenance Request Item ID' })
  @IsUUID()
  requestItemId: string;

  @ApiPropertyOptional({ description: 'Specific notes for this item' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class WorkLogMaterialInputDto {
  @ApiPropertyOptional({ description: 'Material ID' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ example: 'RAM 16GB DDR4', description: 'Name of the material or part used' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 2, description: 'Quantity used' })
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional({ example: 'pcs', description: 'Unit of measure' })
  @IsOptional()
  @IsString()
  unit?: string;
}

export class CreateWorkLogDto {
  @ApiProperty({ description: 'Maintenance Request ID' })
  @IsUUID()
  requestId: string;

  @ApiPropertyOptional({ description: 'Technician User ID (defaults to authenticated user)' })
  @IsOptional()
  @IsUUID()
  technicianId?: string;

  @ApiPropertyOptional({ description: 'Summary of work performed', example: 'Diagnosed power fault and replaced blown capacitor' })
  @IsOptional()
  @IsString()
  workDone?: string;

  @ApiPropertyOptional({ description: 'Frontend alias for workDone', example: 'Diagnosed power fault and replaced blown capacitor' })
  @IsOptional()
  @IsString()
  activity?: string;

  @ApiPropertyOptional({ description: 'Completion or diagnostic notes', example: 'Tested stability for 30 minutes, all tests passed' })
  @IsOptional()
  @IsString()
  completionNotes?: string;

  @ApiPropertyOptional({ description: 'Frontend alias for completionNotes' })
  @IsOptional()
  @IsString()
  additionalNotes?: string;

  @ApiPropertyOptional({ example: 45, description: 'Time spent in minutes' })
  @IsOptional()
  @IsInt()
  @Min(0)
  timeSpentMinutes?: number;

  @ApiPropertyOptional({ description: 'Status of the assignment (COMPLETED or NOT_FIXED)' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Assignment ID (ItemTechnician ID)' })
  @IsOptional()
  @IsUUID()
  assignmentId?: string;

  @ApiPropertyOptional({ description: 'ItemTechnician ID' })
  @IsOptional()
  @IsUUID()
  itemTechnicianId?: string;

  @ApiPropertyOptional({ description: 'Specific Request Item ID' })
  @IsOptional()
  @IsUUID()
  itemId?: string;

  @ApiPropertyOptional({ type: [WorkLogItemInputDto], description: 'Items serviced in this work log' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkLogItemInputDto)
  items?: WorkLogItemInputDto[];

  @ApiPropertyOptional({ type: [WorkLogMaterialInputDto], description: 'Materials or parts used' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkLogMaterialInputDto)
  materials?: WorkLogMaterialInputDto[];
}

export class ReviewWorkLogDto {
  @ApiProperty({ enum: [WorkLogStatus.ACCEPTED, WorkLogStatus.REJECTED] })
  @IsEnum(WorkLogStatus)
  status: WorkLogStatus;

  @ApiPropertyOptional({ description: 'Reason for rejection if rejected' })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
