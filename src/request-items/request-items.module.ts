import { Module } from '@nestjs/common';
import { RequestItemsController } from './request-items.controller';
import { RequestItemsService } from './request-items.service';

@Module({
  controllers: [RequestItemsController],
  providers: [RequestItemsService],
  exports: [RequestItemsService],
})
export class RequestItemsModule {}
