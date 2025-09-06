"use client";

import { useState, useEffect } from "react";
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
  email: z.string().email("올바른 이메일 주소를 입력해주세요"),
  password: z.string().min(6, "비밀번호는 6자 이상 입력해주세요"),
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
      email: "",
      password: "",
      category: "",
      title: "",
      content: "",
      urgency: "",
    },
  });

  // 로그인 정보 자동 매핑
  useEffect(() => {
    const savedEmail = localStorage.getItem('customerEmail');
    const savedPassword = localStorage.getItem('customerPassword');
    
    if (savedEmail) {
      form.setValue('email', savedEmail);
    }
    if (savedPassword) {
      form.setValue('password', savedPassword);
    }
  }, [form]);

  const onSubmit = async (data: InquiryFormData) => {
    setIsSubmitting(true);
    setShowAiResponse(true);

    try {
      // 1. 문의 생성
      const inquiryResponse = await createInquiry({
        companyId: "hunters-company",
        customerEmail: data.email,
        customerPassword: data.password,
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
        category: data.category,
      });
      setAiResponse(aiResponseData.aiResponse);
    } catch (error) {
      console.error("문의 제출 실패:", error);
      alert(`문의 제출에 실패했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`);
      setShowAiResponse(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEscalation = async () => {
    if (!inquiryId) return;

    try {
      await escalateInquiry(inquiryId, "고객이 AI 응답에 만족하지 않아 에스컬레이션을 요청했습니다.");

      alert(
        `문의 ID: ${inquiryId}\n담당자에게 연결 요청이 전송되었습니다.\n상태 추적 페이지에서 진행 상황을 확인하실 수 있습니다.`
      );

      // 상태 추적 페이지로 이동
      router.push(`/status?id=${inquiryId}`);
    } catch (error) {
      console.error("에스컬레이션 실패:", error);
      alert(`에스컬레이션 요청에 실패했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`);
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
    <div
      className={`transition-all duration-500 ${
        showAiResponse ? "grid lg:grid-cols-2 gap-16 items-start" : "flex justify-center"
      }`}
    >
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">헌터스 고객지원 문의</CardTitle>
            {inquiryId && <p className="text-sm text-muted-foreground">문의 ID: {inquiryId}</p>}
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* 이메일 입력 */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">이메일 *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="이메일 주소를 입력해주세요" className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 비밀번호 입력 */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">비밀번호 *</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="비밀번호를 입력해주세요 (6자 이상)"
                          className="h-11"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 문의 유형 선택 */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">문의 유형 *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11">
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
                      <FormLabel className="text-sm font-medium">제목 *</FormLabel>
                      <FormControl>
                        <Input placeholder="문의 제목을 입력해주세요" className="h-11" {...field} />
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
                      <FormLabel className="text-sm font-medium">내용 *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="문의 내용을 자세히 입력해주세요"
                          className="min-h-[100px] resize-none"
                          {...field}
                        />
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
                      <FormLabel className="text-sm font-medium">긴급도 *</FormLabel>
                      <FormControl>
                        <div className="flex gap-6">
                          {[
                            { value: "low", label: "낮음", color: "text-slate-600" },
                            { value: "medium", label: "보통", color: "text-slate-600" },
                            { value: "high", label: "높음", color: "text-slate-600" },
                          ].map((option) => (
                            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                value={option.value}
                                checked={field.value === option.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                className="w-4 h-4"
                              />
                              <span className={`${option.color} text-sm font-medium`}>{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 제출 버튼 */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting || showAiResponse}
                >
                  {isSubmitting ? "제출 중..." : "문의 제출"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* AI 응답 표시 */}
      {showAiResponse && (
        <div className="mt-0">
          <AIResponse
            response={aiResponse}
            isLoading={isSubmitting}
            onEscalate={handleEscalation}
            onRating={handleRating}
          />

          {/* 새 문의 작성 버튼 & 상태 추적 링크 */}
          {aiResponse && !isSubmitting && (
            <div className="mt-6 flex gap-3 justify-center">
              <Button variant="outline" onClick={handleNewInquiry} size="default">
                다른 문의하기
              </Button>
              {inquiryId && (
                <Button
                  variant="default"
                  onClick={() => router.push(`/status?id=${inquiryId}`)}
                  size="default"
                >
                  진행상황 확인
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
