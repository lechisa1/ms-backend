import { Module } from '@nestjs/common';
import { IssueCategoriesController } from './issue-categories.controller';
import { IssueCategoriesService } from './issue-categories.service';

@Module({
  controllers: [IssueCategoriesController],
  providers: [IssueCategoriesService],
  exports: [IssueCategoriesService],
})
export class IssueCategoriesModule {}
