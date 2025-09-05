import { NextResponse } from 'next/server'
import { ScanCommand } from '@aws-sdk/lib-dynamodb'
import { dynamodb, TABLE_NAME } from '@/lib/dynamodb'

export async function GET() {
  try {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'urgency = :urgency',
      ExpressionAttributeValues: {
        ':urgency': '높음'
      }
    })

    const result = await dynamodb.send(command)
    const urgentInquiries = result.Items || []

    return NextResponse.json({
      success: true,
      data: {
        count: urgentInquiries.length,
        inquiries: urgentInquiries.slice(0, 5) // 최대 5개만
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