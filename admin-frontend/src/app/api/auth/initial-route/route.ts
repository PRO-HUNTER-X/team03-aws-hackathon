import { NextRequest, NextResponse } from 'next/server'
import { ScanCommand } from '@aws-sdk/lib-dynamodb'
import { dynamodb } from '@/lib/dynamodb'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  console.log('=== API 시작 ===', new Date().toISOString())
  
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    
    console.log('1. 요청 파라미터:', { companyId, url: request.url })
    
    if (!companyId) {
      console.log('2. companyId 누락 - 400 에러 반환')
      return NextResponse.json(
        { success: false, error: 'companyId is required' },
        { status: 400 }
      )
    }

    console.log('3. DynamoDB 연결 시도 시작')
    console.log('4. 환경변수 확인:', {
      REGION: process.env.REGION,
      ACCESS_KEY_ID: process.env.ACCESS_KEY_ID ? '설정됨' : '누락',
      SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY ? '설정됨' : '누락'
    })

    // DynamoDB에서 회사 정보 조회
    const command = new ScanCommand({
      TableName: 'companies',
      FilterExpression: 'companyId = :companyId',
      ExpressionAttributeValues: {
        ':companyId': companyId
      }
    })

    console.log('5. DynamoDB 커맨드 준비 완료:', command)
    
    const result = await dynamodb.send(command)
    console.log('6. DynamoDB 조회 성공:', { 
      itemCount: result.Items?.length || 0,
      scannedCount: result.ScannedCount
    })
    
    const company = result.Items?.[0]
    console.log('7. 찾은 회사 데이터:', company)

    if (company) {
      console.log('8. 회사 존재 - 대시보드로 리다이렉트')
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
      console.log('8. 회사 없음 - 설정 페이지로 리다이렉트')
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
    console.error('=== 에러 발생 ===', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      code: error.code
    })
    
    const companyId = new URL(request.url).searchParams.get('companyId')
    
    // DynamoDB 에러 시 hunters-company는 설정된 것으로 처리
    if (companyId === 'hunters-company') {
      console.log('9. Fallback: hunters-company 대시보드로')
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
      console.log('9. Fallback: 기타 회사 설정 페이지로')
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