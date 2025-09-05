# CS 챗봇 자동화 플랫폼 - 프로젝트 컨텍스트

## 프로젝트 개요
**목표**: 소규모 회사의 운영 이슈 해결을 위한 AI 기반 CS 챗봇 자동화 플랫폼

## 핵심 문제 정의
- **타겟**: 10인 미만 소규모 사업장 (국민연금 통계 기반)
- **페인포인트**: 
  - CS 인력 부족 (월 200만원 인건비 부담)
  - 운영 인력 없이 업무 분산 처리 중
  - 좁은 사무실, 소음 이슈로 인한 업무 집중도 저하

## 비즈니스 모델
- **수익구조**: 구독제 (채널톡 대비 가격 경쟁력)
- **차별화**: 타사 대비 간편한 설치/도입, 데이터 기반 CS 조언 제공
- **확장성**: 파트너사 데이터 시각화/분석 서비스로 확장

## 핵심 기능 명세
1. **1차 AI 응답**: 폼 기반 문의 → AI 답변 생성
2. **2차 인간 연결**: AI 답변 불만족 시 원클릭 메일 문의
3. **데이터 학습**: 인간 답변을 AI 학습 데이터로 활용
4. **진행 현황**: 예상 응답 시간 및 처리 상태 UI

## 기술 스택
- **Backend**: Python Lambda, AWS Bedrock, DynamoDB
- **Frontend**: React/Next.js
- **AI**: AWS Bedrock (Claude/GPT 연동)
- **Database**: AWS RDS (PostgreSQL)
- **Infrastructure**: AWS CDK, CloudFormation

## 참고 벤치마크
카카오톡, 젠데스크, 채널톡, Tailscale

## 팀 구성
- Backend 개발자 1명
- Frontend 개발자 1명  
- Frontend+Backend 개발자 1명
- Infrastructure+Backend 개발자 1명
