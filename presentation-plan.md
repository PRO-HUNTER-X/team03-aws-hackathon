# 📑 발표 자료 구성 플랜

## 장표 1: 프로젝트 제목 & 임팩트

**🤖 CS 챗봇 자동화 플랫폼**

• "월 500만원 CS 인건비를 50만원으로, AI가 24시간 고객 응대"

**🎯 핵심 문제**

• **타겟**: 10인 미만 소규모 사업장 (국민연금 통계 기준 전체 사업장의 85%, 약 340만개)

• **페인포인트**:
  • CS 인력 부족 (월 200만원 이상 인건비 부담)
  • 반복 문의로 인한 업무 과부하  
  • 시도때도 없이 걸려오는 상담 전화/이메일로 중요 업무 집중 어려움

**💡 솔루션 개요**

• AI 기반 실시간 문의 자동 상담 + 학습형 품질 개선

• **정량적 효과**: 문의 처리 시간 24시간 → 2분 (95% 단축), 운영비 60% 절감

**💰 비즈니스 임팩트**

• **절약 효과**: 월 인건비 500만원 → AI 솔루션 50만원 (90% 절감)

• **ROI**: 도입 첫 달부터 즉시 비용 절감, 연 5,400만원 절약

• **시장 규모**: 국내 CS 솔루션 시장 2조원, 타겟 340만 사업장

## 장표 2: 팀 & 문제 정의

**👥 Team 03 구성**

• Backend 개발자 1명 (Python/AWS Lambda)

• Frontend 개발자 1명 (React/Next.js)

• Full-stack 개발자 1명 (통합 개발)

• Infrastructure 개발자 1명 (AWS CDK)

## 장표 3: 아키텍처 & 인프라 구성

**🏗️ 시스템 아키텍처**

• **architecture.drawio → PNG 변환** 필요

• **핵심 구성요소**:
  • Frontend: CloudFront + S3 (React/Next.js)
  • Backend: API Gateway + Lambda (Python)
  • AI Engine: AWS Bedrock (Claude 3.5 Sonnet)
  • Database: DynamoDB (NoSQL)
  • CI/CD: GitHub Actions + IAM OIDC

**🚀 배포 전략**

• **Infrastructure as Code**: AWS CDK로 인프라 자동화
• ./deploy.sh 로 간단하게 인프라 프로비저닝 / 배포 자동화 구성
• **CI/CD 파이프라인**: GitHub Actions 기반 자동 배포

## 장표 4: 라이브 데모

**🎬 데모 시나리오**

**1단계: 고객 문의 접수**
• 쇼핑몰 등 고객사에서 고객이 문의 작성
• AI 즉시 응답 생성 - 자동 응답으로 해결되지 않는다면, 버튼 원클릭으로 실제 상담 문의
• 문의 진행 상황 추적 가능

---

## 향후 장표 계획 (5-9)

### 장표 5: Amazon Q Developer 활용
- docs, rules 기반 개발 플로우
- TDD, DDD 개발 방식 도식화

### 장표 6: 비즈니스 가치
- 문제 정의와 타겟 고객층
- 수익성과 고객 활용성

### 장표 7: Q Developer 핵심 활용
- README.md 기반 혁신적 활용 사례

### 장표 8: 핵심 프롬프트 예시
- AI 응답 생성 프롬프트
- 코드 생성 프롬프트
