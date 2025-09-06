import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { SetupModule } from './setup/setup.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { CompanyModule } from './company/company.module';
import { InsightsModule } from './insights/insights.module';

@Module({
  imports: [AuthModule, SetupModule, DashboardModule, CompanyModule, InsightsModule],
})
export class AppModule {}