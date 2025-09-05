export const mockInquiries = [
  {
    id: 'INQ-001',
    status: '대기',
    type: '기술 문의',
    title: '로그인이 안돼요',
    content: '로그인 버튼을 눌러도 반응이 없습니다. 도움이 필요해요.',
    urgency: '높음',
    customerId: 'user123',
    customerName: '김철수',
    customerEmail: 'kim@example.com',
    timeAgo: '5분 전',
    replyCount: 0,
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 'INQ-002',
    status: '처리중',
    type: '결제 문의',
    title: '결제가 중복으로 됐어요',
    content: '같은 상품을 두 번 결제한 것 같습니다. 환불 요청드립니다.',
    urgency: '보통',
    customerId: 'user456',
    customerName: '이영희',
    customerEmail: 'lee@example.com',
    timeAgo: '1시간 전',
    replyCount: 2,
    created_at: '2024-01-15T09:30:00Z'
  },
  {
    id: 'INQ-003',
    status: '완료',
    type: '일반 문의',
    title: '배송 일정 문의',
    content: '주문한 상품 언제 도착하나요?',
    urgency: '낮음',
    customerId: 'user789',
    customerName: '박민수',
    customerEmail: 'park@example.com',
    timeAgo: '3시간 전',
    replyCount: 1,
    created_at: '2024-01-15T07:30:00Z'
  }
]