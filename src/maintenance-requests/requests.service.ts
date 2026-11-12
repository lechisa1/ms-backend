import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import {
  ApprovalStatus,
  OrganizationMembershipRole,
  Prisma,
  RequestPriority,
  RequestStatus,
  TechnicianAssignmentStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateMaintenanceRequestDto,
  CreateRequestItemDto,
  RequestTypeEnum,
} from './dto/create-request.dto';
import { CreateSpecificationItemDto } from '../specification-requests/dto/create-specification-request.dto';
import {
  AddRequestUpdateDto,
  ChangeStatusDto,
  QueryMaintenanceRequestDto,
  UpdateMaintenanceRequestDto,
} from './dto/update-request.dto';
import { QueryMyTasksDto } from './dto/query-my-tasks.dto';
import { PaginatedResult } from '../common/dto/paginated-result.dto';
import { NotificationsService } from '../notifications/notifications.service';

const MAINTENANCE_SELECT = {
  id: true,
  ticketNumber: true,
  priority: true,
  status: true,
  title: true,
  description: true,
  rejectionReason: true,
  requestedAt: true,
  createdAt: true,
  updatedAt: true,
  requesterId: true,
  requester: {
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      organizationUnitId: true,
      organizationUnit: { select: { id: true, name: true, code: true } },
    },
  },
  items: {
    where: { deletedAt: null },
    select: {
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
          notes: true,
          isLead: true,
          roleInAssignment: true,
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
    },
  },
  files: {
    select: {
      id: true,
      fileName: true,
      originalName: true,
      mimeType: true,
      fileType: true,
      sizeBytes: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  },
  _count: { select: { workLogs: true, approvalRequests: true, updates: true } },
} satisfies Prisma.MaintenanceRequestSelect;

const SPECIFICATION_SELECT = {
  id: true,
  ticketNumber: true,
  priority: true,
  status: true,
  title: true,
  description: true,
  rejectionReason: true,
  requestedAt: true,
  createdAt: true,
  updatedAt: true,
  requesterId: true,
  requester: {
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      organizationUnitId: true,
      organizationUnit: { select: { id: true, name: true, code: true } },
    },
  },
  items: {
    where: { deletedAt: null },
    select: {
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
    },
    orderBy: { createdAt: 'asc' },
  },
  files: {
    select: {
      id: true,
      fileName: true,
      originalName: true,
      mimeType: true,
      fileType: true,
      sizeBytes: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  },
} satisfies Prisma.SpecificationRequestSelect;

