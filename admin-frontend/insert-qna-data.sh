#!/bin/bash

echo "QnA 학습 데이터 추가 중..."

# 기술 문의 - 로그인 문제 (AI 답변 + 인간 피드백)
aws dynamodb put-item \
  --region us-east-1 \
  --profile aws-hackathon \
  --table-name admin-inquiries \
  --item '{
    "id": {"S": "INQ-006"},
    "status": {"S": "완료"},
    "type": {"S": "기술 문의"},
    "title": {"S": "비밀번호 재설정이 안돼요"},
    "content": {"S": "비밀번호 찾기를 눌러도 이메일이 오지 않습니다. 어떻게 해야 하나요?"},
    "urgency": {"S": "보통"},
    "customerId": {"S": "user301"},
    "customerName": {"S": "홍길동"},
    "customerEmail": {"S": "hong@example.com"},
    "created_at": {"S": "2024-01-14T15:30:00Z"},
    "companyId": {"S": "company1"},
    "ai_response": {"S": "스팸 메일함을 확인해보시고, 등록된 이메일 주소가 정확한지 확인해주세요. 문제가 지속되면 고객센터로 연락 부탁드립니다."},
    "human_response": {"S": "안녕하세요. 스팸 메일함 확인 후에도 메일이 없다면, 계정 설정에서 이메일 주소를 다시 확인해주세요. 필요시 직접 비밀번호 재설정을 도와드리겠습니다."},
    "feedback_score": {"N": "4"},
    "feedback_comment": {"S": "AI 답변이 도움이 되었지만, 더 구체적인 해결책이 필요했어요"}
  }'

# 결제 문의 - 환불 요청 (AI 답변 + 인간 피드백)
aws dynamodb put-item \
  --region us-east-1 \
  --profile aws-hackathon \
  --table-name admin-inquiries \
  --item '{
    "id": {"S": "INQ-007"},
    "status": {"S": "완료"},
    "type": {"S": "결제 문의"},
    "title": {"S": "환불 처리 기간이 궁금해요"},
    "content": {"S": "3일 전에 환불 신청했는데 언제 처리되나요? 카드로 결제했습니다."},
    "urgency": {"S": "보통"},
    "customerId": {"S": "user302"},
    "customerName": {"S": "김영수"},
    "customerEmail": {"S": "kim@example.com"},
    "created_at": {"S": "2024-01-14T11:20:00Z"},
    "companyId": {"S": "company1"},
    "ai_response": {"S": "일반적으로 카드 환불은 3-5영업일이 소요됩니다. 환불 상태는 마이페이지에서 확인 가능합니다."},
    "human_response": {"S": "안녕하세요. 카드 환불은 보통 3-5영업일 소요되며, 고객님의 경우 내일까지 처리 완료 예정입니다. 처리 완료 시 SMS로 알림드리겠습니다."},
    "feedback_score": {"N": "5"},
    "feedback_comment": {"S": "정확한 정보와 개인별 처리 상황까지 알려주셔서 만족합니다"}
  }'

# 일반 문의 - 배송 문의 (AI만 처리)
aws dynamodb put-item \
  --region us-east-1 \
  --profile aws-hackathon \
  --table-name admin-inquiries \
  --item '{
    "id": {"S": "INQ-008"},
    "status": {"S": "완료"},
    "type": {"S": "일반 문의"},
    "title": {"S": "배송 추적이 안돼요"},
    "content": {"S": "주문번호 12345로 주문했는데 배송 추적이 업데이트가 안됩니다."},
    "urgency": {"S": "낮음"},
    "customerId": {"S": "user303"},
    "customerName": {"S": "이민정"},
    "customerEmail": {"S": "lee@example.com"},
    "created_at": {"S": "2024-01-14T09:15:00Z"},
    "companyId": {"S": "company1"},
    "ai_response": {"S": "주문번호 12345 확인 결과, 현재 배송 중이며 내일 오후 도착 예정입니다. 실시간 추적은 택배사 홈페이지에서 가능합니다."},
    "feedback_score": {"N": "5"},
    "feedback_comment": {"S": "빠르고 정확한 답변이었습니다"}
  }'

