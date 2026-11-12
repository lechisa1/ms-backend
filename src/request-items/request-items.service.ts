import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ApprovalStatus,
  AssignmentRole,
  Prisma,
  RequestPriority,
  RequestStatus,
  TechnicianAssignmentStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  AssignTechnicianDto,
  CreateRequestItemDto,
  UpdateTechnicianAssignmentDto,
} from './dto/request-item.dto';

const ITEM_SELECT = {
  id: true,
  maintenanceRequestId: true,
  itemId: true,
  issueCategoryId: true,
  issueTypeId: true,
  priority: true,
  description: true,
  createdAt: true,
  updatedAt: true,
  item: {
    select: {
      id: true,
      name: true,
      unitOfMeasure: true,
      status: true,
      category: { select: { id: true, name: true } },
    },
  },
  issueCategory: { select: { id: true, name: true, slug: true } },
  issueType: {
    select: {
      id: true,
      name: true,
      slug: true,
      needsApproval: true,
      category: { select: { id: true, name: true, slug: true } },
    },
  },
  technicians: {
    select: {
      id: true,
      technicianId: true,
      assignedById: true,
      status: true,
      isLead: true,
      roleInAssignment: true,
      notes: true,
      assignedAt: true,
      startedAt: true,
      completedAt: true,
      technician: { select: { id: true, fullName: true, email: true } },
      assignedBy: { select: { id: true, fullName: true } },
      workLogs: {
        select: {
          id: true,
          workDone: true,
          completionNotes: true,
          timeSpentMinutes: true,
          logDate: true,
          status: true,
          materials: { select: { id: true, name: true, quantity: true, unit: true } },
        },
        orderBy: { logDate: 'desc' },
        take: 1,
      },
    },
  },
} satisfies Prisma.MaintenanceRequestItemSelect;

