import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { RequestPriority, RequestStatus } from '@prisma/client';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CreateMaintenanceRequestDto } from './create-request.dto';

export class UpdateMaintenanceRequestDto extends PartialType(
  CreateMaintenanceRequestDto,
) {}

export class QueryMaintenanceRequestDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by requester user ID' })
  @IsOptional()
  @IsUUID()
  requesterId?: string;

  @ApiPropertyOptional({ description: 'Filter by organization unit ID' })
  @IsOptional()
  @IsUUID()
  organizationUnitId?: string;

  @ApiPropertyOptional({ enum: RequestStatus })
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  @ApiPropertyOptional({ description: 'Comma separated RequestStatus values' })
  @IsOptional()
  @IsString()
  statuses?: string;

  @ApiPropertyOptional({ enum: RequestPriority })
  @IsOptional()
  @IsEnum(RequestPriority)
  priority?: RequestPriority;

  @ApiPropertyOptional({ enum: ['MAINTENANCE', 'SPECIFICATION'], description: 'Request type filter' })
  @IsOptional()
  @IsString()
  requestType?: string;

  @ApiPropertyOptional({ description: 'Ticket number search' })
  @IsOptional()
  @IsString()
  ticketNumber?: string;
}

export class ChangeStatusDto {
  @ApiProperty({ enum: RequestStatus })
  @IsEnum(RequestStatus)
  status: RequestStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

export class AddRequestUpdateDto {
  @ApiProperty({ example: 'DIAGNOSIS', description: 'Update type' })
  @IsString()
  @MaxLength(60)
  updateType: string;

  @ApiProperty({ example: 'Motherboard replaced and testing started' })
  @IsString()
  updateText: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  userId?: string;
}
