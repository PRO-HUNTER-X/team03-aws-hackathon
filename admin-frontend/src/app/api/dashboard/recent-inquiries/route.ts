import { NextRequest, NextResponse } from 'next/server'
import { mockInquiries } from '@/lib/mock-data'

// API Route를 동적으로 설정
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '5')

    // Mock 데이터에서 최신순 정렬 후 제한
    const recentInquiries = [...mockInquiries]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)

    return NextResponse.json({
      success: true,
      data: recentInquiries
    })
  } catch (error) {
    console.error('최근 문의 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: '최근 문의를 불러올 수 없습니다.' },
      { status: 500 }
    )
  }
}