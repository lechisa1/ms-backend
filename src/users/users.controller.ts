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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, ResetPasswordDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { AssignRolesDto, AssignPermissionsDto } from './dto/assign-roles.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RequirePermissions('users:create')
  @ApiOperation({ summary: 'Create a user' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @RequirePermissions('users:read')
  @ApiOperation({ summary: 'List users' })
  findAll(@Query() query: QueryUserDto) {
    return this.usersService.findAll(query);
  }

  @Get('technicians')
  @ApiOperation({ summary: 'List active technicians' })
  technicians() {
    return this.usersService.technicians();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('users:update')
  @ApiOperation({ summary: 'Update a user' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Put(':id/password')
  @RequirePermissions('users:update')
  @ApiOperation({ summary: 'Reset a user password' })
  resetPassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ResetPasswordDto,
  ) {
    return this.usersService.resetPassword(id, dto);
  }

  @Put(':id/roles')
  @RequirePermissions('users:assign-roles')
  @ApiOperation({ summary: 'Replace user roles' })
  assignRoles(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignRolesDto,
  ) {
    return this.usersService.assignRoles(id, dto);
  }

  @Put(':id/permissions')
  @RequirePermissions('users:assign-permissions')
  @ApiOperation({ summary: 'Replace direct permission grants' })
  assignPermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignPermissionsDto,
  ) {
    return this.usersService.assignPermissions(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('users:delete')
  @ApiOperation({ summary: 'Soft delete a user' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('users:update')
  @ApiOperation({ summary: 'Restore a soft deleted user' })
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.restore(id);
  }
}