@Injectable()
export class RequestItemsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  private formatItem(raw: any) {
    if (!raw) return null;
    return {
      ...raw,
      issueCategory: raw.issueCategory ?? raw.issueType?.category ?? null,
      technicians: raw.technicians?.map((tech: any) => ({
        id: tech.id,
        technicianId: tech.technicianId,
        assignedById: tech.assignedById,
        status: tech.status,
        isLead: tech.isLead,
        roleInAssignment: tech.roleInAssignment,
        notes: tech.notes,
        assignedAt: tech.assignedAt,
        startedAt: tech.startedAt,
        completedAt: tech.completedAt,
        technician: tech.technician,
        assignedBy: tech.assignedBy,
        workLog: tech.workLogs?.[0]
          ? {
              id: tech.workLogs[0].id,
              activity: tech.workLogs[0].workDone,
              timeSpentMinutes: tech.workLogs[0].timeSpentMinutes,
              additionalNotes: tech.workLogs[0].completionNotes,
              materials: tech.workLogs[0].materials?.map((m: any) => ({
                id: m.id,
                name: m.name,
                quantity: m.quantity != null ? Number(m.quantity) : undefined,
                unit: m.unit,
              })),
              status: tech.status === 'NOT_FIXED' ? 'NOT_FIXED' : 'COMPLETED',
              loggedAt: tech.workLogs[0].logDate,
            }
          : undefined,
      })) ?? [],
    };
  }

  async findByRequest(requestId: string) {
    await this.assertRequest(requestId);
    const items = await this.prisma.maintenanceRequestItem.findMany({
      where: { maintenanceRequestId: requestId, deletedAt: null },
      select: ITEM_SELECT,
      orderBy: { createdAt: 'asc' },
    });
    return items.map((it) => this.formatItem(it));
  }

  async findOne(id: string) {
    const item = await this.prisma.maintenanceRequestItem.findFirst({
      where: { id, deletedAt: null },
      select: ITEM_SELECT,
    });
    if (!item) {
      throw new NotFoundException(`Request item ${id} not found`);
    }
    return this.formatItem(item);
  }

  async create(requestId: string, dto: CreateRequestItemDto) {
    await this.assertRequest(requestId);

    const existing = await this.prisma.maintenanceRequestItem.findFirst({
      where: {
        maintenanceRequestId: requestId,
        itemId: dto.itemId,
        issueTypeId: dto.issueTypeId,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (existing) {
      throw new BadRequestException(
        'This item/issue type combination already exists on the request',
      );
    }

    const item = await this.prisma.maintenanceRequestItem.create({
      data: {
        maintenanceRequestId: requestId,
        itemId: dto.itemId,
        issueCategoryId: dto.issueCategoryId,
        issueTypeId: dto.issueTypeId,
        priority: dto.priority ?? RequestPriority.MEDIUM,
        description: dto.description,
      },
      select: ITEM_SELECT,
    });

    const issueType = await this.prisma.issueType.findUnique({
      where: { id: dto.issueTypeId },
      select: { needsApproval: true, name: true },
    });
    if (issueType?.needsApproval) {
      const parentReq = await this.prisma.maintenanceRequest.findUnique({
        where: { id: requestId },
        select: { status: true },
      });
      if (parentReq?.status === RequestStatus.PENDING) {
        await this.prisma.$transaction([
          this.prisma.maintenanceRequest.update({
            where: { id: requestId },
            data: { status: RequestStatus.WAITING_APPROVAL },
          }),
          this.prisma.approvalRequest.create({
            data: {
              maintenanceRequestId: requestId,
              maintenanceRequestItemId: item.id,
              status: ApprovalStatus.PENDING,
              notes: `Supervisor approval required for issue: ${issueType.name}`,
            },
          }),
          this.prisma.requestStatusHistory.create({
            data: {
              maintenanceRequestId: requestId,
              fromStatus: RequestStatus.PENDING,
              toStatus: RequestStatus.WAITING_APPROVAL,
              reason: `Item added requiring supervisor approval (${issueType.name})`,
            },
          }),
        ]);
      }
    }

    return this.formatItem(item);
  }

  async update(id: string, dto: Partial<CreateRequestItemDto>) {
    await this.findOne(id);
    const item = await this.prisma.maintenanceRequestItem.update({
      where: { id },
      data: dto,
      select: ITEM_SELECT,
    });
    return this.formatItem(item);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.maintenanceRequestItem.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private async assertRequest(requestId: string) {
    const request = await this.prisma.maintenanceRequest.findFirst({
      where: { id: requestId, deletedAt: null },
      select: { id: true },
    });
    if (!request) {
      throw new NotFoundException(`Maintenance request ${requestId} not found`);
    }
  }

  async assignTechnicians(
    itemId: string,
    dto: AssignTechnicianDto,
    assignedById?: string,
  ) {
    await this.findOne(itemId);

    const technicians = await this.prisma.user.findMany({
      where: {
        id: { in: dto.technicianIds },
        deletedAt: null,
        isActive: true,
        OR: [
          {
            roleAssignments: {
              some: {
                role: {
                  permissions: {
                    some: {
                      permission: {
                        name: 'tasks:technician',
                      },
                    },
                  },
                },
              },
            },
          },
          {
            permissionGrants: {
              some: {
                permission: {
                  name: 'tasks:technician',
                },
              },
            },
          },
        ],
      },
      select: { id: true },
    });

    if (technicians.length !== dto.technicianIds.length) {
      throw new NotFoundException(
        'One or more selected technicians were not found or do not have the tasks:technician permission',
      );
    }

    const effectiveLeadId =
      dto.leadTechnicianId ||
      (dto.isLead ? dto.technicianIds[0] : dto.technicianIds[0]);

    if (effectiveLeadId) {
      await this.prisma.itemTechnician.updateMany({
        where: {
          requestItemId: itemId,
          technicianId: { not: effectiveLeadId },
          isLead: true,
        },
        data: {
          isLead: false,
          roleInAssignment: AssignmentRole.ASSISTANT,
        },
      });
    }

    for (let i = 0; i < dto.technicianIds.length; i++) {
      const techId = dto.technicianIds[i];
      const isLead = techId === effectiveLeadId;
      const roleInAssignment =
        dto.roleInAssignment ??
        (isLead ? AssignmentRole.LEAD : AssignmentRole.ASSISTANT);

      await this.prisma.itemTechnician.upsert({
        where: {
          requestItemId_technicianId: {
            requestItemId: itemId,
            technicianId: techId,
          },
        },
        create: {
          requestItemId: itemId,
          technicianId: techId,
          assignedById: assignedById ?? null,
          status: TechnicianAssignmentStatus.ASSIGNED,
          isLead,
          roleInAssignment,
          notes: dto.notes,
        },
        update: {
          status: TechnicianAssignmentStatus.ASSIGNED,
          isLead,
          roleInAssignment,
          notes: dto.notes,
        },
      });
    }

    // Update maintenance request status to ASSIGNED if currently PENDING or APPROVED
    const itemRecord = await this.prisma.maintenanceRequestItem.findUnique({
      where: { id: itemId },
      select: {
        maintenanceRequestId: true,
        maintenanceRequest: { select: { status: true } },
      },
    });

    if (
      itemRecord &&
      (itemRecord.maintenanceRequest.status === RequestStatus.PENDING ||
        itemRecord.maintenanceRequest.status === RequestStatus.APPROVED)
    ) {
      await this.prisma.$transaction([
        this.prisma.maintenanceRequest.update({
          where: { id: itemRecord.maintenanceRequestId },
          data: { status: RequestStatus.ASSIGNED },
        }),
        this.prisma.requestStatusHistory.create({
          data: {
            maintenanceRequestId: itemRecord.maintenanceRequestId,
            fromStatus: itemRecord.maintenanceRequest.status,
            toStatus: RequestStatus.ASSIGNED,
            changedById: assignedById ?? null,
            reason: dto.notes
              ? `Assigned team: ${dto.notes}`
              : `Assigned ${dto.technicianIds.length} engineer(s) to affected asset`,
          },
        }),
      ]);
    }

    if (itemRecord) {
      const requestInfo = await this.prisma.maintenanceRequest.findUnique({
        where: { id: itemRecord.maintenanceRequestId },
        select: { id: true, ticketNumber: true, requesterId: true },
      });

      if (requestInfo) {
        // 1. Notify assigned technicians
        await this.notifications.notifyUsers(
          dto.technicianIds,
          'REQUEST_ASSIGNED',
          {
            requestId: requestInfo.id,
            ticketNumber: requestInfo.ticketNumber,
            itemId,
            message: `You have been assigned to maintenance ticket ${requestInfo.ticketNumber}.`,
          },
        );

        // 2. Notify requester
        if (requestInfo.requesterId && requestInfo.requesterId !== assignedById) {
          await this.notifications.notifyUser(
            requestInfo.requesterId,
            'REQUEST_ASSIGNED',
            {
              requestId: requestInfo.id,
              ticketNumber: requestInfo.ticketNumber,
              message: `Technicians have been assigned to your maintenance request ${requestInfo.ticketNumber}.`,
            },
          );
        }
      }
    }

    return this.findOne(itemId);
  }

  async unassignTechnician(itemId: string, assignmentId: string) {
    await this.findOne(itemId);
    return this.prisma.itemTechnician.update({
      where: { id: assignmentId },
      data: { status: TechnicianAssignmentStatus.CANCELLED },
      select: {
        id: true,
        technicianId: true,
        status: true,
        notes: true,
        technician: { select: { id: true, fullName: true } },
      },
    });
  }

  async updateAssignment(
    assignmentId: string,
    dto: UpdateTechnicianAssignmentDto,
    userId?: string,
  ) {
    const assignment = await this.prisma.itemTechnician.findUnique({
      where: { id: assignmentId },
      select: {
        id: true,
        status: true,
        requestItemId: true,
        technicianId: true,
        requestItem: {
          select: {
            maintenanceRequestId: true,
            maintenanceRequest: { select: { status: true } },
          },
        },
      },
    });
    if (!assignment) {
      throw new NotFoundException(`Assignment ${assignmentId} not found`);
    }

    if (userId && assignment.technicianId !== userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          permissionGrants: { include: { permission: true } },
          roleAssignments: {
            include: {
              role: {
                include: {
                  permissions: { include: { permission: true } },
                },
              },
            },
          },
        },
      });
      const perms = new Set<string>();
      user?.permissionGrants.forEach((pg) => perms.add(pg.permission.name));
      user?.roleAssignments.forEach((ra) =>
        ra.role.permissions.forEach((p) => perms.add(p.permission.name)),
      );
      if (
        !perms.has('*') &&
        !perms.has('tasks:ict-director') &&
        !perms.has('requests:assign-technicians')
      ) {
        throw new ForbiddenException(
          'You can only update your own assigned technician tasks.',
        );
      }
    }

    const data: Prisma.ItemTechnicianUpdateInput = { notes: dto.notes };

    if (dto.status) {
      data.status = dto.status;
      if (dto.status === TechnicianAssignmentStatus.IN_PROGRESS) {
        data.startedAt = new Date();
      }
      if (
        dto.status === TechnicianAssignmentStatus.COMPLETED ||
        dto.status === TechnicianAssignmentStatus.NOT_FIXED
      ) {
        data.completedAt = new Date();
      }
    }

    if (dto.isLead !== undefined) {
      data.isLead = dto.isLead;
      data.roleInAssignment = dto.isLead
        ? AssignmentRole.LEAD
        : AssignmentRole.ASSISTANT;
    }

    if (dto.roleInAssignment) {
      data.roleInAssignment = dto.roleInAssignment;
      data.isLead = dto.roleInAssignment === AssignmentRole.LEAD;
    }

    const updated = await this.prisma.itemTechnician.update({
      where: { id: assignmentId },
      data,
      select: {
        id: true,
        technicianId: true,
        status: true,
        isLead: true,
        roleInAssignment: true,
        notes: true,
        assignedAt: true,
        startedAt: true,
        completedAt: true,
        technician: { select: { id: true, fullName: true, email: true } },
        assignedBy: { select: { id: true, fullName: true } },
      },
    });

    const requestId = assignment.requestItem.maintenanceRequestId;
    const currentReqStatus = assignment.requestItem.maintenanceRequest.status;

    // Transition request to IN_PROGRESS if starting work
    if (dto.status === TechnicianAssignmentStatus.IN_PROGRESS) {
      if (
        currentReqStatus === RequestStatus.ASSIGNED ||
        currentReqStatus === RequestStatus.PENDING ||
        currentReqStatus === RequestStatus.APPROVED
      ) {
        await this.prisma.$transaction([
          this.prisma.maintenanceRequest.update({
            where: { id: requestId },
            data: { status: RequestStatus.IN_PROGRESS },
          }),
          this.prisma.requestStatusHistory.create({
            data: {
              maintenanceRequestId: requestId,
              fromStatus: currentReqStatus,
              toStatus: RequestStatus.IN_PROGRESS,
              changedById: userId ?? assignment.technicianId,
              reason: 'Technician commenced physical inspection & diagnosis',
            },
          }),
        ]);
      }

      const req = await this.prisma.maintenanceRequest.findUnique({
        where: { id: requestId },
        select: { ticketNumber: true, requesterId: true },
      });
      if (req?.requesterId && req.requesterId !== (userId ?? assignment.technicianId)) {
        const techName = updated.technician?.fullName ?? 'A technician';
        await this.notifications.notifyUser(req.requesterId, 'WORK_STARTED', {
          requestId,
          ticketNumber: req.ticketNumber,
          message: `${techName} started diagnostic/maintenance work on your request ${req.ticketNumber}.`,
        });
      }
    }

    // If assignment completed or not fixed, check if all assignments on this request are resolved
    if (
      dto.status === TechnicianAssignmentStatus.COMPLETED ||
      dto.status === TechnicianAssignmentStatus.NOT_FIXED
    ) {
      const allAssignments = await this.prisma.itemTechnician.findMany({
        where: {
          requestItem: { maintenanceRequestId: requestId, deletedAt: null },
        },
        select: { id: true, status: true },
      });

      const allResolved =
        allAssignments.length > 0 &&
        allAssignments.every(
          (a) =>
            a.id === assignmentId
              ? dto.status === TechnicianAssignmentStatus.COMPLETED ||
                dto.status === TechnicianAssignmentStatus.NOT_FIXED
              : a.status === TechnicianAssignmentStatus.COMPLETED ||
                a.status === TechnicianAssignmentStatus.NOT_FIXED,
        );

      if (allResolved && currentReqStatus === RequestStatus.IN_PROGRESS) {
        const hasNotFixed = allAssignments.some((a) =>
          a.id === assignmentId
            ? dto.status === TechnicianAssignmentStatus.NOT_FIXED
            : a.status === TechnicianAssignmentStatus.NOT_FIXED,
        );
        const nextStatus = RequestStatus.WAITING_CONFIRMATION;

        await this.prisma.$transaction([
          this.prisma.maintenanceRequest.update({
            where: { id: requestId },
            data: { status: nextStatus },
          }),
          this.prisma.requestStatusHistory.create({
            data: {
              maintenanceRequestId: requestId,
              fromStatus: currentReqStatus,
              toStatus: nextStatus,
              changedById: userId ?? assignment.technicianId,
              reason: hasNotFixed
                ? 'Diagnostic reports filed for all affected items'
                : 'All items serviced and confirmed completed',
            },
          }),
        ]);

        const req = await this.prisma.maintenanceRequest.findUnique({
          where: { id: requestId },
          select: { ticketNumber: true, requesterId: true },
        });
        if (req?.requesterId) {
          await this.notifications.notifyUser(req.requesterId, 'WAITING_CONFIRMATION', {
            requestId,
            ticketNumber: req.ticketNumber,
            message: `Technicians have finished servicing ticket ${req.ticketNumber}. Please inspect equipment and confirm completion or report rework.`,
          });
        }
      }
    }

    return updated;
  }

  async findByTechnician(technicianId: string) {
    return this.prisma.itemTechnician.findMany({
      where: {
        technicianId,
        requestItem: { maintenanceRequest: { deletedAt: null } },
      },
      select: {
        id: true,
        status: true,
        isLead: true,
        roleInAssignment: true,
        assignedAt: true,
        startedAt: true,
        completedAt: true,
        requestItem: {
          select: {
            id: true,
            description: true,
            item: { select: { id: true, name: true } },
            issueType: { select: { id: true, name: true } },
            maintenanceRequest: {
              select: {
                id: true,
                ticketNumber: true,
                title: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });
  }
}
