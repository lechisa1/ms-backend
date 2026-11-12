import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { RequestPriority } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateSpecificationItemDto {
  @ApiProperty({ example: 'Bearing 6205' })
  @IsString()
  @MaxLength(180)
  requestedItemName: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  unitOfMeasure?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ enum: RequestPriority })
  @IsOptional()
  @IsEnum(RequestPriority)
  priority?: RequestPriority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateSpecificationItemDto extends PartialType(
  CreateSpecificationItemDto,
) {}
