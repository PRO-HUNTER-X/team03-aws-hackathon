import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, MessageCircle, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="">
      {/* Hero Section - Full Screen */}
      <section className="min-h-screen flex items-center justify-center bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100"></div>
        <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
          <div className="mb-12">
            <div className="inline-block p-6 bg-white rounded-3xl shadow-2xl mb-8">
              <div className="w-20 h-20 bg-slate-600 rounded-2xl flex items-center justify-center mx-auto">
                <span className="text-white font-bold text-2xl">헌터스</span>
              </div>
            </div>
          </div>
          <h1 className="text-7xl md:text-8xl font-bold mb-8 text-gray-900 leading-tight">헌터스 고객지원센터</h1>
          <p className="text-2xl text-gray-600 mb-16 max-w-4xl mx-auto leading-relaxed">
            헌터스 고객님들을 위한 24시간 AI 고객지원 서비스
          </p>
          <div className="flex gap-6 justify-center">
            <Link href="/inquiry">
              <Button
                size="lg"
                className="flex items-center gap-3 bg-slate-600 hover:bg-slate-700 text-white px-12 py-6 text-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <MessageCircle className="w-6 h-6" />
                문의하기
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="flex items-center gap-3 border-slate-600 text-slate-600 hover:bg-slate-600 hover:text-white px-12 py-6 text-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <Clock className="w-6 h-6" />
                내 문의 확인
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - Full Screen */}
      <section className="min-h-screen flex items-center bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6 text-gray-900">헌터스 고객지원 서비스</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              헌터스 고객님들을 위한 편리하고 빠른 지원 서비스를 제공합니다
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 bg-white p-8 rounded-3xl hover:scale-105">
              <CardHeader className="pb-6">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
                  <Bot className="w-8 h-8 text-slate-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-4">즉시 AI 응답</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed text-lg">
                  24시간 언제든지 AI가 고객 문의에 즉시 답변을 제공합니다.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 bg-white p-8 rounded-3xl hover:scale-105">
              <CardHeader className="pb-6">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
                  <MessageCircle className="w-8 h-8 text-slate-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-4">사람과 연결</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed text-lg">
                  AI 답변이 부족할 때 원클릭으로 담당자와 연결됩니다.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 bg-white p-8 rounded-3xl hover:scale-105">
              <CardHeader className="pb-6">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
                  <Clock className="w-8 h-8 text-slate-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-4">실시간 추적</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed text-lg">문의 처리 상황을 실시간으로 확인할 수 있습니다.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works Section - Full Screen */}
      <section className="min-h-screen flex items-center bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6 text-gray-900">헌터스 고객지원 이용방법</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              간단한 4단계로 헌터스 고객지원 서비스를 이용하실 수 있습니다
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="text-center group">
              <div className="w-24 h-24 bg-slate-600 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                <span className="text-white font-bold text-2xl">1</span>
              </div>
              <h3 className="font-bold mb-4 text-2xl text-gray-900">문의 작성</h3>
              <p className="text-gray-600 leading-relaxed text-lg">간단한 폼으로 문의사항을 작성합니다</p>
            </div>
            <div className="text-center group">
              <div className="w-24 h-24 bg-slate-600 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                <span className="text-white font-bold text-2xl">2</span>
              </div>
              <h3 className="font-bold mb-4 text-2xl text-gray-900">AI 분석</h3>
              <p className="text-gray-600 leading-relaxed text-lg">AI가 문의 내용을 분석하고 답변을 생성합니다</p>
            </div>
            <div className="text-center group">
              <div className="w-24 h-24 bg-slate-600 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                <span className="text-white font-bold text-2xl">3</span>
              </div>
              <h3 className="font-bold mb-4 text-2xl text-gray-900">즉시 응답</h3>
              <p className="text-gray-600 leading-relaxed text-lg">3초 이내에 맞춤형 답변을 받아보세요</p>
            </div>
            <div className="text-center group">
              <div className="w-24 h-24 bg-slate-600 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                <span className="text-white font-bold text-2xl">4</span>
              </div>
              <h3 className="font-bold mb-4 text-2xl text-gray-900">만족도 평가</h3>
              <p className="text-gray-600 leading-relaxed text-lg">답변에 만족하지 않으면 담당자와 연결됩니다</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Full Screen */}
      <section className="min-h-screen flex items-center bg-gray-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-6xl font-bold mb-8">헌터스 고객지원이 필요하신가요?</h2>
          <p className="text-2xl text-gray-300 mb-16 max-w-4xl mx-auto leading-relaxed">
            언제든지 문의해주세요. 24시간 빠른 답변을 제공해드립니다
          </p>
          <Link href="/inquiry">
            <Button
              size="lg"
              className="bg-slate-600 hover:bg-slate-700 text-white px-16 py-8 text-2xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300"
            >
              지금 문의하기
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
