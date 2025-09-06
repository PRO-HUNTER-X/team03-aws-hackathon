import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SetupService, QnAData } from './setup.service';

@ApiTags('Setup')
@Controller('setup')
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  @Get('status')
  @ApiOperation({ summary: '시스템 설정 완료 상태 확인' })
  @ApiResponse({ status: 200, description: '설정 상태 조회 성공' })
  getSetupStatus() {
    const isComplete = this.setupService.isSetupComplete();
    const hasQnA = this.setupService.hasQnAData();

    return {
      success: true,
      data: {
        setupComplete: isComplete,
        hasQnAData: hasQnA,
        nextStep: isComplete ? 'dashboard' : 'qna-setup',
        message: isComplete 
          ? '설정이 완료되었습니다. 대시보드로 이동하세요.' 
          : 'QnA 데이터를 설정해주세요.'
      }
    };
  }

  @Post('qna')
  @ApiOperation({ summary: '초기 QnA 데이터 설정' })
  @ApiResponse({ status: 201, description: 'QnA 설정 성공' })
  setupQnA(@Body() body: { qnaList: Array<{ question: string; answer: string; category: string }> }) {
    const result = this.setupService.setupInitialQnA(body.qnaList);
    return {
      statusCode: 201,
      ...result
    };
  }

  @Get('qna')
  @ApiOperation({ summary: 'QnA 데이터 조회' })
  @ApiResponse({ status: 200, description: 'QnA 데이터 조회 성공' })
  async getQnAData(): Promise<{ success: boolean; data: QnAData[]; count: number }> {
    const qnaData = await this.setupService.getQnAData();
    return {
      success: true,
      data: qnaData,
      count: qnaData.length
    };
  }

  @Get('qna/company/:companyId')
  @ApiOperation({ summary: '회사별 QnA 데이터 조회' })
  @ApiResponse({ status: 200, description: '회사별 QnA 데이터 조회 성공' })
  async getQnADataByCompany(@Param('companyId') companyId: string) {
    const qnaData = await this.setupService.getQnADataByCompany(companyId);
    return {
      success: true,
      data: qnaData,
      count: qnaData.length
    };
  }

  @Get('qna/industry/:industry')
  @ApiOperation({ summary: '업종별 QnA 데이터 조회' })
  @ApiResponse({ status: 200, description: '업종별 QnA 데이터 조회 성공' })
  async getQnADataByIndustry(@Param('industry') industry: string) {
    const qnaData = await this.setupService.getQnADataByIndustry(industry);
    return {
      success: true,
      data: qnaData,
      count: qnaData.length
    };
  }
}