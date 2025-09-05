// 대시보드 통계 데이터 (NestJS에서 복사)
const inquiries = [
  {
    id: 'inq_001',
    status: '대기',
    type: '기술 문의',
    title: '로그인이 안돼요',
    content: '계속 로그인 오류가 발생합니다.',
    urgency: '높음',
    customerId: 'customer_001',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: 'inq_002',
    status: '처리중',
    type: '결제 문의',
    title: '결제 오류 문의',
    content: '결제가 완료되었는데 주문이 취소되었습니다.',
    urgency: '보통',
    customerId: 'customer_002',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
  },
  {
    id: 'inq_003',
    status: '완료',
    type: '일반 문의',
    title: '상품 정보 문의',
    content: '상품 사이즈 정보를 알고 싶습니다.',
    urgency: '낮음',
    customerId: 'customer_003',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000)
  },
  {
    id: 'inq_004',
    status: '대기',
    type: '기술 문의',
    title: '앱 오류 문의',
    content: '앱이 계속 종료됩니다.',
    urgency: '높음',
    customerId: 'customer_004',
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000)
  },
  {
    id: 'inq_005',
    status: '처리중',
    type: '기타',
    title: '회원 탈퇴 문의',
    content: '회원 탈퇴 방법을 알려주세요.',
    urgency: '보통',
    customerId: 'customer_005',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
  }
];

export async function GET() {
  try {
    const total = inquiries.length;
    const pending = inquiries.filter(i => i.status === '대기').length;
    const processing = inquiries.filter(i => i.status === '처리중').length;
    const completed = inquiries.filter(i => i.status === '완료').length;

    const high = inquiries.filter(i => i.urgency === '높음').length;
    const normal = inquiries.filter(i => i.urgency === '보통').length;
    const low = inquiries.filter(i => i.urgency === '낮음').length;

    const typeStats = inquiries.reduce((acc, inquiry) => {
      acc[inquiry.type] = (acc[inquiry.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const stats = {
      total,
      status: {
        pending,
        processing,
        completed
      },
      urgency: {
        high,
        normal,
        low
      },
      types: typeStats
    };

    return Response.json({
      success: true,
      data: stats
    });
  } catch (error) {
    return Response.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}