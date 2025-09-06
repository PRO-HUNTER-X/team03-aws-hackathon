import { NextRequest, NextResponse } from 'next/server'
import { ScanCommand } from '@aws-sdk/lib-dynamodb'
import { dynamodb, TABLE_NAME } from '@/lib/dynamodb'

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

    // DynamoDB에서 데이터 조회
    const command = new ScanCommand({
      TableName: TABLE_NAME,
    })

    const result = await dynamodb.send(command)
    const dbItems = result.Items || []

    console.log('조회된 원본 데이터 개수:', dbItems.length)

    // 실제 DynamoDB 데이터를 대시보드 형식으로 변환
    let items = dbItems.map((item: any) => ({
      id: item.inquiry_id || item.id,
      status: item.status === 'pending' ? '대기' : 
              item.status === 'ai_answered' ? '처리중' : 
              item.status === 'human_answered' ? '완료' : 
              item.status === 'closed' ? '완료' : '대기',
      type: item.category || item.type || '기타',
      title: item.title || '제목 없음',
      content: item.content || item.question || '내용 없음',
      urgency: item.urgency === 'high' ? '높음' : 
               item.urgency === 'medium' ? '보통' : 
               item.urgency === 'low' ? '낮음' : '보통',
      customerId: item.customerEmail || item.customer_email || '고객',
      customerEmail: item.customerEmail || item.customer_email || '',
      created_at: item.created_at || item.createdAt || new Date().toISOString(),
      aiResponse: item.aiResponse || '',
      humanResponse: item.humanResponse || ''
    }))

    console.log('변환된 데이터 샘플:', items.slice(0, 2))

    // 필터링
    if (status && status !== '전체') {
      items = items.filter(item => item.status === status)
      console.log(`상태 필터링 후: ${items.length}개`)
    }
    if (urgency && urgency !== '전체') {
      items = items.filter(item => item.urgency === urgency)
      console.log(`긴급도 필터링 후: ${items.length}개`)
    }
    if (type && type !== '전체') {
      items = items.filter(item => item.type === type)
      console.log(`타입 필터링 후: ${items.length}개`)
    }

    // 정렬
    items.sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a] || ''
      const bValue = b[sortBy as keyof typeof b] || ''
      
      if (sortBy === 'created_at') {
        const aTime = new Date(aValue as string).getTime()
        const bTime = new Date(bValue as string).getTime()
        return sortOrder === 'desc' ? bTime - aTime : aTime - bTime
      }
      
      if (sortOrder === 'desc') {
        return String(bValue).localeCompare(String(aValue))
      } else {
        return String(aValue).localeCompare(String(bValue))
      }
    })

    // 페이징
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedItems = items.slice(startIndex, endIndex)

    console.log(`페이징 결과: ${startIndex}-${endIndex}, 총 ${items.length}개 중 ${paginatedItems.length}개 반환`)

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
