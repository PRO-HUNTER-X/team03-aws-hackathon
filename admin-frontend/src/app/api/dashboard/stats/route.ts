import { NextResponse } from 'next/server'
import { ScanCommand } from '@aws-sdk/lib-dynamodb'
import { dynamodb, TABLE_NAME } from '@/lib/dynamodb'

export async function GET() {
  try {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
    })

    const result = await dynamodb.send(command)
    const items = result.Items || []

    // 통계 계산
    const stats = {
      total: items.length,
      status: {
        pending: items.filter(item => item.status === '대기').length,
        processing: items.filter(item => item.status === '처리중').length,
        completed: items.filter(item => item.status === '완료').length,
      },
      urgency: {
        high: items.filter(item => item.urgency === '높음').length,
        normal: items.filter(item => item.urgency === '보통').length,
        low: items.filter(item => item.urgency === '낮음').length,
      },
      types: items.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('통계 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: '통계를 불러올 수 없습니다.' },
      { status: 500 }
    )
  }
}