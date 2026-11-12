import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { OrganizationModule } from './organization/organization.module';
import { ItemCategoriesModule } from './catalog/item-categories/item-categories.module';
import { ItemsModule } from './catalog/items/items.module';
import { IssueCategoriesModule } from './catalog/issue-categories/issue-categories.module';
import { IssueTypesModule } from './catalog/issue-types/issue-types.module';
import { MaintenanceCategoriesModule } from './catalog/maintenance-categories/maintenance-categories.module';
import { RequestsModule } from './maintenance-requests/requests.module';
import { SpecificationRequestsModule } from './specification-requests/specification-requests.module';
import { RequestItemsModule } from './request-items/request-items.module';
import { SpecificationItemsModule } from './specification-items/specification-items.module';
import { WorkLogsModule } from './work-logs/work-logs.module';
import { ApprovalsModule } from './approvals/approvals.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';
import { HealthController } from './health/health.controller';
import { CsrfGuard } from './common/guards/csrf.guard';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    OrganizationModule,
    ItemCategoriesModule,
    ItemsModule,
    IssueCategoriesModule,
    IssueTypesModule,
    MaintenanceCategoriesModule,
    RequestsModule,
    SpecificationRequestsModule,
    RequestItemsModule,
    SpecificationItemsModule,
    WorkLogsModule,
    ApprovalsModule,
    NotificationsModule,
    ReportsModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: CsrfGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
