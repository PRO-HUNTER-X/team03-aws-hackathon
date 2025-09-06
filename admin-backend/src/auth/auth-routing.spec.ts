import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { SetupService } from '../setup/setup.service';
import { CompanyService } from '../company/company.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthRoutingService', () => {
  let authService: AuthService;
  let mockSetupService: jest.Mocked<SetupService>;
  let mockCompanyService: jest.Mocked<CompanyService>;

  beforeEach(async () => {
    const mockSetup = {
      getQnADataByCompany: jest.fn(),
    };

    const mockCompany = {
      getCompanyById: jest.fn(),
    };

    const mockJwt = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: SetupService, useValue: mockSetup },
        { provide: CompanyService, useValue: mockCompany },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    mockSetupService = module.get(SetupService);
    mockCompanyService = module.get(CompanyService);
  });

  describe('test_초기_라우팅_정보_제공_성공', () => {
    it('should return initial route info with QnA data exists', async () => {
      // Given
      const companyId = 'hunters-company';
      const mockCompany = {
        companyId: 'hunters-company',
        companyName: '헌터스 쇼핑몰',
        industry: '이커머스',
        businessType: 'B2C',
        companySize: '중소기업',
        monthlyRevenue: 50000000,
        customerCount: 1500,
        csTeamSize: 2,
        createdAt: '2024-01-15T00:00:00Z'
      };
      const mockQnAData = [{ 
        id: 'qna_001', 
        question: 'test',
        answer: 'test answer',
        category: 'test',
        createdAt: '2024-09-06T10:00:00Z'
      }];
      
      mockCompanyService.getCompanyById.mockResolvedValue(mockCompany);
      mockSetupService.getQnADataByCompany.mockResolvedValue(mockQnAData);

      // When
      const result = await authService.getInitialRoute(companyId);

      // Then
      expect(result.hasQnAData).toBe(true);
      expect(result.redirectTo).toBe('/dashboard');
      expect(result.qnaCount).toBe(1);
      expect(result.companyInfo.companyName).toBe('헌터스 쇼핑몰');
    });

    it('should return initial route info with no QnA data', async () => {
      // Given
      const companyId = 'new-company';
      const mockCompany = {
        companyId: 'new-company',
        companyName: '신규 회사',
        industry: 'SaaS',
        businessType: 'B2B',
        companySize: '스타트업',
        monthlyRevenue: 30000000,
        customerCount: 500,
        csTeamSize: 1,
        createdAt: '2024-02-01T00:00:00Z'
      };
      
      mockCompanyService.getCompanyById.mockResolvedValue(mockCompany);
      mockSetupService.getQnADataByCompany.mockResolvedValue([]);

      // When
      const result = await authService.getInitialRoute(companyId);

      // Then
      expect(result.hasQnAData).toBe(false);
      expect(result.redirectTo).toBe('/setup');
      expect(result.qnaCount).toBe(0);
    });
  });
});
