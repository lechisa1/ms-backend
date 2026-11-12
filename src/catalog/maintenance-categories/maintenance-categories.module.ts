import { Module } from '@nestjs/common';
import { MaintenanceCategoriesController } from './maintenance-categories.controller';
import { MaintenanceCategoriesService } from './maintenance-categories.service';

@Module({
  controllers: [MaintenanceCategoriesController],
  providers: [MaintenanceCategoriesService],
  exports: [MaintenanceCategoriesService],
})
export class MaintenanceCategoriesModule {}
