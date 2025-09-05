import { Injectable } from '@nestjs/common';

export interface QnAData {
  id: string;
  question: string;
  answer: string;
  category: string;
  createdAt: Date;
}

@Injectable()
export class SetupService {
  private qnaData: QnAData[] = [];

  hasQnAData(): boolean {
    return this.qnaData.length > 0;
  }

  setupInitialQnA(qnaList: Array<{ question: string; answer: string; category: string }>) {
    this.qnaData = qnaList.map((item, index) => ({
      id: `qna_${index + 1}`,
      question: item.question,
      answer: item.answer,
      category: item.category,
      createdAt: new Date()
    }));

    return {
      success: true,
      message: 'QnA 데이터가 성공적으로 설정되었습니다',
      count: this.qnaData.length
    };
  }

  getQnAData(): QnAData[] {
    return this.qnaData;
  }

  isSetupComplete(): boolean {
    return this.hasQnAData();
  }
}