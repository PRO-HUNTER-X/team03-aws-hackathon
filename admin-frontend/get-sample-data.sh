#!/bin/bash

echo "=== DynamoDB 샘플 데이터 조회 ==="

# 1. 전체 데이터 개수 확인
echo "📊 전체 데이터 개수:"
aws dynamodb scan --region us-east-1 --profile aws-hackathon --table-name admin-inquiries --select COUNT

echo ""

# 2. 전체 데이터 조회 (간단히)
echo "📋 전체 데이터 목록:"
aws dynamodb scan --region us-east-1 --profile aws-hackathon --table-name admin-inquiries --output table

echo ""

# 3. 특정 문의 조회 (INQ-001)
echo "🔍 특정 문의 조회 (INQ-001):"
aws dynamodb get-item \
  --region us-east-1 \
  --profile aws-hackathon \
  --table-name admin-inquiries \
  --key '{"id": {"S": "INQ-001"}}' \
  --output table

echo ""

# 4. 상태별 필터링 (대기 상태만)
echo "⏳ 대기 상태 문의만 조회:"
aws dynamodb scan \
  --region us-east-1 \
  --profile aws-hackathon \
  --table-name admin-inquiries \
  --filter-expression "#status = :status" \
  --expression-attribute-names '{"#status": "status"}' \
  --expression-attribute-values '{":status": {"S": "대기"}}' \
  --output table

echo ""

# 5. 긴급도별 필터링 (높음만)
echo "🚨 긴급도 높음 문의만 조회:"
aws dynamodb scan \
  --region us-east-1 \
  --profile aws-hackathon \
  --table-name admin-inquiries \
  --filter-expression "urgency = :urgency" \
  --expression-attribute-values '{":urgency": {"S": "높음"}}' \
  --output table

echo ""

# 6. JSON 형태로 전체 데이터 조회
echo "📄 JSON 형태 전체 데이터:"
aws dynamodb scan --region us-east-1 --profile aws-hackathon --table-name admin-inquiries