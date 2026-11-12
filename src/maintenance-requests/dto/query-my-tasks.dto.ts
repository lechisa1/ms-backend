import { ApiPropertyOptional } from '@nestjs/swagger';
import { RequestPriority, RequestStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class QueryMyTasksDto {
  @ApiPropertyOptional({
    description: 'Filter by role view (SUPERVISOR, ICT_DIRECTOR, TECHNICIAN, or ALL)',
    enum: ['SUPERVISOR', 'ICT_DIRECTOR', 'TECHNICIAN', 'ALL'],
  })
  @IsOptional()
  @IsIn(['SUPERVISOR', 'ICT_DIRECTOR', 'TECHNICIAN', 'ALL'])
  roleView?: 'SUPERVISOR' | 'ICT_DIRECTOR' | 'TECHNICIAN' | 'ALL';

  @ApiPropertyOptional({ enum: RequestStatus })
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  @ApiPropertyOptional({ enum: RequestPriority })
  @IsOptional()
  @IsEnum(RequestPriority)
  priority?: RequestPriority;

  @ApiPropertyOptional({ description: 'Search term for ticket number, title, or requester name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ default: 'desc', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
