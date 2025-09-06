import { Injectable } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

@Injectable()
export class DynamoDBService {
  private client: DynamoDBDocumentClient;

  constructor() {
    const dynamoClient = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1'
    });
    this.client = DynamoDBDocumentClient.from(dynamoClient);
  }

  async put(tableName: string, item: any) {
    const command = new PutCommand({
      TableName: tableName,
      Item: item
    });
    return await this.client.send(command);
  }

  async get(tableName: string, key: any) {
    const command = new GetCommand({
      TableName: tableName,
      Key: key
    });
    const result = await this.client.send(command);
    return result.Item;
  }

  async scan(tableName: string, filterExpression?: string, expressionAttributeValues?: any) {
    const command = new ScanCommand({
      TableName: tableName,
      FilterExpression: filterExpression,
      ExpressionAttributeValues: expressionAttributeValues
    });
    const result = await this.client.send(command);
    return result.Items || [];
  }

  async query(tableName: string, indexName: string, keyConditionExpression: string, expressionAttributeValues: any) {
    const command = new QueryCommand({
      TableName: tableName,
      IndexName: indexName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ScanIndexForward: false
    });
    const result = await this.client.send(command);
    return result.Items || [];
  }

  async update(tableName: string, key: any, updateExpression: string, expressionAttributeValues: any) {
    const command = new UpdateCommand({
      TableName: tableName,
      Key: key,
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    });
    const result = await this.client.send(command);
    return result.Attributes;
  }
}