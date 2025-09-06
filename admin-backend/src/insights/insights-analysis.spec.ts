import { Test, TestingModule } from '@nestjs/testing';
import { InsightsService } from './insights.service';
import { CompanyService } from '../company/company.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { SetupService } from '../setup/setup.service';

describe('InsightsAnalysisService', () => {
  let service: InsightsService;
  let mockCompanyService: jest.Mocked<CompanyService>;
  let mockDashboardService: jest.Mocked<DashboardService>;
  let mockSetupService: jest.Mocked<SetupService>;

  beforeEach(async () => {
    const mockCompany = {
      getCompanyById: jest.fn(),
      getAllCompanies: jest.fn(),
    };

    const mockDashboard = {
      getInquiriesByCompany: jest.fn(),
    };

    const mockSetup = {
      getQnADataByCompany: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InsightsService,
        { provide: CompanyService, useValue: mockCompany },
        { provide: DashboardService, useValue: mockDashboard },
        { provide: SetupService, useValue: mockSetup },
      ],
    }).compile();

    service = module.get<InsightsService>(InsightsService);
    mockCompanyService = module.get(CompanyService);
    mockDashboardService = module.get(DashboardService);
    mockSetupService = module.get(SetupService);
  });

  describe('test_회사별_맞춤_분석_성공', () => {
    it('should analyze company patterns and benchmarking', async () => {
      // Given
      const companyId = 'hunters-company';
      const mockCompany = {
        companyId: 'hunters-company',
        industry: '이커머스',
        monthlyRevenue: 50000000
      };
      const mockInquiries = [
        { category: '배송', status: 'pending' },
        { category: '배송', status: 'resolved' },
        { category: '결제', status: 'pending' }
      ];

      mockCompanyService.getCompanyById.mockResolvedValue(mockCompany as any);
      mockDashboardService.getInquiriesByCompany.mockResolvedValue(mockInquiries as any);

      // When
      const result = await service.getCompanyAnalysis(companyId);

      // Then
      expect(result.industryPattern).toBeDefined();
      expect(result.industryPattern[0].category).toBe('배송');
      expect(result.industryPattern[0].percentage).toBe(67); // 2/3 = 67%
    });
  });

  describe('test_AI_최적화_분석_성공', () => {
    it('should analyze AI accuracy by category', async () => {
      // Given
      const companyId = 'hunters-company';
      const mockQnAData = [
        { category: '배송', confidence: 0.95 },
        { category: '배송', confidence: 0.90 },
        { category: '결제', confidence: 0.40 }
      ];

      mockSetupService.getQnADataByCompany.mockResolvedValue(mockQnAData as any);

      // When
      const result = await service.getAIOptimization(companyId);

      // Then
      expect(result.categoryAccuracy).toBeDefined();
      expect(result.categoryAccuracy[0].category).toBe('배송');
      expect(result.categoryAccuracy[0].aiAccuracy).toBe(93); // (95+90)/2 = 92.5 → 93
      expect(result.categoryAccuracy[0].needsHumanIntervention).toBe(false);
    });
  });
});
