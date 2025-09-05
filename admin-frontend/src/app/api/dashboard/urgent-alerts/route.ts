import { NextResponse } from 'next/server'
import { mockInquiries } from '@/lib/mock-data'

export async function GET() {
  try {
    // Mock 데이터에서 긴급 문의 필터링
    const urgentInquiries = mockInquiries.filter(item => item.urgency === '높음')

    return NextResponse.json({
      success: true,
      data: {
        count: urgentInquiries.length,
        inquiries: urgentInquiries.slice(0, 5) // 최대 5개만
      }
    })
  } catch (error) {
    console.error('긴급 알림 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: '긴급 알림을 불러올 수 없습니다.' },
      { status: 500 }
    )
  }
}