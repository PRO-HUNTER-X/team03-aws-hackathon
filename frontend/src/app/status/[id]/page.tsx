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
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-6 py-20 max-w-4xl">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Clock className="w-12 h-12 animate-spin mx-auto mb-6 text-primary" />
              <p className="text-lg text-muted-foreground">문의 정보를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-6 py-20 max-w-4xl">
          <Card className="bg-card border-0 shadow-sm">
            <CardContent className="text-center py-20">
              <AlertCircle className="w-16 h-16 mx-auto mb-6 text-destructive" />
              <h2 className="text-2xl font-bold mb-4 text-foreground">문의를 찾을 수 없습니다</h2>
              <p className="text-muted-foreground mb-8 text-lg">요청하신 문의 ID({inquiryId})를 찾을 수 없습니다.</p>
              <Link href="/inquiry">
                <Button className="bg-primary hover:bg-secondary text-primary-foreground px-8 py-3 text-lg">새 문의 작성하기</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(inquiry.status);

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 text-foreground">문의 상태 확인</h1>
          <p className="text-muted-foreground text-lg">문의 ID: {inquiry.id}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-card border-0 shadow-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center justify-between text-xl">
                  <span className="text-foreground">현재 상태</span>
                  <Badge className={`${statusInfo.color} px-3 py-1 rounded-full font-medium`}>
                    {statusInfo.icon}
                    <span className="ml-2">{statusInfo.label}</span>
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold mb-3 text-lg text-foreground">{inquiry.title}</h3>
                <p className="text-muted-foreground mb-6">
                  카테고리:{" "}
                  {inquiry.category === "technical"
                    ? "기술 문의"
                    : inquiry.category === "billing"
                    ? "결제 문의"
                    : "일반 문의"}
                </p>

                <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-semibold text-foreground">예상 응답 시간</span>
                  </div>
                  <p className="text-xl font-bold text-primary mb-4">{formatTimeRemaining(timeRemaining)}</p>
                  {timeRemaining > 0 && (
                    <div className="mt-4">
                      <div className="w-full bg-primary/20 rounded-full h-3">
                        <div
                          className="bg-primary h-3 rounded-full transition-all duration-1000"
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

            <Card className="bg-card border-0 shadow-sm">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl text-foreground">처리 과정</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {inquiry.timeline.map((event, index) => (
                    <div key={event.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                          {getTimelineIcon(event.icon)}
                        </div>
                        {index < inquiry.timeline.length - 1 && <div className="w-px h-8 bg-border mt-3"></div>}
                      </div>
                      <div className="flex-1 pb-4">
                        <h4 className="font-semibold text-foreground mb-1">{event.title}</h4>
                        <p className="text-muted-foreground mb-2 leading-relaxed">{event.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.timestamp).toLocaleString("ko-KR")}
                        </p>
                      </div>
                    </div>
                  ))}

                  {inquiry.status !== "completed" && (
                    <div className="flex gap-4 opacity-40">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-muted-foreground">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="flex-1 pb-4">
                        <h4 className="font-semibold text-muted-foreground mb-1">답변 완료</h4>
                        <p className="text-muted-foreground leading-relaxed">담당자가 상세한 답변을 제공할 예정입니다.</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
        </div>

          <div className="space-y-8">
            <Card className="bg-card border-0 shadow-sm">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl text-foreground">빠른 액션</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all" asChild>
                  <Link href="/inquiry">새 문의 작성</Link>
                </Button>
                <Button variant="outline" className="w-full border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all">
                  이메일로 알림 받기
                </Button>
                <Button variant="outline" className="w-full border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all">
                  문의 내용 수정
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-0 shadow-sm">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl text-foreground">도움말</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 leading-relaxed">
                <div className="space-y-3">
                  <p className="text-foreground">
                    <span className="font-semibold text-primary">대기중:</span> 문의가 접수되어 처리를 기다리고 있습니다.
                  </p>
                  <p className="text-foreground">
                    <span className="font-semibold text-secondary">처리중:</span> 담당자가 문의를 검토하고 있습니다.
                  </p>
                  <p className="text-foreground">
                    <span className="font-semibold text-primary">완료:</span> 답변이 완료되었습니다.
                  </p>
                </div>
                <div className="border-t border-border pt-4 mt-4">
                  <p className="text-muted-foreground">평균 응답 시간은 2-4시간입니다. 긴급한 문의는 우선 처리됩니다.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

