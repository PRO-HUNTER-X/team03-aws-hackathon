import { NextRequest, NextResponse } from 'next/server'
import { ScanCommand } from '@aws-sdk/lib-dynamodb'
import { dynamodb, TABLE_NAME } from '@/lib/dynamodb'

// API Route를 동적으로 설정
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const urgency = searchParams.get('urgency')
    const type = searchParams.get('type')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    console.log('문의 목록 조회 시작:', { status, urgency, type, sortBy, sortOrder, page, limit })

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
    const transformedItems = items.map(item => {
      try {
        return {
          id: item.inquiry_id || 'unknown',
          status: item.status === 'pending' ? '대기' : 
                  item.status === 'ai_responded' ? '처리중' : '완료',
          type: item.category || '일반 문의',
          title: item.title || '제목 없음',
          content: item.content || '내용 없음',
          urgency: item.urgency === 'high' ? '높음' : 
                   item.urgency === 'medium' ? '보통' : '낮음',
          customerId: item.customerEmail || 'unknown',
          customerName: item.customerEmail?.split('@')[0] || '고객',
          customerEmail: item.customerEmail || 'unknown@example.com',
          created_at: item.created_at || new Date().toISOString(),
          timeAgo: calculateTimeAgo(item.created_at),
          replyCount: 0
        }
      } catch (error) {
        console.error('데이터 변환 에러:', error, item)
        return null
      }
    }).filter(item => item !== null)

    // 정렬
    transformedItems.sort((a, b) => {
      let aValue: any = a.created_at
      let bValue: any = b.created_at
      
      if (sortBy === 'title') {
        aValue = a.title
        bValue = b.title
      } else if (sortBy === 'status') {
        aValue = a.status
        bValue = b.status
      } else if (sortBy === 'urgency') {
        const urgencyOrder = { '높음': 3, '보통': 2, '낮음': 1 }
        const aOrder = urgencyOrder[a.urgency as keyof typeof urgencyOrder] || 0
        const bOrder = urgencyOrder[b.urgency as keyof typeof urgencyOrder] || 0
        return sortOrder === 'desc' ? bOrder - aOrder : aOrder - bOrder
      }
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1
      } else {
        return aValue > bValue ? 1 : -1
      }
    })

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
    console.error('문의 목록 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: '문의 목록을 불러올 수 없습니다.' },
      { status: 500 }
    )
  }
}

function calculateTimeAgo(dateString: string): string {
  try {
    if (!dateString) return '시간 미상'
    
    const now = new Date()
    const past = new Date(dateString)
    
    // 유효하지 않은 날짜 체크
    if (isNaN(past.getTime())) {
      return '시간 미상'
    }
    
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
  } catch (error) {
    console.error('시간 계산 에러:', error)
    return '시간 미상'
  }
}