import { ApiProperty } from '@nestjs/swagger';

export class StatsResponseDto {
  @ApiProperty({ example: 5, description: '전체 문의 수' })
  total: number;

  @ApiProperty({
    example: { pending: 2, processing: 2, completed: 1 },
    description: '상태별 문의 수'
  })
  status: {
    pending: number;
    processing: number;
    completed: number;
  };

  @ApiProperty({
    example: { urgent: 2, normal: 2, low: 1 },
    description: '긴급도별 문의 수'
  })
  urgency: {
    urgent: number;
    normal: number;
    low: number;
  };

  @ApiProperty({
    example: { '배송 문의': 1, '결제 문의': 1, '상품 문의': 1 },
    description: '유형별 문의 수'
  })
  types: Record<string, number>;
}