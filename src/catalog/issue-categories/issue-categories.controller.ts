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
import { IssueCategoriesService } from './issue-categories.service';
import {
  CreateIssueCategoryDto,
  QueryIssueCategoryDto,
  UpdateIssueCategoryDto,
} from './dto/issue-category.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('issue-categories')
@ApiBearerAuth()
@Controller('issue-categories')
export class IssueCategoriesController {
  constructor(private readonly service: IssueCategoriesService) {}

  @Post()
  @RequirePermissions('issue-types:create')
  @ApiOperation({ summary: 'Create an issue category' })
  create(@Body() dto: CreateIssueCategoryDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List issue categories' })
  findAll(@Query() query: QueryIssueCategoryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an issue category' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('issue-types:update')
  @ApiOperation({ summary: 'Update an issue category' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIssueCategoryDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('issue-types:delete')
  @ApiOperation({ summary: 'Soft delete an issue category' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('issue-types:update')
  @ApiOperation({ summary: 'Restore a soft deleted issue category' })
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.restore(id);
  }
}
