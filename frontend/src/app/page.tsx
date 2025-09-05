import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, MessageCircle, Clock, Star } from "lucide-react";

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      {/* Hero Section */}
      <div className="text-center py-16">
        <h1 className="text-4xl font-bold mb-4">
          AI 기반 CS 챗봇 플랫폼
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          소규모 회사를 위한 스마트한 고객 서비스 자동화 솔루션
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/inquiry">
            <Button size="lg" className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              문의하기
            </Button>
          </Link>
          <Link href="/demo">
            <Button variant="outline" size="lg">
              데모 보기
            </Button>
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-600" />
              즉시 AI 응답
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              24시간 언제든지 AI가 고객 문의에 즉시 답변을 제공합니다.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-green-600" />
              사람과 연결
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              AI 답변이 부족할 때 원클릭으로 담당자와 연결됩니다.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              실시간 추적
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              문의 처리 상황을 실시간으로 확인할 수 있습니다.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* How it works */}
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-8">어떻게 작동하나요?</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <h3 className="font-semibold mb-2">문의 작성</h3>
            <p className="text-sm text-muted-foreground">
              간단한 폼으로 문의사항을 작성합니다
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 font-bold">2</span>
            </div>
            <h3 className="font-semibold mb-2">AI 분석</h3>
            <p className="text-sm text-muted-foreground">
              AI가 문의 내용을 분석하고 답변을 생성합니다
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-orange-600 font-bold">3</span>
            </div>
            <h3 className="font-semibold mb-2">즉시 응답</h3>
            <p className="text-sm text-muted-foreground">
              3초 이내에 맞춤형 답변을 받아보세요
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-purple-600 font-bold">4</span>
            </div>
            <h3 className="font-semibold mb-2">만족도 평가</h3>
            <p className="text-sm text-muted-foreground">
              답변에 만족하지 않으면 담당자와 연결됩니다
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center py-16 bg-blue-50 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">지금 바로 시작해보세요</h2>
        <p className="text-muted-foreground mb-6">
          무료로 문의 시스템을 체험해보실 수 있습니다
        </p>
        <Link href="/inquiry">
          <Button size="lg">
            무료 체험하기
          </Button>
        </Link>
      </div>
    </div>
  );
}
