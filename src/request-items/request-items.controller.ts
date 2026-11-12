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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequestItemsService } from './request-items.service';
import {
  AssignTechnicianDto,
  CreateRequestItemDto,
  UpdateTechnicianAssignmentDto,
} from './dto/request-item.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('request-items')
@ApiBearerAuth()
@Controller()
export class RequestItemsController {
  constructor(private readonly service: RequestItemsService) {}

  @Get('requests/:requestId/items')
  @ApiOperation({ summary: 'Items of a maintenance request' })
  findByRequest(@Param('requestId', ParseUUIDPipe) requestId: string) {
    return this.service.findByRequest(requestId);
  }

  @Post('requests/:requestId/items')
  @RequirePermissions('requests:update')
  @ApiOperation({ summary: 'Add an item to a request' })
  create(
    @Param('requestId', ParseUUIDPipe) requestId: string,
    @Body() dto: CreateRequestItemDto,
  ) {
    return this.service.create(requestId, dto);
  }

  @Get('request-items/:id')
  @ApiOperation({ summary: 'Get a request item' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch('request-items/:id')
  @RequirePermissions('requests:update')
  @ApiOperation({ summary: 'Update a request item' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateRequestItemDto>,
  ) {
    return this.service.update(id, dto);
  }

  @Delete('request-items/:id')
  @RequirePermissions('requests:update')
  @ApiOperation({ summary: 'Soft delete a request item' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }

  @Post('request-items/:id/technicians')
  @RequirePermissions('tasks:ict-director')
  @ApiOperation({ summary: 'Assign technicians to a request item' })
  assignTechnicians(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignTechnicianDto,
    @CurrentUser('id') userId?: string,
  ) {
    return this.service.assignTechnicians(id, dto, userId);
  }

  @Patch('item-technicians/:assignmentId')
  @RequirePermissions('tasks:technician', 'tasks:ict-director', 'requests:assign-technicians')
  @ApiOperation({ summary: 'Update a technician assignment status' })
  updateAssignment(
    @Param('assignmentId', ParseUUIDPipe) assignmentId: string,
    @Body() dto: UpdateTechnicianAssignmentDto,
    @CurrentUser('id') userId?: string,
  ) {
    return this.service.updateAssignment(assignmentId, dto, userId);
  }

  @Delete('request-items/:id/technicians/:assignmentId')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('tasks:ict-director')
  @ApiOperation({ summary: 'Cancel a technician assignment' })
  unassignTechnician(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('assignmentId', ParseUUIDPipe) assignmentId: string,
  ) {
    return this.service.unassignTechnician(id, assignmentId);
  }

  @Get('technicians/:technicianId/assignments')
  @ApiOperation({ summary: 'Assignments of a technician' })
  findByTechnician(@Param('technicianId', ParseUUIDPipe) technicianId: string) {
    return this.service.findByTechnician(technicianId);
  }
}
