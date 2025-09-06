import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

// Amplify 환경에서는 사용자 정의 자격증명 사용
const client = new DynamoDBClient({
  region: process.env.REGION || 'us-east-1',
  credentials: process.env.ACCESS_KEY_ID && process.env.SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  } : undefined,
})

export const dynamodb = DynamoDBDocumentClient.from(client)
export const TABLE_NAME = process.env.DYNAMODB_ADMIN_INQUIRIES_TABLE || 'cs-inquiries'

// 로그로 테이블명 확인
console.log('DynamoDB TABLE_NAME:', TABLE_NAME)