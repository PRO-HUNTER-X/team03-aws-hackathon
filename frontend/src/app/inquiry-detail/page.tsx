"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageSquare, Clock, User, Bot, RefreshCw } from "lucide-react";
import { getInquiryById, regenerateAIResponse, type Inquiry, getStatusLabel, getStatusColor } from "@/lib/api";

function InquiryDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      loadInquiry(id);
    }
  }, [searchParams]);

  const loadInquiry = async (id: string) => {
    try {
      setIsLoading(true);
      const data = await getInquiryById(id);
      setInquiry(data);
    } catch (error) {
      console.error("문의 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateAI = async () => {
    if (!inquiry) return;
    
    try {
      setIsRegenerating(true);
      const result = await regenerateAIResponse(inquiry.id);
      
      // AI 답변 재생성 후 문의를 다시 조회하여 최신 상태 반영
      const updatedInquiry = await getInquiryById(inquiry.id);
      if (updatedInquiry) {
        setInquiry(updatedInquiry);
      }
      
    } catch (error) {
      console.error("AI 답변 재생성 실패:", error);
      alert("AI 답변 재생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsRegenerating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">문의 내용을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="border-0 shadow-lg bg-white rounded-3xl max-w-md">
          <CardContent className="p-8 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">문의를 찾을 수 없습니다</h3>
            <p className="text-gray-600 mb-6">요청하신 문의가 존재하지 않거나 삭제되었습니다.</p>
            <Button onClick={() => router.push('/my-inquiries')} className="rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              목록으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-24 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/my-inquiries')}
            className="mb-4 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로 돌아가기
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{inquiry.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>작성일: {formatDate(inquiry.created_at)}</span>
                <Badge className={`${getStatusColor(inquiry.status)} border-0`}>
                  {getStatusLabel(inquiry.status)}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* 문의 내용 */}
        <Card className="border-0 shadow-lg bg-white rounded-3xl mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              문의 내용
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {inquiry.content}
            </div>
          </CardContent>
        </Card>

        {/* AI 답변 */}
        {inquiry.ai_response && (
          <Card className="border-0 shadow-lg bg-blue-50 rounded-3xl mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Bot className="w-5 h-5" />
                  AI 답변
                </CardTitle>
                <Button
                  onClick={handleRegenerateAI}
                  disabled={isRegenerating}
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-200 hover:bg-blue-100"
                >
                  {isRegenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      재생성 중...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      답변 재생성
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {inquiry.ai_response}
              </div>
              {inquiry.ai_responded_at && (
                <div className="mt-4 text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(inquiry.ai_responded_at)}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 상담사 답변 */}
        {inquiry.human_response && (
          <Card className="border-0 shadow-lg bg-green-50 rounded-3xl mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <User className="w-5 h-5" />
                상담사 답변
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {inquiry.human_response}
              </div>
              {inquiry.human_responded_at && (
                <div className="mt-4 text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(inquiry.human_responded_at)}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 상태별 안내 메시지 */}
        {inquiry.status === 'pending' && (
          <Card className="border-0 shadow-lg bg-yellow-50 rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <div>
                    <h3 className="font-semibold text-yellow-800">문의 접수 완료</h3>
                    <p className="text-yellow-700 text-sm">AI가 답변을 준비 중입니다. 잠시만 기다려주세요.</p>
                  </div>
                </div>
                <Button
                  onClick={handleRegenerateAI}
                  disabled={isRegenerating}
                  variant="outline"
                  size="sm"
                  className="text-yellow-600 border-yellow-200 hover:bg-yellow-100"
                >
                  {isRegenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      생성 중...
                    </>
                  ) : (
                    <>
                      <Bot className="w-4 h-4 mr-2" />
                      AI 답변 생성
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {inquiry.status === 'ai_responded' && !inquiry.human_response && (
          <Card className="border-0 shadow-lg bg-blue-50 rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Bot className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-800">AI 답변 완료</h3>
                  <p className="text-blue-700 text-sm">추가 문의가 있으시면 새로운 문의를 작성해주세요.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function InquiryDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">페이지를 불러오는 중...</p>
        </div>
      </div>
    }>
      <InquiryDetailContent />
    </Suspense>
  );
}
