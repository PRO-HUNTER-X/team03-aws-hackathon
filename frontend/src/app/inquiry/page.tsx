import { InquiryForm } from "@/components/inquiry-form";

export default function InquiryPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Main Content */}
      <div className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Side - Info */}
          <div className="space-y-8">
            <div>
              <h1 className="text-6xl font-bold mb-6 leading-tight text-gray-900">
                헌터스 고객지원
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                헌터스 서비스에 대한 문의사항이 있으시면 언제든지 문의해주세요.
              </p>
            </div>
            
            {/* Features */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900">즉시 AI 응답</h3>
                  <p className="text-gray-600">제출 후 3초 이내에 AI가 답변을 제공합니다</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">→</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900">전문가 연결</h3>
                  <p className="text-gray-600">AI 답변이 부족하면 전문가와 연결됩니다</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">✓</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900">실시간 추적</h3>
                  <p className="text-gray-600">문의 처리 상황을 실시간으로 확인할 수 있습니다</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Side - Form */}
          <div>
            <InquiryForm />
          </div>
        </div>
      </div>
    </div>
  );
}
