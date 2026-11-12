import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  RequestStatus,
  TechnicianAssignmentStatus,
  WorkLogStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateWorkLogDto, ReviewWorkLogDto } from './dto/work-log.dto';
import { PaginatedResult } from '../common/dto/paginated-result.dto';
import { QueryWorkLogDto } from './dto/query-work-log.dto';

const SELECT = {
  id: true,
  requestId: true,
  technicianId: true,
  workDone: true,
  completionNotes: true,
  timeSpentMinutes: true,
  logDate: true,
  status: true,
  rejectedAt: true,
  rejectedById: true,
  rejectionReason: true,
  createdAt: true,
  updatedAt: true,
  itemTechnicianId: true,
  technician: { select: { id: true, fullName: true, email: true } },
  rejectedBy: { select: { id: true, fullName: true } },
  request: {
    select: { id: true, ticketNumber: true, title: true, status: true },
  },
  items: {
    select: {
      requestItemId: true,
      notes: true,
      item: {
        select: {
          id: true,
          item: { select: { id: true, name: true } },
          issueType: { select: { id: true, name: true } },
        },
      },
    },
  },
  materials: {
    select: { id: true, name: true, quantity: true, unit: true },
  },
} satisfies Prisma.WorkLogSelect;

@Injectable()
export class WorkLogsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  private formatWorkLog(raw: any) {
    if (!raw) return null;
    return {
      ...raw,
      activity: raw.workDone,
      additionalNotes: raw.completionNotes,
      materials:
        raw.materials?.map((m: any) => ({
          id: m.id,
          name: m.name,
          quantity: m.quantity != null ? Number(m.quantity) : undefined,
          unit: m.unit,
        })) ?? [],
    };
  }

  async create(dto: CreateWorkLogDto, currentUserId?: string) {
    const request = await this.prisma.maintenanceRequest.findFirst({
      where: { id: dto.requestId, deletedAt: null },
      select: { id: true, status: true, ticketNumber: true },
    });
    if (!request) {
      throw new NotFoundException(
        `Maintenance request ${dto.requestId} not found`,
      );
    }

    const technicianId = dto.technicianId ?? currentUserId;
    if (!technicianId) {
      throw new BadRequestException('technicianId is required');
    }

    const workDone =
      dto.workDone?.trim() ||
      dto.activity?.trim() ||
      'Maintenance work performed';
    const completionNotes =
      dto.completionNotes?.trim() ||
      dto.additionalNotes?.trim() ||
      null;

    // 1. Resolve itemTechnician if provided or lookup
    const assignmentId = dto.itemTechnicianId ?? dto.assignmentId;
    let itemTechnician = assignmentId
      ? await this.prisma.itemTechnician.findUnique({
          where: { id: assignmentId },
          include: { requestItem: true },
        })
      : null;

    const targetItemId = dto.itemId ?? dto.items?.[0]?.requestItemId;
    if (!itemTechnician && targetItemId) {
      itemTechnician = await this.prisma.itemTechnician.findFirst({
        where: {
          requestItemId: targetItemId,
          technicianId,
        },
        include: { requestItem: true },
      });
    }

    if (!itemTechnician) {
      itemTechnician = await this.prisma.itemTechnician.findFirst({
        where: {
          technicianId,
          requestItem: {
            maintenanceRequestId: dto.requestId,
            deletedAt: null,
          },
        },
        include: { requestItem: true },
      });
    }

    // 2. Resolve items for WorkLogItem
    let itemsToCreate: Array<{ requestItemId: string; notes?: string }> = [];
    if (dto.items?.length) {
      const count = await this.prisma.maintenanceRequestItem.count({
        where: {
          id: { in: dto.items.map((item) => item.requestItemId) },
          maintenanceRequestId: dto.requestId,
        },
      });
      if (count !== dto.items.length) {
        throw new BadRequestException(
          'One or more request items do not belong to this request',
        );
      }
      itemsToCreate = dto.items.map((it) => ({
        requestItemId: it.requestItemId,
        notes: it.notes ?? completionNotes ?? undefined,
      }));
    } else if (itemTechnician) {
      itemsToCreate = [
        {
          requestItemId: itemTechnician.requestItemId,
          notes: completionNotes ?? undefined,
        },
      ];
    } else if (targetItemId) {
      itemsToCreate = [
        {
          requestItemId: targetItemId,
          notes: completionNotes ?? undefined,
        },
      ];
    }

    // 3. Resolve materials
    const materialsCreate = dto.materials?.length
      ? dto.materials
          .filter((m) => m.name && m.name.trim().length > 0)
          .map((m) => ({
            name: m.name.trim(),
            quantity: m.quantity != null ? new Prisma.Decimal(m.quantity) : null,
            unit: m.unit?.trim() || 'pcs',
          }))
      : undefined;

    // 4. Create the work log
    const workLog = await this.prisma.workLog.create({
      data: {
        requestId: dto.requestId,
        technicianId,
        workDone,
        completionNotes,
        timeSpentMinutes: dto.timeSpentMinutes ?? null,
        itemTechnicianId: itemTechnician?.id ?? null,
        items: itemsToCreate.length
          ? {
              create: itemsToCreate,
            }
          : undefined,
        materials: materialsCreate?.length
          ? {
              create: materialsCreate,
            }
          : undefined,
      },
      select: SELECT,
    });

    // 5. Update technician assignment status if applicable
    if (itemTechnician) {
      const targetStatus =
        dto.status === 'NOT_FIXED'
          ? TechnicianAssignmentStatus.NOT_FIXED
          : TechnicianAssignmentStatus.COMPLETED;

      await this.prisma.itemTechnician.update({
        where: { id: itemTechnician.id },
        data: {
          status: targetStatus,
          completedAt: new Date(),
        },
      });

      // 6. Check if all assignments across the request are completed / not fixed
      const allAssignments = await this.prisma.itemTechnician.findMany({
        where: {
          requestItem: {
            maintenanceRequestId: dto.requestId,
            deletedAt: null,
          },
        },
        select: { id: true, status: true },
      });

      const allDone =
        allAssignments.length > 0 &&
        allAssignments.every(
          (a) =>
            a.id === itemTechnician.id
              ? true
              : a.status === TechnicianAssignmentStatus.COMPLETED ||
                a.status === TechnicianAssignmentStatus.NOT_FIXED,
        );

      if (allDone) {
        const hasNotFixed = allAssignments.some((a) =>
          a.id === itemTechnician.id
            ? targetStatus === TechnicianAssignmentStatus.NOT_FIXED
            : a.status === TechnicianAssignmentStatus.NOT_FIXED,
        );

        const nextStatus = hasNotFixed
          ? RequestStatus.WAITING_CONFIRMATION
          : RequestStatus.WAITING_CONFIRMATION;

        if (
          request.status === RequestStatus.IN_PROGRESS ||
          request.status === RequestStatus.ASSIGNED
        ) {
          await this.prisma.$transaction([
            this.prisma.maintenanceRequest.update({
              where: { id: dto.requestId },
              data: { status: nextStatus },
            }),
            this.prisma.requestStatusHistory.create({
              data: {
                maintenanceRequestId: dto.requestId,
                fromStatus: request.status,
                toStatus: nextStatus,
                changedById: technicianId,
                reason: hasNotFixed
                  ? 'Diagnostic reports filed for all affected items'
                  : `All items serviced and confirmed completed (${workDone})`,
              },
            }),
          ]);

          const reqData = await this.prisma.maintenanceRequest.findUnique({
            where: { id: dto.requestId },
            select: { ticketNumber: true, requesterId: true },
          });
          if (reqData?.requesterId) {
            await this.notifications.notifyUser(
              reqData.requesterId,
              'WAITING_CONFIRMATION',
              {
                requestId: dto.requestId,
                ticketNumber: reqData.ticketNumber,
                message: `Technicians finished servicing ticket ${reqData.ticketNumber}. Please inspect equipment and confirm completion or report rework.`,
              },
            );
          }
        }
      }
    }

    return this.formatWorkLog(workLog);
  }

  async findAll(query: QueryWorkLogDto): Promise<PaginatedResult<unknown>> {
    const where: Prisma.WorkLogWhereInput = {
      ...(query.requestId ? { requestId: query.requestId } : {}),
      ...(query.technicianId ? { technicianId: query.technicianId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search ? { workDone: { contains: query.search } } : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.workLog.count({ where }),
      this.prisma.workLog.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: { [query.sortBy ?? 'logDate']: query.order },
        select: SELECT,
      }),
    ]);

    const formatted = data.map((item) => this.formatWorkLog(item));
    return PaginatedResult.of(formatted, total, query.page, query.limit);
  }

  async findOne(id: string) {
    const workLog = await this.prisma.workLog.findUnique({
      where: { id },
      select: SELECT,
    });
    if (!workLog) {
      throw new NotFoundException(`Work log ${id} not found`);
    }
    return this.formatWorkLog(workLog);
  }

  async review(id: string, dto: ReviewWorkLogDto, reviewerId?: string) {
    const workLog = await this.prisma.workLog.findUnique({
      where: { id },
      select: { id: true, status: true, itemTechnicianId: true, requestId: true },
    });
    if (!workLog) {
      throw new NotFoundException(`Work log ${id} not found`);
    }
    if (workLog.status !== WorkLogStatus.PENDING) {
      throw new BadRequestException(`Work log is already ${workLog.status}`);
    }
    if (dto.status === WorkLogStatus.REJECTED && !dto.rejectionReason?.trim()) {
      throw new BadRequestException(
        'A rejection reason is required when rejecting a work log',
      );
    }

    const updated = await this.prisma.workLog.update({
      where: { id },
      data: {
        status: dto.status,
        rejectionReason: dto.rejectionReason,
        rejectedAt: dto.status === WorkLogStatus.REJECTED ? new Date() : null,
        rejectedById:
          dto.status === WorkLogStatus.REJECTED ? (reviewerId ?? null) : null,
      },
      select: SELECT,
    });

    // If rejected and linked to itemTechnician, reopen assignment to IN_PROGRESS so technician can redo it
    if (dto.status === WorkLogStatus.REJECTED && workLog.itemTechnicianId) {
      await this.prisma.itemTechnician.update({
        where: { id: workLog.itemTechnicianId },
        data: { status: TechnicianAssignmentStatus.IN_PROGRESS },
      });
      await this.prisma.maintenanceRequest.update({
        where: { id: workLog.requestId },
        data: { status: RequestStatus.IN_PROGRESS },
      });

      const fullLog = await this.prisma.workLog.findUnique({
        where: { id },
        select: {
          technicianId: true,
          request: { select: { ticketNumber: true } },
        },
      });
      if (fullLog?.technicianId) {
        await this.notifications.notifyUser(
          fullLog.technicianId,
          'WORK_LOG_REJECTED',
          {
            requestId: workLog.requestId,
            ticketNumber: fullLog.request?.ticketNumber ?? '',
            reason: dto.rejectionReason,
            message: `Your work log for ticket ${fullLog.request?.ticketNumber ?? ''} was rejected: "${dto.rejectionReason}". Please update and resubmit.`,
          },
        );
      }
    }

    return this.formatWorkLog(updated);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.workLog.delete({ where: { id } });
  }
}
