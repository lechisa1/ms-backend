# Maintenance System API

NestJS 11 + Prisma 6 + PostgreSQL implementation of the `my-schema` Prisma model.

## Setup

```bash
npm install
cp .env.example .env   # set DATABASE_URL
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run start:dev
```

Swagger UI: `http://localhost:3000/docs` — all routes are prefixed with `/api`.

Seed credentials: `admin@example.com` / `Admin@12345` (override with `ADMIN_EMAIL` / `ADMIN_PASSWORD`).

## Database notes

The schema follows `my-schema` exactly, with two provider-specific adjustments for
PostgreSQL:

- `provider = "postgresql"`
- `@db.DateTime(3)` → `@db.Timestamp(3)` (the MySQL native type does not exist in Postgres)

All enums, relations, unique constraints and indexes are unchanged.

## Modules

| Module | Routes | Notes |
| --- | --- | --- |
| Prisma | – | Global `PrismaService` |
| Auth | `/api/auth` | Register, login, refresh, profile, change password |
| Users | `/api/users` | CRUD, soft delete/restore, role and permission assignment |
| Roles | `/api/roles` | CRUD, replace role permissions |
| Permissions | `/api/permissions` | CRUD, bulk create |
| Organization | `/api/organization-units` | Tree, move, supervisor, members |
| Catalog | `/api/item-categories`, `/api/items`, `/api/issue-categories`, `/api/issue-types`, `/api/maintenance-categories` | Reference data |
| Requests | `/api/requests` | Ticket lifecycle, status history, updates, file uploads, stats |
| Request items | `/api/request-items`, `/api/requests/:id/items` | Items + technician assignments |
| Specification items | `/api/specification-items` | Requested items with attachments |
| Work logs | `/api/work-logs` | Items, materials, accept/reject |
| Approvals | `/api/approvals` | Forward, approve, reject |
| Notifications | `/api/notifications` | Per-user inbox |
| Health | `/api/health`, `/api/health/db` | Liveness probes |

## Auth and permissions

- `JwtAuthGuard` is global: routes are protected unless marked `@Public()`.
- `PermissionsGuard` is global: routes opt in with `@RequirePermissions('requests:create')`.
  Grants resolve from the user's roles (`RolePermission`) plus direct `UserPermission` rows,
  loaded fresh on every request by `JwtStrategy`.
- Seeded roles: `ADMIN` (all permissions), `MANAGER`, `TECHNICIAN`, `REQUESTER`.

## Request status flow

`PENDING → WAITING_APPROVAL → PENDING_APPROVAL_REVIEW → APPROVED → ASSIGNED → IN_PROGRESS → WAITING_CONFIRMATION → COMPLETED → CONFIRMED`
with `REJECTED` and `NOT_FIXED` as terminal branches. Every status change writes a
`RequestStatusHistory` row and notifies the requester.

Uploads are written to `uploads/requests` and `uploads/specifications`; only metadata is
stored in the database. `BigIntSerializerInterceptor` converts `sizeBytes` for JSON.
