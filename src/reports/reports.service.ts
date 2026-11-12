import { Injectable, Logger } from '@nestjs/common';
import { Prisma, RequestPriority, RequestStatus, TechnicianAssignmentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QueryReportRequestsDto } from './reports.dto';
import { PaginatedResult } from '../common/dto/paginated-result.dto';

const USER_SELECT = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  organizationUnitId: true,
  organizationUnit: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
};

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private getDateFilter(timeframe?: string, startDate?: string, endDate?: string) {
    if (startDate || endDate) {
      return {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        ...(endDate ? { lte: new Date(endDate) } : {}),
      };
    }

    if (!timeframe || timeframe === 'ALL') {
      return undefined;
    }

    const now = new Date();
    if (timeframe === 'TODAY') {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { gte: todayStart };
    }
    if (timeframe === '7DAYS') {
      const past7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { gte: past7 };
    }
    if (timeframe === '30DAYS') {
      const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { gte: past30 };
    }
    if (timeframe === '90DAYS') {
      const past90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      return { gte: past90 };
    }

    return undefined;
  }

  /**
   * Executive high-level reporting summary and KPI metrics
   */
  async getSummary(query?: QueryReportRequestsDto) {
    const createdAtFilter = this.getDateFilter(
      query?.timeframe,
      query?.startDate,
      query?.endDate,
    );

    const baseMaintWhere: Prisma.MaintenanceRequestWhereInput = {
      deletedAt: null,
      ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
      ...(query?.departmentId && query.departmentId !== 'ALL'
        ? { requester: { organizationUnitId: query.departmentId } }
        : {}),
    };

    const baseSpecWhere: Prisma.SpecificationRequestWhereInput = {
      deletedAt: null,
      ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
      ...(query?.departmentId && query.departmentId !== 'ALL'
        ? { requester: { organizationUnitId: query.departmentId } }
        : {}),
    };

    const [
      totalMaint,
      totalSpec,
      maintByStatus,
      specByStatus,
      maintByPriority,
      specByPriority,
      unassignedMaintCount,
      completedWithDates,
    ] = await Promise.all([
      this.prisma.maintenanceRequest.count({ where: baseMaintWhere }),
      this.prisma.specificationRequest.count({ where: baseSpecWhere }),
      this.prisma.maintenanceRequest.groupBy({
        by: ['status'],
        where: baseMaintWhere,
        _count: { _all: true },
      }),
      this.prisma.specificationRequest.groupBy({
        by: ['status'],
        where: baseSpecWhere,
        _count: { _all: true },
      }),
      this.prisma.maintenanceRequest.groupBy({
        by: ['priority'],
        where: baseMaintWhere,
        _count: { _all: true },
      }),
      this.prisma.specificationRequest.groupBy({
        by: ['priority'],
        where: baseSpecWhere,
        _count: { _all: true },
      }),
      this.prisma.maintenanceRequest.count({
        where: {
          ...baseMaintWhere,
          items: {
            none: {
              technicians: {
                some: {},
              },
            },
          },
        },
      }),
      this.prisma.maintenanceRequest.findMany({
        where: {
          ...baseMaintWhere,
          status: { in: [RequestStatus.COMPLETED, RequestStatus.CONFIRMED] },
        },
        select: {
          createdAt: true,
          updatedAt: true,
        },
        take: 100,
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    // Consolidate status counts
    const statusCounts: Record<string, number> = {};
    for (const item of maintByStatus) {
      statusCounts[item.status] = (statusCounts[item.status] || 0) + item._count._all;
    }
    for (const item of specByStatus) {
      statusCounts[item.status] = (statusCounts[item.status] || 0) + item._count._all;
    }

    // Consolidate priority counts
    const priorityCounts: Record<string, number> = {};
    for (const item of maintByPriority) {
      priorityCounts[item.priority] = (priorityCounts[item.priority] || 0) + item._count._all;
    }
    for (const item of specByPriority) {
      priorityCounts[item.priority] = (priorityCounts[item.priority] || 0) + item._count._all;
    }

    // Calculate In Progress (active servicing) & Completed counts
    const inProgressStatuses = [
      RequestStatus.PENDING,
      RequestStatus.WAITING_APPROVAL,
      RequestStatus.PENDING_APPROVAL_REVIEW,
      RequestStatus.APPROVED,
      RequestStatus.ASSIGNED,
      RequestStatus.IN_PROGRESS,
      RequestStatus.WAITING_CONFIRMATION,
    ];
    let inProgressCount = 0;
    for (const st of inProgressStatuses) {
      inProgressCount += statusCounts[st] || 0;
    }

    const completedCount =
      (statusCounts[RequestStatus.COMPLETED] || 0) +
      (statusCounts[RequestStatus.CONFIRMED] || 0);

    // Calculate average resolution minutes
    let averageResolutionMinutes = 0;
    if (completedWithDates.length > 0) {
      const totalMinutes = completedWithDates.reduce((acc, curr) => {
        const diffMs = curr.updatedAt.getTime() - curr.createdAt.getTime();
        return acc + Math.max(0, Math.round(diffMs / (1000 * 60)));
      }, 0);
      averageResolutionMinutes = Math.round(totalMinutes / completedWithDates.length);
    }

    return {
      totalRequests: totalMaint + totalSpec,
      maintenanceCount: totalMaint,
      specificationCount: totalSpec,
      inProgressCount,
      completedCount,
      unassignedCount: unassignedMaintCount,
      statusCounts,
      priorityCounts,
      averageResolutionMinutes,
    };
  }

  /**
   * Detailed reports request list with full multi-dimensional filtering
   */
  async getRequests(query: QueryReportRequestsDto): Promise<PaginatedResult<any>> {
    const createdAtFilter = this.getDateFilter(query.timeframe, query.startDate, query.endDate);

    const isOnlyMaint = query.requestType === 'MAINTENANCE';
    const isOnlySpec = query.requestType === 'SPECIFICATION';

    // Technician filter only applies to maintenance items
    const hasTechFilter =
      query.technicianId && query.technicianId !== 'ALL';
    const hasTaskStatusFilter =
      query.taskStatus && query.taskStatus !== 'ALL';

    // If technician filter is set and not 'UNASSIGNED', specification requests have no technicians so we skip spec
    const canIncludeSpec =
      !isOnlyMaint &&
      (!hasTechFilter || query.technicianId === 'ALL') &&
      (!hasTaskStatusFilter || query.taskStatus === 'ALL');

    const canIncludeMaint = !isOnlySpec;

    // Build Maintenance where clause
    const maintWhere: Prisma.MaintenanceRequestWhereInput = {
      deletedAt: null,
      ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
      ...(query.status && query.status !== 'ALL'
        ? { status: query.status as RequestStatus }
        : {}),
      ...(query.priority && query.priority !== 'ALL'
        ? { priority: query.priority as RequestPriority }
        : {}),
      ...(query.departmentId && query.departmentId !== 'ALL'
        ? { requester: { organizationUnitId: query.departmentId } }
        : {}),
    };

    if (query.technicianId === 'UNASSIGNED') {
      maintWhere.items = {
        none: {
          technicians: { some: {} },
        },
      };
    } else if (hasTechFilter) {
      maintWhere.items = {
        some: {
          technicians: {
            some: {
              technicianId: query.technicianId,
              ...(hasTaskStatusFilter
                ? { status: query.taskStatus as TechnicianAssignmentStatus }
                : {}),
            },
          },
        },
      };
    } else if (hasTaskStatusFilter) {
      maintWhere.items = {
        some: {
          technicians: {
            some: {
              status: query.taskStatus as TechnicianAssignmentStatus,
            },
          },
        },
      };
    }

    if (query.search?.trim()) {
      const q = query.search.trim();
      maintWhere.OR = [
        { ticketNumber: { contains: q, mode: 'insensitive' } },
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { requester: { fullName: { contains: q, mode: 'insensitive' } } },
        { requester: { organizationUnit: { name: { contains: q, mode: 'insensitive' } } } },
        { requester: { organizationUnit: { code: { contains: q, mode: 'insensitive' } } } },
        { items: { some: { item: { name: { contains: q, mode: 'insensitive' } } } } },
      ];
    }

    // Build Specification where clause
    const specWhere: Prisma.SpecificationRequestWhereInput = {
      deletedAt: null,
      ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
      ...(query.status && query.status !== 'ALL'
        ? { status: query.status as RequestStatus }
        : {}),
      ...(query.priority && query.priority !== 'ALL'
        ? { priority: query.priority as RequestPriority }
        : {}),
      ...(query.departmentId && query.departmentId !== 'ALL'
        ? { requester: { organizationUnitId: query.departmentId } }
        : {}),
    };

    if (query.search?.trim()) {
      const q = query.search.trim();
      specWhere.OR = [
        { ticketNumber: { contains: q, mode: 'insensitive' } },
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { requester: { fullName: { contains: q, mode: 'insensitive' } } },
        { requester: { organizationUnit: { name: { contains: q, mode: 'insensitive' } } } },
        { requester: { organizationUnit: { code: { contains: q, mode: 'insensitive' } } } },
        { items: { some: { requestedItemName: { contains: q, mode: 'insensitive' } } } },
      ];
    }

    const allowedSort = ['createdAt', 'updatedAt', 'ticketNumber', 'priority', 'status', 'title'];
    const sortBy = allowedSort.includes(query.sortBy || '') ? query.sortBy : 'createdAt';
    const sortOrder = (query.sortOrder || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';

    // 1. Only Maintenance
    if (canIncludeMaint && !canIncludeSpec) {
      const [total, list] = await Promise.all([
        this.prisma.maintenanceRequest.count({ where: maintWhere }),
        this.prisma.maintenanceRequest.findMany({
          where: maintWhere,
          skip: query.skip,
          take: query.limit,
          orderBy: { [sortBy as string]: sortOrder },
          include: {
            requester: { select: USER_SELECT },
            items: {
              where: { deletedAt: null },
              include: {
                item: { select: { id: true, name: true, unitOfMeasure: true, status: true } },
                issueCategory: { select: { id: true, name: true } },
                issueType: { select: { id: true, name: true } },
                technicians: {
                  include: {
                    technician: { select: { id: true, fullName: true, email: true, phone: true } },
                    workLogs: {
                      select: {
                        id: true,
                        workDone: true,
                        timeSpentMinutes: true,
                        status: true,
                        logDate: true,
                      },
                      take: 1,
                      orderBy: { logDate: 'desc' },
                    },
                  },
                },
              },
            },
            files: true,
          },
        }),
      ]);

      const formatted = list.map((m) => this.formatMaintenanceRequest(m));
      return PaginatedResult.of(formatted, total, query.page ?? 1, query.limit ?? 20);
    }

    // 2. Only Specification
    if (canIncludeSpec && !canIncludeMaint) {
      const [total, list] = await Promise.all([
        this.prisma.specificationRequest.count({ where: specWhere }),
        this.prisma.specificationRequest.findMany({
          where: specWhere,
          skip: query.skip,
          take: query.limit,
          orderBy: { [sortBy as string]: sortOrder },
          include: {
            requester: { select: USER_SELECT },
            items: {
              where: { deletedAt: null },
              include: {
                category: { select: { id: true, name: true } },
              },
            },
            files: true,
          },
        }),
      ]);

      const formatted = list.map((s) => this.formatSpecificationRequest(s));
      return PaginatedResult.of(formatted, total, query.page ?? 1, query.limit ?? 20);
    }

    // 3. Combined query (Maintenance + Specification)
    const [maintTotal, specTotal, maintList, specList] = await Promise.all([
      this.prisma.maintenanceRequest.count({ where: maintWhere }),
      this.prisma.specificationRequest.count({ where: specWhere }),
      this.prisma.maintenanceRequest.findMany({
        where: maintWhere,
        take: query.skip + (query.limit ?? 20),
        orderBy: { [sortBy as string]: sortOrder },
        include: {
          requester: { select: USER_SELECT },
          items: {
            where: { deletedAt: null },
            include: {
              item: { select: { id: true, name: true, unitOfMeasure: true, status: true } },
              issueCategory: { select: { id: true, name: true } },
              issueType: { select: { id: true, name: true } },
              technicians: {
                include: {
                  technician: { select: { id: true, fullName: true, email: true, phone: true } },
                  workLogs: {
                    select: {
                      id: true,
                      workDone: true,
                      timeSpentMinutes: true,
                      status: true,
                      logDate: true,
                    },
                    take: 1,
                    orderBy: { logDate: 'desc' },
                  },
                },
              },
            },
          },
          files: true,
        },
      }),
      this.prisma.specificationRequest.findMany({
        where: specWhere,
        take: query.skip + (query.limit ?? 20),
        orderBy: { [sortBy as string]: sortOrder },
        include: {
          requester: { select: USER_SELECT },
          items: {
            where: { deletedAt: null },
            include: {
              category: { select: { id: true, name: true } },
            },
          },
          files: true,
        },
      }),
    ]);

    const formattedMaint = maintList.map((m) => this.formatMaintenanceRequest(m));
    const formattedSpec = specList.map((s) => this.formatSpecificationRequest(s));

    const combined = [...formattedMaint, ...formattedSpec].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    const paged = combined.slice(query.skip, query.skip + (query.limit ?? 20));
    return PaginatedResult.of(paged, maintTotal + specTotal, query.page ?? 1, query.limit ?? 20);
  }

  /**
   * Technician live workload and allocation matrix
   */
  async getTechniciansWorkload() {
    // Find all users who are technicians or have technician task permissions
    const technicians = await this.prisma.user.findMany({
      where: {
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
          {
            itemAssignments: {
              some: {},
            },
          },
        ],
      },
      include: {
        organizationUnit: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        itemAssignments: {
          include: {
            requestItem: {
              include: {
                maintenanceRequest: {
                  select: {
                    id: true,
                    ticketNumber: true,
                    title: true,
                    priority: true,
                    status: true,
                    createdAt: true,
                  },
                },
              },
            },
          },
        },
        workLogs: {
          select: {
            timeSpentMinutes: true,
          },
        },
      },
      orderBy: { fullName: 'asc' },
    });

    return technicians.map((tech) => {
      const assignments = tech.itemAssignments || [];

      const activeAssignments = assignments.filter(
        (a) => a.status === 'ASSIGNED' || a.status === 'IN_PROGRESS',
      );
      const completedAssignments = assignments.filter((a) => a.status === 'COMPLETED');
      const notFixedAssignments = assignments.filter((a) => a.status === 'NOT_FIXED');

      const totalMinutesLogged = (tech.workLogs || []).reduce(
        (sum, log) => sum + (log.timeSpentMinutes || 0),
        0,
      );

      // Default capacity: 5 concurrent tasks
      const capacity = 5;
      const utilization = Math.min(100, Math.round((activeAssignments.length / capacity) * 100));

      // Extract unique active requests assigned to this technician
      const assignedRequestsMap = new Map<string, any>();
      for (const assign of activeAssignments) {
        const req = assign.requestItem?.maintenanceRequest;
        if (req && !assignedRequestsMap.has(req.id)) {
          assignedRequestsMap.set(req.id, {
            id: req.id,
            ticketNumber: req.ticketNumber,
            title: req.title,
            priority: req.priority,
            status: req.status,
            taskStatus: assign.status,
            assignedAt: assign.assignedAt,
          });
        }
      }

      return {
        id: tech.id,
        fullName: tech.fullName,
        email: tech.email,
        phone: tech.phone,
        unit: tech.organizationUnit?.name || 'ICT Maintenance Unit',
        unitCode: tech.organizationUnit?.code || 'ICT',
        role: 'Maintenance Technician',
        capacity,
        activeTasksCount: activeAssignments.length,
        completedTasksCount: completedAssignments.length,
        notFixedTasksCount: notFixedAssignments.length,
        totalAssignedCount: assignments.length,
        totalMinutesLogged,
        utilization,
        assignedRequests: Array.from(assignedRequestsMap.values()),
      };
    });
  }

  private formatMaintenanceRequest(raw: any) {
    return {
      id: raw.id,
      ticketNumber: raw.ticketNumber,
      requestType: 'MAINTENANCE',
      priority: raw.priority,
      status: raw.status,
      title: raw.title,
      description: raw.description,
      requestedAt: raw.requestedAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      requesterId: raw.requesterId,
      requester: raw.requester,
      organizationUnitId: raw.requester?.organizationUnitId ?? null,
      organizationUnit: raw.requester?.organizationUnit ?? null,
      items:
        raw.items?.map((it: any) => ({
          id: it.id,
          maintenanceRequestId: it.maintenanceRequestId,
          itemId: it.itemId,
          priority: it.priority,
          description: it.description,
          item: it.item,
          issueCategory: it.issueCategory,
          issueType: it.issueType,
          technicians:
            it.technicians?.map((t: any) => ({
              id: t.id,
              technicianId: t.technicianId,
              status: t.status,
              notes: t.notes,
              isLead: t.isLead,
              assignedAt: t.assignedAt,
              technician: t.technician,
              workLog: t.workLogs?.[0]
                ? {
                    id: t.workLogs[0].id,
                    activity: t.workLogs[0].workDone,
                    timeSpentMinutes: t.workLogs[0].timeSpentMinutes,
                    status: t.workLogs[0].status,
                    loggedAt: t.workLogs[0].logDate,
                  }
                : undefined,
            })) ?? [],
        })) ?? [],
      specificationItems: [],
      files: (raw.files || []).map((f: any) => ({
        ...f,
        sizeBytes: Number(f.sizeBytes),
        downloadUrl: `/api/requests/${raw.id}/files/${f.id}/download`,
      })),
    };
  }

  private formatSpecificationRequest(raw: any) {
    return {
      id: raw.id,
      ticketNumber: raw.ticketNumber,
      requestType: 'SPECIFICATION',
      priority: raw.priority,
      status: raw.status,
      title: raw.title,
      description: raw.description,
      requestedAt: raw.requestedAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      requesterId: raw.requesterId,
      requester: raw.requester,
      organizationUnitId: raw.requester?.organizationUnitId ?? null,
      organizationUnit: raw.requester?.organizationUnit ?? null,
      items: [],
      specificationItems:
        raw.items?.map((it: any) => ({
          id: it.id,
          specificationRequestId: raw.id,
          requestedItemName: it.requestedItemName,
          quantity: it.quantity,
          unitOfMeasure: it.unitOfMeasure,
          priority: it.priority,
          description: it.description,
          category: it.category,
        })) ?? [],
      files: (raw.files || []).map((f: any) => ({
        ...f,
        sizeBytes: Number(f.sizeBytes),
        downloadUrl: `/api/requests/${raw.id}/files/${f.id}/download`,
      })),
    };
  }
}
