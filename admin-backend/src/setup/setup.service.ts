import { Injectable } from '@nestjs/common';
import { DynamoDBService } from '../common/dynamodb.service';

export interface QnAData {
  id: string;
  question: string;
  answer: string;
  category: string;
  createdAt: string;
}

@Injectable()
export class SetupService {
  private readonly qnaTable = process.env.QNA_TABLE || 'qna-data';

  constructor(private readonly dynamoDBService: DynamoDBService) {}

  async hasQnAData(): Promise<boolean> {
    const items = await this.dynamoDBService.scan(this.qnaTable);
    return items.length > 0;
  }

  async setupInitialQnA(qnaList: Array<{ question: string; answer: string; category: string }>) {
    const qnaItems = qnaList.map((item, index) => ({
      id: `qna_${Date.now()}_${index + 1}`,
      question: item.question,
      answer: item.answer,
      category: item.category,
      createdAt: new Date().toISOString()
    }));

    // 모든 QnA 데이터를 DynamoDB에 저장
    for (const qnaItem of qnaItems) {
      await this.dynamoDBService.put(this.qnaTable, qnaItem);
    }

    return {
      success: true,
      message: 'QnA 데이터가 성공적으로 설정되었습니다',
      count: qnaItems.length
    };
  }

  async getQnAData(): Promise<QnAData[]> {
    return await this.dynamoDBService.scan(this.qnaTable);
  }

  async isSetupComplete(): Promise<boolean> {
    return await this.hasQnAData();
  }
}