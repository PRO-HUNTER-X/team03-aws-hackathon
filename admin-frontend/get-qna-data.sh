#!/bin/bash

echo "=== QnA 학습 데이터 조회 ==="

# 1. AI 답변이 있는 문의만 조회
echo "🤖 AI 답변이 있는 문의:"
aws dynamodb scan \
  --region us-east-1 \
  --profile aws-hackathon \
  --table-name admin-inquiries \
  --filter-expression "attribute_exists(ai_response)" \
  --output table

echo ""

# 2. 피드백 점수별 조회 (높은 점수)
echo "⭐ 피드백 점수 4점 이상:"
aws dynamodb scan \
  --region us-east-1 \
  --profile aws-hackathon \
  --table-name admin-inquiries \
  --filter-expression "feedback_score >= :score" \
  --expression-attribute-values '{":score": {"N": "4"}}' \
  --output table

echo ""

# 3. 인간 답변이 있는 문의 (AI 학습용)
echo "👨💼 인간 답변이 있는 문의 (AI 학습용):"
aws dynamodb scan \
  --region us-east-1 \
  --profile aws-hackathon \
  --table-name admin-inquiries \
  --filter-expression "attribute_exists(human_response)" \
  --output table

echo ""

# 4. 특정 문의 상세 조회 (INQ-006)
echo "🔍 특정 QnA 데이터 상세 (INQ-006):"
aws dynamodb get-item \
  --region us-east-1 \
  --profile aws-hackathon \
  --table-name admin-inquiries \
  --key '{"id": {"S": "INQ-006"}}' \
  --output table