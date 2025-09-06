#!/bin/bash

echo "DynamoDB에 샘플 데이터 추가 중..."

# 샘플 데이터 1
aws dynamodb put-item \
  --region us-east-1 \
  --profile aws-hackathon \
  --table-name admin-inquiries \
  --item '{
    "id": {"S": "INQ-001"},
    "status": {"S": "대기"},
    "type": {"S": "기술 문의"},
    "title": {"S": "로그인이 안돼요"},
    "content": {"S": "로그인 버튼을 눌러도 반응이 없습니다. 도움이 필요해요."},
    "urgency": {"S": "높음"},
    "customerId": {"S": "user123"},
    "customerName": {"S": "김철수"},
    "customerEmail": {"S": "kim@example.com"},
    "created_at": {"S": "2024-01-15T10:30:00Z"},
    "companyId": {"S": "company1"}
  }'

# 샘플 데이터 2
aws dynamodb put-item \
  --region us-east-1 \
  --profile aws-hackathon \
  --table-name admin-inquiries \
  --item '{
    "id": {"S": "INQ-002"},
    "status": {"S": "처리중"},
    "type": {"S": "결제 문의"},
    "title": {"S": "결제가 중복으로 됐어요"},
    "content": {"S": "같은 상품을 두 번 결제한 것 같습니다. 환불 요청드립니다."},
    "urgency": {"S": "보통"},
    "customerId": {"S": "user456"},
    "customerName": {"S": "이영희"},
    "customerEmail": {"S": "lee@example.com"},
    "created_at": {"S": "2024-01-15T09:30:00Z"},
    "companyId": {"S": "company1"}
  }'

# 샘플 데이터 3
aws dynamodb put-item \
  --region us-east-1 \
  --profile aws-hackathon \
  --table-name admin-inquiries \
  --item '{
    "id": {"S": "INQ-003"},
    "status": {"S": "완료"},
    "type": {"S": "일반 문의"},
    "title": {"S": "배송 일정 문의"},
    "content": {"S": "주문한 상품 언제 도착하나요?"},
    "urgency": {"S": "낮음"},
    "customerId": {"S": "user789"},
    "customerName": {"S": "박민수"},
    "customerEmail": {"S": "park@example.com"},
    "created_at": {"S": "2024-01-15T07:30:00Z"},
    "companyId": {"S": "company1"}
  }'

# 샘플 데이터 4
aws dynamodb put-item \
  --region us-east-1 \
  --profile aws-hackathon \
  --table-name admin-inquiries \
  --item '{
    "id": {"S": "INQ-004"},
    "status": {"S": "대기"},
    "type": {"S": "기타"},
    "title": {"S": "계정 삭제 요청"},
    "content": {"S": "더 이상 서비스를 사용하지 않아서 계정을 삭제하고 싶습니다."},
    "urgency": {"S": "낮음"},
    "customerId": {"S": "user101"},
    "customerName": {"S": "최지훈"},
    "customerEmail": {"S": "choi@example.com"},
    "created_at": {"S": "2024-01-15T06:00:00Z"},
    "companyId": {"S": "company1"}
  }'

# 샘플 데이터 5
aws dynamodb put-item \
  --region us-east-1 \
  --profile aws-hackathon \
  --table-name admin-inquiries \
  --item '{
    "id": {"S": "INQ-005"},
    "status": {"S": "처리중"},
    "type": {"S": "기술 문의"},
    "title": {"S": "앱이 자꾸 꺼져요"},
    "content": {"S": "모바일 앱을 사용하다가 자꾸 강제 종료됩니다. 해결 방법이 있나요?"},
    "urgency": {"S": "높음"},
    "customerId": {"S": "user202"},
    "customerName": {"S": "정수민"},
    "customerEmail": {"S": "jung@example.com"},
    "created_at": {"S": "2024-01-15T05:15:00Z"},
    "companyId": {"S": "company1"}
  }'

echo "샘플 데이터 추가 완료!"
echo "확인: aws dynamodb scan --region us-east-1 --profile aws-hackathon --table-name admin-inquiries --select COUNT"