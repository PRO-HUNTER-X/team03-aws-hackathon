import { NextRequest } from 'next/server';

// 확장된 문의 데이터 (답변 히스토리 포함)
const inquiriesDetail = [
  {
    id: 'inq_001',
    status: '대기',
    type: '기술 문의',
    title: '로그인이 안돼요',
    content: '계속 로그인 오류가 발생합니다. 비밀번호를 여러 번 확인했는데도 로그인이 되지 않습니다. 도움이 필요합니다.',
    urgency: '높음',
    customerId: 'customer_001',
    customerName: '김고객',
    customerEmail: 'customer001@example.com',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    replies: []
  },
  {
    id: 'inq_002',
    status: '처리중',
    type: '결제 문의',
    title: '결제 오류 문의',
    content: '결제가 완료되었는데 주문이 취소되었습니다. 카드에서는 결제가 되었다고 나오는데 주문 내역에서는 취소로 표시됩니다.',
    urgency: '보통',
    customerId: 'customer_002',
    customerName: '이고객',
    customerEmail: 'customer002@example.com',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    replies: [
      {
        id: 'reply_001',
        content: '안녕하세요. 결제 오류 문의 주셔서 감사합니다. 확인해보니 시스템 오류로 인한 문제였습니다. 곧 해결해드리겠습니다.',
        author: 'admin',
        authorName: '관리자',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        isInternal: false
      }
    ]
  },
  {
    id: 'inq_003',
    status: '완료',
    type: '일반 문의',
    title: '상품 정보 문의',
    content: '상품 사이즈 정보를 알고 싶습니다. 특히 XL 사이즈의 실제 치수가 궁금합니다.',
    urgency: '낮음',
    customerId: 'customer_003',
    customerName: '박고객',
    customerEmail: 'customer003@example.com',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
    replies: [
      {
        id: 'reply_002',
        content: 'XL 사이즈의 실제 치수는 가슴둘레 110cm, 총길이 75cm입니다.',
        author: 'admin',
        authorName: '관리자',
        createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
        isInternal: false
      },
      {
        id: 'reply_003',
        content: '답변 감사합니다. 주문하겠습니다.',
        author: 'customer_003',
        authorName: '박고객',
        createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000),
        isInternal: false
      }
    ]
  },
  {
    id: 'inq_004',
    status: '대기',
    type: '기술 문의',
    title: '앱 오류 문의',
    content: '앱이 계속 종료됩니다. 아이폰 14에서 사용 중인데 앱을 실행하면 몇 초 후에 자동으로 종료됩니다.',
    urgency: '높음',
    customerId: 'customer_004',
    customerName: '최고객',
    customerEmail: 'customer004@example.com',
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000),
    replies: []
  },
  {
    id: 'inq_005',
    status: '처리중',
    type: '기타',
    title: '회원 탈퇴 문의',
    content: '회원 탈퇴 방법을 알려주세요. 개인정보 삭제도 함께 요청드립니다.',
    urgency: '보통',
    customerId: 'customer_005',
    customerName: '정고객',
    customerEmail: 'customer005@example.com',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    replies: [
      {
        id: 'reply_004',
        content: '회원 탈퇴는 마이페이지 > 계정 설정에서 가능합니다. 개인정보는 탈퇴 후 30일 내에 완전 삭제됩니다.',
        author: 'admin',
        authorName: '관리자',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        isInternal: false
      }
    ]
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const inquiryId = params.id;
    
    const inquiry = inquiriesDetail.find(inq => inq.id === inquiryId);
    
    if (!inquiry) {
      return Response.json(
        { message: '문의를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 답변에 timeAgo 추가
    const inquiryWithTimeAgo = {
      ...inquiry,
      timeAgo: getTimeAgo(inquiry.createdAt),
      replies: inquiry.replies.map(reply => ({
        ...reply,
        timeAgo: getTimeAgo(reply.createdAt)
      }))
    };

    return Response.json({
      success: true,
      data: inquiryWithTimeAgo
    });
  } catch (error) {
    return Response.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}