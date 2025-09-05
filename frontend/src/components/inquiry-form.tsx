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
import { createInquiry, generateAIResponse, escalateInquiry } from "@/lib/api";

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
      // 1. 문의 생성
      const inquiryResponse = await createInquiry({
        companyId: 'demo-company', // TODO: 실제 회사 ID로 교체
        customerEmail: 'customer@example.com', // TODO: 실제 고객 이메일로 교체
        category: data.category,
        title: data.title,
        content: data.content,
        urgency: data.urgency,
      });

      setInquiryId(inquiryResponse.inquiryId);

      // 2. AI 응답 생성
      const aiResponseData = await generateAIResponse({
        title: data.title,
        content: data.content,
        category: data.category
      });
      setAiResponse(aiResponseData.aiResponse);
    } catch (error) {
      console.error("문의 제출 실패:", error);
      alert(`문의 제출에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      setShowAiResponse(false);
    } finally {
      setIsSubmitting(false);
    }
  };



  const handleEscalation = async () => {
    if (!inquiryId) return;

    try {
      await escalateInquiry(inquiryId, '고객이 AI 응답에 만족하지 않아 에스컬레이션을 요청했습니다.');
      
      alert(
        `문의 ID: ${inquiryId}\n담당자에게 연결 요청이 전송되었습니다.\n상태 추적 페이지에서 진행 상황을 확인하실 수 있습니다.`
      );

      // 상태 추적 페이지로 이동
      router.push(`/status/${inquiryId}`);
    } catch (error) {
      console.error('에스컬레이션 실패:', error);
      alert(`에스컬레이션 요청에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
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

