"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MessageSquare, Bot, User, Clock } from "lucide-react";
import { mockApi, type Inquiry, getStatusLabel, getStatusColor } from "@/lib/mock-data";

export default function InquiryDetailClient() {
  const params = useParams();

  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadInquiry(params.id as string);
    }
  }, [params.id]);

  const loadInquiry = async (id: string) => {
    try {
      setIsLoading(true);
      const data = await mockApi.getInquiry(id);
      if (data) {
        setInquiry(data);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error("문의 상세 로드 실패:", error);
      setNotFound(true);
    } finally {
      setIsLoading(false);
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

  const getTimelineItems = () => {
    if (!inquiry) return [];

    const items = [
      {
        type: 'created',
        title: '문의 접수',
        description: '고객님의 문의가 접수되었습니다',
        timestamp: inquiry.created_at,
        icon: MessageSquare,
        color: 'text-blue-600'
      }
    ];

    if (inquiry.ai_response) {
      items.push({
        type: 'ai_response',
        title: 'AI 답변 완료',
        description: 'AI가 답변을 생성했습니다',
        timestamp: inquiry.updated_at,
        icon: Bot,
        color: 'text-purple-600'
      });
    }

    if (inquiry.human_response) {
      items.push({
        type: 'human_response',
        title: '상담사 답변 완료',
        description: '전문 상담사가 답변을 작성했습니다',
        timestamp: inquiry.updated_at,
        icon: User,
        color: 'text-green-600'
      });
    }

    return items;
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

  if (notFound || !inquiry) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <Card className="border-0 shadow-lg bg-white rounded-3xl max-w-md w-full">
          <CardContent className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">문의를 찾을 수 없습니다</h3>
            <p className="text-gray-600 mb-6">요청하신 문의가 존재하지 않거나 접근 권한이 없습니다</p>
            <Link href="/my-inquiries">
              <Button size="lg" className="rounded-xl">
                <ArrowLeft className="w-4 h-4 mr-2" />
                문의 목록으로 돌아가기
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const timelineItems = getTimelineItems();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/my-inquiries">
              <Button variant="outline" size="sm" className="rounded-xl">
                <ArrowLeft className="w-4 h-4 mr-2" />
                목록으로
              </Button>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{inquiry.title}</h1>
                <Badge className={`${getStatusColor(inquiry.status)} border-0`}>
                  {getStatusLabel(inquiry.status)}
                </Badge>
              </div>
              <p className="text-gray-600">문의 ID: {inquiry.id}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 원본 문의 */}
            <Card className="border-0 shadow-lg bg-white rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  원본 문의
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-gray-800 whitespace-pre-wrap">{inquiry.content}</p>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  작성일: {formatDate(inquiry.created_at)}
                </div>
              </CardContent>
            </Card>

            {/* AI 답변 */}
            {inquiry.ai_response && (
              <Card className="border-0 shadow-lg bg-white rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-purple-600" />
                    AI 답변
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-purple-50 rounded-2xl p-4 border-l-4 border-purple-500">
                    <p className="text-gray-800 whitespace-pre-wrap">{inquiry.ai_response}</p>
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    답변 생성일: {formatDate(inquiry.updated_at)}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 상담사 답변 */}
            {inquiry.human_response && (
              <Card className="border-0 shadow-lg bg-white rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-green-600" />
                    상담사 답변
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-green-50 rounded-2xl p-4 border-l-4 border-green-500">
                    <p className="text-gray-800 whitespace-pre-wrap">{inquiry.human_response}</p>
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    답변 완료일: {formatDate(inquiry.updated_at)}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 추가 문의 버튼 */}
            {inquiry.status !== 'pending' && (
              <Card className="border-0 shadow-lg bg-white rounded-3xl">
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">추가 문의가 필요하신가요?</h3>
                  <p className="text-gray-600 mb-4">답변이 충분하지 않다면 새로운 문의를 작성해주세요</p>
                  <Link href="/inquiry">
                    <Button size="lg" className="rounded-xl">
                      새 문의 작성하기
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 진행 상태 타임라인 */}
            <Card className="border-0 shadow-lg bg-white rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  진행 상태
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timelineItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.type} className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center ${item.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{item.title}</p>
                          <p className="text-xs text-gray-500">{item.description}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(item.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* 문의 정보 */}
            <Card className="border-0 shadow-lg bg-white rounded-3xl">
              <CardHeader>
                <CardTitle>문의 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">문의 ID</span>
                  <p className="text-sm text-gray-900">{inquiry.id}</p>
                </div>
                <Separator />
                <div>
                  <span className="text-sm font-medium text-gray-700">작성일</span>
                  <p className="text-sm text-gray-900">{formatDate(inquiry.created_at)}</p>
                </div>
                <Separator />
                <div>
                  <span className="text-sm font-medium text-gray-700">최종 업데이트</span>
                  <p className="text-sm text-gray-900">{formatDate(inquiry.updated_at)}</p>
                </div>
                <Separator />
                <div>
                  <span className="text-sm font-medium text-gray-700">상태</span>
                  <div className="mt-1">
                    <Badge className={`${getStatusColor(inquiry.status)} border-0`}>
                      {getStatusLabel(inquiry.status)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}