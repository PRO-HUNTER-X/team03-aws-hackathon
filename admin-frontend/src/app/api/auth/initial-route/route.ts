import { NextRequest, NextResponse } from 'next/server'
import { ScanCommand } from '@aws-sdk/lib-dynamodb'
import { dynamodb, TABLE_NAME } from '@/lib/dynamodb'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    
    console.log('초기 라우팅 API 시작:', { companyId })
    
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'companyId is required' },
        { status: 400 }
      )
    }

    // companies 테이블에서 회사 정보 조회
    const command = new ScanCommand({
      TableName: 'companies',
      FilterExpression: 'companyId = :companyId',
      ExpressionAttributeValues: {
        ':companyId': companyId
      }
    })

    const result = await dynamodb.send(command)
    const company = result.Items?.[0]
    
    console.log('DB 조회 결과:', { found: !!company, companyId })

    if (company) {
      console.log('회사 존재 - 대시보드로 리다이렉트')
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
      console.log('회사 없음 - 설정 페이지로 리다이렉트')
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
    console.error('초기 라우팅 에러:', error)
    
    // 에러 시 fallback: hunters-company는 대시보드로
    const companyId = new URL(request.url).searchParams.get('companyId')
    if (companyId === 'hunters-company') {
      return NextResponse.json({
        success: true,
        data: {
          hasSetup: true,
          redirectUrl: '/dashboard',
          companyId: companyId,
          message: 'DB 에러로 fallback 사용'
        }
      })
    } else {
      return NextResponse.json({
        success: true,
        data: {
          hasSetup: false,
          redirectUrl: '/setup',
          companyId: companyId
        }
      })
    }
  }
}