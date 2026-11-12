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
import { ItemCategoriesService } from './item-categories.service';
import {
  CreateItemCategoryDto,
  UpdateItemCategoryDto,
} from './dto/item-category.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('item-categories')
@ApiBearerAuth()
@Controller('item-categories')
export class ItemCategoriesController {
  constructor(private readonly service: ItemCategoriesService) {}

  @Post()
  @RequirePermissions('items:create')
  @ApiOperation({ summary: 'Create an item category' })
  create(@Body() dto: CreateItemCategoryDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List item categories' })
  findAll(@Query() query: PaginationDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an item category' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('items:update')
  @ApiOperation({ summary: 'Update an item category' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateItemCategoryDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('items:delete')
  @ApiOperation({ summary: 'Delete an item category' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
