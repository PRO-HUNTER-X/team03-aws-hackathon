import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
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

  @Get('company-analysis/:companyId')
  @ApiOperation({ summary: '회사별 맞춤 분석' })
  @ApiResponse({ status: 200, description: '회사별 분석 성공' })
  async getCompanyAnalysis(@Param('companyId') companyId: string) {
    const analysis = await this.insightsService.getCompanyAnalysis(companyId);
    return {
      success: true,
      data: analysis
    };
  }

  @Get('ai-optimization/:companyId')
  @ApiOperation({ summary: 'AI 최적화 분석' })
  @ApiResponse({ status: 200, description: 'AI 최적화 분석 성공' })
  async getAIOptimization(@Param('companyId') companyId: string) {
    const optimization = await this.insightsService.getAIOptimization(companyId);
    return {
      success: true,
      data: optimization
    };
  }
}