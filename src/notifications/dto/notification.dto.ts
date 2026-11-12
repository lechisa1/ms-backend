import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class SendNotificationDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty({ example: 'REQUEST_ASSIGNED' })
  @IsString()
  type: string;

  @ApiProperty({ type: Object })
  @IsObject()
  payload: Record<string, unknown>;
}

export class QueryNotificationDto extends PaginationDto {
  @ApiPropertyOptional()
  declare search?: string;

  @ApiPropertyOptional({ description: 'Only unread notifications' })
  @IsOptional()
  unreadOnly?: string;
}
