import { Injectable } from '@nestjs/common';
import { DynamoDBService } from '../common/dynamodb.service';

export interface Inquiry {
  inquiry_id: string;
  status: 'pending' | 'in_progress' | 'resolved';
  category: string;
  content: string;
  urgency: 'low' | 'medium' | 'high';
  companyId: string;
  created_at: string;
  updated_at?: string;
}

@Injectable()
export class DashboardService {
  private readonly adminInquiriesTable = process.env.CS_INQUIRIES_TABLE || 'cs-inquiries';

  constructor(private readonly dynamoDBService: DynamoDBService) {
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    const existingData = await this.dynamoDBService.scan(this.adminInquiriesTable);
    if (existingData.length === 0) {
      const sampleInquiries: Inquiry[] = [
        {
          inquiry_id: 'inq_001',
          status: 'pending',
          category: 'technical',
          content: '로그인이 안돼요. 계속 로그인 오류가 발생합니다.',
          urgency: 'high',
          companyId: 'customer_001',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          inquiry_id: 'inq_002',
          status: 'in_progress',
          category: 'billing',
          content: '결제 오류 문의: 결제가 완료되었는데 주문이 취소되었습니다.',
          urgency: 'medium',
          companyId: 'customer_002',
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
        },
        {
          inquiry_id: 'inq_003',
          status: 'resolved',
          category: 'general',
          content: '상품 정보 문의: 상품 사이즈 정보를 알고 싶습니다.',
          urgency: 'low',
          companyId: 'customer_003',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()
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
    const pending = inquiries.filter(i => i.status === 'pending').length;
    const processing = inquiries.filter(i => i.status === 'in_progress').length;
    const completed = inquiries.filter(i => i.status === 'resolved').length;

    const high = inquiries.filter(i => i.urgency === 'high').length;
    const normal = inquiries.filter(i => i.urgency === 'medium').length;
    const low = inquiries.filter(i => i.urgency === 'low').length;

    const typeStats = inquiries.reduce((acc, inquiry) => {
      acc[inquiry.category] = (acc[inquiry.category] || 0) + 1;
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
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)
      .map(inquiry => ({
        ...inquiry,
        timeAgo: this.getTimeAgo(new Date(inquiry.created_at))
      }));
  }

  async getUrgentAlerts() {
    const inquiries = await this.dynamoDBService.scan(
      this.adminInquiriesTable,
      'urgency = :urgency AND #status <> :status',
      {
        ':urgency': 'high',
        ':status': 'resolved'
      }
    );

    return {
      count: inquiries.length,
      inquiries: inquiries.map(inquiry => ({
        ...inquiry,
        timeAgo: this.getTimeAgo(new Date(inquiry.created_at))
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