# 기술 문의 - 앱 오류 (인간 처리 필요)
aws dynamodb put-item \
  --region us-east-1 \
  --profile aws-hackathon \
  --table-name admin-inquiries \
  --item '{
    "id": {"S": "INQ-009"},
    "status": {"S": "완료"},
    "type": {"S": "기술 문의"},
    "title": {"S": "결제 페이지에서 오류가 나요"},
    "content": {"S": "결제하려고 하면 ERROR_CODE_500이 뜨면서 진행이 안됩니다. 여러 번 시도해봤어요."},
    "urgency": {"S": "높음"},
    "customerId": {"S": "user304"},
    "customerName": {"S": "박서준"},
    "customerEmail": {"S": "park@example.com"},
    "created_at": {"S": "2024-01-14T08:45:00Z"},
    "companyId": {"S": "company1"},
    "ai_response": {"S": "시스템 오류로 보입니다. 브라우저 캐시를 삭제하고 다시 시도해보세요."},
    "human_response": {"S": "안녕하세요. 해당 오류는 서버 이슈로 확인되어 긴급 수정 완료했습니다. 현재 정상 이용 가능하며, 불편을 드려 죄송합니다. 추가 문제 시 즉시 연락 부탁드립니다."},
    "feedback_score": {"N": "3"},
    "feedback_comment": {"S": "AI 답변은 도움이 안됐지만, 담당자가 빠르게 해결해주셨어요"}
  }'

# 기타 문의 - 계정 관련 (AI 답변 우수)
aws dynamodb put-item \
  --region us-east-1 \
  --profile aws-hackathon \
  --table-name admin-inquiries \
  --item '{
    "id": {"S": "INQ-010"},
    "status": {"S": "완료"},
    "type": {"S": "기타"},
    "title": {"S": "회원 등급 혜택이 궁금해요"},
    "content": {"S": "골드 회원이 되면 어떤 혜택이 있나요? 승급 조건도 알고 싶습니다."},
    "urgency": {"S": "낮음"},
    "customerId": {"S": "user305"},
    "customerName": {"S": "최유진"},
    "customerEmail": {"S": "choi@example.com"},
    "created_at": {"S": "2024-01-14T07:30:00Z"},
    "companyId": {"S": "company1"},
    "ai_response": {"S": "골드 회원 혜택: 무료배송, 10% 할인쿠폰 매월 지급, 우선 고객지원. 승급 조건: 연간 구매금액 50만원 이상 또는 구매횟수 20회 이상입니다."},
    "feedback_score": {"N": "5"},
    "feedback_comment": {"S": "궁금한 내용을 모두 정확하게 답변해주셨네요"}
  }'

# 결제 문의 - 복잡한 케이스 (인간 개입 필요)
aws dynamodb put-item \
  --region us-east-1 \
  --profile aws-hackathon \
  --table-name admin-inquiries \
  --item '{
    "id": {"S": "INQ-011"},
    "status": {"S": "완료"},
    "type": {"S": "결제 문의"},
    "title": {"S": "해외카드 결제 문제"},
    "content": {"S": "미국 발행 카드로 결제하려는데 자꾸 실패합니다. 다른 결제 방법이 있나요?"},
    "urgency": {"S": "보통"},
    "customerId": {"S": "user306"},
    "customerName": {"S": "김해외"},
    "customerEmail": {"S": "overseas@example.com"},
    "created_at": {"S": "2024-01-14T06:00:00Z"},
    "companyId": {"S": "company1"},
    "ai_response": {"S": "해외카드는 일부 제한이 있을 수 있습니다. 페이팔이나 계좌이체를 이용해보세요."},
    "human_response": {"S": "안녕하세요. 해외카드 결제 이슈 확인했습니다. 고객님 카드사에 해외결제 승인 요청 후 재시도해보시고, 여전히 안되면 페이팔 결제를 권장드립니다. 필요시 전화 상담도 가능합니다."},
    "feedback_score": {"N": "4"},
    "feedback_comment": {"S": "구체적인 해결 방법을 제시해주셔서 도움이 되었습니다"}
  }'

echo "QnA 학습 데이터 추가 완료!"
echo "AI 성능 분석용 데이터:"
echo "- 총 6건의 완료된 문의"
echo "- AI 답변 만족도: 평균 4.3/5"
echo "- 인간 개입 필요 케이스: 4건"
echo "- AI만으로 해결 가능: 2건"