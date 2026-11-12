import { Module } from '@nestjs/common';
import { SpecificationItemsController } from './specification-items.controller';
import { SpecificationItemsService } from './specification-items.service';

@Module({
  controllers: [SpecificationItemsController],
  providers: [SpecificationItemsService],
  exports: [SpecificationItemsService],
})
export class SpecificationItemsModule {}
