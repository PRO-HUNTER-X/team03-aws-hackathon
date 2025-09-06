import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { SetupModule } from './setup/setup.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [AuthModule, SetupModule, DashboardModule],
})
export class AppModule {}