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
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IssueTypesService } from './issue-types.service';
import {
  CreateIssueTypeDto,
  QueryIssueTypeDto,
  UpdateIssueTypeDto,
} from './dto/issue-type.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('issue-types')
@ApiBearerAuth()
@Controller('issue-types')
export class IssueTypesController {
  constructor(private readonly service: IssueTypesService) {}

  @Post()
  @RequirePermissions('issue-types:create')
  @ApiOperation({ summary: 'Create an issue type' })
  create(@Body() dto: CreateIssueTypeDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List issue types' })
  findAll(@Query() query: QueryIssueTypeDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an issue type' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('issue-types:update')
  @ApiOperation({ summary: 'Update an issue type' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIssueTypeDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('issue-types:delete')
  @ApiOperation({ summary: 'Soft delete an issue type' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('issue-types:update')
  @ApiOperation({ summary: 'Restore a soft deleted issue type' })
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.restore(id);
  }
}
