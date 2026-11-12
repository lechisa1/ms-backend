import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateMaintenanceCategoryDto {
  @ApiProperty({ example: 'Preventive' })
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateMaintenanceCategoryDto extends PartialType(
  CreateMaintenanceCategoryDto,
) {}
