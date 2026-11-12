import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SpecificationRequestsController } from './specification-requests.controller';
import { SpecificationRequestsService } from './specification-requests.service';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [SpecificationRequestsController],
  providers: [SpecificationRequestsService],
  exports: [SpecificationRequestsService],
})
export class SpecificationRequestsModule {}
