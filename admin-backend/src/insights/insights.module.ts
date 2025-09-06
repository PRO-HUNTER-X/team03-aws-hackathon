import { Module } from '@nestjs/common';
import { InsightsController } from './insights.controller';
import { InsightsService } from './insights.service';
import { CompanyModule } from '../company/company.module';
import { DashboardModule } from '../dashboard/dashboard.module';
import { SetupModule } from '../setup/setup.module';

@Module({
  imports: [CompanyModule, DashboardModule, SetupModule],
  controllers: [InsightsController],
  providers: [InsightsService],
})
export class InsightsModule {}