@Injectable()
export class RequestsService {
  private readonly logger = new Logger(RequestsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  private generateTicketNumber(prefix = 'MTN'): string {
    const now = new Date();
    const datePart = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('');
    const random = randomBytes(3).toString('hex').toUpperCase();
    return `${prefix}-${datePart}-${random}`;
  }

  private formatMaintenanceRequest(raw: any) {
    if (!raw) return null;
    return {
      id: raw.id,
      ticketNumber: raw.ticketNumber,
      requestType: RequestTypeEnum.MAINTENANCE,
      priority: raw.priority,
      status: raw.status,
      title: raw.title,
      description: raw.description,
      rejectionReason: raw.rejectionReason,
      requestedAt: raw.requestedAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      requesterId: raw.requesterId,
      requester: raw.requester
        ? {
            id: raw.requester.id,
            fullName: raw.requester.fullName,
            email: raw.requester.email,
            phone: raw.requester.phone,
            organizationUnit: raw.requester.organizationUnit,
          }
        : null,
      organizationUnitId: raw.requester?.organizationUnitId ?? null,
      organizationUnit: raw.requester?.organizationUnit ?? null,
      items:
        raw.items?.map((it: any) => ({
          id: it.id,
          maintenanceRequestId: it.maintenanceRequestId,
          itemId: it.itemId,
          issueCategoryId: it.issueCategoryId,
          issueTypeId: it.issueTypeId,
          priority: it.priority,
          description: it.description,
          createdAt: it.createdAt,
          updatedAt: it.updatedAt,
          item: it.item
            ? {
                id: it.item.id,
                name: it.item.name,
                code: it.item.id,
                unitOfMeasure: it.item.unitOfMeasure,
                status: it.item.status,
                category: it.item.category,
              }
            : null,
          issueCategory: it.issueCategory ?? it.issueType?.category ?? null,
          issueType: it.issueType
            ? {
                id: it.issueType.id,
                name: it.issueType.name,
                slug: it.issueType.slug,
                needsApproval: it.issueType.needsApproval,
                category: it.issueType.category,
              }
            : null,
          technicians:
            it.technicians?.map((tech: any) => ({
              id: tech.id,
              technicianId: tech.technicianId,
              assignedById: tech.assignedById,
              status: tech.status,
              notes: tech.notes,
              isLead: tech.isLead,
              roleInAssignment: tech.roleInAssignment,
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
        })) ?? [],
      specificationItems: [],
      files:
        raw.files?.map((f: any) => ({
          ...f,
          sizeBytes: Number(f.sizeBytes),
          downloadUrl: `/api/requests/${raw.id}/files/${f.id}/download`,
          previewUrl: `/api/requests/${raw.id}/files/${f.id}/download`,
        })) ?? [],
      statusHistory: raw.statusHistory ?? [],
      updates: raw.updates ?? [],
      workLogs: raw.workLogs ?? [],
      approvalRequests: raw.approvalRequests ?? [],
      _count: raw._count ?? { workLogs: 0, approvalRequests: 0, updates: 0 },
    };
  }

  private formatSpecificationRequest(raw: any) {
    if (!raw) return null;
    return {
      id: raw.id,
      ticketNumber: raw.ticketNumber,
      requestType: RequestTypeEnum.SPECIFICATION,
      priority: raw.priority,
      status: raw.status,
      title: raw.title,
      description: raw.description,
      rejectionReason: raw.rejectionReason,
      requestedAt: raw.requestedAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      requesterId: raw.requesterId,
      requester: raw.requester
        ? {
            id: raw.requester.id,
            fullName: raw.requester.fullName,
            email: raw.requester.email,
            phone: raw.requester.phone,
            organizationUnit: raw.requester.organizationUnit,
          }
        : null,
      organizationUnitId: raw.requester?.organizationUnitId ?? null,
      organizationUnit: raw.requester?.organizationUnit ?? null,
      items: [],
      specificationItems:
        raw.items?.map((it: any) => ({
          id: it.id,
          maintenanceRequestId: raw.id,
          specificationRequestId: raw.id,
          categoryId: it.categoryId,
          requestedItemName: it.requestedItemName,
          quantity: it.quantity,
          unitOfMeasure: it.unitOfMeasure,
          priority: it.priority,
          description: it.description,
          createdAt: it.createdAt,
          updatedAt: it.updatedAt,
          category: it.category,
          files:
            it.files?.map((f: any) => ({
              ...f,
              sizeBytes: Number(f.sizeBytes),
              downloadUrl: `/api/specification-items/${it.id}/files/${f.id}/download`,
              previewUrl: `/api/specification-items/${it.id}/files/${f.id}/download`,
            })) ?? [],
        })) ?? [],
      files:
        raw.files?.map((f: any) => ({
          ...f,
          sizeBytes: Number(f.sizeBytes),
          downloadUrl: `/api/requests/${raw.id}/files/${f.id}/download`,
          previewUrl: `/api/requests/${raw.id}/files/${f.id}/download`,
        })) ?? [],
      statusHistory: [],
      updates: [],
      workLogs: [],
      approvalRequests: [],
      _count: { workLogs: 0, approvalRequests: 0, updates: 0 },
    };
  }

  async create(dto: CreateMaintenanceRequestDto, currentUserId?: string) {
    const isSpecification = (dto as any).requestType === 'SPECIFICATION';
    const requesterId = currentUserId ?? null;

    if (requesterId) {
      const requester = await this.prisma.user.findFirst({
        where: { id: requesterId, deletedAt: null },
        select: { id: true },
      });
      if (!requester) {
        throw new NotFoundException(`Requester ${requesterId} not found`);
      }
    }

    if (isSpecification) {
      const ticketNumber = this.generateTicketNumber('SPEC');
      const specItems = (dto as any).specificationItems ?? (dto as any).items ?? [];

      const specReq = await this.prisma.specificationRequest.create({
        data: {
          ticketNumber,
          requesterId,
          priority: dto.priority ?? RequestPriority.MEDIUM,
          status: RequestStatus.PENDING,
          title: dto.title,
          description: dto.description,
          items: specItems.length
            ? {
                create: specItems.map((item: any) => ({
                  categoryId: item.categoryId ?? item.itemCategoryId ?? null,
                  requestedItemName:
                    item.requestedItemName ?? item.itemName ?? 'Requested Item',
                  quantity: item.quantity ?? 1,
                  unitOfMeasure: item.unitOfMeasure ?? null,
                  priority: item.priority ?? dto.priority ?? RequestPriority.MEDIUM,
                  description: item.description ?? null,
                })),
              }
            : undefined,
        },
        select: SPECIFICATION_SELECT,
      });

      if (requesterId) {
        await this.notifications.notifyUser(requesterId, 'REQUEST_CREATED', {
          requestId: specReq.id,
          ticketNumber: specReq.ticketNumber,
          title: specReq.title ?? 'Specification Request',
          message: `Your specification request ${specReq.ticketNumber} was submitted successfully.`,
        });
      }

      await this.notifications.notifyUsersWithPermissions(
        ['tasks:ict-director', 'requests:assign-technicians'],
        'REQUEST_CREATED',
        {
          requestId: specReq.id,
          ticketNumber: specReq.ticketNumber,
          title: specReq.title ?? 'Specification Request',
          message: `New specification request ${specReq.ticketNumber} submitted.`,
        },
        requesterId ? [requesterId] : [],
      );

      return this.formatSpecificationRequest(specReq);
    }

    // Default: MAINTENANCE
    const ticketNumber = this.generateTicketNumber('MTN');
    const maintItems = dto.items ?? dto.maintenanceItems ?? [];

    const issueTypeIds = maintItems.map((i) => i.issueTypeId).filter(Boolean);
    const approvalItem =
      issueTypeIds.length > 0
        ? await this.prisma.issueType.findFirst({
            where: {
              id: { in: issueTypeIds },
              needsApproval: true,
              deletedAt: null,
            },
            select: { id: true, name: true },
          })
        : null;

    const initialStatus = approvalItem
      ? RequestStatus.WAITING_APPROVAL
      : RequestStatus.PENDING;

    const initialReason = approvalItem
      ? `Initial request submitted — requires supervisor approval due to issue type '${approvalItem.name}'`
      : 'Request created';

    const maintReq = await this.prisma.maintenanceRequest.create({
      data: {
        ticketNumber,
        requesterId,
        priority: dto.priority ?? RequestPriority.MEDIUM,
        status: initialStatus,
        title: dto.title,
        description: dto.description,
        items: maintItems.length
          ? {
              create: maintItems.map((item) => ({
                itemId: item.itemId,
                issueCategoryId: item.issueCategoryId ?? null,
                issueTypeId: item.issueTypeId,
                priority: item.priority ?? dto.priority ?? RequestPriority.MEDIUM,
                description: item.description ?? null,
              })),
            }
          : undefined,
        approvalRequests: approvalItem
          ? {
              create: {
                status: ApprovalStatus.PENDING,
                notes: `Supervisor approval required for issue: ${approvalItem.name}`,
              },
            }
          : undefined,
        statusHistory: {
          create: {
            toStatus: initialStatus,
            changedById: currentUserId ?? null,
            reason: initialReason,
          },
        },
      },
      select: MAINTENANCE_SELECT,
    });

    if (approvalItem) {
      const supervisorId = requesterId
        ? await this.resolveApprovingSupervisorId(requesterId)
        : null;
      if (supervisorId) {
        await this.notifications.notifyUser(supervisorId, 'APPROVAL_NEEDED', {
          requestId: maintReq.id,
          ticketNumber: maintReq.ticketNumber,
          title: maintReq.title ?? 'Maintenance Request',
          message: `New maintenance request ${maintReq.ticketNumber} requires your supervisor review and approval.`,
        });
      }
      if (requesterId) {
        await this.notifications.notifyUser(requesterId, 'REQUEST_CREATED', {
          requestId: maintReq.id,
          ticketNumber: maintReq.ticketNumber,
          title: maintReq.title ?? 'Maintenance Request',
          message: `Your maintenance request ${maintReq.ticketNumber} was submitted and is pending supervisor approval.`,
        });
      }
    } else {
      await this.notifications.notifyUsersWithPermissions(
        ['tasks:ict-director', 'requests:assign-technicians'],
        'REQUEST_CREATED',
        {
          requestId: maintReq.id,
          ticketNumber: maintReq.ticketNumber,
          title: maintReq.title ?? 'Maintenance Request',
          message: `New maintenance request ${maintReq.ticketNumber} submitted and ready for technician assignment.`,
        },
        requesterId ? [requesterId] : [],
      );
      if (requesterId) {
        await this.notifications.notifyUser(requesterId, 'REQUEST_CREATED', {
          requestId: maintReq.id,
          ticketNumber: maintReq.ticketNumber,
          title: maintReq.title ?? 'Maintenance Request',
          message: `Your maintenance request ${maintReq.ticketNumber} was submitted and queued for technician assignment.`,
        });
      }
    }

    return this.formatMaintenanceRequest(maintReq);
  }

  async findAll(query: QueryMaintenanceRequestDto): Promise<PaginatedResult<unknown>> {
    const statusList = query.statuses
      ? (query.statuses
          .split(',')
          .map((status) => status.trim())
          .filter(Boolean) as RequestStatus[])
      : query.status
        ? [query.status]
        : undefined;

    const allowedSort = ['createdAt', 'updatedAt', 'ticketNumber', 'priority', 'status', 'title'];
    const sortBy = allowedSort.includes(query.sortBy || '') ? query.sortBy : 'createdAt';
    const order = (query.sortOrder || query.order || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';

    // 1. If SPECIFICATION is explicitly requested
    if (query.requestType === RequestTypeEnum.SPECIFICATION) {
      const where: Prisma.SpecificationRequestWhereInput = {
        deletedAt: null,
        ...(query.requesterId ? { requesterId: query.requesterId } : {}),
        ...(query.organizationUnitId
          ? { requester: { organizationUnitId: query.organizationUnitId } }
          : {}),
        ...(statusList ? { status: { in: statusList } } : {}),
        ...(query.priority ? { priority: query.priority } : {}),
        ...(query.ticketNumber ? { ticketNumber: { contains: query.ticketNumber, mode: 'insensitive' } } : {}),
        ...(query.search
          ? {
              OR: [
                { ticketNumber: { contains: query.search, mode: 'insensitive' } },
                { title: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      };

      const [total, data] = await this.prisma.$transaction([
        this.prisma.specificationRequest.count({ where }),
        this.prisma.specificationRequest.findMany({
          where,
          skip: query.skip,
          take: query.limit,
          orderBy: { [sortBy as string]: order },
          select: SPECIFICATION_SELECT,
        }),
      ]);

      const formatted = data.map((item) => this.formatSpecificationRequest(item));
      return PaginatedResult.of(formatted, total, query.page, query.limit);
    }

    // 2. If MAINTENANCE is explicitly requested
    if (query.requestType === RequestTypeEnum.MAINTENANCE) {
      const where: Prisma.MaintenanceRequestWhereInput = {
        deletedAt: null,
        ...(query.requesterId ? { requesterId: query.requesterId } : {}),
        ...(query.organizationUnitId
          ? { requester: { organizationUnitId: query.organizationUnitId } }
          : {}),
        ...(statusList ? { status: { in: statusList } } : {}),
        ...(query.priority ? { priority: query.priority } : {}),
        ...(query.ticketNumber ? { ticketNumber: { contains: query.ticketNumber, mode: 'insensitive' } } : {}),
        ...(query.search
          ? {
              OR: [
                { ticketNumber: { contains: query.search, mode: 'insensitive' } },
                { title: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      };

      const [total, data] = await this.prisma.$transaction([
        this.prisma.maintenanceRequest.count({ where }),
        this.prisma.maintenanceRequest.findMany({
          where,
          skip: query.skip,
          take: query.limit,
          orderBy: { [sortBy as string]: order },
          select: MAINTENANCE_SELECT,
        }),
      ]);

      const formatted = data.map((item) => this.formatMaintenanceRequest(item));
      return PaginatedResult.of(formatted, total, query.page, query.limit);
    }

    // 3. If requestType is omitted: combine maintenance and specification requests
    const maintWhere: Prisma.MaintenanceRequestWhereInput = {
      deletedAt: null,
      ...(query.requesterId ? { requesterId: query.requesterId } : {}),
      ...(query.organizationUnitId
        ? { requester: { organizationUnitId: query.organizationUnitId } }
        : {}),
      ...(statusList ? { status: { in: statusList } } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
      ...(query.ticketNumber ? { ticketNumber: { contains: query.ticketNumber } } : {}),
      ...(query.search
        ? {
            OR: [
              { ticketNumber: { contains: query.search } },
              { title: { contains: query.search } },
              { description: { contains: query.search } },
            ],
          }
        : {}),
    };

    const specWhere: Prisma.SpecificationRequestWhereInput = {
      deletedAt: null,
      ...(query.requesterId ? { requesterId: query.requesterId } : {}),
      ...(query.organizationUnitId
        ? { requester: { organizationUnitId: query.organizationUnitId } }
        : {}),
      ...(statusList ? { status: { in: statusList } } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
      ...(query.ticketNumber ? { ticketNumber: { contains: query.ticketNumber } } : {}),
      ...(query.search
        ? {
            OR: [
              { ticketNumber: { contains: query.search } },
              { title: { contains: query.search } },
              { description: { contains: query.search } },
            ],
          }
        : {}),
    };

    const [maintTotal, specTotal, maintData, specData] = await this.prisma.$transaction([
      this.prisma.maintenanceRequest.count({ where: maintWhere }),
      this.prisma.specificationRequest.count({ where: specWhere }),
      this.prisma.maintenanceRequest.findMany({
        where: maintWhere,
        take: query.limit * 2,
        orderBy: { [sortBy as string]: order },
        select: MAINTENANCE_SELECT,
      }),
      this.prisma.specificationRequest.findMany({
        where: specWhere,
        take: query.limit * 2,
        orderBy: { [sortBy as string]: order },
        select: SPECIFICATION_SELECT,
      }),
    ]);

    const combined = [
      ...maintData.map((item) => this.formatMaintenanceRequest(item)),
      ...specData.map((item) => this.formatSpecificationRequest(item)),
    ];

    const sortField = query.sortBy ?? 'createdAt';
    const sortOrder = query.order ?? 'desc';
    combined.sort((a: any, b: any) => {
      const valA = new Date(a[sortField] || 0).getTime();
      const valB = new Date(b[sortField] || 0).getTime();
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    const paged = combined.slice(query.skip, query.skip + query.limit);
    return PaginatedResult.of(paged, maintTotal + specTotal, query.page, query.limit);
  }

  async getMyTasks(userId: string, query: QueryMyTasksDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        fullName: true,
        organizationUnitId: true,
        membershipRole: true,
        supervisedUnit: { select: { id: true, name: true } },
        roleAssignments: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
                permissions: {
                  select: { permission: { select: { name: true } } },
                },
              },
            },
          },
        },
        permissionGrants: {
          select: { permission: { select: { name: true } } },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Effective permissions check (zero role name dependency)
    const rolePermissions = user.roleAssignments.flatMap((a) =>
      a.role.permissions.map((p) => p.permission.name),
    );
    const directPermissions = user.permissionGrants.map((p) => p.permission.name);
    const allPermissions = new Set([...rolePermissions, ...directPermissions]);

    const isIctDirector =
      allPermissions.has('tasks:ict-director') || allPermissions.has('*');
    const isTechnician =
      allPermissions.has('tasks:technician') || allPermissions.has('*');

    // Supervisor status is strictly determined by being assigned as supervisor of an organization unit
    const supervisedUnits = await this.prisma.organizationUnit.findMany({
      where: {
        deletedAt: null,
        supervisorId: userId,
      },
      select: { id: true },
    });

    const isSupervisor = supervisedUnits.length > 0;

    // Resolve units and child supervisors for hierarchical approval
    let directUnitIds: string[] = [];
    let childSupervisorIds: string[] = [];
    if (isSupervisor) {
      const supervisedUnitIds = supervisedUnits.map((u) => u.id);

      // Find immediate child units under supervisor's unit(s)
      const immediateChildUnits = await this.prisma.organizationUnit.findMany({
        where: { parentId: { in: supervisedUnitIds }, deletedAt: null },
        select: { id: true, supervisorId: true },
      });

      // Immediate child unit supervisors (their requests escalate up to this supervisor)
      childSupervisorIds = immediateChildUnits
        .map((u) => u.supervisorId)
        .filter((id): id is string => Boolean(id) && id !== userId);

      // Child units with no supervisor assigned fall back to this parent supervisor
      const unassignedChildUnitIds = immediateChildUnits
        .filter((u) => !u.supervisorId)
        .map((u) => u.id);

      directUnitIds = [...supervisedUnitIds, ...unassignedChildUnitIds];
    }

    // Common search filter
    const searchFilter = query.search
      ? {
          OR: [
            { ticketNumber: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
            { title: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
            { description: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
            {
              requester: {
                fullName: { contains: query.search, mode: Prisma.QueryMode.insensitive },
              },
            },
          ],
        }
      : {};

    const supervisorRequesterFilter = {
      requesterId: { not: userId },
      OR: [
        {
          requester: {
            organizationUnitId: { in: directUnitIds },
            id: { not: userId },
          },
        },
        ...(childSupervisorIds.length > 0
          ? [{ requesterId: { in: childSupervisorIds } }]
          : []),
      ],
    };

    // 1. SUPERVISOR condition: requests from direct members or immediate child unit supervisors that require approval
    const supervisorMaintWhere: Prisma.MaintenanceRequestWhereInput = isSupervisor
      ? {
          deletedAt: null,
          status: RequestStatus.WAITING_APPROVAL,
          ...supervisorRequesterFilter,
          ...(query.priority ? { priority: query.priority } : {}),
          ...searchFilter,
        }
      : { id: '00000000-0000-0000-0000-000000000000' };

    const supervisorSpecWhere: Prisma.SpecificationRequestWhereInput = isSupervisor
      ? {
          deletedAt: null,
          status: RequestStatus.WAITING_APPROVAL,
          ...supervisorRequesterFilter,
          ...(query.priority ? { priority: query.priority } : {}),
          ...searchFilter,
        }
      : { id: '00000000-0000-0000-0000-000000000000' };

    // 2. ICT DIRECTOR condition: requests approved by supervisor OR requests not requiring approval from any unit
    const ictMaintWhere: Prisma.MaintenanceRequestWhereInput = isIctDirector
      ? {
          deletedAt: null,
          requesterId: { not: userId },
          OR: [
            {
              // Approved by requester supervisor
              approvalRequests: {
                some: { status: ApprovalStatus.APPROVED },
              },
            },
            {
              // Did not require approval from any organization unit
              approvalRequests: {
                none: {},
              },
              status: { not: RequestStatus.WAITING_APPROVAL },
            },
          ],
          ...(query.status ? { status: query.status } : {}),
          ...(query.priority ? { priority: query.priority } : {}),
          ...searchFilter,
        }
      : { id: '00000000-0000-0000-0000-000000000000' };

    const ictSpecWhere: Prisma.SpecificationRequestWhereInput = isIctDirector
      ? {
          deletedAt: null,
          requesterId: { not: userId },
          status: query.status ? query.status : { in: [RequestStatus.PENDING, RequestStatus.APPROVED] },
          ...(query.priority ? { priority: query.priority } : {}),
          ...searchFilter,
        }
      : { id: '00000000-0000-0000-0000-000000000000' };

    // 3. TECHNICIAN condition: only the tasks assigned to this technician
    const technicianMaintWhere: Prisma.MaintenanceRequestWhereInput = isTechnician
      ? {
          deletedAt: null,
          requesterId: { not: userId },
          items: {
            some: {
              technicians: {
                some: { technicianId: userId },
              },
            },
          },
          ...(query.status ? { status: query.status } : {}),
          ...(query.priority ? { priority: query.priority } : {}),
          ...searchFilter,
        }
      : { id: '00000000-0000-0000-0000-000000000000' };

    // Real-time badge counts for each role view
    const [supervisorCount, ictCount, technicianCount] = await Promise.all([
      isSupervisor
        ? Promise.all([
            this.prisma.maintenanceRequest.count({
              where: {
                deletedAt: null,
                status: RequestStatus.WAITING_APPROVAL,
                ...supervisorRequesterFilter,
              },
            }),
            this.prisma.specificationRequest.count({
              where: {
                deletedAt: null,
                status: RequestStatus.WAITING_APPROVAL,
                ...supervisorRequesterFilter,
              },
            }),
          ]).then(([m, s]) => m + s)
        : 0,
      isIctDirector
        ? Promise.all([
            this.prisma.maintenanceRequest.count({
              where: {
                deletedAt: null,
                requesterId: { not: userId },
                status: { in: [RequestStatus.PENDING, RequestStatus.APPROVED] },
                OR: [
                  { approvalRequests: { some: { status: ApprovalStatus.APPROVED } } },
                  { approvalRequests: { none: {} }, status: { not: RequestStatus.WAITING_APPROVAL } },
                ],
              },
            }),
            this.prisma.specificationRequest.count({
              where: {
                deletedAt: null,
                requesterId: { not: userId },
                status: { in: [RequestStatus.PENDING, RequestStatus.APPROVED] },
              },
            }),
          ]).then(([m, s]) => m + s)
        : 0,
      isTechnician
        ? this.prisma.maintenanceRequest.count({
            where: {
              deletedAt: null,
              requesterId: { not: userId },
              items: {
                some: {
                  technicians: {
                    some: {
                      technicianId: userId,
                      status: { not: TechnicianAssignmentStatus.COMPLETED },
                    },
                  },
                },
              },
            },
          })
        : 0,
    ]);

    // Determine active role view
    let activeRoleView = query.roleView;
    if (!activeRoleView || activeRoleView === 'ALL') {
      if (isSupervisor && supervisorCount > 0) {
        activeRoleView = 'SUPERVISOR';
      } else if (isIctDirector && ictCount > 0) {
        activeRoleView = 'ICT_DIRECTOR';
      } else if (isTechnician && technicianCount > 0) {
        activeRoleView = 'TECHNICIAN';
      } else if (isSupervisor) {
        activeRoleView = 'SUPERVISOR';
      } else if (isIctDirector) {
        activeRoleView = 'ICT_DIRECTOR';
      } else if (isTechnician) {
        activeRoleView = 'TECHNICIAN';
      } else {
        activeRoleView = 'ALL';
      }
    }

    let items: any[] = [];
    let total = 0;

    if (activeRoleView === 'SUPERVISOR') {
      const [mCount, sCount, mData, sData] = await Promise.all([
        this.prisma.maintenanceRequest.count({ where: supervisorMaintWhere }),
        this.prisma.specificationRequest.count({ where: supervisorSpecWhere }),
        this.prisma.maintenanceRequest.findMany({
          where: supervisorMaintWhere,
          orderBy: { createdAt: 'desc' },
          take: limit * 2,
          select: MAINTENANCE_SELECT,
        }),
        this.prisma.specificationRequest.findMany({
          where: supervisorSpecWhere,
          orderBy: { createdAt: 'desc' },
          take: limit * 2,
          select: SPECIFICATION_SELECT,
        }),
      ]);
      total = mCount + sCount;
      const combined = [
        ...mData.map((it) => ({
          ...this.formatMaintenanceRequest(it),
          taskRole: 'SUPERVISOR',
          taskActionRequired: 'Supervisor Approval',
        })),
        ...sData.map((it) => ({
          ...this.formatSpecificationRequest(it),
          taskRole: 'SUPERVISOR',
          taskActionRequired: 'Supervisor Approval',
        })),
      ].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      items = combined.slice(skip, skip + limit);
    } else if (activeRoleView === 'ICT_DIRECTOR') {
      const [mCount, sCount, mData, sData] = await Promise.all([
        this.prisma.maintenanceRequest.count({ where: ictMaintWhere }),
        this.prisma.specificationRequest.count({ where: ictSpecWhere }),
        this.prisma.maintenanceRequest.findMany({
          where: ictMaintWhere,
          orderBy: { createdAt: 'desc' },
          take: limit * 2,
          select: MAINTENANCE_SELECT,
        }),
        this.prisma.specificationRequest.findMany({
          where: ictSpecWhere,
          orderBy: { createdAt: 'desc' },
          take: limit * 2,
          select: SPECIFICATION_SELECT,
        }),
      ]);
      total = mCount + sCount;
      const combined = [
        ...mData.map((it) => {
          const hadApproval = ((it as any)._count?.approvalRequests ?? 0) > 0;
          return {
            ...this.formatMaintenanceRequest(it),
            taskRole: 'ICT_DIRECTOR',
            taskActionRequired:
              it.status === RequestStatus.PENDING
                ? 'Review & Approve / Assign'
                : 'Manage Execution',
            supervisorApproved: hadApproval,
          };
        }),
        ...sData.map((it) => ({
          ...this.formatSpecificationRequest(it),
          taskRole: 'ICT_DIRECTOR',
          taskActionRequired: 'Procurement Review',
        })),
      ].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      items = combined.slice(skip, skip + limit);
    } else if (activeRoleView === 'TECHNICIAN') {
      const [mCount, mData] = await Promise.all([
        this.prisma.maintenanceRequest.count({ where: technicianMaintWhere }),
        this.prisma.maintenanceRequest.findMany({
          where: technicianMaintWhere,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          select: MAINTENANCE_SELECT,
        }),
      ]);
      total = mCount;
      items = mData.map((it) => {
        // Extract items specifically assigned to this technician
        const myItems = (it.items || []).filter((item: any) =>
          (item.technicians || []).some(
            (t: any) => t.technicianId === userId,
          ),
        );
        const myAssignment = myItems.flatMap((item: any) =>
          (item.technicians || []).filter(
            (t: any) => t.technicianId === userId,
          ),
        )[0];

        return {
          ...this.formatMaintenanceRequest(it),
          taskRole: 'TECHNICIAN',
          taskActionRequired:
            it.status === RequestStatus.IN_PROGRESS
              ? 'In Progress (Log Work)'
              : 'Work Required',
          myAssignedItems: myItems.map((item: any) => ({
            itemId: item.itemId,
            itemName: item.item?.name,
            issueType: item.issueType?.name,
            priority: item.priority,
          })),
          myAssignmentRole: myAssignment?.roleInAssignment || 'ASSISTANT',
          myAssignmentStatus: myAssignment?.status || 'ASSIGNED',
          isLead: myAssignment?.isLead ?? false,
        };
      });
    }

    return {
      data: items,
      counts: {
        supervisorCount,
        ictCount,
        technicianCount,
        totalActiveCount: supervisorCount + ictCount + technicianCount,
      },
      activeRoleView,
      userRoles: {
        isSupervisor,
        isIctDirector,
        isTechnician,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: string) {
    // Check maintenance request first
    const maint = await this.prisma.maintenanceRequest.findFirst({
      where: { id, deletedAt: null },
      select: {
        ...MAINTENANCE_SELECT,
        statusHistory: {
          select: {
            id: true,
            fromStatus: true,
            toStatus: true,
            reason: true,
            createdAt: true,
            changedBy: { select: { id: true, fullName: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        updates: {
          select: {
            id: true,
            updateType: true,
            updateText: true,
            createdAt: true,
            user: { select: { id: true, fullName: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        workLogs: {
          select: {
            id: true,
            workDone: true,
            completionNotes: true,
            timeSpentMinutes: true,
            logDate: true,
            status: true,
            rejectionReason: true,
            technician: { select: { id: true, fullName: true } },
          },
          orderBy: { logDate: 'desc' },
        },
        approvalRequests: {
          select: {
            id: true,
            status: true,
            notes: true,
            forwardedAt: true,
            reviewedAt: true,
            technician: { select: { id: true, fullName: true, email: true } },
            reviewer: { select: { id: true, fullName: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (maint) {
      return this.formatMaintenanceRequest(maint);
    }

    // Check specification request
    const spec = await this.prisma.specificationRequest.findFirst({
      where: { id, deletedAt: null },
      select: SPECIFICATION_SELECT,
    });

    if (spec) {
      return this.formatSpecificationRequest(spec);
    }

    throw new NotFoundException(`Request ${id} not found`);
  }


  async findByTicketNumber(ticketNumber: string) {
    const maint = await this.prisma.maintenanceRequest.findFirst({
      where: { ticketNumber, deletedAt: null },
      select: MAINTENANCE_SELECT,
    });
    if (maint) {
      return this.formatMaintenanceRequest(maint);
    }

    const spec = await this.prisma.specificationRequest.findFirst({
      where: { ticketNumber, deletedAt: null },
      select: SPECIFICATION_SELECT,
    });
    if (spec) {
      return this.formatSpecificationRequest(spec);
    }

    throw new NotFoundException(`Request ${ticketNumber} not found`);
  }

  async update(id: string, dto: UpdateMaintenanceRequestDto) {
    const maint = await this.prisma.maintenanceRequest.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });

    if (maint) {
      const { items, maintenanceItems, ...rest } = dto;
      const updateData: Prisma.MaintenanceRequestUpdateInput = {};
      if (rest.title !== undefined) updateData.title = rest.title;
      if (rest.description !== undefined) updateData.description = rest.description;
      if (rest.priority !== undefined) updateData.priority = rest.priority;

      await this.prisma.$transaction(async (tx) => {
        await tx.maintenanceRequest.update({
          where: { id },
          data: updateData,
        });

        const newItems = items ?? maintenanceItems;
        if (newItems) {
          await tx.maintenanceRequestItem.deleteMany({
            where: { maintenanceRequestId: id },
          });
          if (newItems.length) {
            await tx.maintenanceRequestItem.createMany({
              data: newItems.map((item) => ({
                maintenanceRequestId: id,
                itemId: item.itemId,
                issueCategoryId: item.issueCategoryId ?? null,
                issueTypeId: item.issueTypeId,
                priority: item.priority ?? rest.priority ?? RequestPriority.MEDIUM,
                description: item.description ?? null,
              })),
            });
          }
        }
      });

      return this.findOne(id);
    }

    const spec = await this.prisma.specificationRequest.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });

    if (spec) {
      const { specificationItems, ...rest } = dto as any;
      const updateData: Prisma.SpecificationRequestUpdateInput = {};
      if (rest.title !== undefined) updateData.title = rest.title;
      if (rest.description !== undefined) updateData.description = rest.description;
      if (rest.priority !== undefined) updateData.priority = rest.priority;

      await this.prisma.$transaction(async (tx) => {
        await tx.specificationRequest.update({
          where: { id },
          data: updateData,
        });

        if (specificationItems) {
          await tx.specificationItem.deleteMany({
            where: { specificationRequestId: id },
          });
          if (specificationItems.length) {
            await tx.specificationItem.createMany({
              data: specificationItems.map((specItem) => ({
                specificationRequestId: id,
                categoryId: specItem.categoryId ?? specItem.itemCategoryId ?? null,
                requestedItemName:
                  specItem.requestedItemName ?? specItem.itemName ?? 'Requested Item',
                quantity: specItem.quantity ?? 1,
                unitOfMeasure: specItem.unitOfMeasure ?? null,
                priority: specItem.priority ?? rest.priority ?? RequestPriority.MEDIUM,
                description: specItem.description ?? null,
              })),
            });
          }
        }
      });

      return this.findOne(id);
    }

    throw new NotFoundException(`Request ${id} not found`);
  }


  async changeStatus(id: string, dto: ChangeStatusDto, changedById?: string) {
    const maint = await this.prisma.maintenanceRequest.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, status: true, requesterId: true, ticketNumber: true },
    });

    if (maint) {
      await this.prisma.$transaction(async (tx) => {
        await tx.maintenanceRequest.update({
          where: { id },
          data: {
            status: dto.status,
            rejectionReason:
              dto.status === RequestStatus.REJECTED ? dto.reason : undefined,
          },
        });

        await tx.requestStatusHistory.create({
          data: {
            maintenanceRequestId: id,
            fromStatus: maint.status,
            toStatus: dto.status,
            changedById: changedById ?? null,
            reason: dto.reason,
          },
        });
      });

      if (maint.requesterId && maint.requesterId !== changedById) {
        await this.notifications
          .create({
            userId: maint.requesterId,
            type: 'REQUEST_STATUS_CHANGED',
            payload: {
              requestId: id,
              ticketNumber: maint.ticketNumber,
              fromStatus: maint.status,
              toStatus: dto.status,
              reason: dto.reason ?? null,
            },
          })
          .catch((error) => this.logger.warn(`Notification failed: ${error}`));
      }

      return this.findOne(id);
    }

    const spec = await this.prisma.specificationRequest.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, status: true, requesterId: true, ticketNumber: true },
    });

    if (spec) {
      if (dto.status === RequestStatus.REJECTED && !dto.reason?.trim()) {
        throw new BadRequestException('A reason is required to reject a request');
      }

      await this.prisma.specificationRequest.update({
        where: { id },
        data: {
          status: dto.status,
          rejectionReason:
            dto.status === RequestStatus.REJECTED ? dto.reason?.trim() : null,
        },
      });

      if (spec.requesterId && spec.requesterId !== changedById) {
        await this.notifications
          .create({
            userId: spec.requesterId,
            type: 'REQUEST_STATUS_CHANGED',
            payload: {
              requestId: id,
              ticketNumber: spec.ticketNumber,
              fromStatus: spec.status,
              toStatus: dto.status,
              reason: dto.reason ?? null,
            },
          })
          .catch((error) => this.logger.warn(`Notification failed: ${error}`));
      }

      return this.findOne(id);
    }

    throw new NotFoundException(`Request ${id} not found`);
  }


  /**
   * Resolves the supervisor ID who is responsible for approving a given requester's request.
   * - If the requester is a regular member of unit U, their supervisor is U.supervisorId.
   * - If the requester is the supervisor of unit U, their approval escalates to U's parent unit supervisor.
   * - If a unit has no supervisor, it traverses up to the first ancestor unit that has a supervisor.
   */
  private async resolveApprovingSupervisorId(requesterId: string): Promise<string | null> {
    const requester = await this.prisma.user.findUnique({
      where: { id: requesterId },
      select: { id: true, organizationUnitId: true },
    });

    if (!requester?.organizationUnitId) {
      return null;
    }

    const currentUnit = await this.prisma.organizationUnit.findUnique({
      where: { id: requester.organizationUnitId },
      select: { id: true, supervisorId: true, parentId: true },
    });

    if (!currentUnit) {
      return null;
    }

    // If requester is the supervisor of their own unit, approval must escalate to parent unit
    let checkUnitId: string | null = null;
    if (currentUnit.supervisorId === requesterId) {
      checkUnitId = currentUnit.parentId;
    } else if (currentUnit.supervisorId) {
      return currentUnit.supervisorId;
    } else {
      // Current unit has no supervisor assigned, fallback to parent
      checkUnitId = currentUnit.parentId;
    }

    // Traverse up ancestors until we find an assigned supervisor who is NOT the requester
    while (checkUnitId) {
      const ancestor = await this.prisma.organizationUnit.findUnique({
        where: { id: checkUnitId },
        select: { id: true, supervisorId: true, parentId: true },
      });
      if (ancestor?.supervisorId && ancestor.supervisorId !== requesterId) {
        return ancestor.supervisorId;
      }
      checkUnitId = ancestor?.parentId ?? null;
    }

    return null;
  }

  private async checkCanApproveOrReject(
    currentStatus: RequestStatus,
    requesterId: string | null,
    userId?: string,
  ): Promise<void> {
    if (!userId) {
      throw new ForbiddenException('User authentication required');
    }

    if (requesterId && requesterId === userId) {
      throw new ForbiddenException(
        'You cannot approve or reject your own request under any circumstance. Your request must be reviewed by the supervisor above you.',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roleAssignments: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
        permissionGrants: {
          include: { permission: true },
        },
      },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const allPermissions = new Set<string>();
    user.roleAssignments.forEach((ra) => {
      ra.role.permissions.forEach((p) => allPermissions.add(p.permission.name));
    });
    user.permissionGrants.forEach((pg) => allPermissions.add(pg.permission.name));

    // Wildcard permission grants full administrative review access
    if (allPermissions.has('*')) {
      return;
    }

    if (currentStatus === RequestStatus.WAITING_APPROVAL) {
      // Reviewer permission or hierarchical supervisor verification
      if (allPermissions.has('approvals:review')) {
        return;
      }
      if (requesterId) {
        const approvingSupervisorId = await this.resolveApprovingSupervisorId(requesterId);
        if (approvingSupervisorId === userId) {
          return; // Authorized!
        }
      }

      throw new ForbiddenException(
        'You are not authorized to review this request. Only the assigned organization unit supervisor in the hierarchy or an authorized reviewer can review it.',
      );
    } else {
      // Normal review/approval stage (e.g. PENDING -> APPROVED)
      if (
        allPermissions.has('tasks:ict-director') ||
        allPermissions.has('approvals:review') ||
        allPermissions.has('requests:update-status')
      ) {
        return;
      }

      throw new ForbiddenException(
        'Only users with ICT Director permissions (tasks:ict-director) or status update permissions can approve/reject requests at this stage.',
      );
    }
  }

  async approve(id: string, notes?: string, changedById?: string) {
    const maint = await this.prisma.maintenanceRequest.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        status: true,
        requesterId: true,
        ticketNumber: true,
      },
    });

    if (maint) {
      await this.checkCanApproveOrReject(maint.status, maint.requesterId, changedById);

      if (maint.status === RequestStatus.WAITING_APPROVAL) {
        // Supervisor approval stage:
        // Must have at least 1 attached procurement recommendation document
        const fileCount = await this.prisma.maintenanceRequestFile.count({
          where: { maintenanceRequestId: id },
        });
        if (fileCount === 0) {
          throw new BadRequestException(
            'Supervisor approval requires at least one attached procurement document instructing the ICT Director what to purchase',
          );
        }

        // Update any pending ApprovalRequest
        await this.prisma.approvalRequest.updateMany({
          where: {
            maintenanceRequestId: id,
            status: ApprovalStatus.PENDING,
          },
          data: {
            status: ApprovalStatus.APPROVED,
            reviewedById: changedById ?? null,
            reviewedAt: new Date(),
            notes: notes ?? 'Approved by supervisor with procurement attachment',
          },
        });

        // Advance to PENDING (for ICT Director review)
        const res = await this.changeStatus(
          id,
          {
            status: RequestStatus.PENDING,
            reason: notes
              ? `Approved by Organization Supervisor with procurement document: ${notes}`
              : 'Approved by Organization Supervisor with procurement document for ICT Director review',
          },
          changedById,
        );

        if (maint.requesterId) {
          await this.notifications.notifyUser(maint.requesterId, 'REQUEST_APPROVED', {
            requestId: id,
            ticketNumber: maint.ticketNumber,
            message: `Your maintenance request ${maint.ticketNumber} was approved by supervisor and forwarded for technician assignment.`,
            notes: notes ?? null,
          });
        }

        await this.notifications.notifyUsersWithPermissions(
          ['tasks:ict-director', 'requests:assign-technicians'],
          'REQUEST_PENDING_ASSIGNMENT',
          {
            requestId: id,
            ticketNumber: maint.ticketNumber,
            message: `Maintenance request ${maint.ticketNumber} was approved by supervisor and is ready for technician assignment.`,
            notes: notes ?? null,
          },
          changedById ? [changedById] : [],
        );

        return res;
      }

      // If already in PENDING (ICT Director stage), approve moves it to APPROVED
      const res = await this.changeStatus(
        id,
        {
          status: RequestStatus.APPROVED,
          reason: notes ?? 'Approved by ICT Director for maintenance servicing',
        },
        changedById,
      );

      if (maint.requesterId) {
        await this.notifications.notifyUser(maint.requesterId, 'REQUEST_APPROVED', {
          requestId: id,
          ticketNumber: maint.ticketNumber,
          message: `Your maintenance request ${maint.ticketNumber} has been approved for maintenance servicing.`,
          notes: notes ?? null,
        });
      }

      return res;
    }

    const spec = await this.prisma.specificationRequest.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, status: true },
    });
    if (spec) {
      return this.changeStatus(
        id,
        {
          status: RequestStatus.APPROVED,
          reason: notes,
        },
        changedById,
      );
    }

    throw new NotFoundException(`Request ${id} not found`);
  }


  async reject(id: string, reason: string, changedById?: string) {
    if (!reason?.trim()) {
      throw new BadRequestException('A reason is required to reject a request');
    }

    const maint = await this.prisma.maintenanceRequest.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, status: true, requesterId: true, ticketNumber: true },
    });

    if (maint) {
      await this.checkCanApproveOrReject(maint.status, maint.requesterId, changedById);
      if (maint.status === RequestStatus.WAITING_APPROVAL) {
        await this.prisma.approvalRequest.updateMany({
          where: {
            maintenanceRequestId: id,
            status: ApprovalStatus.PENDING,
          },
          data: {
            status: ApprovalStatus.REJECTED,
            reviewedById: changedById ?? null,
            reviewedAt: new Date(),
            notes: reason.trim(),
          },
        });

        const res = await this.changeStatus(
          id,
          {
            status: RequestStatus.REJECTED,
            reason: `Rejected by Organization Supervisor: ${reason.trim()}`,
          },
          changedById,
        );

        if (maint.requesterId) {
          await this.notifications.notifyUser(maint.requesterId, 'REQUEST_REJECTED', {
            requestId: id,
            ticketNumber: maint.ticketNumber,
            reason: reason.trim(),
            message: `Your maintenance request ${maint.ticketNumber} was rejected by supervisor: "${reason.trim()}".`,
          });
        }

        return res;
      }

      const res = await this.changeStatus(
        id,
        {
          status: RequestStatus.REJECTED,
          reason: reason.trim(),
        },
        changedById,
      );

      if (maint.requesterId) {
        await this.notifications.notifyUser(maint.requesterId, 'REQUEST_REJECTED', {
          requestId: id,
          ticketNumber: maint.ticketNumber,
          reason: reason.trim(),
          message: `Maintenance request ${maint.ticketNumber} was rejected: "${reason.trim()}".`,
        });
      }

      return res;
    }

    throw new NotFoundException(`Request ${id} not found`);
  }

  async confirmCompletion(id: string, notes?: string, userId?: string) {
    if (!userId) {
      throw new ForbiddenException('User authentication required');
    }

    const maint = await this.prisma.maintenanceRequest.findFirst({
      where: { id, deletedAt: null },
      include: {
        items: {
          include: {
            technicians: true,
          },
        },
      },
    });

    if (!maint) {
      throw new NotFoundException(`Maintenance request ${id} not found`);
    }

    // Must be the requester or have admin/director status override
    const isOwner = maint.requesterId === userId;
    if (!isOwner) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          roleAssignments: {
            include: {
              role: {
                include: {
                  permissions: { include: { permission: true } },
                },
              },
            },
          },
          permissionGrants: { include: { permission: true } },
        },
      });

      const allPermissions = new Set<string>();
      user?.roleAssignments.forEach((ra) => {
        ra.role.permissions.forEach((p) => allPermissions.add(p.permission.name));
      });
      user?.permissionGrants.forEach((pg) => allPermissions.add(pg.permission.name));

      if (!allPermissions.has('*') && !allPermissions.has('requests:update-status')) {
        throw new ForbiddenException(
          'Only the request owner (requester) can verify and confirm completion of this work.',
        );
      }
    }

    const confirmationReason = notes?.trim()
      ? `Confirmed by requester: ${notes.trim()}`
      : 'Requester inspected the equipment and confirmed maintenance completed satisfactorily';

    await this.prisma.$transaction(async (tx) => {
      // 1. Update request status to COMPLETED
      await tx.maintenanceRequest.update({
        where: { id },
        data: {
          status: RequestStatus.COMPLETED,
          rejectionReason: null,
        },
      });

      // 2. Ensure all technician assignments are marked COMPLETED
      const assignmentIds = maint.items.flatMap((i) => i.technicians.map((t) => t.id));
      if (assignmentIds.length > 0) {
        await tx.itemTechnician.updateMany({
          where: {
            id: { in: assignmentIds },
            status: { not: TechnicianAssignmentStatus.COMPLETED },
          },
          data: {
            status: TechnicianAssignmentStatus.COMPLETED,
            completedAt: new Date(),
          },
        });
      }

      // 3. Record status history
      await tx.requestStatusHistory.create({
        data: {
          maintenanceRequestId: id,
          fromStatus: maint.status,
          toStatus: RequestStatus.COMPLETED,
          changedById: userId,
          reason: confirmationReason,
        },
      });

      // 4. Create request update
      await tx.requestUpdate.create({
        data: {
          maintenanceRequestId: id,
          userId,
          updateType: 'STATUS_CHANGE',
          updateText: confirmationReason,
        },
      });
    });

    // 5. Notify assigned technicians
    const technicianIds = Array.from(
      new Set(
        maint.items.flatMap((i) =>
          i.technicians.map((t) => t.technicianId).filter(Boolean),
        ),
      ),
    );

    for (const techId of technicianIds) {
      if (techId !== userId) {
        await this.notifications
          .create({
            userId: techId,
            type: 'REQUEST_CONFIRMED',
            payload: {
              requestId: id,
              ticketNumber: maint.ticketNumber,
              message: `Requester has confirmed and accepted completion of maintenance request ${maint.ticketNumber}.`,
              notes: notes?.trim() ?? null,
            },
          })
          .catch((error) => this.logger.warn(`Notification failed: ${error}`));
      }
    }

    await this.notifications.notifyUsersWithPermissions(
      ['tasks:ict-director', 'requests:assign-technicians'],
      'REQUEST_CONFIRMED',
      {
        requestId: id,
        ticketNumber: maint.ticketNumber,
        message: `Requester confirmed completion of maintenance request ${maint.ticketNumber}. Ticket is now successfully closed.`,
        notes: notes?.trim() ?? null,
      },
      [userId, ...technicianIds],
    );

    return this.findOne(id);
  }

  async rejectWork(id: string, reason: string, userId?: string) {
    if (!userId) {
      throw new ForbiddenException('User authentication required');
    }

    if (!reason || !reason.trim()) {
      throw new BadRequestException(
        'Please provide a reason explaining what is not working properly and why rework is required.',
      );
    }

    const maint = await this.prisma.maintenanceRequest.findFirst({
      where: { id, deletedAt: null },
      include: {
        items: {
          include: {
            technicians: true,
          },
        },
      },
    });

    if (!maint) {
      throw new NotFoundException(`Maintenance request ${id} not found`);
    }

    // Must be the requester or have admin/director status override
    const isOwner = maint.requesterId === userId;
    if (!isOwner) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          roleAssignments: {
            include: {
              role: {
                include: {
                  permissions: { include: { permission: true } },
                },
              },
            },
          },
          permissionGrants: { include: { permission: true } },
        },
      });

      const allPermissions = new Set<string>();
      user?.roleAssignments.forEach((ra) => {
        ra.role.permissions.forEach((p) => allPermissions.add(p.permission.name));
      });
      user?.permissionGrants.forEach((pg) => allPermissions.add(pg.permission.name));

      if (!allPermissions.has('*') && !allPermissions.has('requests:update-status')) {
        throw new ForbiddenException(
          'Only the request owner (requester) can reject technician work.',
        );
      }
    }

    const rejectionReason = reason.trim();
    const historyReason = `Requester rejected technician work (Needs Rework): ${rejectionReason}`;

    await this.prisma.$transaction(async (tx) => {
      // 1. Move request status back to IN_PROGRESS so technicians can rework it
      await tx.maintenanceRequest.update({
        where: { id },
        data: {
          status: RequestStatus.IN_PROGRESS,
          rejectionReason: rejectionReason,
        },
      });

      // 2. Set technician assignments back to IN_PROGRESS
      const assignmentIds = maint.items.flatMap((i) => i.technicians.map((t) => t.id));
      if (assignmentIds.length > 0) {
        await tx.itemTechnician.updateMany({
          where: {
            id: { in: assignmentIds },
          },
          data: {
            status: TechnicianAssignmentStatus.IN_PROGRESS,
            completedAt: null,
          },
        });
      }

      // 3. Record status history
      await tx.requestStatusHistory.create({
        data: {
          maintenanceRequestId: id,
          fromStatus: maint.status,
          toStatus: RequestStatus.IN_PROGRESS,
          changedById: userId,
          reason: historyReason,
        },
      });

      // 4. Create request update
      await tx.requestUpdate.create({
        data: {
          maintenanceRequestId: id,
          userId,
          updateType: 'STATUS_CHANGE',
          updateText: `Requester inspected the equipment and reported it is not fixed properly. Feedback: "${rejectionReason}". Technicians must rework the task.`,
        },
      });
    });

    // 5. Notify assigned technicians
    const technicianIds = Array.from(
      new Set(
        maint.items.flatMap((i) =>
          i.technicians.map((t) => t.technicianId).filter(Boolean),
        ),
      ),
    );

    for (const techId of technicianIds) {
      if (techId !== userId) {
        await this.notifications
          .create({
            userId: techId,
            type: 'WORK_REJECTED',
            payload: {
              requestId: id,
              ticketNumber: maint.ticketNumber,
              reason: rejectionReason,
              message: `The requester reported that maintenance request ${maint.ticketNumber} is not fixed properly and requires rework: "${rejectionReason}".`,
            },
          })
          .catch((error) => this.logger.warn(`Notification failed: ${error}`));
      }
    }

    await this.notifications.notifyUsersWithPermissions(
      ['tasks:ict-director', 'requests:assign-technicians'],
      'WORK_REJECTED',
      {
        requestId: id,
        ticketNumber: maint.ticketNumber,
        reason: rejectionReason,
        message: `Requester reported equipment on ticket ${maint.ticketNumber} still faulty and requested rework: "${rejectionReason}".`,
      },
      [userId, ...technicianIds],
    );

    return this.findOne(id);
  }

  async addUpdate(id: string, dto: AddRequestUpdateDto) {
    const maint = await this.prisma.maintenanceRequest.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });

    if (!maint) {
      throw new NotFoundException(`Maintenance request ${id} not found`);
    }

    return this.prisma.requestUpdate.create({
      data: {
        maintenanceRequestId: id,
        userId: dto.userId,
        updateType: dto.updateType,
        updateText: dto.updateText,
      },
      select: {
        id: true,
        updateType: true,
        updateText: true,
        createdAt: true,
        user: { select: { id: true, fullName: true } },
      },
    });
  }

  async statusHistory(id: string) {
    const maint = await this.prisma.maintenanceRequest.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });

    if (maint) {
      return this.prisma.requestStatusHistory.findMany({
        where: { maintenanceRequestId: id },
        select: {
          id: true,
          fromStatus: true,
          toStatus: true,
          reason: true,
          createdAt: true,
          changedBy: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return [];
  }

  async stats(query: QueryMaintenanceRequestDto) {
    const maintWhere: Prisma.MaintenanceRequestWhereInput = {
      deletedAt: null,
      ...(query.organizationUnitId
        ? { requester: { organizationUnitId: query.organizationUnitId } }
        : {}),
    };

    const specWhere: Prisma.SpecificationRequestWhereInput = {
      deletedAt: null,
      ...(query.organizationUnitId
        ? { requester: { organizationUnitId: query.organizationUnitId } }
        : {}),
    };

    const [
      maintByStatus,
      maintByPriority,
      maintTotal,
      specByStatus,
      specByPriority,
      specTotal,
    ] = await this.prisma.$transaction([
      this.prisma.maintenanceRequest.groupBy({
        by: ['status'],
        where: maintWhere,
        _count: { _all: true },
        orderBy: { status: 'asc' },
      }),
      this.prisma.maintenanceRequest.groupBy({
        by: ['priority'],
        where: maintWhere,
        _count: { _all: true },
        orderBy: { priority: 'asc' },
      }),
      this.prisma.maintenanceRequest.count({ where: maintWhere }),
      this.prisma.specificationRequest.groupBy({
        by: ['status'],
        where: specWhere,
        _count: { _all: true },
        orderBy: { status: 'asc' },
      }),
      this.prisma.specificationRequest.groupBy({
        by: ['priority'],
        where: specWhere,
        _count: { _all: true },
        orderBy: { priority: 'asc' },
      }),
      this.prisma.specificationRequest.count({ where: specWhere }),
    ]);

    const getCount = (c: any): number => {
      if (typeof c === 'number') return c;
      if (c && typeof c._all === 'number') return c._all;
      return 0;
    };

    const statusCounts = new Map<RequestStatus, number>();
    for (const row of maintByStatus) {
      statusCounts.set(
        row.status,
        (statusCounts.get(row.status) ?? 0) + getCount(row._count),
      );
    }
    for (const row of specByStatus) {
      statusCounts.set(
        row.status,
        (statusCounts.get(row.status) ?? 0) + getCount(row._count),
      );
    }

    const priorityCounts = new Map<RequestPriority, number>();
    for (const row of maintByPriority) {
      priorityCounts.set(
        row.priority,
        (priorityCounts.get(row.priority) ?? 0) + getCount(row._count),
      );
    }
    for (const row of specByPriority) {
      priorityCounts.set(
        row.priority,
        (priorityCounts.get(row.priority) ?? 0) + getCount(row._count),
      );
    }

    return {
      total: maintTotal + specTotal,
      byStatus: Array.from(statusCounts.entries()).map(([status, count]) => ({
        status,
        count,
      })),
      byPriority: Array.from(priorityCounts.entries()).map(([priority, count]) => ({
        priority,
        count,
      })),
    };
  }

  async addFiles(
    requestId: string,
    userId: string,
    files: Express.Multer.File[],
  ) {
    if (!files.length) {
      throw new BadRequestException('No files were uploaded');
    }

    const maint = await this.prisma.maintenanceRequest.findFirst({
      where: { id: requestId, deletedAt: null },
      select: { id: true },
    });

    if (maint) {
      const data = files.map((file) => ({
        maintenanceRequestId: requestId,
        uploadedById: userId,
        fileName: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        storageKey: `requests/${file.filename}`,
        fileType: 'ATTACHMENT',
        sizeBytes: BigInt(file.size),
      }));

      await this.prisma.maintenanceRequestFile.createMany({ data });

      const created = await this.prisma.maintenanceRequestFile.findMany({
        where: {
          maintenanceRequestId: requestId,
          fileName: { in: files.map((f) => f.filename) },
        },
        select: {
          id: true,
          fileName: true,
          originalName: true,
          mimeType: true,
          fileType: true,
          sizeBytes: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      });

      return created.map((f) => ({
        ...f,
        sizeBytes: Number(f.sizeBytes),
        downloadUrl: `/api/requests/${requestId}/files/${f.id}/download`,
        previewUrl: `/api/requests/${requestId}/files/${f.id}/download`,
      }));
    }

    const spec = await this.prisma.specificationRequest.findFirst({
      where: { id: requestId, deletedAt: null },
      select: { id: true },
    });

    if (spec) {
      const data = files.map((file) => ({
        specificationRequestId: requestId,
        uploadedById: userId,
        fileName: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        storageKey: `spec-requests/${file.filename}`,
        fileType: 'ATTACHMENT',
        sizeBytes: BigInt(file.size),
      }));

      await this.prisma.specificationRequestFile.createMany({ data });

      const created = await this.prisma.specificationRequestFile.findMany({
        where: {
          specificationRequestId: requestId,
          fileName: { in: files.map((f) => f.filename) },
        },
        select: {
          id: true,
          fileName: true,
          originalName: true,
          mimeType: true,
          fileType: true,
          sizeBytes: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      });

      return created.map((f) => ({
        ...f,
        sizeBytes: Number(f.sizeBytes),
        downloadUrl: `/api/requests/${requestId}/files/${f.id}/download`,
        previewUrl: `/api/requests/${requestId}/files/${f.id}/download`,
      }));
    }

    throw new NotFoundException(`Request ${requestId} not found`);
  }

  async getFile(requestId: string, fileId: string) {
    const file = await this.prisma.maintenanceRequestFile.findFirst({
      where: { id: fileId, maintenanceRequestId: requestId },
    });
    if (file) return file;

    const specFile = await this.prisma.specificationRequestFile.findFirst({
      where: { id: fileId, specificationRequestId: requestId },
    });
    if (specFile) return specFile;

    const specItemFile = await this.prisma.specificationItemFile.findFirst({
      where: {
        id: fileId,
        OR: [
          { specificationItemId: requestId },
          { specificationItem: { specificationRequestId: requestId } },
        ],
      },
    });
    if (specItemFile) return specItemFile;

    // Resilient fallback: search across all file tables by fileId alone
    const fallback =
      (await this.prisma.specificationRequestFile.findUnique({ where: { id: fileId } })) ||
      (await this.prisma.maintenanceRequestFile.findUnique({ where: { id: fileId } })) ||
      (await this.prisma.specificationItemFile.findUnique({ where: { id: fileId } }));
    if (fallback) return fallback;

    throw new NotFoundException(`File ${fileId} not found`);
  }

  async removeFile(requestId: string, fileId: string) {
    await this.prisma.maintenanceRequestFile.deleteMany({
      where: { id: fileId, maintenanceRequestId: requestId },
    });
    await this.prisma.specificationRequestFile.deleteMany({
      where: { id: fileId, specificationRequestId: requestId },
    });
  }

  async remove(id: string) {
    const maint = await this.prisma.maintenanceRequest.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });

    if (maint) {
      await this.prisma.maintenanceRequest.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return { success: true };
    }

    const spec = await this.prisma.specificationRequest.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });

    if (spec) {
      await this.prisma.specificationRequest.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return { success: true };
    }

    throw new NotFoundException(`Request ${id} not found`);
  }


  async restore(id: string) {
    const maint = await this.prisma.maintenanceRequest.findFirst({
      where: { id },
      select: { id: true },
    });

    if (maint) {
      await this.prisma.maintenanceRequest.update({
        where: { id },
        data: { deletedAt: null },
      });
      return this.findOne(id);
    }

    const spec = await this.prisma.specificationRequest.findFirst({
      where: { id },
      select: { id: true },
    });

    if (spec) {
      await this.prisma.specificationRequest.update({
        where: { id },
        data: { deletedAt: null },
      });
      return this.findOne(id);
    }

    throw new NotFoundException(`Request ${id} not found`);
  }

}
