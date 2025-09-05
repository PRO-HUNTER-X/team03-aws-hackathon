"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, AlertCircle, MessageCircle, User, Bot } from "lucide-react";
import Link from "next/link";
import { getInquiry, InquiryDetail } from "@/lib/api";

type InquiryStatus = "pending" | "processing" | "completed";

interface InquiryData {
  id: string;
  title: string;
  category: string;
  status: InquiryStatus;
  createdAt: string;
  estimatedResponseTime: number;
  timeline: TimelineEvent[];
}

interface TimelineEvent {
  id: string;
  type: "created" | "ai_response" | "escalated" | "human_response" | "completed";
  title: string;
  description: string;
  timestamp: string;
  icon: "message" | "bot" | "user" | "check";
}

export default function StatusPage() {
  const params = useParams();
  const inquiryId = params.id as string;

  const [inquiry, setInquiry] = useState<InquiryData | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInquiryData = async () => {
      try {
        const inquiryDetail = await getInquiry(inquiryId);
        
        // API 응답을 UI 형식으로 변환
        const inquiryData: InquiryData = {
          id: inquiryDetail.inquiry_id,
          title: inquiryDetail.title,
          category: inquiryDetail.category,
          status: mapApiStatusToUIStatus(inquiryDetail.status),
          createdAt: inquiryDetail.created_at,
          estimatedResponseTime: inquiryDetail.estimatedResponseTime || 120,
          timeline: generateTimelineFromStatus(inquiryDetail)
        };

        setInquiry(inquiryData);

        const createdTime = new Date(inquiryData.createdAt).getTime();
        const estimatedEndTime = createdTime + inquiryData.estimatedResponseTime * 60 * 1000;
        const remaining = Math.max(0, estimatedEndTime - Date.now());
        setTimeRemaining(Math.floor(remaining / 1000 / 60));

      } catch (error) {
        console.error('문의 조회 실패:', error);
        setInquiry(null);
      } finally {
        setLoading(false);
      }
    };

    fetchInquiryData();
  }, [inquiryId]);

  const mapApiStatusToUIStatus = (apiStatus: string): InquiryStatus => {
    switch (apiStatus) {
      case 'pending': return 'pending';
      case 'in_progress': 
      case 'escalated': return 'processing';
      case 'resolved': return 'completed';
      default: return 'pending';
    }
  };

  const generateTimelineFromStatus = (inquiry: InquiryDetail): TimelineEvent[] => {
    const timeline: TimelineEvent[] = [
      {
        id: '1',
        type: 'created',
        title: '문의 접수',
        description: '고객님의 문의가 접수되었습니다.',
        timestamp: inquiry.created_at,
        icon: 'message'
      }
    ];

    // AI 응답은 항상 있다고 가정
    timeline.push({
      id: '2',
      type: 'ai_response',
      title: 'AI 자동 응답',
      description: 'AI가 초기 답변을 제공했습니다.',
      timestamp: inquiry.created_at, // 실제로는 AI 응답 시간
      icon: 'bot'
    });

    if (inquiry.status === 'escalated') {
      timeline.push({
        id: '3',
        type: 'escalated',
        title: '담당자 연결',
        description: '전문 상담사에게 문의가 전달되었습니다.',
        timestamp: inquiry.updatedAt || inquiry.created_at,
        icon: 'user'
      });
    }

    if (inquiry.status === 'resolved') {
      timeline.push({
        id: '4',
        type: 'completed',
        title: '답변 완료',
        description: '담당자가 상세한 답변을 제공했습니다.',
        timestamp: inquiry.updatedAt || inquiry.created_at,
        icon: 'check'
      });
    }

    return timeline;
  };

  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 60000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const getStatusInfo = (status: InquiryStatus) => {
    switch (status) {
      case "pending":
        return {
          label: "대기중",
          color: "bg-yellow-100 text-yellow-800",
          icon: <Clock className="w-4 h-4" />,
        };
      case "processing":
        return {
          label: "처리중",
          color: "bg-blue-100 text-blue-800",
          icon: <AlertCircle className="w-4 h-4" />,
        };
      case "completed":
        return {
          label: "완료",
          color: "bg-green-100 text-green-800",
          icon: <CheckCircle className="w-4 h-4" />,
        };
    }
  };

  const getTimelineIcon = (iconType: string) => {
    switch (iconType) {
      case "message":
        return <MessageCircle className="w-4 h-4" />;
      case "bot":
        return <Bot className="w-4 h-4" />;
      case "user":
        return <User className="w-4 h-4" />;
      case "check":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatTimeRemaining = (minutes: number) => {
    if (minutes <= 0) return "곧 답변 예정";

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `약 ${hours}시간 ${mins}분 후 답변 예정`;
    }
    return `약 ${mins}분 후 답변 예정`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p>문의 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Card>
          <CardContent className="text-center py-16">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold mb-2">문의를 찾을 수 없습니다</h2>
            <p className="text-muted-foreground mb-4">요청하신 문의 ID({inquiryId})를 찾을 수 없습니다.</p>
            <Link href="/inquiry">
              <Button>새 문의 작성하기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo(inquiry.status);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">문의 상태 확인</h1>
        <p className="text-muted-foreground">문의 ID: {inquiry.id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>현재 상태</span>
                <Badge className={statusInfo.color}>
                  {statusInfo.icon}
                  <span className="ml-1">{statusInfo.label}</span>
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-2">{inquiry.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                카테고리:{" "}
                {inquiry.category === "technical"
                  ? "기술 문의"
                  : inquiry.category === "billing"
                  ? "결제 문의"
                  : "일반 문의"}
              </p>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">예상 응답 시간</span>
                </div>
                <p className="text-lg font-semibold text-blue-700">{formatTimeRemaining(timeRemaining)}</p>
                {timeRemaining > 0 && (
                  <div className="mt-2">
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                        style={{
                          width: `${Math.max(10, 100 - (timeRemaining / inquiry.estimatedResponseTime) * 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>처리 과정</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inquiry.timeline.map((event, index) => (
                  <div key={event.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        {getTimelineIcon(event.icon)}
                      </div>
                      {index < inquiry.timeline.length - 1 && <div className="w-px h-8 bg-gray-200 mt-2"></div>}
                    </div>
                    <div className="flex-1 pb-4">
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground mb-1">{event.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString("ko-KR")}
                      </p>
                    </div>
                  </div>
                ))}

                {inquiry.status !== "completed" && (
                  <div className="flex gap-4 opacity-50">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex-1 pb-4">
                      <h4 className="font-medium text-gray-500">답변 완료</h4>
                      <p className="text-sm text-gray-400">담당자가 상세한 답변을 제공할 예정입니다.</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>빠른 액션</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/inquiry">새 문의 작성</Link>
              </Button>
              <Button variant="outline" className="w-full">
                이메일로 알림 받기
              </Button>
              <Button variant="outline" className="w-full">
                문의 내용 수정
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>도움말</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>
                <strong>대기중:</strong> 문의가 접수되어 처리를 기다리고 있습니다.
              </p>
              <p>
                <strong>처리중:</strong> 담당자가 문의를 검토하고 있습니다.
              </p>
              <p>
                <strong>완료:</strong> 답변이 완료되었습니다.
              </p>
              <hr className="my-3" />
              <p className="text-muted-foreground">평균 응답 시간은 2-4시간입니다. 긴급한 문의는 우선 처리됩니다.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

