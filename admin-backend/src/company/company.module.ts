import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { DynamoDBService } from '../common/dynamodb.service';

@Module({
  controllers: [CompanyController],
  providers: [CompanyService, DynamoDBService],
  exports: [CompanyService],
})
export class CompanyModule {}