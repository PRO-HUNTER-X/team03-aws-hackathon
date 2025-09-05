import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [DashboardService],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    service = module.get<DashboardService>(DashboardService);
  });

  describe('getStats', () => {
    it('통계_조회_성공_응답을_반환해야_함', () => {
      // Given
      const mockStats = {
        total: 5,
        status: { pending: 2, processing: 2, completed: 1 },
        urgency: { high: 2, normal: 2, low: 1 },
        types: { '기술 문의': 2 }
      };
      jest.spyOn(service, 'getStats').mockReturnValue(mockStats);

      // When
      const result = controller.getStats();

      // Then
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockStats);
      expect(service.getStats).toHaveBeenCalled();
    });
  });

  describe('getRecentInquiries', () => {
    it('최근_문의_조회_성공_응답을_반환해야_함', () => {
      // Given
      const mockInquiries = [
        {
          id: 'inq_001',
          status: '대기' as const,
          type: '기술 문의',
          title: '로그인 오류',
          content: '로그인이 안돼요',
          urgency: '높음' as const,
          customerId: 'customer_001',
          createdAt: new Date(),
          updatedAt: new Date(),
          timeAgo: '2시간 전'
        }
      ];
      jest.spyOn(service, 'getRecentInquiries').mockReturnValue(mockInquiries);

      // When
      const result = controller.getRecentInquiries('5');

      // Then
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockInquiries);
      expect(result.count).toBe(1);
      expect(service.getRecentInquiries).toHaveBeenCalledWith(5);
    });

    it('limit_파라미터가_없으면_기본값_10을_사용해야_함', () => {
      // Given
      jest.spyOn(service, 'getRecentInquiries').mockReturnValue([]);

      // When
      controller.getRecentInquiries();

      // Then
      expect(service.getRecentInquiries).toHaveBeenCalledWith(10);
    });
  });

  describe('getUrgentAlerts', () => {
    it('긴급_알림_조회_성공_응답을_반환해야_함', () => {
      // Given
      const mockAlerts = {
        count: 2,
        inquiries: [
          {
            id: 'inq_001',
            status: '대기' as const,
            type: '기술 문의',
            title: '긴급 오류',
            content: '앱이 종료돼요',
            urgency: '높음' as const,
            customerId: 'customer_001',
            createdAt: new Date(),
            updatedAt: new Date(),
            timeAgo: '1시간 전'
          }
        ]
      };
      jest.spyOn(service, 'getUrgentAlerts').mockReturnValue(mockAlerts);

      // When
      const result = controller.getUrgentAlerts();

      // Then
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAlerts);
      expect(service.getUrgentAlerts).toHaveBeenCalled();
    });
  });
});