import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DashboardService],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  describe('getStats', () => {
    it('전체_통계를_정확히_계산해야_함', () => {
      // When
      const stats = service.getStats();

      // Then
      expect(stats.total).toBe(5);
      expect(stats.status.pending).toBe(2);
      expect(stats.status.processing).toBe(2);
      expect(stats.status.completed).toBe(1);
      expect(stats.urgency.urgent).toBe(2);
      expect(stats.urgency.normal).toBe(2);
      expect(stats.urgency.low).toBe(1);
    });

    it('문의_유형별_통계를_정확히_계산해야_함', () => {
      // When
      const stats = service.getStats();

      // Then
      expect(stats.types['배송 문의']).toBe(1);
      expect(stats.types['결제 문의']).toBe(1);
      expect(stats.types['상품 문의']).toBe(1);
      expect(stats.types['기술 지원']).toBe(1);
      expect(stats.types['기타 문의']).toBe(1);
    });
  });

  describe('getRecentInquiries', () => {
    it('최근_문의를_시간순으로_정렬해야_함', () => {
      // When
      const inquiries = service.getRecentInquiries(3);

      // Then
      expect(inquiries).toHaveLength(3);
      expect(inquiries[0].id).toBe('inq_004'); // 가장 최근 (30분 전)
      expect(inquiries[1].id).toBe('inq_001'); // 2시간 전
      expect(inquiries[2].id).toBe('inq_002'); // 4시간 전
    });

    it('limit_파라미터를_적용해야_함', () => {
      // When
      const inquiries = service.getRecentInquiries(2);

      // Then
      expect(inquiries).toHaveLength(2);
    });

    it('timeAgo_필드를_포함해야_함', () => {
      // When
      const inquiries = service.getRecentInquiries(1);

      // Then
      expect(inquiries[0]).toHaveProperty('timeAgo');
      expect(typeof inquiries[0].timeAgo).toBe('string');
    });
  });

  describe('getUrgentAlerts', () => {
    it('긴급_문의만_필터링해야_함', () => {
      // When
      const alerts = service.getUrgentAlerts();

      // Then
      expect(alerts.count).toBe(2);
      alerts.inquiries.forEach(inquiry => {
        expect(inquiry.urgency).toBe('긴급');
        expect(inquiry.status).not.toBe('완료');
      });
    });

    it('완료된_긴급_문의는_제외해야_함', () => {
      // When
      const alerts = service.getUrgentAlerts();

      // Then
      const completedUrgent = alerts.inquiries.filter(i => i.status === '완료');
      expect(completedUrgent).toHaveLength(0);
    });
  });
});