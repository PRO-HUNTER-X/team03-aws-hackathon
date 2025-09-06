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

    // 실제 DynamoDB 데이터만 사용
    const dataToUse = items
    
    const stats = {
      total: dataToUse.length,
      status: {
        pending: dataToUse.filter(item => item.status === '대기').length,
        processing: dataToUse.filter(item => item.status === '처리중').length,
        completed: dataToUse.filter(item => item.status === '완료').length,
      },
      urgency: {
        high: dataToUse.filter(item => item.urgency === '높음').length,
        normal: dataToUse.filter(item => item.urgency === '보통').length,
        low: dataToUse.filter(item => item.urgency === '낮음').length,
      },
      types: dataToUse.reduce((acc: Record<string, number>, item: any) => {
        const type = String(item.type || '')
        if (type) {
          acc[type] = (acc[type] || 0) + 1
        }
        return acc
      }, {})
    }

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