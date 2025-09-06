import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { SetupModule } from './setup/setup.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { CompanyModule } from './company/company.module';
import { InsightsModule } from './insights/insights.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule, 
    SetupModule, 
    DashboardModule, 
    CompanyModule, 
    InsightsModule
  ],
})
export class AppModule {}