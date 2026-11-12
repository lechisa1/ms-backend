import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ItemStatus } from '@prisma/client';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { PaginationDto as PaginationQuery } from '../../../common/dto/pagination.dto';

export class CreateItemDto {
  @ApiProperty({ example: 'Air Compressor' })
  @IsString()
  @MaxLength(180)
  name: string;

  @ApiProperty({ example: 'unit' })
  @IsString()
  @MaxLength(50)
  unitOfMeasure: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ enum: ItemStatus, default: ItemStatus.ACTIVE })
  @IsOptional()
  @IsEnum(ItemStatus)
  status?: ItemStatus;
}

export class UpdateItemDto extends PartialType(CreateItemDto) {}

export class QueryItemDto extends PaginationQuery {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ enum: ItemStatus })
  @IsOptional()
  @IsEnum(ItemStatus)
  status?: ItemStatus;
}
