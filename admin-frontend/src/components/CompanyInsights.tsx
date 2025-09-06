'use client'

import { Company } from '@/lib/auth'

interface CompanyInsightsProps {
  company: Company
  qnaCount: number
}

export default function CompanyInsights({ company, qnaCount }: CompanyInsightsProps) {
  const getIndustryInsights = (industry: string) => {
    switch (industry) {
      case '이커머스':
        return {
          icon: '🛒',
          commonIssues: ['배송 문의 70%', '결제 문의 20%', '상품 문의 10%'],
          recommendations: [
            '배송 추적 시스템 강화로 문의 60% 감소 가능',
            '결제 오류 FAQ 추가로 월 50만원 CS 비용 절약',
            '주말 문의량 200% 증가 대비 필요'
          ],
          riskFactors: ['결제 오류 시 시간당 매출손실 평균 150만원']
        }
      case 'SaaS':
        return {
          icon: '💻',
          commonIssues: ['기술 문의 80%', '계정 관리 15%', '결제 문의 5%'],
          recommendations: [
            '온보딩 튜토리얼 추가로 기술문의 40% 감소',
            '사용자 가이드 강화 필요',
            'API 문서 개선으로 개발자 만족도 향상'
          ],
          riskFactors: ['로그인 장애 시 고객 이탈률 25% 증가']
        }
      case '금융':
        return {
          icon: '🏦',
          commonIssues: ['보안 문의 60%', '거래 문의 30%', '계좌 관리 10%'],
          recommendations: [
            '보안 관련 AI 정확도 40%, 인간 개입 필수',
            '금융 규제 준수 답변 템플릿 필요',
            '실시간 거래 상태 확인 시스템 구축'
          ],
          riskFactors: ['보안 이슈 발생 시 신뢰도 급락 위험']
        }
      default:
        return {
          icon: '🏢',
          commonIssues: ['일반 문의 50%', '기술 지원 30%', '기타 20%'],
          recommendations: [
            '업종별 맞춤 FAQ 구축 필요',
            'AI 학습 데이터 확충 권장'
          ],
          riskFactors: ['업종 특화 대응 부족으로 만족도 저하 가능']
        }
    }
  }

  const insights = getIndustryInsights(company.industry)

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">{insights.icon}</span>
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            {company.companyName} 맞춤 인사이트
          </h2>
          <p className="text-sm text-gray-600">
            {company.industry} 업종 • QnA {qnaCount}개 등록됨
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* 업종별 문의 패턴 */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            📊 업종별 문의 패턴
          </h3>
          <ul className="space-y-2">
            {insights.commonIssues.map((issue, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                {issue}
              </li>
            ))}
          </ul>
        </div>

        {/* 개선 권장사항 */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            💡 개선 권장사항
          </h3>
          <ul className="space-y-2">
            {insights.recommendations.map((rec, index) => (
              <li key={index} className="text-sm text-gray-600">
                <span className="text-green-500 mr-2">✓</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>

        {/* 위험 요소 */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            ⚠️ 주의사항
          </h3>
          <ul className="space-y-2">
            {insights.riskFactors.map((risk, index) => (
              <li key={index} className="text-sm text-orange-600">
                <span className="text-orange-500 mr-2">⚡</span>
                {risk}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 벤치마킹 정보 */}
      <div className="mt-4 bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          🏆 벤치마킹
        </h3>
        <p className="text-sm text-gray-600">
          {company.industry} 업종 평균 대비 QnA 설정률: 
          <span className="font-medium text-green-600 ml-1">
            {qnaCount > 10 ? '상위 20%' : qnaCount > 5 ? '평균' : '하위 30%'}
          </span>
        </p>
      </div>
    </div>
  )
}
