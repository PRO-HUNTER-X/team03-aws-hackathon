"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Search, MessageSquare, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { getInquiryById, type Inquiry, getStatusLabel, getStatusColor } from "@/lib/api";

const statusSchema = z.object({
  inquiryId: z.string().min(1, "문의 ID를 입력해주세요"),
});

type StatusFormData = z.infer<typeof statusSchema>;

export default function StatusPage() {
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<StatusFormData>({
    resolver: zodResolver(statusSchema),
    defaultValues: {
      inquiryId: "",
    },
  });

  const onSubmit = async (data: StatusFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getInquiryById(data.inquiryId);
      setInquiry(result);
    } catch (error) {
      console.error("문의 조회 실패:", error);
      setError("문의를 찾을 수 없습니다. 문의 ID를 확인해주세요.");
      setInquiry(null);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'ai_responded':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'human_responded':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-24 p-6">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">진행사항 확인</h1>
          <p className="text-gray-600">문의 ID를 입력하여 처리 현황을 확인하세요</p>
        </div>

        {/* 검색 폼 */}
        <Card className="border-0 shadow-lg bg-white rounded-3xl mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="w-5 h-5" />
              문의 조회
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="inquiryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>문의 ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="예: INQ_20240906_001"
                          {...field}
                          className="rounded-xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      조회 중...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      조회하기
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* 에러 메시지 */}
        {error && (
          <Card className="border-0 shadow-lg bg-red-50 rounded-3xl mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 문의 정보 */}
        {inquiry && (
          <Card className="border-0 shadow-lg bg-white rounded-3xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">문의 정보</CardTitle>
                <Badge className={`${getStatusColor(inquiry.status)} border-0`}>
                  {getStatusLabel(inquiry.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 기본 정보 */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">제목</h3>
                  <p className="text-gray-700">{inquiry.title}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">내용</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{inquiry.content}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">작성일</h3>
                    <p className="text-gray-600 text-sm">{formatDate(inquiry.created_at)}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">문의 ID</h3>
                    <p className="text-gray-600 text-sm font-mono">{inquiry.id}</p>
                  </div>
                </div>
              </div>

              {/* 진행 상태 */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  {getStatusIcon(inquiry.status)}
                  현재 상태
                </h3>
                <div className="space-y-3">
                  <div className={`flex items-center gap-3 p-3 rounded-xl ${
                    inquiry.status === 'pending' ? 'bg-yellow-50' : 'bg-gray-50'
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${
                      inquiry.status === 'pending' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <span className="text-sm">문의 접수됨</span>
                  </div>
                  <div className={`flex items-center gap-3 p-3 rounded-xl ${
                    ['ai_responded', 'human_responded', 'resolved'].includes(inquiry.status) ? 'bg-blue-50' : 'bg-gray-50'
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${
                      ['ai_responded', 'human_responded', 'resolved'].includes(inquiry.status) ? 'bg-blue-500' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-sm">AI 답변 생성됨</span>
                  </div>
                  <div className={`flex items-center gap-3 p-3 rounded-xl ${
                    ['human_responded', 'resolved'].includes(inquiry.status) ? 'bg-green-50' : 'bg-gray-50'
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${
                      ['human_responded', 'resolved'].includes(inquiry.status) ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-sm">상담사 답변 완료</span>
                  </div>
                </div>
              </div>

              {/* 상세보기 버튼 */}
              <div className="border-t pt-6">
                <Button
                  onClick={() => router.push(`/inquiry-detail?id=${inquiry.id}`)}
                  className="w-full rounded-xl"
                  variant="outline"
                >
                  상세 답변 보기
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 도움말 */}
        <Card className="mt-8 border-0 shadow-lg bg-blue-50 rounded-3xl">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900 mb-2">💡 도움말</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 문의 ID는 문의 작성 완료 시 제공됩니다</li>
              <li>• 문의 ID를 분실하신 경우 '내 문의 보기'를 이용해주세요</li>
              <li>• 처리 시간은 문의 유형에 따라 다를 수 있습니다</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
