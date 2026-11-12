import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { QueryReportRequestsDto } from './reports.dto';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get executive report summary metrics and KPIs' })
  getSummary(@Query() query: QueryReportRequestsDto) {
    return this.reportsService.getSummary(query);
  }

  @Get('requests')
  @ApiOperation({ summary: 'Get filtered requests report list' })
  getRequests(@Query() query: QueryReportRequestsDto) {
    return this.reportsService.getRequests(query);
  }

  @Get('technicians')
  @ApiOperation({ summary: 'Get technician capacity and workload allocation matrix' })
  getTechniciansWorkload() {
    return this.reportsService.getTechniciansWorkload();
  }
}

