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
import { MaintenanceCategoriesService } from './maintenance-categories.service';
import {
  CreateMaintenanceCategoryDto,
  UpdateMaintenanceCategoryDto,
} from './dto/maintenance-category.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('maintenance-categories')
@ApiBearerAuth()
@Controller('maintenance-categories')
export class MaintenanceCategoriesController {
  constructor(private readonly service: MaintenanceCategoriesService) {}

  @Post()
  @RequirePermissions('requests:create')
  @ApiOperation({ summary: 'Create a maintenance category' })
  create(@Body() dto: CreateMaintenanceCategoryDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List maintenance categories' })
  findAll(@Query() query: PaginationDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a maintenance category' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('requests:update')
  @ApiOperation({ summary: 'Update a maintenance category' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMaintenanceCategoryDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('requests:delete')
  @ApiOperation({ summary: 'Delete a maintenance category' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
