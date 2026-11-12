import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class AssignRolesDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  roleIds: string[];
}

export class AssignPermissionsDto {
  @ApiPropertyOptional({ type: [String], description: 'Permission ids' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Permission names' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissionNames?: string[];
}
