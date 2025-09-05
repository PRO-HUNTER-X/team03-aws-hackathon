import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { StatsResponseDto } from './dto/dashboard.dto';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: '대시보드 통계 조회' })
  @ApiResponse({ 
    status: 200, 
    description: '통계 조회 성공',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        data: { $ref: '#/components/schemas/StatsResponseDto' }
      }
    }
  })
  getStats() {
    const stats = this.dashboardService.getStats();
    return {
      success: true,
      data: stats
    };
  }

  @Get('recent-inquiries')
  @ApiOperation({ summary: '최근 문의 목록 조회' })
  @ApiResponse({ status: 200, description: '최근 문의 조회 성공' })
  @ApiQuery({ name: 'limit', required: false, description: '조회할 문의 수 (기본값: 10)' })
  getRecentInquiries(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const inquiries = this.dashboardService.getRecentInquiries(limitNum);
    
    return {
      success: true,
      data: inquiries,
      count: inquiries.length
    };
  }

  @Get('urgent-alerts')
  @ApiOperation({ summary: '긴급 문의 알림 조회' })
  @ApiResponse({ status: 200, description: '긴급 알림 조회 성공' })
  getUrgentAlerts() {
    const alerts = this.dashboardService.getUrgentAlerts();
    return {
      success: true,
      data: alerts
    };
  }
}