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
    example: { high: 2, normal: 2, low: 1 },
    description: '긴급도별 문의 수'
  })
  urgency: {
    high: number;
    normal: number;
    low: number;
  };

  @ApiProperty({
    example: { '기술 문의': 2, '결제 문의': 1, '일반 문의': 1, '기타': 1 },
    description: '유형별 문의 수'
  })
  types: Record<string, number>;
}