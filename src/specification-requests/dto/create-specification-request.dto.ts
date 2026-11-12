import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RequestPriority } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSpecificationItemDto {
  @ApiPropertyOptional({
    description: 'Item category ID',
    example: 'icat-electronics',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Name of the requested item',
    example: 'Dell Latitude 5540 Laptop',
  })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  requestedItemName?: string;

  @ApiProperty({
    description: 'Quantity needed',
    example: 3,
    default: 1,
  })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({
    description: 'Unit of measure (e.g. units, pcs, reams)',
    example: 'units',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  unitOfMeasure?: string;

  @ApiProperty({
    enum: RequestPriority,
    default: RequestPriority.MEDIUM,
    description: 'Item priority',
  })
  @IsEnum(RequestPriority)
  priority: RequestPriority;

  @ApiPropertyOptional({
    description: 'Justification / why item is needed',
    example: 'For new engineering staff joining in Q1',
  })
  @IsOptional()
  @IsString()
  description?: string;

  // Non-Swagger backwards-compatibility with frontend form field names
  @IsOptional()
  @IsString()
  itemCategoryId?: string;

  @IsOptional()
  @IsString()
  itemName?: string;
}

export class CreateSpecificationRequestDto {
  @ApiProperty({
    description: 'Specification request title',
    example: 'Laptop and Accessories Request for New Staff',
  })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({
    description: 'General description or justification',
    example: 'Request 3 laptops for new staff members and related accessories',
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

  @ApiPropertyOptional({
    type: [CreateSpecificationItemDto],
    description: 'List of requested items and quantities',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSpecificationItemDto)
  items?: CreateSpecificationItemDto[];

  // Non-Swagger backwards-compatibility with forms sending specificationItems
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSpecificationItemDto)
  specificationItems?: CreateSpecificationItemDto[];
}
