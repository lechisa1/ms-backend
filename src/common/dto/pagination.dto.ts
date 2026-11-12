import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === undefined ? 1 : Number(value),
  )
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 200 })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === undefined ? 20 : Number(value),
  )
  @IsInt()
  @Min(1)
  @Max(200)
  limit: number = 20;

  @ApiPropertyOptional({ description: 'Field to sort by' })
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === 'asc' ? 'asc' : 'desc',
  )
  order: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], description: 'Alias for order' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === 'asc' ? 'asc' : 'desc',
  )
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({ description: 'Free text search' })
  @IsOptional()
  search?: string;

  get skip(): number {
    return (Number(this.page ?? 1) - 1) * Number(this.limit ?? 20);
  }
}
