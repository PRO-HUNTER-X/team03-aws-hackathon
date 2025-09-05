import { GET } from './route';
import { NextRequest } from 'next/server';

// Mock NextRequest 생성 헬퍼
function createMockRequest(url: string) {
  return new NextRequest(new URL(url, 'http://localhost:3000'));
}

describe('GET /api/inquiries/[id]', () => {
  describe('문의_상세_조회', () => {
    it('존재하는_문의_ID로_조회시_상세_정보를_반환해야_함', async () => {
      // Given
      const request = createMockRequest('/api/inquiries/inq_001');
      const params = { id: 'inq_001' };

      // When
      const response = await GET(request, { params });
      const data = await response.json();

      // Then
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('inq_001');
      expect(data.data.title).toBe('로그인이 안돼요');
      expect(data.data.customerName).toBe('김고객');
      expect(data.data.customerEmail).toBe('customer001@example.com');
    });

    it('존재하지_않는_문의_ID로_조회시_404를_반환해야_함', async () => {
      // Given
      const request = createMockRequest('/api/inquiries/invalid_id');
      const params = { id: 'invalid_id' };

      // When
      const response = await GET(request, { params });
      const data = await response.json();

      // Then
      expect(response.status).toBe(404);
      expect(data.message).toBe('문의를 찾을 수 없습니다');
    });

    it('답변이_없는_문의의_경우_빈_배열을_반환해야_함', async () => {
      // Given
      const request = createMockRequest('/api/inquiries/inq_001');
      const params = { id: 'inq_001' };

      // When
      const response = await GET(request, { params });
      const data = await response.json();

      // Then
      expect(data.data.replies).toEqual([]);
    });

    it('답변이_있는_문의의_경우_답변_목록을_반환해야_함', async () => {
      // Given
      const request = createMockRequest('/api/inquiries/inq_002');
      const params = { id: 'inq_002' };

      // When
      const response = await GET(request, { params });
      const data = await response.json();

      // Then
      expect(data.data.replies).toHaveLength(1);
      expect(data.data.replies[0]).toHaveProperty('id');
      expect(data.data.replies[0]).toHaveProperty('content');
      expect(data.data.replies[0]).toHaveProperty('author');
      expect(data.data.replies[0]).toHaveProperty('authorName');
      expect(data.data.replies[0]).toHaveProperty('timeAgo');
    });

    it('여러_답변이_있는_문의의_경우_모든_답변을_반환해야_함', async () => {
      // Given
      const request = createMockRequest('/api/inquiries/inq_003');
      const params = { id: 'inq_003' };

      // When
      const response = await GET(request, { params });
      const data = await response.json();

      // Then
      expect(data.data.replies).toHaveLength(2);
      expect(data.data.replies[0].author).toBe('admin');
      expect(data.data.replies[1].author).toBe('customer_003');
    });
  });

  describe('응답_형식', () => {
    it('올바른_응답_구조를_반환해야_함', async () => {
      // Given
      const request = createMockRequest('/api/inquiries/inq_001');
      const params = { id: 'inq_001' };

      // When
      const response = await GET(request, { params });
      const data = await response.json();

      // Then
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      
      const inquiry = data.data;
      expect(inquiry).toHaveProperty('id');
      expect(inquiry).toHaveProperty('status');
      expect(inquiry).toHaveProperty('type');
      expect(inquiry).toHaveProperty('title');
      expect(inquiry).toHaveProperty('content');
      expect(inquiry).toHaveProperty('urgency');
      expect(inquiry).toHaveProperty('customerId');
      expect(inquiry).toHaveProperty('customerName');
      expect(inquiry).toHaveProperty('customerEmail');
      expect(inquiry).toHaveProperty('createdAt');
      expect(inquiry).toHaveProperty('updatedAt');
      expect(inquiry).toHaveProperty('timeAgo');
      expect(inquiry).toHaveProperty('replies');
    });

    it('timeAgo_필드가_문자열이어야_함', async () => {
      // Given
      const request = createMockRequest('/api/inquiries/inq_001');
      const params = { id: 'inq_001' };

      // When
      const response = await GET(request, { params });
      const data = await response.json();

      // Then
      expect(typeof data.data.timeAgo).toBe('string');
    });

    it('답변에도_timeAgo_필드가_포함되어야_함', async () => {
      // Given
      const request = createMockRequest('/api/inquiries/inq_002');
      const params = { id: 'inq_002' };

      // When
      const response = await GET(request, { params });
      const data = await response.json();

      // Then
      expect(data.data.replies[0]).toHaveProperty('timeAgo');
      expect(typeof data.data.replies[0].timeAgo).toBe('string');
    });
  });

  describe('데이터_검증', () => {
    it('각_문의_유형별로_올바른_데이터를_반환해야_함', async () => {
      // Given & When & Then
      const testCases = [
        { id: 'inq_001', expectedType: '기술 문의', expectedUrgency: '높음' },
        { id: 'inq_002', expectedType: '결제 문의', expectedUrgency: '보통' },
        { id: 'inq_003', expectedType: '일반 문의', expectedUrgency: '낮음' }
      ];

      for (const testCase of testCases) {
        const request = createMockRequest(`/api/inquiries/${testCase.id}`);
        const params = { id: testCase.id };
        
        const response = await GET(request, { params });
        const data = await response.json();
        
        expect(data.data.type).toBe(testCase.expectedType);
        expect(data.data.urgency).toBe(testCase.expectedUrgency);
      }
    });

    it('상태별로_올바른_데이터를_반환해야_함', async () => {
      // Given & When & Then
      const statusTests = [
        { id: 'inq_001', expectedStatus: '대기' },
        { id: 'inq_002', expectedStatus: '처리중' },
        { id: 'inq_003', expectedStatus: '완료' }
      ];

      for (const test of statusTests) {
        const request = createMockRequest(`/api/inquiries/${test.id}`);
        const params = { id: test.id };
        
        const response = await GET(request, { params });
        const data = await response.json();
        
        expect(data.data.status).toBe(test.expectedStatus);
      }
    });
  });
});