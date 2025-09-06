import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { DynamoDBService } from '../common/dynamodb.service';

describe('InquiriesService', () => {
  let service: DashboardService;
  let mockDynamoDBService: jest.Mocked<DynamoDBService>;

  beforeEach(async () => {
    const mockDynamoDB = {
      scan: jest.fn().mockResolvedValue([]), // 기본값으로 빈 배열 반환
      get: jest.fn(),
      put: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: DynamoDBService, useValue: mockDynamoDB },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    mockDynamoDBService = module.get(DynamoDBService);
  });

  describe('test_회사별_문의_조회_성공', () => {
    it('should return inquiries for specific company', async () => {
      // Given
      const companyId = 'hunters-company';
      const mockInquiries = [
        {
          inquiry_id: 'inq_001',
          companyId: 'hunters-company',
          content: '배송 문의',
          category: '배송',
          status: 'pending',
          urgency: 'medium',
          created_at: '2024-09-06T10:00:00Z'
        }
      ];
      mockDynamoDBService.scan.mockResolvedValue(mockInquiries);

      // When
      const result = await service.getInquiriesByCompany(companyId);

      // Then
      expect(result).toHaveLength(1);
      expect(result[0].companyId).toBe(companyId);
    });
  });

  describe('test_문의_통계_계산_성공', () => {
    it('should calculate inquiry statistics correctly', async () => {
      // Given
      const mockInquiries = [
        { category: '배송', status: 'pending', urgency: 'high' },
        { category: '배송', status: 'resolved', urgency: 'medium' },
        { category: '결제', status: 'pending', urgency: 'low' }
      ];
      mockDynamoDBService.scan.mockResolvedValue(mockInquiries);

      // When
      const stats = await service.getInquiryStats();

      // Then
      expect(stats.total).toBe(3);
      expect(stats.categories['배송']).toBe(2);
      expect(stats.categories['결제']).toBe(1);
      expect(stats.status.pending).toBe(2);
      expect(stats.status.resolved).toBe(1);
    });
  });
});
