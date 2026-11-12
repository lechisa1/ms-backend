-- CreateEnum
CREATE TYPE "OrganizationMembershipRole" AS ENUM ('MEMBER', 'LEADER');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "RequestPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'WAITING_APPROVAL', 'PENDING_APPROVAL_REVIEW', 'APPROVED', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_CONFIRMATION', 'COMPLETED', 'REJECTED', 'NOT_FIXED', 'CONFIRMED');

-- CreateEnum
CREATE TYPE "TechnicianAssignmentStatus" AS ENUM ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'NOT_FIXED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AssignmentRole" AS ENUM ('LEAD', 'ASSISTANT');

-- CreateEnum
CREATE TYPE "WorkLogStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'FORWARDED', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "users" (
    "id" CHAR(36) NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "password_hash" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "email_verified_at" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "last_login_ip" VARCHAR(45),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "organization_unit_id" CHAR(36),
    "membership_role" "OrganizationMembershipRole" NOT NULL DEFAULT 'MEMBER',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" CHAR(36) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "dashboard_route" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" CHAR(36) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "resource" VARCHAR(100),
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "user_id" CHAR(36) NOT NULL,
    "role_id" CHAR(36) NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "role_id" CHAR(36) NOT NULL,
    "permission_id" CHAR(36) NOT NULL,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "user_permissions" (
    "user_id" CHAR(36) NOT NULL,
    "permission_id" CHAR(36) NOT NULL,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("user_id","permission_id")
);

