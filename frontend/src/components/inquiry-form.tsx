"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AIResponse } from "@/components/ai-response";

const inquirySchema = z.object({
  category: z.string().min(1, "문의 유형을 선택해주세요"),
  title: z.string().min(1, "제목을 입력해주세요").max(100, "제목은 100자 이내로 입력해주세요"),
  content: z.string().min(10, "내용을 10자 이상 입력해주세요").max(1000, "내용은 1000자 이내로 입력해주세요"),
  urgency: z.string().min(1, "긴급도를 선택해주세요"),
});

type InquiryFormData = z.infer<typeof inquirySchema>;

export function InquiryForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | undefined>(undefined);
  const [showAiResponse, setShowAiResponse] = useState(false);
  const [inquiryId, setInquiryId] = useState<string | undefined>(undefined);

  const form = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      category: "",
      title: "",
      content: "",
      urgency: "",
    },
  });

  const onSubmit = async (data: InquiryFormData) => {
    setIsSubmitting(true);
    setShowAiResponse(true);

    try {
      // TODO: 실제 API 호출로 교체
      console.log("문의 제출:", data);

      // 임시 문의 ID 생성
      const tempId = `INQ-${Date.now()}`;
      setInquiryId(tempId);

      // AI 응답 시뮬레이션 (3초 대기)
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // 임시 AI 응답 생성
      const mockResponse = generateMockAIResponse(data);
      setAiResponse(mockResponse);
    } catch (error) {
      console.error("문의 제출 실패:", error);
      alert("문의 제출에 실패했습니다. 다시 시도해주세요.");
      setShowAiResponse(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateMockAIResponse = (data: InquiryFormData): string => {
    const responses = {
      technical: `## 기술 문의 답변\n\n**${data.title}**에 대한 답변을 드립니다.\n\n### 해결 방법\n1. 먼저 브라우저 캐시를 삭제해보세요\n2. 다른 브라우저에서 시도해보세요\n3. 네트워크 연결을 확인해주세요\n\n### 추가 도움\n위 방법으로 해결되지 않으면 **사람과 연결하기**를 클릭해주세요.`,
      billing: `## 결제 문의 답변\n\n**${data.title}**에 대해 안내드립니다.\n\n### 결제 정보\n- 월 구독료: 29,000원\n- 결제일: 매월 가입일 기준\n- 결제 방법: 신용카드, 계좌이체\n\n### 환불 정책\n7일 이내 100% 환불 가능합니다.\n\n더 자세한 내용은 담당자와 상담하시기 바랍니다.`,
      general: `## 일반 문의 답변\n\n**${data.title}**에 대해 답변드립니다.\n\n### 서비스 안내\n저희 CS 챗봇 플랫폼은 다음과 같은 기능을 제공합니다:\n\n- ✅ 24시간 AI 자동 응답\n- ✅ 실시간 상담 연결\n- ✅ 문의 이력 관리\n- ✅ 다양한 채널 지원\n\n추가 궁금한 점이 있으시면 언제든 문의해주세요!`,
      other: `## 기타 문의 답변\n\n**${data.title}**에 대해 확인해보겠습니다.\n\n현재 제공해드린 정보로는 정확한 답변이 어려울 수 있습니다.\n\n### 권장사항\n더 정확한 답변을 위해 **사람과 연결하기**를 통해\n담당자와 직접 상담받으시기를 권장드립니다.\n\n평균 응답시간은 2-4시간입니다.`,
    };

    return responses[data.category as keyof typeof responses] || responses.other;
  };

  const handleEscalation = () => {
    // TODO: 에스컬레이션 API 호출
    alert(
      `문의 ID: ${inquiryId}\n담당자에게 연결 요청이 전송되었습니다.\n상태 추적 페이지에서 진행 상황을 확인하실 수 있습니다.`
    );

    // 상태 추적 페이지로 이동
    if (inquiryId) {
      router.push(`/status/${inquiryId}`);
    }
  };

  const handleRating = (rating: number) => {
    // TODO: 평점 저장 API 호출
    console.log("평점:", rating, "문의 ID:", inquiryId);
  };

  const handleNewInquiry = () => {
    setShowAiResponse(false);
    setAiResponse(undefined);
    setInquiryId(undefined);
    form.reset();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>새 문의 작성</CardTitle>
          {inquiryId && <p className="text-sm text-muted-foreground">문의 ID: {inquiryId}</p>}
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* 문의 유형 선택 */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>문의 유형 *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="문의 유형을 선택해주세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="technical">기술 문의</SelectItem>
                        <SelectItem value="billing">결제 문의</SelectItem>
                        <SelectItem value="general">일반 문의</SelectItem>
                        <SelectItem value="other">기타</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 제목 입력 */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>제목 *</FormLabel>
                    <FormControl>
                      <Input placeholder="문의 제목을 입력해주세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 내용 입력 */}
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>내용 *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="문의 내용을 자세히 입력해주세요" className="min-h-[120px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 긴급도 선택 */}
              <FormField
                control={form.control}
                name="urgency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>긴급도 *</FormLabel>
                    <FormControl>
                      <div className="flex gap-4">
                        {[
                          { value: "low", label: "낮음", color: "text-green-600" },
                          { value: "medium", label: "보통", color: "text-yellow-600" },
                          { value: "high", label: "높음", color: "text-red-600" },
                        ].map((option) => (
                          <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value={option.value}
                              checked={field.value === option.value}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="w-4 h-4"
                            />
                            <span className={option.color}>{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 제출 버튼 */}
              <Button type="submit" className="w-full" disabled={isSubmitting || showAiResponse}>
                {isSubmitting ? "제출 중..." : "문의 제출"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* AI 응답 표시 */}
      {showAiResponse && (
        <AIResponse
          response={aiResponse}
          isLoading={isSubmitting}
          onEscalate={handleEscalation}
          onRating={handleRating}
        />
      )}

      {/* 새 문의 작성 버튼 & 상태 추적 링크 */}
      {aiResponse && !isSubmitting && (
        <div className="mt-6 flex gap-4 justify-center">
          <Button variant="outline" onClick={handleNewInquiry}>
            새 문의 작성하기
          </Button>
          {inquiryId && (
            <Button variant="default" onClick={() => router.push(`/status/${inquiryId}`)}>
              상태 추적하기
            </Button>
          )}
        </div>
      )}
    </>
  );
}
