import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('CS Inquiries')
@Controller('cs-inquiries')
export class InquiriesController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: '모든 문의 조회' })
  @ApiResponse({ status: 200, description: '문의 목록 조회 성공' })
  async getAllInquiries(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 100;
    const inquiries = await this.dashboardService.getRecentInquiries(limitNum);
    
    return {
      success: true,
      data: inquiries,
      count: inquiries.length
    };
  }

  @Get('stats')
  @ApiOperation({ summary: '문의 통계 조회' })
  @ApiResponse({ status: 200, description: '문의 통계 조회 성공' })
  async getInquiryStats() {
    const stats = await this.dashboardService.getInquiryStats();
    return {
      success: true,
      data: stats
    };
  }

  @Get('company/:companyId')
  @ApiOperation({ summary: '회사별 문의 조회' })
  @ApiResponse({ status: 200, description: '회사별 문의 조회 성공' })
  async getInquiriesByCompany(@Param('companyId') companyId: string) {
    const inquiries = await this.dashboardService.getInquiriesByCompany(companyId);
    return {
      success: true,
      data: inquiries,
      count: inquiries.length
    };
  }
}
