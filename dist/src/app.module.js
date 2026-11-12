"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const roles_module_1 = require("./roles/roles.module");
const permissions_module_1 = require("./permissions/permissions.module");
const organization_module_1 = require("./organization/organization.module");
const item_categories_module_1 = require("./catalog/item-categories/item-categories.module");
const items_module_1 = require("./catalog/items/items.module");
const issue_categories_module_1 = require("./catalog/issue-categories/issue-categories.module");
const issue_types_module_1 = require("./catalog/issue-types/issue-types.module");
const maintenance_categories_module_1 = require("./catalog/maintenance-categories/maintenance-categories.module");
const requests_module_1 = require("./maintenance-requests/requests.module");
const specification_requests_module_1 = require("./specification-requests/specification-requests.module");
const request_items_module_1 = require("./request-items/request-items.module");
const specification_items_module_1 = require("./specification-items/specification-items.module");
const work_logs_module_1 = require("./work-logs/work-logs.module");
const approvals_module_1 = require("./approvals/approvals.module");
const notifications_module_1 = require("./notifications/notifications.module");
const reports_module_1 = require("./reports/reports.module");
const health_controller_1 = require("./health/health.controller");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const permissions_guard_1 = require("./common/guards/permissions.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            roles_module_1.RolesModule,
            permissions_module_1.PermissionsModule,
            organization_module_1.OrganizationModule,
            item_categories_module_1.ItemCategoriesModule,
            items_module_1.ItemsModule,
            issue_categories_module_1.IssueCategoriesModule,
            issue_types_module_1.IssueTypesModule,
            maintenance_categories_module_1.MaintenanceCategoriesModule,
            requests_module_1.RequestsModule,
            specification_requests_module_1.SpecificationRequestsModule,
            request_items_module_1.RequestItemsModule,
            specification_items_module_1.SpecificationItemsModule,
            work_logs_module_1.WorkLogsModule,
            approvals_module_1.ApprovalsModule,
            notifications_module_1.NotificationsModule,
            reports_module_1.ReportsModule,
        ],
        controllers: [health_controller_1.HealthController],
        providers: [
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: permissions_guard_1.PermissionsGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map