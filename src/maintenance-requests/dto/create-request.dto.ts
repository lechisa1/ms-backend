import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RequestPriority } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum RequestTypeEnum {
  MAINTENANCE = 'MAINTENANCE',
  SPECIFICATION = 'SPECIFICATION',
  OTHER = 'OTHER',
}

export class CreateMaintenanceItemDto {
  @ApiProperty({
    description: 'Registered asset/item ID',
    example: 'item-1',
  })
  @IsString()
  itemId: string;

  @ApiProperty({
    description: 'Issue category ID (e.g. Hardware, Software)',
    example: 'icat-1',
  })
  @IsString()
  issueCategoryId: string;

  @ApiProperty({
    description: 'Issue type ID (e.g. Not Powering On)',
    example: 'issue-1',
  })
  @IsString()
  issueTypeId: string;

  @ApiProperty({
    enum: RequestPriority,
    default: RequestPriority.MEDIUM,
    description: 'Priority of this asset repair',
  })
  @IsEnum(RequestPriority)
  priority: RequestPriority;

  @ApiPropertyOptional({
    description: 'Specific description of the issue on this asset',
    example: 'Screen flickers when moved',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateMaintenanceRequestDto {
  @ApiProperty({
    description: 'Request title',
    example: 'Laptop and Monitor maintenance for Finance office',
  })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({
    description: 'General description of the maintenance request',
    example: 'Several devices in room 204 require repair',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    enum: RequestPriority,
    default: RequestPriority.MEDIUM,
    description: 'Overall request priority',
  })
  @IsOptional()
  @IsEnum(RequestPriority)
  priority?: RequestPriority;

  @ApiProperty({
    type: [CreateMaintenanceItemDto],
    description: 'List of registered assets and their issues',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMaintenanceItemDto)
  items: CreateMaintenanceItemDto[];

  // Non-Swagger backwards-compatible field for frontend forms sending maintenanceItems
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMaintenanceItemDto)
  maintenanceItems?: CreateMaintenanceItemDto[];
}

export { CreateMaintenanceItemDto as CreateRequestItemDto };
