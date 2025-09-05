import { Injectable } from '@nestjs/common';
import { DynamoDBService } from '../common/dynamodb.service';

export interface Inquiry {
  id: string;
  status: '대기' | '처리중' | '완료';
  type: string;
  title: string;
  content: string;
  urgency: '낮음' | '보통' | '높음';
  customerId: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class DashboardService {
  private readonly adminInquiriesTable = process.env.ADMIN_INQUIRIES_TABLE || 'admin-inquiries';

  constructor(private readonly dynamoDBService: DynamoDBService) {
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    const existingData = await this.dynamoDBService.scan(this.adminInquiriesTable);
    if (existingData.length === 0) {
      const sampleInquiries: Inquiry[] = [
        {
          id: 'inq_001',
          status: '대기',
          type: '기술 문의',
          title: '로그인이 안돼요',
          content: '계속 로그인 오류가 발생합니다.',
          urgency: '높음',
          customerId: 'customer_001',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'inq_002',
          status: '처리중',
          type: '결제 문의',
          title: '결제 오류 문의',
          content: '결제가 완료되었는데 주문이 취소되었습니다.',
          urgency: '보통',
          customerId: 'customer_002',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'inq_003',
          status: '완료',
          type: '일반 문의',
          title: '상품 정보 문의',
          content: '상품 사이즈 정보를 알고 싶습니다.',
          urgency: '낮음',
          customerId: 'customer_003',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()
        }
      ];

      for (const inquiry of sampleInquiries) {
        await this.dynamoDBService.put(this.adminInquiriesTable, inquiry);
      }
    }
  }

  async getStats() {
    const inquiries = await this.dynamoDBService.scan(this.adminInquiriesTable);
    
    const total = inquiries.length;
    const pending = inquiries.filter(i => i.status === '대기').length;
    const processing = inquiries.filter(i => i.status === '처리중').length;
    const completed = inquiries.filter(i => i.status === '완료').length;

    const high = inquiries.filter(i => i.urgency === '높음').length;
    const normal = inquiries.filter(i => i.urgency === '보통').length;
    const low = inquiries.filter(i => i.urgency === '낮음').length;

    const typeStats = inquiries.reduce((acc, inquiry) => {
      acc[inquiry.type] = (acc[inquiry.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      status: {
        pending,
        processing,
        completed
      },
      urgency: {
        high,
        normal,
        low
      },
      types: typeStats
    };
  }

  async getRecentInquiries(limit: number = 10) {
    const inquiries = await this.dynamoDBService.scan(this.adminInquiriesTable);
    
    return inquiries
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
      .map(inquiry => ({
        ...inquiry,
        timeAgo: this.getTimeAgo(new Date(inquiry.createdAt))
      }));
  }

  async getUrgentAlerts() {
    const inquiries = await this.dynamoDBService.scan(
      this.adminInquiriesTable,
      'urgency = :urgency AND #status <> :status',
      {
        ':urgency': '높음',
        ':status': '완료'
      }
    );

    return {
      count: inquiries.length,
      inquiries: inquiries.map(inquiry => ({
        ...inquiry,
        timeAgo: this.getTimeAgo(new Date(inquiry.createdAt))
      }))
    };
  }

  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins}분 전`;
    } else if (diffHours < 24) {
      return `${diffHours}시간 전`;
    } else {
      return `${diffDays}일 전`;
    }
  }
}