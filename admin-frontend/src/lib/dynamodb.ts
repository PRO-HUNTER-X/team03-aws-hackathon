import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { fromIni } from '@aws-sdk/credential-providers'

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: fromIni({ profile: 'aws-hackathon' }), // AWS CLI 프로필 사용
})

export const dynamodb = DynamoDBDocumentClient.from(client)
export const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'cs-inquiries'