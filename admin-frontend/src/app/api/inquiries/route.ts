import { NextRequest, NextResponse } from 'next/server'
import { mockInquiries } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const urgency = searchParams.get('urgency')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Mock 데이터 필터링
    let items = [...mockInquiries]
    
    if (status && status !== '전체') {
      items = items.filter(item => item.status === status)
    }
    if (urgency) {
      items = items.filter(item => item.urgency === urgency)
    }
    if (type) {
      items = items.filter(item => item.type === type)
    }

    // 페이징
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedItems = items.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: paginatedItems,
      pagination: {
        page,
        limit,
        total: items.length,
        totalPages: Math.ceil(items.length / limit),
        hasNext: endIndex < items.length,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('문의 목록 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: '문의 목록을 불러올 수 없습니다.' },
      { status: 500 }
    )
  }
}