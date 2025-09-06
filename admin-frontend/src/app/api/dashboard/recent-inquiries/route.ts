import { NextRequest, NextResponse } from 'next/server'
import { ScanCommand } from '@aws-sdk/lib-dynamodb'
import { dynamodb, TABLE_NAME } from '@/lib/dynamodb'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '5')

    const command = new ScanCommand({
      TableName: TABLE_NAME,
    })

    const result = await dynamodb.send(command)
    const items = result.Items || []

    // 실제 DynamoDB 데이터를 대시보드 형식으로 변환
    const recentInquiries = items
      .map((item: any) => ({
        id: item.inquiry_id || item.id,
        status: item.status === 'pending' ? '대기' : 
                item.status === 'ai_answered' ? '처리중' : 
                item.status === 'human_answered' ? '완료' : '대기',
        type: item.category || '기타',
        title: item.title || '제목 없음',
        content: item.content || item.question || '내용 없음',
        urgency: item.urgency === 'high' ? '높음' : 
                 item.urgency === 'medium' ? '보통' : '낮음',
        customerId: item.customerEmail || item.customer_email || '고객',
        timeAgo: getTimeAgo(item.created_at || item.createdAt),
        created_at: item.created_at || item.createdAt || new Date().toISOString()
      }))
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

function getTimeAgo(dateString: string): string {
  if (!dateString) return '방금 전'
  
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return '방금 전'
  if (diffMins < 60) return `${diffMins}분 전`
  if (diffHours < 24) return `${diffHours}시간 전`
  return `${diffDays}일 전`
}
