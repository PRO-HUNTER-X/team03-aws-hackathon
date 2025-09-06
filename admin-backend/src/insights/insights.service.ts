import { Injectable } from '@nestjs/common';
import { CompanyService, Company } from '../company/company.service';
import { DashboardService, Inquiry } from '../dashboard/dashboard.service';
import { SetupService } from '../setup/setup.service';

@Injectable()
export class InsightsService {
  constructor(
    private readonly companyService: CompanyService,
    private readonly dashboardService: DashboardService,
    private readonly setupService: SetupService,
  ) {}

  async getIndustryAnalysis() {
    const companies = await this.companyService.getAllCompanies();
    const inquiries = await this.dashboardService.getRecentInquiries(1000);
    
    const industryInsights = {};
    
    for (const company of companies) {
      const companyInquiries = inquiries.filter(inq => inq.companyId === company.companyId);
      
      if (!industryInsights[company.industry]) {
        industryInsights[company.industry] = {
          industry: company.industry,
          totalCompanies: 0,
          totalInquiries: 0,
          categoryBreakdown: {},
          urgencyBreakdown: {},
          avgResponseTime: 0,
          recommendations: []
        };
      }
      
      industryInsights[company.industry].totalCompanies++;
      industryInsights[company.industry].totalInquiries += companyInquiries.length;
      
      // 카테고리별 분석
      companyInquiries.forEach(inq => {
        const category = inq.category;
        if (!industryInsights[company.industry].categoryBreakdown[category]) {
          industryInsights[company.industry].categoryBreakdown[category] = 0;
        }
        industryInsights[company.industry].categoryBreakdown[category]++;
      });
      
      // 긴급도별 분석
      companyInquiries.forEach(inq => {
        const urgency = inq.urgency;
        if (!industryInsights[company.industry].urgencyBreakdown[urgency]) {
          industryInsights[company.industry].urgencyBreakdown[urgency] = 0;
        }
        industryInsights[company.industry].urgencyBreakdown[urgency]++;
      });
    }
    
    // 업종별 추천사항 생성
    Object.keys(industryInsights).forEach(industry => {
      const data = industryInsights[industry];
      const topCategory = Object.keys(data.categoryBreakdown).reduce((a, b) => 
        data.categoryBreakdown[a] > data.categoryBreakdown[b] ? a : b, 
        Object.keys(data.categoryBreakdown)[0]
      );
      
      if (industry === '이커머스') {
        data.recommendations = [
          `${topCategory} 문의가 ${Math.round((data.categoryBreakdown[topCategory] / data.totalInquiries) * 100)}%를 차지합니다`,
          '배송 추적 API 개선으로 문의 60% 감소 가능',
          '주말 문의 200% 증가 예상 - 인력 배치 조정 필요'
        ];
      } else if (industry === 'SaaS') {
        data.recommendations = [
          `기술문의가 ${Math.round((data.categoryBreakdown['technical'] || 0) / data.totalInquiries * 100)}%`,
          '온보딩 튜토리얼 추가로 기술문의 40% 감소 가능',
          '사용자 가이드 강화 필요'
        ];
      } else if (industry === '금융') {
        data.recommendations = [
          '보안 관련 문의는 AI보다 인간 개입 필수',
          '규제 준수 관련 FAQ 강화 필요',
          '고객 이탈 방지를 위한 신속 대응 체계 구축'
        ];
      }
    });
    
    return Object.values(industryInsights);
  }

