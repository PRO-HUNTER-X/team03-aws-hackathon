import { NextRequest, NextResponse } from 'next/server'
import { ScanCommand } from '@aws-sdk/lib-dynamodb'
import { dynamodb, TABLE_NAME } from '@/lib/dynamodb'
import { mockInquiries } from '@/lib/mock-data'

// API Route를 동적으로 설정
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const urgency = searchParams.get('urgency')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    console.log('문의 목록 조회 시작:', { status, urgency, type, page, limit })

    // DynamoDB에서 문의 목록 조회
    const command = new ScanCommand({
      TableName: TABLE_NAME,
    })

    const result = await dynamodb.send(command)
    let items = result.Items || []
    
    console.log('DynamoDB 조회 결과:', items.length, '건')

    // 필터링
    if (status && status !== '전체') {
      // cs-inquiries 상태값 매핑
      const statusMap: Record<string, string> = {
        '대기': 'pending',
        '처리중': 'ai_responded', 
        '완료': 'escalated'
      }
      const mappedStatus = statusMap[status] || status
      items = items.filter(item => item.status === mappedStatus)
    }
    
    if (urgency) {
      // 긴급도 매핑
      const urgencyMap: Record<string, string> = {
        '높음': 'high',
        '보통': 'medium',
        '낮음': 'low'
      }
      const mappedUrgency = urgencyMap[urgency] || urgency
      items = items.filter(item => item.urgency === mappedUrgency)
    }
    
    if (type) {
      items = items.filter(item => item.category === type)
    }

    // 데이터 변환 (cs-inquiries → admin-inquiries 형태)
    const transformedItems = items.map(item => ({
      id: item.inquiry_id,
      status: item.status === 'pending' ? '대기' : 
              item.status === 'ai_responded' ? '처리중' : '완료',
      type: item.category || '일반 문의',
      title: item.title,
      content: item.content,
      urgency: item.urgency === 'high' ? '높음' : 
               item.urgency === 'medium' ? '보통' : '낮음',
      customerId: item.customerEmail,
      customerName: item.customerEmail?.split('@')[0] || '고객',
      customerEmail: item.customerEmail,
      created_at: item.created_at,
      timeAgo: calculateTimeAgo(item.created_at),
      replyCount: 0
    }))

    // 페이징
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedItems = transformedItems.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: paginatedItems,
      pagination: {
        page,
        limit,
        total: transformedItems.length,
        totalPages: Math.ceil(transformedItems.length / limit),
        hasNext: endIndex < transformedItems.length,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('DynamoDB 조회 실패, Mock 데이터 사용:', error)
    
    // 에러 시 Mock 데이터로 폴백
    const { searchParams } = new URL(request.url)
    const fallbackStatus = searchParams.get('status')
    const fallbackUrgency = searchParams.get('urgency')
    const fallbackType = searchParams.get('type')
    const fallbackPage = parseInt(searchParams.get('page') || '1')
    const fallbackLimit = parseInt(searchParams.get('limit') || '10')
    
    let items = [...mockInquiries]
    
    if (fallbackStatus && fallbackStatus !== '전체') {
      items = items.filter(item => item.status === fallbackStatus)
    }
    if (fallbackUrgency) {
      items = items.filter(item => item.urgency === fallbackUrgency)
    }
    if (fallbackType) {
      items = items.filter(item => item.type === fallbackType)
    }

    const startIndex = (fallbackPage - 1) * fallbackLimit
    const endIndex = startIndex + fallbackLimit
    const paginatedItems = items.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: paginatedItems,
      pagination: {
        page: fallbackPage,
        limit: fallbackLimit,
        total: items.length,
        totalPages: Math.ceil(items.length / fallbackLimit),
        hasNext: endIndex < items.length,
        hasPrev: fallbackPage > 1
      }
    })
  }
}

function calculateTimeAgo(dateString: string): string {
  const now = new Date()
  const past = new Date(dateString)
  const diffMs = now.getTime() - past.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffDays > 0) {
    return `${diffDays}일 전`
  } else if (diffHours > 0) {
    return `${diffHours}시간 전`
  } else {
    return '방금 전'
  }
}