-- CreateTable
CREATE TABLE "organization_units" (
    "id" CHAR(36) NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "code" VARCHAR(80),
    "unit_type" VARCHAR(80),
    "description" TEXT,
    "parent_id" CHAR(36),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "supervisor_id" CHAR(36),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "organization_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_unit_types" (
    "id" CHAR(36) NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "code" VARCHAR(40),
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_unit_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_categories" (
    "id" CHAR(36) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "item_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" CHAR(36) NOT NULL,
    "category_id" CHAR(36),
    "name" VARCHAR(180) NOT NULL,
    "unit_of_measure" VARCHAR(50) NOT NULL,
    "status" "ItemStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issue_categories" (
    "id" CHAR(36) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(140) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "issue_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issue_types" (
    "id" CHAR(36) NOT NULL,
    "issue_category_id" CHAR(36),
    "name" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(140) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "needs_approval" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "issue_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_requests" (
    "id" CHAR(36) NOT NULL,
    "ticket_number" VARCHAR(40) NOT NULL,
    "requester_id" CHAR(36),
    "priority" "RequestPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "title" VARCHAR(200),
    "description" TEXT,
    "rejection_reason" TEXT,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "maintenance_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_request_items" (
    "id" CHAR(36) NOT NULL,
    "maintenance_request_id" CHAR(36) NOT NULL,
    "item_id" CHAR(36) NOT NULL,
    "issue_category_id" CHAR(36),
    "issue_type_id" CHAR(36) NOT NULL,
    "priority" "RequestPriority" NOT NULL DEFAULT 'MEDIUM',
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "maintenance_request_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_technicians" (
    "id" CHAR(36) NOT NULL,
    "request_item_id" CHAR(36) NOT NULL,
    "technician_id" CHAR(36) NOT NULL,
    "assigned_by_id" CHAR(36),
    "status" "TechnicianAssignmentStatus" NOT NULL DEFAULT 'ASSIGNED',
    "is_lead" BOOLEAN NOT NULL DEFAULT false,
    "role_in_assignment" "AssignmentRole" NOT NULL DEFAULT 'ASSISTANT',
    "notes" TEXT,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "item_technicians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specification_requests" (
    "id" CHAR(36) NOT NULL,
    "ticket_number" VARCHAR(40) NOT NULL,
    "requester_id" CHAR(36),
    "priority" "RequestPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "title" VARCHAR(200),
    "description" TEXT,
    "rejection_reason" TEXT,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "specification_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specification_items" (
    "id" CHAR(36) NOT NULL,
    "specification_request_id" CHAR(36) NOT NULL,
    "category_id" CHAR(36),
    "requested_item_name" VARCHAR(180) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_of_measure" VARCHAR(50),
    "priority" "RequestPriority" NOT NULL DEFAULT 'MEDIUM',
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "specification_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specification_request_files" (
    "id" CHAR(36) NOT NULL,
    "specification_request_id" CHAR(36) NOT NULL,
    "uploaded_by_id" CHAR(36),
    "file_name" VARCHAR(255) NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(150) NOT NULL,
    "storage_key" VARCHAR(500) NOT NULL,
    "file_type" VARCHAR(60) NOT NULL,
    "size_bytes" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "specification_request_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_logs" (
    "id" CHAR(36) NOT NULL,
    "request_id" CHAR(36) NOT NULL,
    "technician_id" CHAR(36) NOT NULL,
    "work_done" TEXT NOT NULL,
    "completion_notes" TEXT,
    "time_spent_minutes" INTEGER,
    "log_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "WorkLogStatus" NOT NULL DEFAULT 'PENDING',
    "rejected_at" TIMESTAMP(3),
    "rejected_by_id" CHAR(36),
    "rejection_reason" TEXT,
    "item_technician_id" CHAR(36),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_log_items" (
    "work_log_id" CHAR(36) NOT NULL,
    "request_item_id" CHAR(36) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "work_log_items_pkey" PRIMARY KEY ("work_log_id","request_item_id")
);

-- CreateTable
CREATE TABLE "work_log_materials" (
    "id" CHAR(36) NOT NULL,
    "work_log_id" CHAR(36) NOT NULL,
    "name" VARCHAR(180) NOT NULL,
    "quantity" DECIMAL(10,2),
    "unit" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_log_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_requests" (
    "id" CHAR(36) NOT NULL,
    "maintenance_request_id" CHAR(36) NOT NULL,
    "maintenance_request_item_id" CHAR(36),
    "technician_id" CHAR(36),
    "reviewed_by_id" CHAR(36),
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "forwarded_at" TIMESTAMP(3),
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "approval_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_status_history" (
    "id" CHAR(36) NOT NULL,
    "maintenance_request_id" CHAR(36) NOT NULL,
    "from_status" "RequestStatus",
    "to_status" "RequestStatus" NOT NULL,
    "changed_by_id" CHAR(36),
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "request_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_updates" (
    "id" CHAR(36) NOT NULL,
    "maintenance_request_id" CHAR(36) NOT NULL,
    "user_id" CHAR(36),
    "update_type" VARCHAR(60) NOT NULL,
    "update_text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "request_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_request_files" (
    "id" CHAR(36) NOT NULL,
    "maintenance_request_id" CHAR(36) NOT NULL,
    "uploaded_by_id" CHAR(36),
    "file_name" VARCHAR(255) NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(150) NOT NULL,
    "storage_key" VARCHAR(500) NOT NULL,
    "file_type" VARCHAR(60) NOT NULL,
    "size_bytes" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "maintenance_request_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specification_item_files" (
    "id" CHAR(36) NOT NULL,
    "specification_item_id" CHAR(36) NOT NULL,
    "uploaded_by_id" CHAR(36),
    "file_name" VARCHAR(255) NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(150) NOT NULL,
    "storage_key" VARCHAR(500) NOT NULL,
    "size_bytes" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "specification_item_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_histories" (
    "id" CHAR(36) NOT NULL,
    "user_id" CHAR(36) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_notifications" (
    "id" CHAR(36) NOT NULL,
    "user_id" CHAR(36) NOT NULL,
    "type" VARCHAR(150) NOT NULL,
    "payload" JSONB NOT NULL,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_is_active_deleted_at_idx" ON "users"("is_active", "deleted_at");

-- CreateIndex
CREATE INDEX "users_organization_unit_id_idx" ON "users"("organization_unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");

-- CreateIndex
CREATE INDEX "user_roles_role_id_idx" ON "user_roles"("role_id");

-- CreateIndex
CREATE INDEX "role_permissions_permission_id_idx" ON "role_permissions"("permission_id");

-- CreateIndex
CREATE INDEX "user_permissions_permission_id_idx" ON "user_permissions"("permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_units_code_key" ON "organization_units"("code");

-- CreateIndex
CREATE UNIQUE INDEX "organization_units_supervisor_id_key" ON "organization_units"("supervisor_id");

-- CreateIndex
CREATE INDEX "organization_units_parent_id_is_active_idx" ON "organization_units"("parent_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "organization_units_parent_id_name_key" ON "organization_units"("parent_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "organization_unit_types_name_key" ON "organization_unit_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "organization_unit_types_code_key" ON "organization_unit_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "item_categories_name_key" ON "item_categories"("name");

-- CreateIndex
CREATE INDEX "items_category_id_status_idx" ON "items"("category_id", "status");

-- CreateIndex
CREATE INDEX "items_name_idx" ON "items"("name");

-- CreateIndex
CREATE UNIQUE INDEX "issue_categories_name_key" ON "issue_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "issue_categories_slug_key" ON "issue_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "issue_types_slug_key" ON "issue_types"("slug");

-- CreateIndex
CREATE INDEX "issue_types_issue_category_id_is_active_idx" ON "issue_types"("issue_category_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "maintenance_requests_ticket_number_key" ON "maintenance_requests"("ticket_number");

-- CreateIndex
CREATE INDEX "maintenance_requests_requester_id_created_at_idx" ON "maintenance_requests"("requester_id", "created_at");

-- CreateIndex
CREATE INDEX "maintenance_requests_status_priority_requested_at_idx" ON "maintenance_requests"("status", "priority", "requested_at");

-- CreateIndex
CREATE INDEX "maintenance_request_items_item_id_idx" ON "maintenance_request_items"("item_id");

-- CreateIndex
CREATE INDEX "maintenance_request_items_issue_category_id_idx" ON "maintenance_request_items"("issue_category_id");

-- CreateIndex
CREATE INDEX "maintenance_request_items_issue_type_id_idx" ON "maintenance_request_items"("issue_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "maintenance_request_items_maintenance_request_id_item_id_is_key" ON "maintenance_request_items"("maintenance_request_id", "item_id", "issue_type_id");

-- CreateIndex
CREATE INDEX "item_technicians_technician_id_status_idx" ON "item_technicians"("technician_id", "status");

-- CreateIndex
CREATE INDEX "item_technicians_request_item_id_status_idx" ON "item_technicians"("request_item_id", "status");

-- CreateIndex
CREATE INDEX "item_technicians_request_item_id_is_lead_idx" ON "item_technicians"("request_item_id", "is_lead");

-- CreateIndex
CREATE INDEX "item_technicians_assigned_by_id_idx" ON "item_technicians"("assigned_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "item_technicians_request_item_id_technician_id_key" ON "item_technicians"("request_item_id", "technician_id");

-- CreateIndex
CREATE UNIQUE INDEX "specification_requests_ticket_number_key" ON "specification_requests"("ticket_number");

-- CreateIndex
CREATE INDEX "specification_requests_requester_id_created_at_idx" ON "specification_requests"("requester_id", "created_at");

-- CreateIndex
CREATE INDEX "specification_requests_status_priority_requested_at_idx" ON "specification_requests"("status", "priority", "requested_at");

-- CreateIndex
CREATE INDEX "specification_items_specification_request_id_idx" ON "specification_items"("specification_request_id");

-- CreateIndex
CREATE INDEX "specification_items_category_id_idx" ON "specification_items"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "specification_request_files_storage_key_key" ON "specification_request_files"("storage_key");

-- CreateIndex
CREATE INDEX "specification_request_files_specification_request_id_create_idx" ON "specification_request_files"("specification_request_id", "created_at");

-- CreateIndex
CREATE INDEX "specification_request_files_uploaded_by_id_idx" ON "specification_request_files"("uploaded_by_id");

-- CreateIndex
CREATE INDEX "work_logs_request_id_log_date_idx" ON "work_logs"("request_id", "log_date");

-- CreateIndex
CREATE INDEX "work_logs_technician_id_log_date_idx" ON "work_logs"("technician_id", "log_date");

-- CreateIndex
CREATE INDEX "work_logs_item_technician_id_idx" ON "work_logs"("item_technician_id");

-- CreateIndex
CREATE INDEX "work_logs_rejected_by_id_idx" ON "work_logs"("rejected_by_id");

-- CreateIndex
CREATE INDEX "work_log_items_request_item_id_idx" ON "work_log_items"("request_item_id");

-- CreateIndex
CREATE INDEX "work_log_materials_work_log_id_idx" ON "work_log_materials"("work_log_id");

-- CreateIndex
CREATE INDEX "approval_requests_maintenance_request_id_status_idx" ON "approval_requests"("maintenance_request_id", "status");

-- CreateIndex
CREATE INDEX "approval_requests_maintenance_request_item_id_idx" ON "approval_requests"("maintenance_request_item_id");

-- CreateIndex
CREATE INDEX "approval_requests_technician_id_idx" ON "approval_requests"("technician_id");

-- CreateIndex
CREATE INDEX "approval_requests_reviewed_by_id_idx" ON "approval_requests"("reviewed_by_id");

-- CreateIndex
CREATE INDEX "request_status_history_maintenance_request_id_created_at_idx" ON "request_status_history"("maintenance_request_id", "created_at");

-- CreateIndex
CREATE INDEX "request_status_history_changed_by_id_idx" ON "request_status_history"("changed_by_id");

-- CreateIndex
CREATE INDEX "request_updates_maintenance_request_id_created_at_idx" ON "request_updates"("maintenance_request_id", "created_at");

-- CreateIndex
CREATE INDEX "request_updates_user_id_idx" ON "request_updates"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "maintenance_request_files_storage_key_key" ON "maintenance_request_files"("storage_key");

-- CreateIndex
CREATE INDEX "maintenance_request_files_maintenance_request_id_created_at_idx" ON "maintenance_request_files"("maintenance_request_id", "created_at");

-- CreateIndex
CREATE INDEX "maintenance_request_files_uploaded_by_id_idx" ON "maintenance_request_files"("uploaded_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "specification_item_files_storage_key_key" ON "specification_item_files"("storage_key");

-- CreateIndex
CREATE INDEX "specification_item_files_specification_item_id_created_at_idx" ON "specification_item_files"("specification_item_id", "created_at");

-- CreateIndex
CREATE INDEX "specification_item_files_uploaded_by_id_idx" ON "specification_item_files"("uploaded_by_id");

-- CreateIndex
CREATE INDEX "password_histories_user_id_created_at_idx" ON "password_histories"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "user_notifications_user_id_read_at_created_at_idx" ON "user_notifications"("user_id", "read_at", "created_at");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organization_unit_id_fkey" FOREIGN KEY ("organization_unit_id") REFERENCES "organization_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_units" ADD CONSTRAINT "organization_units_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "organization_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_units" ADD CONSTRAINT "organization_units_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "item_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_types" ADD CONSTRAINT "issue_types_issue_category_id_fkey" FOREIGN KEY ("issue_category_id") REFERENCES "issue_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_request_items" ADD CONSTRAINT "maintenance_request_items_maintenance_request_id_fkey" FOREIGN KEY ("maintenance_request_id") REFERENCES "maintenance_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_request_items" ADD CONSTRAINT "maintenance_request_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_request_items" ADD CONSTRAINT "maintenance_request_items_issue_category_id_fkey" FOREIGN KEY ("issue_category_id") REFERENCES "issue_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_request_items" ADD CONSTRAINT "maintenance_request_items_issue_type_id_fkey" FOREIGN KEY ("issue_type_id") REFERENCES "issue_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_technicians" ADD CONSTRAINT "item_technicians_request_item_id_fkey" FOREIGN KEY ("request_item_id") REFERENCES "maintenance_request_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_technicians" ADD CONSTRAINT "item_technicians_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_technicians" ADD CONSTRAINT "item_technicians_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specification_requests" ADD CONSTRAINT "specification_requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specification_items" ADD CONSTRAINT "specification_items_specification_request_id_fkey" FOREIGN KEY ("specification_request_id") REFERENCES "specification_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specification_items" ADD CONSTRAINT "specification_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "item_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specification_request_files" ADD CONSTRAINT "specification_request_files_specification_request_id_fkey" FOREIGN KEY ("specification_request_id") REFERENCES "specification_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specification_request_files" ADD CONSTRAINT "specification_request_files_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_logs" ADD CONSTRAINT "work_logs_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "maintenance_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_logs" ADD CONSTRAINT "work_logs_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_logs" ADD CONSTRAINT "work_logs_rejected_by_id_fkey" FOREIGN KEY ("rejected_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_logs" ADD CONSTRAINT "work_logs_item_technician_id_fkey" FOREIGN KEY ("item_technician_id") REFERENCES "item_technicians"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_log_items" ADD CONSTRAINT "work_log_items_work_log_id_fkey" FOREIGN KEY ("work_log_id") REFERENCES "work_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_log_items" ADD CONSTRAINT "work_log_items_request_item_id_fkey" FOREIGN KEY ("request_item_id") REFERENCES "maintenance_request_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_log_materials" ADD CONSTRAINT "work_log_materials_work_log_id_fkey" FOREIGN KEY ("work_log_id") REFERENCES "work_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_maintenance_request_id_fkey" FOREIGN KEY ("maintenance_request_id") REFERENCES "maintenance_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_maintenance_request_item_id_fkey" FOREIGN KEY ("maintenance_request_item_id") REFERENCES "maintenance_request_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_status_history" ADD CONSTRAINT "request_status_history_maintenance_request_id_fkey" FOREIGN KEY ("maintenance_request_id") REFERENCES "maintenance_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_status_history" ADD CONSTRAINT "request_status_history_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_updates" ADD CONSTRAINT "request_updates_maintenance_request_id_fkey" FOREIGN KEY ("maintenance_request_id") REFERENCES "maintenance_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_updates" ADD CONSTRAINT "request_updates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_request_files" ADD CONSTRAINT "maintenance_request_files_maintenance_request_id_fkey" FOREIGN KEY ("maintenance_request_id") REFERENCES "maintenance_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_request_files" ADD CONSTRAINT "maintenance_request_files_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specification_item_files" ADD CONSTRAINT "specification_item_files_specification_item_id_fkey" FOREIGN KEY ("specification_item_id") REFERENCES "specification_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specification_item_files" ADD CONSTRAINT "specification_item_files_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_histories" ADD CONSTRAINT "password_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
