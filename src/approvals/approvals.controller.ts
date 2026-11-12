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
import { ApprovalsService } from './approvals.service';
import {
  CreateApprovalRequestDto,
  QueryApprovalRequestDto,
  ReviewApprovalDto,
} from './dto/approval.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@ApiTags('approvals')
@ApiBearerAuth()
@Controller('approvals')
export class ApprovalsController {
  constructor(private readonly service: ApprovalsService) {}

  @Post()
  @RequirePermissions('approvals:create')
  @ApiOperation({ summary: 'Create an approval request' })
  create(@Body() dto: CreateApprovalRequestDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List approval requests' })
  findAll(@Query() query: QueryApprovalRequestDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an approval request' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/forward')
  @RequirePermissions('approvals:forward')
  @ApiOperation({ summary: 'Forward an approval request' })
  forward(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.forward(id);
  }

  @Patch(':id/review')
  @RequirePermissions('approvals:review')
  @ApiOperation({ summary: 'Approve or reject an approval request' })
  review(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewApprovalDto,
    @CurrentUser('id') userId?: string,
  ) {
    return this.service.review(id, dto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('approvals:delete')
  @ApiOperation({ summary: 'Soft delete an approval request' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
