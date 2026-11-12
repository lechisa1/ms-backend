import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
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
import { SpecificationItemsService } from './specification-items.service';
import {
  CreateSpecificationItemDto,
  UpdateSpecificationItemDto,
} from './dto/specification-item.dto';
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
      cb(null, getUploadDestination('specifications'));
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

@ApiTags('specification-items')
@ApiBearerAuth()
@Controller('specification-items')
export class SpecificationItemsController {
  constructor(private readonly service: SpecificationItemsService) {}

  @Post('request/:requestId')
  @RequirePermissions('requests:update')
  @ApiOperation({ summary: 'Add a specification item to a request' })
  create(
    @Param('requestId', ParseUUIDPipe) requestId: string,
    @Body() dto: CreateSpecificationItemDto,
  ) {
    return this.service.create(requestId, dto);
  }

  @Get('request/:requestId')
  @ApiOperation({ summary: 'Specification items of a request' })
  findByRequest(@Param('requestId', ParseUUIDPipe) requestId: string) {
    return this.service.findByRequest(requestId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specification item' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('requests:update')
  @ApiOperation({ summary: 'Update a specification item' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSpecificationItemDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('requests:update')
  @ApiOperation({ summary: 'Soft delete a specification item' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }

  @Post(':id/files')
  @RequirePermissions('requests:create', 'requests:update')
  @UseInterceptors(FilesInterceptor('files', 10, uploadOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Attach files to a specification item' })
  uploadFiles(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @UploadedFiles() files: Express.Multer.File[] = [],
  ) {
    return this.service.addFiles(id, userId, files ?? []);
  }

  @Get(':id/files/:fileId/download')
  @Public()
  @ApiOperation({ summary: 'Download or stream an attached specification item file' })
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
  @ApiOperation({ summary: 'Download or stream an attached specification item file directly by file ID' })
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
  @ApiOperation({ summary: 'Delete a specification item file' })
  removeFile(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('fileId', ParseUUIDPipe) fileId: string,
  ) {
    return this.service.removeFile(id, fileId);
  }
}
