import { GET } from './route';
import { NextRequest } from 'next/server';

// Mock NextRequest 생성 헬퍼
function createMockRequest(url: string) {
  return new NextRequest(new URL(url, 'http://localhost:3000'));
}

describe('GET /api/inquiries', () => {
  describe('기본_조회', () => {
    it('전체_문의_목록을_반환해야_함', async () => {
      // Given
      const request = createMockRequest('/api/inquiries');

      // When
      const response = await GET(request);
      const data = await response.json();

      // Then
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(7); // 전체 문의 수
      expect(data.pagination.total).toBe(7);
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(10);
    });

    it('페이징이_정상_작동해야_함', async () => {
      // Given
      const request = createMockRequest('/api/inquiries?page=1&limit=3');

      // When
      const response = await GET(request);
      const data = await response.json();

      // Then
      expect(data.data).toHaveLength(3);
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(3);
      expect(data.pagination.totalPages).toBe(3); // 7개 문의 / 3 = 3페이지
      expect(data.pagination.hasNext).toBe(true);
      expect(data.pagination.hasPrev).toBe(false);
    });
  });

  describe('필터링', () => {
    it('상태별_필터링이_작동해야_함', async () => {
      // Given
      const request = createMockRequest('/api/inquiries?status=대기');

      // When
      const response = await GET(request);
      const data = await response.json();

      // Then
      expect(data.data.every((inq: any) => inq.status === '대기')).toBe(true);
      expect(data.data).toHaveLength(3); // 대기 상태 문의 수
    });

    it('긴급도별_필터링이_작동해야_함', async () => {
      // Given
      const request = createMockRequest('/api/inquiries?urgency=높음');

      // When
      const response = await GET(request);
      const data = await response.json();

      // Then
      expect(data.data.every((inq: any) => inq.urgency === '높음')).toBe(true);
      expect(data.data).toHaveLength(3); // 높음 긴급도 문의 수
    });

    it('문의_유형별_필터링이_작동해야_함', async () => {
      // Given
      const request = createMockRequest('/api/inquiries?type=기술 문의');

      // When
      const response = await GET(request);
      const data = await response.json();

      // Then
      expect(data.data.every((inq: any) => inq.type === '기술 문의')).toBe(true);
      expect(data.data).toHaveLength(2); // 기술 문의 수
    });

    it('검색_필터링이_작동해야_함', async () => {
      // Given
      const request = createMockRequest('/api/inquiries?search=로그인');

      // When
      const response = await GET(request);
      const data = await response.json();

      // Then
      expect(data.data.some((inq: any) => 
        inq.title.includes('로그인') || inq.content.includes('로그인')
      )).toBe(true);
    });

    it('복합_필터링이_작동해야_함', async () => {
      // Given
      const request = createMockRequest('/api/inquiries?status=대기&urgency=높음');

      // When
      const response = await GET(request);
      const data = await response.json();

      // Then
      expect(data.data.every((inq: any) => 
        inq.status === '대기' && inq.urgency === '높음'
      )).toBe(true);
    });
  });

  describe('정렬', () => {
    it('생성일_내림차순_정렬이_기본값이어야_함', async () => {
      // Given
      const request = createMockRequest('/api/inquiries');

      // When
      const response = await GET(request);
      const data = await response.json();

      // Then
      const dates = data.data.map((inq: any) => new Date(inq.createdAt).getTime());
      const sortedDates = [...dates].sort((a, b) => b - a);
      expect(dates).toEqual(sortedDates);
    });

    it('긴급도_내림차순_정렬이_작동해야_함', async () => {
      // Given
      const request = createMockRequest('/api/inquiries?sortBy=urgency&sortOrder=desc');

      // When
      const response = await GET(request);
      const data = await response.json();

      // Then
      const urgencies = data.data.map((inq: any) => inq.urgency);
      // 높음이 먼저 나와야 함
      expect(urgencies[0]).toBe('높음');
    });

    it('상태_내림차순_정렬이_작동해야_함', async () => {
      // Given
      const request = createMockRequest('/api/inquiries?sortBy=status&sortOrder=desc');

      // When
      const response = await GET(request);
      const data = await response.json();

      // Then
      const statuses = data.data.map((inq: any) => inq.status);
      // 대기가 먼저 나와야 함
      expect(statuses[0]).toBe('대기');
    });

    it('오름차순_정렬이_작동해야_함', async () => {
      // Given
      const request = createMockRequest('/api/inquiries?sortBy=createdAt&sortOrder=asc');

      // When
      const response = await GET(request);
      const data = await response.json();

      // Then
      const dates = data.data.map((inq: any) => new Date(inq.createdAt).getTime());
      const sortedDates = [...dates].sort((a, b) => a - b);
      expect(dates).toEqual(sortedDates);
    });
  });

  describe('응답_형식', () => {
    it('올바른_응답_구조를_반환해야_함', async () => {
      // Given
      const request = createMockRequest('/api/inquiries');

      // When
      const response = await GET(request);
      const data = await response.json();

      // Then
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('pagination');
      expect(data).toHaveProperty('filters');
      
      expect(data.pagination).toHaveProperty('page');
      expect(data.pagination).toHaveProperty('limit');
      expect(data.pagination).toHaveProperty('total');
      expect(data.pagination).toHaveProperty('totalPages');
      expect(data.pagination).toHaveProperty('hasNext');
      expect(data.pagination).toHaveProperty('hasPrev');
    });

    it('문의_항목이_timeAgo_필드를_포함해야_함', async () => {
      // Given
      const request = createMockRequest('/api/inquiries');

      // When
      const response = await GET(request);
      const data = await response.json();

      // Then
      expect(data.data[0]).toHaveProperty('timeAgo');
      expect(typeof data.data[0].timeAgo).toBe('string');
    });
  });
});