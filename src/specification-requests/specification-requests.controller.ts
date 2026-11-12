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
import { SpecificationRequestsService } from './specification-requests.service';
import { CreateSpecificationRequestDto } from './dto/create-specification-request.dto';
import {
  ApproveSpecificationRequestDto,
  ChangeSpecificationStatusDto,
  QuerySpecificationRequestDto,
  RejectSpecificationRequestDto,
  UpdateSpecificationRequestDto,
} from './dto/update-specification-request.dto';
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
      cb(null, getUploadDestination('spec-requests'));
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

@ApiTags('specification-requests')
@ApiBearerAuth()
@Controller('specification-requests')
export class SpecificationRequestsController {
  constructor(
    private readonly service: SpecificationRequestsService,
  ) {}

  @Post()
  @RequirePermissions('requests:create')
  @ApiOperation({ summary: 'Create a specification request' })
  create(
    @Body() dto: CreateSpecificationRequestDto,
    @CurrentUser('id') userId?: string,
  ) {
    return this.service.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List specification requests' })
  findAll(@Query() query: QuerySpecificationRequestDto) {
    return this.service.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Specification request counts by status and priority' })
  stats(@Query() query: QuerySpecificationRequestDto) {
    return this.service.stats(query);
  }

  @Get('ticket/:ticketNumber')
  @ApiOperation({ summary: 'Get a specification request by ticket number' })
  findByTicket(@Param('ticketNumber') ticketNumber: string) {
    return this.service.findByTicketNumber(ticketNumber);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specification request with all items and attachments' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('requests:update')
  @ApiOperation({ summary: 'Update a specification request' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSpecificationRequestDto,
  ) {
    return this.service.update(id, dto);
  }

  @Put(':id/status')
  @RequirePermissions('requests:update-status')
  @ApiOperation({ summary: 'Change specification request status' })
  changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChangeSpecificationStatusDto,
    @CurrentUser('id') userId?: string,
  ) {
    return this.service.changeStatus(id, dto, userId);
  }

  @Post(':id/approve')
  @RequirePermissions('requests:update-status')
  @ApiOperation({ summary: 'Approve a specification request' })
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApproveSpecificationRequestDto,
    @CurrentUser('id') userId?: string,
  ) {
    return this.service.approve(id, dto, userId);
  }

  @Post(':id/reject')
  @RequirePermissions('requests:update-status')
  @ApiOperation({ summary: 'Reject a specification request' })
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectSpecificationRequestDto,
    @CurrentUser('id') userId?: string,
  ) {
    return this.service.reject(id, dto, userId);
  }

  @Post(':id/files')
  @RequirePermissions('requests:create', 'requests:update')
  @UseInterceptors(FilesInterceptor('files', 10, uploadOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Attach files to a specification request' })
  uploadFiles(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @UploadedFiles() files: Express.Multer.File[] = [],
  ) {
    return this.service.addFiles(id, userId, files ?? []);
  }

  @Get(':id/files')
  @ApiOperation({ summary: 'Files attached to a specification request' })
  listFiles(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id).then((request) => request?.files ?? []);
  }

  @Get(':id/files/:fileId/download')
  @Public()
  @ApiOperation({ summary: 'Download or stream an attached file from a specification request' })
  async downloadFile(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('fileId', ParseUUIDPipe) fileId: string,
    @Res() res: Response,
  ) {
    const file = await this.service.getFile(id, fileId);
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
  @ApiOperation({ summary: 'Download or stream an attached file from a specification request directly by file ID' })
  async downloadFileDirect(
    @Param('fileId', ParseUUIDPipe) fileId: string,
    @Res() res: Response,
  ) {
    const file = await this.service.getFile(fileId, fileId);
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
  @ApiOperation({ summary: 'Delete an attached file from a specification request' })
  deleteFile(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('fileId', ParseUUIDPipe) fileId: string,
  ) {
    return this.service.removeFile(id, fileId);
  }

  @Delete(':id')
  @RequirePermissions('requests:delete')
  @ApiOperation({ summary: 'Soft delete a specification request' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('requests:delete')
  @ApiOperation({ summary: 'Restore a soft deleted specification request' })
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.restore(id);
  }
}
