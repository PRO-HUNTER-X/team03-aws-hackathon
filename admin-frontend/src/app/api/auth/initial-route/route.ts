import { NextRequest, NextResponse } from 'next/server'
import { ScanCommand } from '@aws-sdk/lib-dynamodb'
import { dynamodb } from '@/lib/dynamodb'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'companyId is required' },
        { status: 400 }
      )
    }

    // DynamoDB에서 회사 정보 조회
    const command = new ScanCommand({
      TableName: 'companies',
      FilterExpression: 'companyId = :companyId',
      ExpressionAttributeValues: {
        ':companyId': companyId
      }
    })

    const result = await dynamodb.send(command)
    const company = result.Items?.[0]

    if (company) {
      // DB에 회사 정보가 있으면 대시보드로
      return NextResponse.json({
        success: true,
        data: {
          hasSetup: true,
          redirectUrl: '/dashboard',
          companyId: companyId,
          company: company
        }
      })
    } else {
      // DB에 없으면 설정 페이지로
      return NextResponse.json({
        success: true,
        data: {
          hasSetup: false,
          redirectUrl: '/setup',
          companyId: companyId
        }
      })
    }
  } catch (error) {
    console.error('API 에러:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}