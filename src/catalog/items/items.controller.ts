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
import { ItemsService } from './items.service';
import { CreateItemDto, QueryItemDto, UpdateItemDto } from './dto/item.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('items')
@ApiBearerAuth()
@Controller('items')
export class ItemsController {
  constructor(private readonly service: ItemsService) {}

  @Post()
  @RequirePermissions('items:create')
  @ApiOperation({ summary: 'Create an item' })
  create(@Body() dto: CreateItemDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List items' })
  findAll(@Query() query: QueryItemDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an item' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('items:update')
  @ApiOperation({ summary: 'Update an item' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateItemDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('items:delete')
  @ApiOperation({ summary: 'Soft delete an item' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('items:update')
  @ApiOperation({ summary: 'Restore a soft deleted item' })
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.restore(id);
  }
}
