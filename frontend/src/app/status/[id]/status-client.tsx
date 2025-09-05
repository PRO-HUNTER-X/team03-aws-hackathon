"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Clock, CheckCircle, AlertCircle, MessageCircle, User, Bot } from "lucide-react";
// import Link from "next/link";
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

export default function StatusPageClient() {
  const params = useParams();
  const inquiryId = params.id as string;

  const [inquiry, setInquiry] = useState<InquiryData | null>(null);
  // const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInquiryData = async () => {
      try {
        const inquiryDetail = await getInquiry(inquiryId);
        
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

        // const createdTime = new Date(inquiryData.createdAt).getTime();
        // const estimatedEndTime = createdTime + inquiryData.estimatedResponseTime * 60 * 1000;
        // const remaining = Math.max(0, estimatedEndTime - Date.now());
        // setTimeRemaining(Math.floor(remaining / 1000 / 60));

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

    timeline.push({
      id: '2',
      type: 'ai_response',
      title: 'AI 자동 응답',
      description: 'AI가 초기 답변을 제공했습니다.',
      timestamp: inquiry.created_at,
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!inquiry) {
    return <div>Not Found</div>;
  }

  return <div>Status: {inquiry.status}</div>;
}