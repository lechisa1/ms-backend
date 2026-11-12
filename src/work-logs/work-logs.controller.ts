import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WorkLogsService } from './work-logs.service';
import { CreateWorkLogDto, ReviewWorkLogDto } from './dto/work-log.dto';
import { QueryWorkLogDto } from './dto/query-work-log.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@ApiTags('work-logs')
@ApiBearerAuth()
@Controller('work-logs')
export class WorkLogsController {
  constructor(private readonly service: WorkLogsService) {}

  @Post()
  @RequirePermissions('work-logs:create')
  @ApiOperation({ summary: 'Log work done on a request' })
  create(@Body() dto: CreateWorkLogDto, @CurrentUser('id') userId?: string) {
    return this.service.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List work logs' })
  findAll(@Query() query: QueryWorkLogDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a work log' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/review')
  @RequirePermissions('work-logs:review')
  @ApiOperation({ summary: 'Accept or reject a work log' })
  review(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewWorkLogDto,
    @CurrentUser('id') userId?: string,
  ) {
    return this.service.review(id, dto, userId);
  }

  @Delete(':id')
  @RequirePermissions('work-logs:delete')
  @ApiOperation({ summary: 'Delete a work log' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
