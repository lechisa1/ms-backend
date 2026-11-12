import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApprovalStatus, Prisma, RequestStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateApprovalRequestDto,
  QueryApprovalRequestDto,
  ReviewApprovalDto,
} from './dto/approval.dto';
import { PaginatedResult } from '../common/dto/paginated-result.dto';

const SELECT = {
  id: true,
  maintenanceRequestId: true,
  maintenanceRequestItemId: true,
  technicianId: true,
  reviewedById: true,
  status: true,
  notes: true,
  forwardedAt: true,
  reviewedAt: true,
  createdAt: true,
  updatedAt: true,
  technician: { select: { id: true, fullName: true, email: true } },
  reviewer: { select: { id: true, fullName: true } },
  maintenanceRequest: {
    select: { id: true, ticketNumber: true, title: true, status: true },
  },
  requestItem: {
    select: {
      id: true,
      description: true,
      item: { select: { id: true, name: true } },
      issueType: { select: { id: true, name: true } },
    },
  },
} satisfies Prisma.ApprovalRequestSelect;

@Injectable()
export class ApprovalsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateApprovalRequestDto) {
    const request = await this.prisma.maintenanceRequest.findFirst({
      where: { id: dto.maintenanceRequestId, deletedAt: null },
      select: { id: true },
    });
    if (!request) {
      throw new NotFoundException(
        `Maintenance request ${dto.maintenanceRequestId} not found`,
      );
    }

    const approval = await this.prisma.approvalRequest.create({
      data: {
        maintenanceRequestId: dto.maintenanceRequestId,
        maintenanceRequestItemId: dto.maintenanceRequestItemId,
        technicianId: dto.technicianId,
        notes: dto.notes,
      },
      select: SELECT,
    });

    await this.prisma.maintenanceRequest.update({
      where: { id: dto.maintenanceRequestId },
      data: { status: RequestStatus.WAITING_APPROVAL },
    });

    return approval;
  }

  async findAll(
    query: QueryApprovalRequestDto,
  ): Promise<PaginatedResult<unknown>> {
    const where: Prisma.ApprovalRequestWhereInput = {
      deletedAt: null,
      ...(query.maintenanceRequestId
        ? { maintenanceRequestId: query.maintenanceRequestId }
        : {}),
      ...(query.technicianId ? { technicianId: query.technicianId } : {}),
      ...(query.status ? { status: query.status } : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.approvalRequest.count({ where }),
      this.prisma.approvalRequest.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: { [query.sortBy ?? 'createdAt']: query.order },
        select: SELECT,
      }),
    ]);

    return PaginatedResult.of(data, total, query.page, query.limit);
  }

  async findOne(id: string) {
    const approval = await this.prisma.approvalRequest.findFirst({
      where: { id, deletedAt: null },
      select: SELECT,
    });
    if (!approval) {
      throw new NotFoundException(`Approval request ${id} not found`);
    }
    return approval;
  }

  async forward(id: string) {
    const approval = await this.findOne(id);
    if (approval.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException(
        `Only PENDING approvals can be forwarded, current status is ${approval.status}`,
      );
    }

    return this.prisma.approvalRequest.update({
      where: { id },
      data: { status: ApprovalStatus.FORWARDED, forwardedAt: new Date() },
      select: SELECT,
    });
  }

  async review(id: string, dto: ReviewApprovalDto, reviewerId?: string) {
    const approval = await this.findOne(id);

    if (
      approval.status !== ApprovalStatus.PENDING &&
      approval.status !== ApprovalStatus.FORWARDED
    ) {
      throw new BadRequestException(
        `Approval is already ${approval.status} and cannot be reviewed`,
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.approvalRequest.update({
        where: { id },
        data: {
          status: dto.status,
          notes: dto.notes ?? approval.notes,
          reviewedAt: new Date(),
          reviewedById: reviewerId ?? null,
        },
        select: SELECT,
      });

      await tx.maintenanceRequest.update({
        where: { id: approval.maintenanceRequestId },
        data: {
          status:
            dto.status === ApprovalStatus.APPROVED
              ? RequestStatus.PENDING_APPROVAL_REVIEW
              : RequestStatus.REJECTED,
        },
      });

      await tx.requestStatusHistory.create({
        data: {
          maintenanceRequestId: approval.maintenanceRequestId,
          fromStatus: approval.maintenanceRequest.status,
          toStatus:
            dto.status === ApprovalStatus.APPROVED
              ? RequestStatus.PENDING_APPROVAL_REVIEW
              : RequestStatus.REJECTED,
          changedById: reviewerId ?? null,
          reason: dto.notes ?? null,
        },
      });

      return result;
    });

    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.approvalRequest.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
