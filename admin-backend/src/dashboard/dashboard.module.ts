import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DynamoDBService } from '../common/dynamodb.service';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, DynamoDBService],
  exports: [DashboardService],
})
export class DashboardModule {}