import { ApiPropertyOptional } from '@nestjs/swagger';
import { WorkLogStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryWorkLogDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  requestId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  technicianId?: string;

  @ApiPropertyOptional({ enum: WorkLogStatus })
  @IsOptional()
  @IsEnum(WorkLogStatus)
  status?: WorkLogStatus;
}
