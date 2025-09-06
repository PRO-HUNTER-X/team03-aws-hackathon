import { NextRequest, NextResponse } from 'next/server'
import { GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { dynamodb, TABLE_NAME } from '@/lib/dynamodb'

// API Route를 동적으로 설정
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // DynamoDB에서 특정 문의 조회 (실제 키는 inquiry_id)
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { inquiry_id: id }
    })

    const result = await dynamodb.send(command)
    
    if (result.Item) {
      return NextResponse.json({
        success: true,
        data: {
          ...result.Item,
          replies: result.Item.replies || []
        }
      })
    } else {
      return NextResponse.json(
        { success: false, error: '문의를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('문의 상세 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: '문의를 불러올 수 없습니다.' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { status, response } = body

    // DynamoDB 업데이트
    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { inquiry_id: id },
      UpdateExpression: 'SET #status = :status, #response = :response, updated_at = :updated_at',
      ExpressionAttributeNames: {
        '#status': 'status',
        '#response': 'admin_response'
      },
      ExpressionAttributeValues: {
        ':status': status,
        ':response': response,
        ':updated_at': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    })

    const result = await dynamodb.send(command)

    return NextResponse.json({
      success: true,
      data: result.Attributes
    })
  } catch (error) {
    console.error('문의 업데이트 실패:', error)
    return NextResponse.json(
      { success: false, error: '문의를 업데이트할 수 없습니다.' },
      { status: 500 }
    )
  }
}