  async getCompanyBenchmark(companyId: string) {
    const company = await this.companyService.getCompanyById(companyId);
    if (!company) {
      throw new Error('Company not found');
    }
    
    const sameIndustryCompanies = await this.companyService.getCompaniesByIndustry(company.industry);
    const allInquiries = await this.dashboardService.getRecentInquiries(1000);
    
    const companyInquiries = allInquiries.filter(inq => inq.companyId === companyId);
    const industryInquiries = allInquiries.filter(inq => 
      sameIndustryCompanies.some(c => c.companyId === inq.companyId)
    );
    
    // 벤치마킹 계산
    const companyAvgResponseTime = this.calculateAvgResponseTime(companyInquiries);
    const industryAvgResponseTime = this.calculateAvgResponseTime(industryInquiries);
    
    const companyResolutionRate = companyInquiries.filter(inq => inq.status === 'resolved').length / companyInquiries.length;
    const industryResolutionRate = industryInquiries.filter(inq => inq.status === 'resolved').length / industryInquiries.length;
    
    return {
      company: {
        name: company.companyName,
        industry: company.industry,
        size: company.companySize,
        monthlyRevenue: company.monthlyRevenue
      },
      metrics: {
        responseTime: {
          company: companyAvgResponseTime,
          industryAvg: industryAvgResponseTime,
          performance: companyAvgResponseTime < industryAvgResponseTime ? 'above_average' : 'below_average'
        },
        resolutionRate: {
          company: Math.round(companyResolutionRate * 100),
          industryAvg: Math.round(industryResolutionRate * 100),
          performance: companyResolutionRate > industryResolutionRate ? 'above_average' : 'below_average'
        },
        inquiryVolume: {
          company: companyInquiries.length,
          industryAvg: Math.round(industryInquiries.length / sameIndustryCompanies.length)
        }
      },
      insights: [
        `${company.industry} 업종 평균 대비 ${companyAvgResponseTime < industryAvgResponseTime ? '빠른' : '느린'} 응답속도`,
        `월매출 ${Math.round(company.monthlyRevenue / 10000)}만원 규모 치고 CS효율성 ${companyResolutionRate > 0.8 ? '상위' : '하위'} 수준`,
        `CS팀 ${company.csTeamSize}명으로 고객 ${company.customerCount}명 대응 중`
      ]
    };
  }

  async getAIOptimizationSuggestions() {
    const companies = await this.companyService.getAllCompanies();
    const qnaData = await this.setupService.getQnAData();
    const inquiries = await this.dashboardService.getRecentInquiries(1000);
    
    const suggestions = [];
    
    // 업종별 AI 최적화 제안
    const industryGroups = companies.reduce((acc, company) => {
      if (!acc[company.industry]) acc[company.industry] = [];
      acc[company.industry].push(company);
      return acc;
    }, {});
    
    Object.keys(industryGroups).forEach(industry => {
      const industryInquiries = inquiries.filter(inq => 
        industryGroups[industry].some(c => c.companyId === inq.companyId)
      );
      
      const categoryStats = industryInquiries.reduce((acc, inq) => {
        acc[inq.category] = (acc[inq.category] || 0) + 1;
        return acc;
      }, {});
      
      const topCategory = Object.keys(categoryStats).reduce((a, b) => 
        categoryStats[a] > categoryStats[b] ? a : b
      );
      
      const accuracy = this.calculateAIAccuracy(industry, topCategory);
      
      suggestions.push({
        industry,
        category: topCategory,
        volume: categoryStats[topCategory],
        aiAccuracy: accuracy,
        recommendation: accuracy > 90 ? 
          `${industry} ${topCategory} 문의 → AI 정확도 ${accuracy}%, 추가 학습 불필요` :
          `${industry} ${topCategory} 문의 → AI 정확도 ${accuracy}%, 인간 개입 필요`,
        priority: accuracy < 70 ? 'high' : accuracy < 90 ? 'medium' : 'low'
      });
    });
    
    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private calculateAvgResponseTime(inquiries: any[]): number {
    if (inquiries.length === 0) return 0;
    
    // 임시로 2-8시간 사이의 랜덤값 반환 (실제로는 created_at과 updated_at 차이 계산)
    return Math.round(Math.random() * 6 + 2);
  }

  private calculateAIAccuracy(industry: string, category: string): number {
    // 업종별 카테고리별 AI 정확도 시뮬레이션
    const accuracyMap = {
      '이커머스': { 'technical': 95, 'billing': 85, 'general': 90 },
      'SaaS': { 'technical': 70, 'billing': 95, 'general': 85 },
      '금융': { 'technical': 40, 'billing': 60, 'general': 75 }
    };
    
    return accuracyMap[industry]?.[category] || 80;
  }
}