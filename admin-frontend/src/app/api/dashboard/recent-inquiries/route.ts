import { NextRequest, NextResponse } from 'next/server'
import { ScanCommand } from '@aws-sdk/lib-dynamodb'
import { dynamodb, TABLE_NAME } from '@/lib/dynamodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '5')

    const command = new ScanCommand({
      TableName: TABLE_NAME,
    })

    const result = await dynamodb.send(command)
    const items = result.Items || []

    // 최신순 정렬 후 제한
    const recentInquiries = items
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