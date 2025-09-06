import { Test, TestingModule } from '@nestjs/testing';
import { SetupService } from './setup.service';
import { DynamoDBService } from '../common/dynamodb.service';

describe('QnADataService', () => {
  let service: SetupService;
  let mockDynamoDBService: jest.Mocked<DynamoDBService>;

  beforeEach(async () => {
    const mockDynamoDB = {
      scan: jest.fn().mockResolvedValue([]),
      get: jest.fn(),
      put: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SetupService,
        { provide: DynamoDBService, useValue: mockDynamoDB },
      ],
    }).compile();

    service = module.get<SetupService>(SetupService);
    mockDynamoDBService = module.get(DynamoDBService);
  });

  describe('test_회사별_QnA_조회_성공', () => {
    it('should return QnA data for specific company', async () => {
      // Given
      const companyId = 'hunters-company';
      const mockQnAData = [
        {
          id: 'qna_001',
          companyId: 'hunters-company',
          question: '배송비는 얼마인가요?',
          answer: '5만원 이상 구매시 무료배송입니다.',
          category: '배송',
          createdAt: '2024-09-06T10:00:00Z'
        }
      ];
      mockDynamoDBService.scan.mockResolvedValue(mockQnAData);

      // When
      const result = await service.getQnADataByCompany(companyId);

      // Then
      expect(result).toHaveLength(1);
      expect(result[0].companyId).toBe(companyId);
    });
  });

  describe('test_업종별_QnA_조회_성공', () => {
    it('should return QnA data for specific industry', async () => {
      // Given
      const industry = '이커머스';
      const mockQnAData = [
        {
          id: 'qna_002',
          industry: '이커머스',
          question: '반품은 어떻게 하나요?',
          answer: '구매 후 7일 이내 반품 가능합니다.',
          category: '반품',
          createdAt: '2024-09-06T10:00:00Z'
        }
      ];
      mockDynamoDBService.scan.mockResolvedValue(mockQnAData);

      // When
      const result = await service.getQnADataByIndustry(industry);

      // Then
      expect(result).toHaveLength(1);
      expect(result[0].industry).toBe(industry);
    });
  });
});
