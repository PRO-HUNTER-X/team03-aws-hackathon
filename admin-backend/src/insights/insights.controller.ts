import { Controller, Get, Param } from '@nestjs/common';
import { InsightsService } from './insights.service';

@Controller('insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get('industry-analysis')
  async getIndustryAnalysis() {
    return await this.insightsService.getIndustryAnalysis();
  }

  @Get('benchmark/:companyId')
  async getCompanyBenchmark(@Param('companyId') companyId: string) {
    return await this.insightsService.getCompanyBenchmark(companyId);
  }

  @Get('ai-optimization')
  async getAIOptimizationSuggestions() {
    return await this.insightsService.getAIOptimizationSuggestions();
  }
}