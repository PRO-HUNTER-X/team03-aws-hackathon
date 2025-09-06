import { NextResponse } from 'next/server'
import { ScanCommand } from '@aws-sdk/lib-dynamodb'
import { dynamodb, TABLE_NAME } from '@/lib/dynamodb'

export async function GET() {
  try {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'urgency = :urgency',
      ExpressionAttributeValues: {
        ':urgency': 'high'
      }
    })

    const result = await dynamodb.send(command)
    const items = result.Items || []

    // 실제 DynamoDB 데이터를 대시보드 형식으로 변환
    const urgentInquiries = items
      .map((item: any) => ({
        id: item.inquiry_id || item.id,
        status: item.status === 'pending' ? '대기' : 
                item.status === 'ai_answered' ? '처리중' : 
                item.status === 'human_answered' ? '완료' : '대기',
        type: item.category || '기타',
        title: item.title || '제목 없음',
        content: item.content || item.question || '내용 없음',
        urgency: '높음',
        customerId: item.customerEmail || item.customer_email || '고객',
        timeAgo: getTimeAgo(item.created_at || item.createdAt),
        created_at: item.created_at || item.createdAt || new Date().toISOString()
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5) // 최대 5개만

    return NextResponse.json({
      success: true,
      data: {
        count: items.length,
        inquiries: urgentInquiries
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
