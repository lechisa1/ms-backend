import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrganizationService } from './organization.service';
import {
  AssignSupervisorDto,
  CreateOrganizationUnitDto,
  MoveOrganizationUnitDto,
  UpdateOrganizationUnitDto,
} from './dto/organization-unit.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@ApiTags('organization')
@ApiBearerAuth()
@Controller('organization-units')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  @RequirePermissions('organization:create')
  @ApiOperation({ summary: 'Create an organization unit' })
  create(@Body() dto: CreateOrganizationUnitDto) {
    return this.organizationService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List organization units' })
  findAll(@Query() query: PaginationDto) {
    return this.organizationService.findAll(query);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Organization tree' })
  tree() {
    return this.organizationService.tree();
  }

  @Get('types')
  @ApiOperation({ summary: 'List seeded organization unit types' })
  findTypes() {
    return this.organizationService.findTypes();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an organization unit' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.organizationService.findOne(id);
  }

  @Get(':id/children')
  @ApiOperation({ summary: 'Direct children of a unit' })
  children(@Param('id', ParseUUIDPipe) id: string) {
    return this.organizationService.children(id);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Users belonging to a unit' })
  members(@Param('id', ParseUUIDPipe) id: string) {
    return this.organizationService.members(id);
  }

  @Patch(':id')
  @RequirePermissions('organization:update')
  @ApiOperation({ summary: 'Update an organization unit' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrganizationUnitDto,
  ) {
    return this.organizationService.update(id, dto);
  }

  @Put(':id/move')
  @RequirePermissions('organization:update')
  @ApiOperation({ summary: 'Move a unit under a new parent' })
  move(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: MoveOrganizationUnitDto,
  ) {
    return this.organizationService.move(id, dto);
  }

  @Put(':id/supervisor')
  @RequirePermissions('organization:update')
  @ApiOperation({ summary: 'Assign or clear the unit supervisor' })
  assignSupervisor(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignSupervisorDto,
  ) {
    return this.organizationService.assignSupervisor(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('organization:delete')
  @ApiOperation({ summary: 'Soft delete an organization unit' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.organizationService.remove(id);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('organization:update')
  @ApiOperation({ summary: 'Restore a soft deleted unit' })
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.organizationService.restore(id);
  }
}
