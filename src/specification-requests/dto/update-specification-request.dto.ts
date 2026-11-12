import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { RequestPriority, RequestStatus } from '@prisma/client';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CreateSpecificationRequestDto } from './create-specification-request.dto';

export class UpdateSpecificationRequestDto extends PartialType(
  CreateSpecificationRequestDto,
) {}

export class QuerySpecificationRequestDto extends PaginationDto {
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

  @ApiPropertyOptional({ description: 'Ticket number search' })
  @IsOptional()
  @IsString()
  ticketNumber?: string;
}

export class ChangeSpecificationStatusDto {
  @ApiProperty({ enum: RequestStatus })
  @IsEnum(RequestStatus)
  status: RequestStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

export class ApproveSpecificationRequestDto {
  @ApiPropertyOptional({ description: 'Optional approval notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RejectSpecificationRequestDto {
  @ApiProperty({
    description: 'Reason for rejecting the specification request',
    example: 'Specification details incomplete or not aligned with IT standards',
  })
  @IsString()
  reason: string;
}
