"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const PERMISSIONS = [
    { name: '*', resource: '*', description: 'Superuser wildcard access to all resources' },
    { name: 'users:create', resource: 'users', description: 'Create users' },
    { name: 'users:read', resource: 'users', description: 'View users' },
    { name: 'users:update', resource: 'users', description: 'Update users' },
    { name: 'users:delete', resource: 'users', description: 'Soft delete users' },
    {
        name: 'users:assign-roles',
        resource: 'users',
        description: 'Assign roles to users',
    },
    {
        name: 'users:assign-permissions',
        resource: 'users',
        description: 'Grant direct permissions to users',
    },
    { name: 'roles:create', resource: 'roles', description: 'Create roles' },
    { name: 'roles:read', resource: 'roles', description: 'View roles' },
    { name: 'roles:update', resource: 'roles', description: 'Update roles' },
    { name: 'roles:delete', resource: 'roles', description: 'Delete roles' },
    {
        name: 'permissions:create',
        resource: 'permissions',
        description: 'Create permissions',
    },
    {
        name: 'permissions:read',
        resource: 'permissions',
        description: 'View permissions',
    },
    {
        name: 'permissions:update',
        resource: 'permissions',
        description: 'Update permissions',
    },
    {
        name: 'permissions:delete',
        resource: 'permissions',
        description: 'Delete permissions',
    },
    {
        name: 'organization:create',
        resource: 'organization',
        description: 'Create organization units',
    },
    {
        name: 'organization:update',
        resource: 'organization',
        description: 'Update organization units',
    },
    {
        name: 'organization:delete',
        resource: 'organization',
        description: 'Delete organization units',
    },
    {
        name: 'items:create',
        resource: 'items',
        description: 'Manage item catalog',
    },
    { name: 'items:read', resource: 'items', description: 'View item catalog' },
    { name: 'items:update', resource: 'items', description: 'Update items' },
    { name: 'items:delete', resource: 'items', description: 'Delete items' },
    {
        name: 'issue-types:create',
        resource: 'issue-types',
        description: 'Manage issue types',
    },
    {
        name: 'issue-types:read',
        resource: 'issue-types',
        description: 'View issue types',
    },
    {
        name: 'issue-types:update',
        resource: 'issue-types',
        description: 'Update issue types',
    },
    {
        name: 'issue-types:delete',
        resource: 'issue-types',
        description: 'Delete issue types',
    },
    {
        name: 'requests:create',
        resource: 'requests',
        description: 'Create maintenance requests',
    },
    {
        name: 'requests:read',
        resource: 'requests',
        description: 'View maintenance requests',
    },
    {
        name: 'requests:update',
        resource: 'requests',
        description: 'Update maintenance requests',
    },
    {
        name: 'requests:update-status',
        resource: 'requests',
        description: 'Change request status',
    },
    {
        name: 'requests:delete',
        resource: 'requests',
        description: 'Delete maintenance requests',
    },
    {
        name: 'requests:assign-technicians',
        resource: 'requests',
        description: 'Assign technicians to request items',
    },
    {
        name: 'work-logs:create',
        resource: 'work-logs',
        description: 'Create work logs',
    },
    {
        name: 'work-logs:read',
        resource: 'work-logs',
        description: 'View work logs',
    },
    {
        name: 'work-logs:review',
        resource: 'work-logs',
        description: 'Accept or reject work logs',
    },
    {
        name: 'work-logs:delete',
        resource: 'work-logs',
        description: 'Delete work logs',
    },
    {
        name: 'approvals:create',
        resource: 'approvals',
        description: 'Create approval requests',
    },
    {
        name: 'approvals:read',
        resource: 'approvals',
        description: 'View approval requests',
    },
    {
        name: 'approvals:forward',
        resource: 'approvals',
        description: 'Forward approval requests',
    },
    {
        name: 'approvals:review',
        resource: 'approvals',
        description: 'Approve or reject requests',
    },
    {
        name: 'approvals:delete',
        resource: 'approvals',
        description: 'Delete approval requests',
    },
    {
        name: 'notifications:create',
        resource: 'notifications',
        description: 'Send notifications',
    },
    {
        name: 'tasks:ict-director',
        resource: 'tasks',
        description: 'Manage and review requests as ICT Director',
    },
    {
        name: 'tasks:technician',
        resource: 'tasks',
        description: 'Execute assigned maintenance tasks',
    },
];
const ROLES = [
    {
        name: 'ADMIN',
        description: 'Full access to every resource',
        dashboardRoute: '/admin',
        permissions: '*',
    },
    {
        name: 'MANAGER',
        description: 'Approves, assigns and reviews work',
        dashboardRoute: '/manager',
        permissions: [
            'users:read',
            'organization:update',
            'items:read',
            'issue-types:read',
            'requests:read',
            'requests:update',
            'requests:update-status',
            'requests:assign-technicians',
            'work-logs:read',
            'work-logs:review',
            'approvals:read',
            'approvals:forward',
            'approvals:review',
            'tasks:ict-director',
        ],
    },
    {
        name: 'TECHNICIAN',
        description: 'Works on assigned items and submits work logs',
        dashboardRoute: '/technician',
        permissions: [
            'items:read',
            'issue-types:read',
            'requests:read',
            'work-logs:create',
            'work-logs:read',
            'tasks:technician',
        ],
    },
    {
        name: 'REQUESTER',
        description: 'Creates and tracks own maintenance requests',
        dashboardRoute: '/requests',
        permissions: ['requests:create', 'requests:read', 'items:read'],
    },
];
async function main() {
    await prisma.permission.createMany({
        data: PERMISSIONS,
        skipDuplicates: true,
    });
    const permissions = await prisma.permission.findMany({
        select: { id: true, name: true },
    });
    const permissionIdByName = new Map(permissions.map((permission) => [permission.name, permission.id]));
    for (const role of ROLES) {
        const permissionIds = role.permissions === '*'
            ? permissions.map((permission) => permission.id)
            : role.permissions
                .map((name) => permissionIdByName.get(name))
                .filter((id) => Boolean(id));
        await prisma.role.upsert({
            where: { name: role.name },
            update: {
                description: role.description,
                dashboardRoute: role.dashboardRoute,
                isActive: true,
            },
            create: {
                name: role.name,
                description: role.description,
                dashboardRoute: role.dashboardRoute,
            },
        });
        const dbRole = await prisma.role.findUniqueOrThrow({
            where: { name: role.name },
        });
        await prisma.rolePermission.deleteMany({ where: { roleId: dbRole.id } });
        await prisma.rolePermission.createMany({
            data: permissionIds.map((permissionId) => ({
                roleId: dbRole.id,
                permissionId,
            })),
            skipDuplicates: true,
        });
    }
    const adminRole = await prisma.role.findUniqueOrThrow({
        where: { name: 'ADMIN' },
    });
    const email = (process.env.ADMIN_EMAIL ?? 'admin@example.com').toLowerCase();
    const password = process.env.ADMIN_PASSWORD ?? 'Admin@12345';
    const passwordHash = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS ?? 10));
    const admin = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            fullName: 'System Administrator',
            email,
            passwordHash,
            isActive: true,
            emailVerifiedAt: new Date(),
            membershipRole: client_1.OrganizationMembershipRole.LEADER,
            roleAssignments: { create: [{ roleId: adminRole.id }] },
        },
        select: { id: true },
    });
    await prisma.userRole.createMany({
        data: [{ userId: admin.id, roleId: adminRole.id }],
        skipDuplicates: true,
    });
    const managerRole = await prisma.role.findUniqueOrThrow({ where: { name: 'MANAGER' } });
    const technicianRole = await prisma.role.findUniqueOrThrow({ where: { name: 'TECHNICIAN' } });
    const requesterRole = await prisma.role.findUniqueOrThrow({ where: { name: 'REQUESTER' } });
    const defaultPasswordHash = await bcrypt.hash('Password@12345', Number(process.env.BCRYPT_SALT_ROUNDS ?? 10));
    const director = await prisma.user.upsert({
        where: { email: 'director@example.com' },
        update: {},
        create: {
            fullName: 'Dr. Dawit Bekele (ICT Director)',
            email: 'director@example.com',
            passwordHash: defaultPasswordHash,
            isActive: true,
            emailVerifiedAt: new Date(),
            membershipRole: client_1.OrganizationMembershipRole.LEADER,
            roleAssignments: { create: [{ roleId: managerRole.id }] },
        },
        select: { id: true },
    });
    await prisma.userRole.createMany({
        data: [{ userId: director.id, roleId: managerRole.id }],
        skipDuplicates: true,
    });
    const supervisor = await prisma.user.upsert({
        where: { email: 'supervisor@example.com' },
        update: {},
        create: {
            fullName: 'Samuel Tefera (Supervisor)',
            email: 'supervisor@example.com',
            passwordHash: defaultPasswordHash,
            isActive: true,
            emailVerifiedAt: new Date(),
            membershipRole: client_1.OrganizationMembershipRole.LEADER,
            roleAssignments: { create: [{ roleId: requesterRole.id }] },
        },
        select: { id: true },
    });
    await prisma.userRole.createMany({
        data: [{ userId: supervisor.id, roleId: requesterRole.id }],
        skipDuplicates: true,
    });
    const tech1 = await prisma.user.upsert({
        where: { email: 'tech1@example.com' },
        update: {},
        create: {
            fullName: 'Abel Hailu (Technician)',
            email: 'tech1@example.com',
            passwordHash: defaultPasswordHash,
            isActive: true,
            emailVerifiedAt: new Date(),
            membershipRole: client_1.OrganizationMembershipRole.MEMBER,
            roleAssignments: { create: [{ roleId: technicianRole.id }] },
        },
        select: { id: true },
    });
    await prisma.userRole.createMany({
        data: [{ userId: tech1.id, roleId: technicianRole.id }],
        skipDuplicates: true,
    });
    const tech2 = await prisma.user.upsert({
        where: { email: 'tech2@example.com' },
        update: {},
        create: {
            fullName: 'Sara Tadesse (Technician)',
            email: 'tech2@example.com',
            passwordHash: defaultPasswordHash,
            isActive: true,
            emailVerifiedAt: new Date(),
            membershipRole: client_1.OrganizationMembershipRole.MEMBER,
            roleAssignments: { create: [{ roleId: technicianRole.id }] },
        },
        select: { id: true },
    });
    await prisma.userRole.createMany({
        data: [{ userId: tech2.id, roleId: technicianRole.id }],
        skipDuplicates: true,
    });
    const requester = await prisma.user.upsert({
        where: { email: 'requester@example.com' },
        update: {},
        create: {
            fullName: 'Marta Alene (Requester)',
            email: 'requester@example.com',
            passwordHash: defaultPasswordHash,
            isActive: true,
            emailVerifiedAt: new Date(),
            membershipRole: client_1.OrganizationMembershipRole.MEMBER,
            roleAssignments: { create: [{ roleId: requesterRole.id }] },
        },
        select: { id: true },
    });
    await prisma.userRole.createMany({
        data: [{ userId: requester.id, roleId: requesterRole.id }],
        skipDuplicates: true,
    });
    const ws1Supervisor = await prisma.user.upsert({
        where: { email: 'ws1sup@example.com' },
        update: {},
        create: {
            fullName: 'Yonas Lemma (Workshop One Supervisor)',
            email: 'ws1sup@example.com',
            passwordHash: defaultPasswordHash,
            isActive: true,
            emailVerifiedAt: new Date(),
            membershipRole: client_1.OrganizationMembershipRole.LEADER,
            roleAssignments: { create: [{ roleId: requesterRole.id }] },
        },
        select: { id: true },
    });
    await prisma.userRole.createMany({
        data: [{ userId: ws1Supervisor.id, roleId: requesterRole.id }],
        skipDuplicates: true,
    });
    const ws1Member = await prisma.user.upsert({
        where: { email: 'ws1user@example.com' },
        update: {},
        create: {
            fullName: 'Kassahun Desta (Workshop One Member)',
            email: 'ws1user@example.com',
            passwordHash: defaultPasswordHash,
            isActive: true,
            emailVerifiedAt: new Date(),
            membershipRole: client_1.OrganizationMembershipRole.MEMBER,
            roleAssignments: { create: [{ roleId: requesterRole.id }] },
        },
        select: { id: true },
    });
    await prisma.userRole.createMany({
        data: [{ userId: ws1Member.id, roleId: requesterRole.id }],
        skipDuplicates: true,
    });
    const mechanicalCat = await prisma.issueCategory.upsert({
        where: { slug: 'mechanical' },
        update: { name: 'Mechanical' },
        create: { name: 'Mechanical', slug: 'mechanical', description: 'Mechanical machinery, gearboxes, pumps and piping' },
    });
    const electricalCat = await prisma.issueCategory.upsert({
        where: { slug: 'electrical' },
        update: { name: 'Electrical' },
        create: { name: 'Electrical', slug: 'electrical', description: 'Electrical panels, motors, wiring and sensors' },
    });
    const preventiveCat = await prisma.issueCategory.upsert({
        where: { slug: 'preventive' },
        update: { name: 'Preventive' },
        create: { name: 'Preventive', slug: 'preventive', description: 'Scheduled preventive inspections and servicing' },
    });
    const correctiveCat = await prisma.issueCategory.upsert({
        where: { slug: 'corrective' },
        update: { name: 'Corrective' },
        create: { name: 'Corrective', slug: 'corrective', description: 'Emergency repairs and breakdown fixes' },
    });
    const plumbingCat = await prisma.issueCategory.upsert({
        where: { slug: 'structural-plumbing' },
        update: { name: 'Structural & Plumbing' },
        create: { name: 'Structural & Plumbing', slug: 'structural-plumbing', description: 'Facility structure, leaks, valves and plumbing' },
    });
    await prisma.issueType.upsert({
        where: { slug: 'leaking' },
        update: { issueCategoryId: mechanicalCat.id },
        create: { name: 'Leaking', slug: 'leaking', needsApproval: false, issueCategoryId: mechanicalCat.id, description: 'Fluid or air pressure leakage' },
    });
    await prisma.issueType.upsert({
        where: { slug: 'overheating' },
        update: { issueCategoryId: mechanicalCat.id },
        create: { name: 'Overheating', slug: 'overheating', needsApproval: true, issueCategoryId: mechanicalCat.id, description: 'Motor or bearing running at elevated temperature' },
    });
    await prisma.issueType.upsert({
        where: { slug: 'not-working' },
        update: { issueCategoryId: electricalCat.id },
        create: { name: 'Not working', slug: 'not-working', needsApproval: false, issueCategoryId: electricalCat.id, description: 'Equipment fails to power on or start' },
    });
    await prisma.issueType.upsert({
        where: { slug: 'short-circuit' },
        update: { issueCategoryId: electricalCat.id },
        create: { name: 'Short Circuit / Trip', slug: 'short-circuit', needsApproval: true, issueCategoryId: electricalCat.id, description: 'Circuit breaker trips repeatedly' },
    });
    await prisma.issueType.upsert({
        where: { slug: 'replacement-required' },
        update: { issueCategoryId: correctiveCat.id },
        create: { name: 'Replacement required', slug: 'replacement-required', needsApproval: true, issueCategoryId: correctiveCat.id, description: 'Worn or broken component requires complete replacement' },
    });
    await prisma.issueType.upsert({
        where: { slug: 'scheduled-service' },
        update: { issueCategoryId: preventiveCat.id },
        create: { name: 'Scheduled Periodic Service', slug: 'scheduled-service', needsApproval: false, issueCategoryId: preventiveCat.id, description: 'Routine 500/1000 hr operating service' },
    });
    await prisma.issueType.upsert({
        where: { slug: 'pipe-blockage' },
        update: { issueCategoryId: plumbingCat.id },
        create: { name: 'Pipe Blockage or Burst', slug: 'pipe-blockage', needsApproval: false, issueCategoryId: plumbingCat.id, description: 'Drainage blockage or pipe rupture' },
    });
    const consumablesCat = await prisma.itemCategory.upsert({
        where: { name: 'Consumables' },
        update: { description: 'Gaskets, filters, belts, fuses and daily consumable materials' },
        create: { name: 'Consumables', description: 'Gaskets, filters, belts, fuses and daily consumable materials' },
    });
    const sparePartsCat = await prisma.itemCategory.upsert({
        where: { name: 'Spare Parts' },
        update: { description: 'Replacement mechanical and electrical spares' },
        create: { name: 'Spare Parts', description: 'Replacement mechanical and electrical spares' },
    });
    const toolsCat = await prisma.itemCategory.upsert({
        where: { name: 'Tools & Hardware' },
        update: { description: 'Workshop tools, diagnostic instruments and fasteners' },
        create: { name: 'Tools & Hardware', description: 'Workshop tools, diagnostic instruments and fasteners' },
    });
    const lubricantsCat = await prisma.itemCategory.upsert({
        where: { name: 'Lubricants & Chemicals' },
        update: { description: 'Oils, greases, degreasers and coolants' },
        create: { name: 'Lubricants & Chemicals', description: 'Oils, greases, degreasers and coolants' },
    });
    await prisma.item.upsert({
        where: { id: '00000000-0000-4000-8000-000000000001' },
        update: { categoryId: sparePartsCat.id },
        create: {
            id: '00000000-0000-4000-8000-000000000001',
            name: 'Bearing 6205-2RS',
            unitOfMeasure: 'piece',
            categoryId: sparePartsCat.id,
            status: client_1.ItemStatus.ACTIVE,
        },
    });
    await prisma.item.upsert({
        where: { id: '00000000-0000-4000-8000-000000000002' },
        update: { categoryId: lubricantsCat.id },
        create: {
            id: '00000000-0000-4000-8000-000000000002',
            name: 'Hydraulic Oil ISO VG 46',
            unitOfMeasure: 'liter',
            categoryId: lubricantsCat.id,
            status: client_1.ItemStatus.ACTIVE,
        },
    });
    await prisma.item.upsert({
        where: { id: '00000000-0000-4000-8000-000000000003' },
        update: { categoryId: toolsCat.id },
        create: {
            id: '00000000-0000-4000-8000-000000000003',
            name: 'Digital Multimeter Fluke 117',
            unitOfMeasure: 'unit',
            categoryId: toolsCat.id,
            status: client_1.ItemStatus.ACTIVE,
        },
    });
    await prisma.item.upsert({
        where: { id: '00000000-0000-4000-8000-000000000004' },
        update: { categoryId: consumablesCat.id },
        create: {
            id: '00000000-0000-4000-8000-000000000004',
            name: 'Industrial Air Intake Filter 250mm',
            unitOfMeasure: 'piece',
            categoryId: consumablesCat.id,
            status: client_1.ItemStatus.ACTIVE,
        },
    });
    await prisma.item.upsert({
        where: { id: '00000000-0000-4000-8000-000000000005' },
        update: { categoryId: sparePartsCat.id },
        create: {
            id: '00000000-0000-4000-8000-000000000005',
            name: 'V-Belt B-58 Heavy Duty',
            unitOfMeasure: 'piece',
            categoryId: sparePartsCat.id,
            status: client_1.ItemStatus.ACTIVE,
        },
    });
    const unitTypes = [
        { name: 'Institute', code: 'INSTITUTE', description: 'Top-level institute or institution' },
        { name: 'Directorate', code: 'DIRECTORATE', description: 'Executive directorate' },
        { name: 'Division', code: 'DIVISION', description: 'Operational division' },
        { name: 'Faculty', code: 'FACULTY', description: 'Academic faculty or school' },
        { name: 'Department', code: 'DEPARTMENT', description: 'Operational or academic department' },
        { name: 'Center', code: 'CENTER', description: 'Specialized research or service center' },
        { name: 'Laboratory', code: 'LABORATORY', description: 'Technical or research laboratory' },
        { name: 'Unit', code: 'UNIT', description: 'Functional operating unit' },
        { name: 'Office', code: 'OFFICE', description: 'Administrative or service office' },
        { name: 'Section', code: 'SECTION', description: 'Subdivision or section' },
        { name: 'Workshop', code: 'WORKSHOP', description: 'Maintenance and repair workshop' },
    ];
    for (const ut of unitTypes) {
        await prisma.organizationUnitType.upsert({
            where: { name: ut.name },
            update: { code: ut.code, description: ut.description },
            create: ut,
        });
    }
    const orgUnit = await prisma.organizationUnit.findFirst({
        where: { OR: [{ code: 'ROOT' }, { name: 'Root' }] },
        select: { id: true },
    });
    await prisma.organizationUnit.updateMany({
        where: {
            supervisorId: {
                in: [admin.id, supervisor.id, ws1Supervisor.id],
            },
        },
        data: { supervisorId: null },
    });
    const rootUnit = await prisma.organizationUnit.upsert({
        where: { code: 'ROOT' },
        update: {
            name: 'Ethiopian Artificial Intelligence',
            code: 'ROOT',
            supervisorId: admin.id,
        },
        create: {
            name: 'Ethiopian Artificial Intelligence',
            code: 'ROOT',
            unitType: 'ROOT',
            supervisorId: admin.id,
        },
        select: { id: true },
    });
    await prisma.user.update({
        where: { id: admin.id },
        data: { organizationUnitId: rootUnit.id },
    });
    const workshopSection = await prisma.organizationUnit.upsert({
        where: { code: 'WORKSHOP-SEC' },
        update: {
            name: 'Workshop Section',
            parentId: rootUnit.id,
            supervisorId: supervisor.id,
        },
        create: {
            name: 'Workshop Section',
            code: 'WORKSHOP-SEC',
            unitType: 'WORKSHOP',
            parentId: rootUnit.id,
            supervisorId: supervisor.id,
        },
        select: { id: true },
    });
    await prisma.user.update({
        where: { id: supervisor.id },
        data: { organizationUnitId: workshopSection.id },
    });
    await prisma.user.update({
        where: { id: requester.id },
        data: { organizationUnitId: workshopSection.id },
    });
    const existingWo = await prisma.organizationUnit.findFirst({
        where: { OR: [{ code: 'WO-01' }, { code: 'WORKSHOP-ONE' }, { name: 'Workshop One' }] },
    });
    const workshopOne = existingWo
        ? await prisma.organizationUnit.update({
            where: { id: existingWo.id },
            data: {
                name: 'Workshop One',
                parentId: workshopSection.id,
                supervisorId: ws1Supervisor.id,
            },
            select: { id: true },
        })
        : await prisma.organizationUnit.create({
            data: {
                name: 'Workshop One',
                code: 'WO-01',
                unitType: 'WORKSHOP',
                parentId: workshopSection.id,
                supervisorId: ws1Supervisor.id,
            },
            select: { id: true },
        });
    await prisma.user.update({
        where: { id: ws1Supervisor.id },
        data: { organizationUnitId: workshopOne.id },
    });
    await prisma.user.update({
        where: { id: ws1Member.id },
        data: { organizationUnitId: workshopOne.id },
    });
    const bearingItem = await prisma.item.findFirst({ where: { name: { contains: 'Bearing' } } });
    const filterItem = await prisma.item.findFirst({ where: { name: { contains: 'Air' } } });
    const mechCategory = await prisma.issueCategory.findFirst({ where: { slug: 'mechanical' } });
    const prevCategory = await prisma.issueCategory.findFirst({ where: { slug: 'preventive' } });
    const overheatIssue = await prisma.issueType.findFirst({ where: { slug: 'overheating' } });
    const serviceIssue = await prisma.issueType.findFirst({ where: { slug: 'scheduled-service' } });
    if (bearingItem && mechCategory && overheatIssue) {
        await prisma.maintenanceRequest.upsert({
            where: { ticketNumber: 'MR-2026-0001' },
            update: {},
            create: {
                ticketNumber: 'MR-2026-0001',
                requesterId: admin.id,
                title: 'CNC Lathe Spindle Bearing Vibration',
                description: 'Unusual vibration and elevated noise observed during high-speed rotation',
                priority: client_1.RequestPriority.HIGH,
                status: client_1.RequestStatus.IN_PROGRESS,
                items: {
                    create: {
                        itemId: bearingItem.id,
                        issueCategoryId: mechCategory.id,
                        issueTypeId: overheatIssue.id,
                        priority: client_1.RequestPriority.HIGH,
                        description: 'Bearing running hot after 30 mins operation',
                        technicians: {
                            create: {
                                technicianId: tech1.id,
                                isLead: true,
                                status: client_1.TechnicianAssignmentStatus.ASSIGNED,
                                notes: 'Lead engineer for spindle diagnostic',
                            },
                        },
                    },
                },
                statusHistory: {
                    create: [
                        { toStatus: client_1.RequestStatus.PENDING, changedById: admin.id, reason: 'Initial ticket submitted' },
                        { toStatus: client_1.RequestStatus.APPROVED, changedById: admin.id, reason: 'Approved by maintenance supervisor' },
                        { toStatus: client_1.RequestStatus.IN_PROGRESS, changedById: admin.id, reason: 'Technician dispatched for vibration test' },
                    ],
                },
            },
        });
    }
    if (filterItem && prevCategory && serviceIssue) {
        await prisma.maintenanceRequest.upsert({
            where: { ticketNumber: 'MR-2026-0002' },
            update: {},
            create: {
                ticketNumber: 'MR-2026-0002',
                requesterId: admin.id,
                title: 'Air Compressor Intake Filter Replacement',
                description: 'Routine intake air filter replacement for primary workshop compressor',
                priority: client_1.RequestPriority.MEDIUM,
                status: client_1.RequestStatus.PENDING,
                items: {
                    create: {
                        itemId: filterItem.id,
                        issueCategoryId: prevCategory.id,
                        issueTypeId: serviceIssue.id,
                        priority: client_1.RequestPriority.MEDIUM,
                        description: '500-hour operational service due',
                    },
                },
                statusHistory: {
                    create: [
                        { toStatus: client_1.RequestStatus.PENDING, changedById: admin.id, reason: 'Scheduled PM task submitted' },
                    ],
                },
            },
        });
    }
    const shortCircuitIssue = await prisma.issueType.findFirst({ where: { slug: 'short-circuit' } });
    if (bearingItem && mechCategory && shortCircuitIssue) {
        await prisma.maintenanceRequest.upsert({
            where: { ticketNumber: 'MR-2026-0003' },
            update: { requesterId: ws1Member.id },
            create: {
                ticketNumber: 'MR-2026-0003',
                requesterId: ws1Member.id,
                title: 'Drill Press Spindle Jamming',
                description: 'Drill press spindle binding during operation; submitted by Workshop One operator',
                priority: client_1.RequestPriority.HIGH,
                status: client_1.RequestStatus.WAITING_APPROVAL,
                items: {
                    create: {
                        itemId: bearingItem.id,
                        issueCategoryId: mechCategory.id,
                        issueTypeId: shortCircuitIssue.id,
                        priority: client_1.RequestPriority.HIGH,
                        description: 'Spindle motor tripping 63A breaker',
                    },
                },
                approvalRequests: {
                    create: {
                        status: client_1.ApprovalStatus.PENDING,
                        notes: 'Requires Workshop One Supervisor review',
                    },
                },
                statusHistory: {
                    create: [
                        { toStatus: client_1.RequestStatus.WAITING_APPROVAL, changedById: ws1Member.id, reason: 'Submitted by operator, awaiting Workshop One supervisor' },
                    ],
                },
            },
        });
        await prisma.maintenanceRequest.upsert({
            where: { ticketNumber: 'MR-2026-0004' },
            update: { requesterId: ws1Supervisor.id },
            create: {
                ticketNumber: 'MR-2026-0004',
                requesterId: ws1Supervisor.id,
                title: 'Workshop One Exhaust Ventilation Failure',
                description: 'Primary exhaust fan motor failure in Workshop One; escalated to Workshop Section supervisor',
                priority: client_1.RequestPriority.HIGH,
                status: client_1.RequestStatus.WAITING_APPROVAL,
                items: {
                    create: {
                        itemId: bearingItem.id,
                        issueCategoryId: mechCategory.id,
                        issueTypeId: shortCircuitIssue.id,
                        priority: client_1.RequestPriority.HIGH,
                        description: 'Main blower motor seized',
                    },
                },
                approvalRequests: {
                    create: {
                        status: client_1.ApprovalStatus.PENDING,
                        notes: 'Escalated to Workshop Section Supervisor for approval',
                    },
                },
                statusHistory: {
                    create: [
                        { toStatus: client_1.RequestStatus.WAITING_APPROVAL, changedById: ws1Supervisor.id, reason: 'Submitted by WS1 supervisor, awaiting Section supervisor approval' },
                    ],
                },
            },
        });
        await prisma.maintenanceRequest.upsert({
            where: { ticketNumber: 'MR-2026-0005' },
            update: { requesterId: requester.id },
            create: {
                ticketNumber: 'MR-2026-0005',
                requesterId: requester.id,
                title: 'Milling Machine Motor Short Circuit',
                description: 'Direct section machine drive motor short circuit; requires Workshop Section supervisor review',
                priority: client_1.RequestPriority.HIGH,
                status: client_1.RequestStatus.WAITING_APPROVAL,
                items: {
                    create: {
                        itemId: bearingItem.id,
                        issueCategoryId: mechCategory.id,
                        issueTypeId: shortCircuitIssue.id,
                        priority: client_1.RequestPriority.HIGH,
                        description: 'Section milling drive failure',
                    },
                },
                approvalRequests: {
                    create: {
                        status: client_1.ApprovalStatus.PENDING,
                        notes: 'Requires Workshop Section Supervisor review',
                    },
                },
                statusHistory: {
                    create: [
                        { toStatus: client_1.RequestStatus.WAITING_APPROVAL, changedById: requester.id, reason: 'Submitted by Section operator, awaiting Section supervisor' },
                    ],
                },
            },
        });
        await prisma.maintenanceRequest.upsert({
            where: { ticketNumber: 'MR-2026-0006' },
            update: { requesterId: supervisor.id },
            create: {
                ticketNumber: 'MR-2026-0006',
                requesterId: supervisor.id,
                title: 'Workshop Section Main Substation Transformer Inspection',
                description: 'High voltage transformer overheating; escalated to Ethiopian Artificial Intelligence directorate supervisor',
                priority: client_1.RequestPriority.HIGH,
                status: client_1.RequestStatus.WAITING_APPROVAL,
                items: {
                    create: {
                        itemId: bearingItem.id,
                        issueCategoryId: mechCategory.id,
                        issueTypeId: shortCircuitIssue.id,
                        priority: client_1.RequestPriority.HIGH,
                        description: 'Main 15kVA transformer oil dielectric breakdown',
                    },
                },
                approvalRequests: {
                    create: {
                        status: client_1.ApprovalStatus.PENDING,
                        notes: 'Escalated to Directorate Root Supervisor for approval',
                    },
                },
                statusHistory: {
                    create: [
                        { toStatus: client_1.RequestStatus.WAITING_APPROVAL, changedById: supervisor.id, reason: 'Submitted by Section supervisor, awaiting Root supervisor approval' },
                    ],
                },
            },
        });
    }
    const toolsCategory = await prisma.itemCategory.findFirst({ where: { name: 'Tools & Hardware' } });
    const lubricantsCategory = await prisma.itemCategory.findFirst({ where: { name: 'Lubricants & Chemicals' } });
    await prisma.specificationRequest.upsert({
        where: { ticketNumber: 'SR-2026-0001' },
        update: {},
        create: {
            ticketNumber: 'SR-2026-0001',
            requesterId: admin.id,
            title: 'Digital Multimeters for Testing Technicians',
            description: 'Procurement request for Fluke 117 true-RMS digital multimeters',
            priority: client_1.RequestPriority.MEDIUM,
            status: client_1.RequestStatus.APPROVED,
            items: {
                create: [
                    {
                        categoryId: toolsCategory?.id,
                        requestedItemName: 'Digital Multimeter Fluke 117',
                        quantity: 3,
                        unitOfMeasure: 'units',
                        priority: client_1.RequestPriority.MEDIUM,
                        description: 'Needed for electrical diagnostics team',
                    },
                ],
            },
        },
    });
    await prisma.specificationRequest.upsert({
        where: { ticketNumber: 'SR-2026-0002' },
        update: {},
        create: {
            ticketNumber: 'SR-2026-0002',
            requesterId: admin.id,
            title: 'Hydraulic ISO VG 46 Oil 200L Drum',
            description: 'Quarterly stock replenishment for workshop hydraulic power units',
            priority: client_1.RequestPriority.HIGH,
            status: client_1.RequestStatus.PENDING,
            items: {
                create: [
                    {
                        categoryId: lubricantsCategory?.id,
                        requestedItemName: 'Hydraulic Oil ISO VG 46',
                        quantity: 200,
                        unitOfMeasure: 'liters',
                        priority: client_1.RequestPriority.HIGH,
                        description: 'Central hydraulic distribution stock',
                    },
                ],
            },
        },
    });
    console.log('Seed complete');
    console.log(`  Admin: ${email} / ${password} (Supervises Ethiopian Artificial Intelligence - Root)`);
    console.log(`  ICT Director: director@example.com / Password@12345 (tasks:ict-director)`);
    console.log(`  Workshop Section Supervisor: supervisor@example.com / Password@12345`);
    console.log(`  Workshop One Supervisor: ws1sup@example.com / Password@12345`);
    console.log(`  Workshop One Member: ws1user@example.com / Password@12345`);
    console.log(`  Workshop Section Member: requester@example.com / Password@12345`);
    console.log(`  Technicians: tech1@example.com, tech2@example.com / Password@12345 (tasks:technician)`);
    console.log(`  enum counts -> priority:${client_1.RequestPriority.MEDIUM}, status:${client_1.RequestStatus.PENDING}, assignment:${client_1.TechnicianAssignmentStatus.ASSIGNED}, workLog:${client_1.WorkLogStatus.PENDING}, approval:${client_1.ApprovalStatus.PENDING}`);
}
main()
    .catch((error) => {
    console.error(error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map