import InquiryDetailClient from './inquiry-detail-client';

export async function generateStaticParams() {
  // 정적 생성할 기본 ID들
  return [
    { id: 'demo-001' },
    { id: 'demo-002' },
    { id: 'demo-003' }
  ];
}

// 정적 export에서는 동적 파라미터 비활성화
export const dynamicParams = false;

export default function InquiryDetailPage() {
  return <InquiryDetailClient />;
}