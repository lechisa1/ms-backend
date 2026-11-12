import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, RequestPriority } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateSpecificationItemDto,
  UpdateSpecificationItemDto,
} from './dto/specification-item.dto';

const SELECT = {
  id: true,
  specificationRequestId: true,
  categoryId: true,
  requestedItemName: true,
  quantity: true,
  unitOfMeasure: true,
  priority: true,
  description: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { id: true, name: true } },
  files: {
    select: {
      id: true,
      fileName: true,
      originalName: true,
      mimeType: true,
      sizeBytes: true,
      createdAt: true,
    },
  },
} satisfies Prisma.SpecificationItemSelect;

@Injectable()
export class SpecificationItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByRequest(requestId: string) {
    const request = await this.prisma.specificationRequest.findFirst({
      where: { id: requestId, deletedAt: null },
      select: { id: true },
    });
    if (!request) {
      return [];
    }

    const items = await this.prisma.specificationItem.findMany({
      where: { specificationRequestId: requestId, deletedAt: null },
      select: SELECT,
      orderBy: { createdAt: 'asc' },
    });

    return items.map((it) => ({
      ...it,
      maintenanceRequestId: it.specificationRequestId,
    }));
  }

  async findOne(id: string) {
    const item = await this.prisma.specificationItem.findFirst({
      where: { id, deletedAt: null },
      select: SELECT,
    });
    if (!item) {
      throw new NotFoundException(`Specification item ${id} not found`);
    }
    return {
      ...item,
      maintenanceRequestId: item.specificationRequestId,
    };
  }

  async create(requestId: string, dto: CreateSpecificationItemDto) {
    const request = await this.prisma.specificationRequest.findFirst({
      where: { id: requestId, deletedAt: null },
      select: { id: true, priority: true },
    });
    if (!request) {
      throw new NotFoundException(`Specification request ${requestId} not found`);
    }

    const item = await this.prisma.specificationItem.create({
      data: {
        specificationRequestId: requestId,
        requestedItemName: dto.requestedItemName,
        quantity: dto.quantity ?? 1,
        unitOfMeasure: dto.unitOfMeasure,
        priority: dto.priority ?? request.priority ?? RequestPriority.MEDIUM,
        categoryId: dto.categoryId,
        description: dto.description,
      },
      select: SELECT,
    });

    return {
      ...item,
      maintenanceRequestId: item.specificationRequestId,
    };
  }

  async update(id: string, dto: UpdateSpecificationItemDto) {
    await this.findOne(id);
    const item = await this.prisma.specificationItem.update({
      where: { id },
      data: dto,
      select: SELECT,
    });
    return {
      ...item,
      maintenanceRequestId: item.specificationRequestId,
    };
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.specificationItem.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async addFiles(itemId: string, userId: string, files: Express.Multer.File[]) {
    await this.findOne(itemId);

    if (!files.length) {
      throw new BadRequestException('No files were uploaded');
    }

    const data = files.map((file) => ({
      specificationItemId: itemId,
      uploadedById: userId,
      fileName: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      storageKey: `specifications/${file.filename}`,
      sizeBytes: BigInt(file.size),
    }));

    await this.prisma.specificationItemFile.createMany({ data });

    return this.prisma.specificationItemFile.findMany({
      where: {
        specificationItemId: itemId,
        fileName: { in: files.map((file) => file.filename) },
      },
      select: {
        id: true,
        fileName: true,
        originalName: true,
        mimeType: true,
        sizeBytes: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getFile(itemId: string, fileId: string) {
    const file = await this.prisma.specificationItemFile.findFirst({
      where: { id: fileId, specificationItemId: itemId },
    });
    if (file) return file;

    const fallback =
      (await this.prisma.specificationItemFile.findUnique({ where: { id: fileId } })) ||
      (await this.prisma.specificationRequestFile.findUnique({ where: { id: fileId } })) ||
      (await this.prisma.maintenanceRequestFile.findUnique({ where: { id: fileId } }));
    if (fallback) return fallback;

    throw new NotFoundException(`File ${fileId} not found`);
  }

  async removeFile(itemId: string, fileId: string) {
    await this.findOne(itemId);
    return this.prisma.specificationItemFile.deleteMany({
      where: { id: fileId, specificationItemId: itemId },
    });
  }
}
