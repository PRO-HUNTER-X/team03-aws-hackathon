import { Module } from '@nestjs/common';
import { SetupController } from './setup.controller';
import { SetupService } from './setup.service';
import { DynamoDBService } from '../common/dynamodb.service';

@Module({
  controllers: [SetupController],
  providers: [SetupService, DynamoDBService],
  exports: [SetupService],
})
export class SetupModule {}