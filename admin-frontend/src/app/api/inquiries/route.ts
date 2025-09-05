import { NextRequest } from 'next/server';

// 전체 문의 데이터
const allInquiries = [
  {
    id: 'inq_001',
    status: '대기',
    type: '기술 문의',
    title: '로그인이 안돼요',
    content: '계속 로그인 오류가 발생합니다.',
    urgency: '높음',
    customerId: 'customer_001',
    customerName: '김고객',
    customerEmail: 'customer001@example.com',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    replyCount: 0
  },
  {
    id: 'inq_002',
    status: '처리중',
    type: '결제 문의',
    title: '결제 오류 문의',
    content: '결제가 완료되었는데 주문이 취소되었습니다.',
    urgency: '보통',
    customerId: 'customer_002',
    customerName: '이고객',
    customerEmail: 'customer002@example.com',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    replyCount: 1
  },
  {
    id: 'inq_003',
    status: '완료',
    type: '일반 문의',
    title: '상품 정보 문의',
    content: '상품 사이즈 정보를 알고 싶습니다.',
    urgency: '낮음',
    customerId: 'customer_003',
    customerName: '박고객',
    customerEmail: 'customer003@example.com',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
    replyCount: 2
  },
  {
    id: 'inq_004',
    status: '대기',
    type: '기술 문의',
    title: '앱 오류 문의',
    content: '앱이 계속 종료됩니다.',
    urgency: '높음',
    customerId: 'customer_004',
    customerName: '최고객',
    customerEmail: 'customer004@example.com',
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000),
    replyCount: 0
  },
  {
    id: 'inq_005',
    status: '처리중',
    type: '기타',
    title: '회원 탈퇴 문의',
    content: '회원 탈퇴 방법을 알려주세요.',
    urgency: '보통',
    customerId: 'customer_005',
    customerName: '정고객',
    customerEmail: 'customer005@example.com',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    replyCount: 1
  },
  {
    id: 'inq_006',
    status: '대기',
    type: '결제 문의',
    title: '환불 요청',
    content: '주문 취소 후 환불이 안되었습니다.',
    urgency: '높음',
    customerId: 'customer_006',
    customerName: '한고객',
    customerEmail: 'customer006@example.com',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    replyCount: 0
  },
  {
    id: 'inq_007',
    status: '완료',
    type: '일반 문의',
    title: '배송 문의',
    content: '배송 예정일을 알고 싶습니다.',
    urgency: '낮음',
    customerId: 'customer_007',
    customerName: '송고객',
    customerEmail: 'customer007@example.com',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
    replyCount: 1
  }
];

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins}분 전`;
  } else if (diffHours < 24) {
    return `${diffHours}시간 전`;
  } else {
    return `${diffDays}일 전`;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 쿼리 파라미터 추출
    const status = searchParams.get('status'); // 전체, 대기, 처리중, 완료
    const urgency = searchParams.get('urgency'); // 높음, 보통, 낮음
    const type = searchParams.get('type'); // 기술 문의, 결제 문의, 일반 문의, 기타
    const sortBy = searchParams.get('sortBy') || 'createdAt'; // createdAt, urgency, status
    const sortOrder = searchParams.get('sortOrder') || 'desc'; // asc, desc
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search'); // 제목/내용 검색

    let filteredInquiries = [...allInquiries];

    // 상태 필터링
    if (status && status !== '전체') {
      filteredInquiries = filteredInquiries.filter(inq => inq.status === status);
    }

    // 긴급도 필터링
    if (urgency) {
      filteredInquiries = filteredInquiries.filter(inq => inq.urgency === urgency);
    }

    // 유형 필터링
    if (type) {
      filteredInquiries = filteredInquiries.filter(inq => inq.type === type);
    }

    // 검색 필터링
    if (search) {
      const searchLower = search.toLowerCase();
      filteredInquiries = filteredInquiries.filter(inq => 
        inq.title.toLowerCase().includes(searchLower) ||
        inq.content.toLowerCase().includes(searchLower) ||
        inq.customerName.toLowerCase().includes(searchLower)
      );
    }

    // 정렬
    filteredInquiries.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'urgency':
          const urgencyOrder = { '높음': 3, '보통': 2, '낮음': 1 };
          aValue = urgencyOrder[a.urgency as keyof typeof urgencyOrder];
          bValue = urgencyOrder[b.urgency as keyof typeof urgencyOrder];
          break;
        case 'status':
          const statusOrder = { '대기': 3, '처리중': 2, '완료': 1 };
          aValue = statusOrder[a.status as keyof typeof statusOrder];
          bValue = statusOrder[b.status as keyof typeof statusOrder];
          break;
        case 'createdAt':
        default:
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
      }

      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    // 페이징
    const total = filteredInquiries.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedInquiries = filteredInquiries.slice(startIndex, endIndex);

    // timeAgo 추가
    const inquiriesWithTimeAgo = paginatedInquiries.map(inquiry => ({
      ...inquiry,
      timeAgo: getTimeAgo(inquiry.createdAt)
    }));

    return Response.json({
      success: true,
      data: inquiriesWithTimeAgo,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        status,
        urgency,
        type,
        search,
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    return Response.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}