import { NextResponse } from 'next/server'
import { ScanCommand } from '@aws-sdk/lib-dynamodb'
import { dynamodb, TABLE_NAME } from '@/lib/dynamodb'

export async function GET() {
  try {
    console.log('DynamoDB 통계 조회 시작, 테이블:', TABLE_NAME)
    
    const command = new ScanCommand({
      TableName: TABLE_NAME,
    })

    const result = await dynamodb.send(command)
    const items = result.Items || []
    
    console.log('조회된 데이터 개수:', items.length)

    // 실제 DynamoDB 데이터 상태 매핑
    const stats = {
      total: items.length,
      status: {
        pending: items.filter(item => 
          item.status === 'pending' || item.status === '대기'
        ).length,
        processing: items.filter(item => 
          item.status === 'in_progress' || item.status === 'ai_response' || 
          item.status === 'ai_answered' || item.status === '처리중'
        ).length,
        completed: items.filter(item => 
          item.status === 'completed' || item.status === 'human_answered' || 
          item.status === 'closed' || item.status === '완료'
        ).length,
      },
      urgency: {
        high: items.filter(item => 
          item.urgency === 'high' || item.urgency === '높음'
        ).length,
        normal: items.filter(item => 
          item.urgency === 'medium' || item.urgency === '보통'
        ).length,
        low: items.filter(item => 
          item.urgency === 'low' || item.urgency === '낮음'
        ).length,
      },
      types: items.reduce((acc: Record<string, number>, item: any) => {
        const type = String(item.category || item.type || '기타')
        if (type) {
          acc[type] = (acc[type] || 0) + 1
        }
        return acc
      }, {})
    }

    console.log('통계 결과:', stats)

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('대시보드 통계 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: '통계를 불러올 수 없습니다.' },
      { status: 500 }
    )
  }
}
