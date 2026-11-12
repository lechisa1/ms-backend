import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync, existsSync, createReadStream } from 'fs';
import { randomUUID } from 'crypto';
import type { Response } from 'express';
import { RequestsService } from './requests.service';
import { CreateMaintenanceRequestDto } from './dto/create-request.dto';
import {
  AddRequestUpdateDto,
  ChangeStatusDto,
  QueryMaintenanceRequestDto,
  UpdateMaintenanceRequestDto,
} from './dto/update-request.dto';
import { QueryMyTasksDto } from './dto/query-my-tasks.dto';
import { SpecificationItemsService } from '../specification-items/specification-items.service';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { findFileOnDisk, getUploadDestination } from '../common/utils/file-upload.util';

const uploadOptions = {
  storage: diskStorage({
    destination: (
      _req: unknown,
      _file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void,
    ) => {
      cb(null, getUploadDestination('requests'));
    },
    filename: (
      _req: unknown,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void,
    ) => {
      cb(null, `${randomUUID()}${extname(file.originalname)}`);
    },
  }),
  limits: {
    fileSize: Number(process.env.MAX_FILE_SIZE_BYTES ?? 10485760),
    files: 10,
  },
};

@ApiTags('maintenance-requests')
@ApiBearerAuth()
@Controller('requests')
export class RequestsController {
  constructor(
    private readonly requestsService: RequestsService,
    private readonly specificationItemsService: SpecificationItemsService,
  ) {}

  @Post()
  @RequirePermissions('requests:create')
  @ApiOperation({ summary: 'Create a maintenance request' })
  create(
    @Body() dto: CreateMaintenanceRequestDto,
    @CurrentUser('id') userId?: string,
  ) {
    return this.requestsService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List maintenance requests' })
  findAll(@Query() query: QueryMaintenanceRequestDto) {
    return this.requestsService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Request counts by status and priority' })
  stats(@Query() query: QueryMaintenanceRequestDto) {
    return this.requestsService.stats(query);
  }

  @Get('my-tasks')
  @ApiOperation({ summary: 'Get assigned tasks and requests requiring review for current user' })
  getMyTasks(
    @CurrentUser('id') userId: string,
    @Query() query: QueryMyTasksDto,
  ) {
    return this.requestsService.getMyTasks(userId, query);
  }

  @Get('ticket/:ticketNumber')
  @ApiOperation({ summary: 'Get a request by ticket number' })
  findByTicket(@Param('ticketNumber') ticketNumber: string) {
    return this.requestsService.findByTicketNumber(ticketNumber);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a request with all related data' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.requestsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('requests:update')
  @ApiOperation({ summary: 'Update a request' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMaintenanceRequestDto,
  ) {
    return this.requestsService.update(id, dto);
  }

  @Put(':id/status')
  @RequirePermissions('requests:update-status')
  @ApiOperation({ summary: 'Change request status' })
  changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChangeStatusDto,
    @CurrentUser('id') userId?: string,
  ) {
    return this.requestsService.changeStatus(id, dto, userId);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve a request' })
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { notes?: string },
    @CurrentUser('id') userId?: string,
  ) {
    return this.requestsService.approve(id, dto?.notes, userId);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject a request' })
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { reason: string },
    @CurrentUser('id') userId?: string,
  ) {
    return this.requestsService.reject(id, dto?.reason, userId);
  }

  @Post(':id/confirm-completion')
  @ApiOperation({ summary: 'Requester confirms technician work completion' })
  confirmCompletion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { notes?: string },
    @CurrentUser('id') userId?: string,
  ) {
    return this.requestsService.confirmCompletion(id, dto?.notes, userId);
  }

  @Post(':id/reject-work')
  @ApiOperation({ summary: 'Requester rejects technician work and requests rework' })
  rejectWork(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { reason: string },
    @CurrentUser('id') userId?: string,
  ) {
    return this.requestsService.rejectWork(id, dto?.reason, userId);
  }

  @Post(':id/updates')
  @ApiOperation({ summary: 'Add a progress update to a request' })
  addUpdate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddRequestUpdateDto,
    @CurrentUser('id') userId?: string,
  ) {
    return this.requestsService.addUpdate(id, {
      ...dto,
      userId: dto.userId ?? userId,
    });
  }

  @Get(':id/status-history')
  @ApiOperation({ summary: 'Status history of a request' })
  statusHistory(@Param('id', ParseUUIDPipe) id: string) {
    return this.requestsService.statusHistory(id);
  }

  @Post(':id/files')
  @RequirePermissions('requests:create', 'requests:update')
  @UseInterceptors(FilesInterceptor('files', 10, uploadOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Attach files to a request' })
  uploadFiles(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @UploadedFiles() files: Express.Multer.File[] = [],
  ) {
    return this.requestsService.addFiles(id, userId, files ?? []);
  }

  @Get(':id/files')
  @ApiOperation({ summary: 'Files attached to a request' })
  listFiles(@Param('id', ParseUUIDPipe) id: string) {
    return this.requestsService.findOne(id).then((request) => request?.files ?? []);
  }

  @Get(':id/files/:fileId/download')
  @Public()
  @ApiOperation({ summary: 'Download or stream an attached file' })
  async downloadFile(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('fileId', ParseUUIDPipe) fileId: string,
    @Res() res: Response,
  ) {
    const file = await this.requestsService.getFile(id, fileId);
    const filePath = findFileOnDisk(file.fileName, (file as any).storageKey);
    if (!filePath) {
      throw new NotFoundException(`File ${file.fileName} not found on disk`);
    }
    res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(file.originalName || file.fileName)}"`,
    );
    createReadStream(filePath).pipe(res);
  }

  @Get('files/:fileId/download')
  @Public()
  @ApiOperation({ summary: 'Download or stream an attached file directly by file ID' })
  async downloadFileDirect(
    @Param('fileId', ParseUUIDPipe) fileId: string,
    @Res() res: Response,
  ) {
    const file = await this.requestsService.getFile(fileId, fileId);
    const filePath = findFileOnDisk(file.fileName, (file as any).storageKey);
    if (!filePath) {
      throw new NotFoundException(`File ${file.fileName} not found on disk`);
    }
    res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(file.originalName || file.fileName)}"`,
    );
    createReadStream(filePath).pipe(res);
  }

  @Delete(':id/files/:fileId')
  @RequirePermissions('requests:update')
  @ApiOperation({ summary: 'Delete an attached file' })
  deleteFile(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('fileId', ParseUUIDPipe) fileId: string,
  ) {
    return this.requestsService.removeFile(id, fileId);
  }

  @Get(':id/specification-items')
  @ApiOperation({ summary: 'Specification items of a request' })
  specificationItems(@Param('id', ParseUUIDPipe) id: string) {
    return this.specificationItemsService.findByRequest(id);
  }

  @Delete(':id')
  @RequirePermissions('requests:delete')
  @ApiOperation({ summary: 'Soft delete a request' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.requestsService.remove(id);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('requests:delete')
  @ApiOperation({ summary: 'Restore a soft deleted request' })
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.requestsService.restore(id);
  }
}
