import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QueryReportRequestsDto {
  @ApiPropertyOptional({ description: 'Free text search across ticket, title, requester, department, asset item' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['ALL', 'MAINTENANCE', 'SPECIFICATION'], default: 'ALL' })
  @IsOptional()
  @IsString()
  requestType?: string = 'ALL';

  @ApiPropertyOptional({ description: 'Filter by request status or ALL' })
  @IsOptional()
  @IsString()
  status?: string = 'ALL';

  @ApiPropertyOptional({ description: 'Filter by priority or ALL' })
  @IsOptional()
  @IsString()
  priority?: string = 'ALL';

  @ApiPropertyOptional({ description: 'Filter by department / organization unit ID or ALL' })
  @IsOptional()
  @IsString()
  departmentId?: string = 'ALL';

  @ApiPropertyOptional({ description: 'Filter by technician ID, UNASSIGNED, or ALL' })
  @IsOptional()
  @IsString()
  technicianId?: string = 'ALL';

  @ApiPropertyOptional({ description: 'Filter by technician assignment status or ALL' })
  @IsOptional()
  @IsString()
  taskStatus?: string = 'ALL';

  @ApiPropertyOptional({ enum: ['ALL', 'TODAY', '7DAYS', '30DAYS', '90DAYS'], default: 'ALL' })
  @IsOptional()
  @IsString()
  timeframe?: string = 'ALL';

  @ApiPropertyOptional({ description: 'Start date ISO string' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date ISO string' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({ default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ default: 'desc', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';

  get skip(): number {
    return (Number(this.page ?? 1) - 1) * Number(this.limit ?? 20);
  }
}

