"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LogIn } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("올바른 이메일 주소를 입력해주세요"),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      // TODO: 로그인 API 호출
      console.log("로그인 시도:", data);

      // 이메일 저장
      localStorage.setItem('customerEmail', data.email);
      
      // 성공 시 문의 목록 페이지로 이동
      router.push(`/my-inquiries?email=${data.email}`);
    } catch (error) {
      console.error("로그인 실패:", error);
      alert("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* 로그인 폼 */}
        <Card className="border-0 shadow-2xl bg-white rounded-3xl">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl text-center">로그인</CardTitle>
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
                      <FormLabel className="text-sm font-medium">이메일</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="이메일 주소를 입력해주세요"
                          className="h-11 rounded-xl"
                          {...field}
                        />
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
                      <FormLabel className="text-sm font-medium">비밀번호</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="비밀번호를 입력해주세요"
                          className="h-11 rounded-xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 로그인 버튼 */}
                <Button type="submit" size="lg" className="w-full rounded-xl" disabled={isLoading}>
                  {isLoading ? (
                    "로그인 중..."
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      로그인
                    </>
                  )}
                </Button>
              </form>
            </Form>

            {/* 추가 링크 */}
            <div className="mt-6 text-center space-y-3">
              <p className="text-sm text-gray-600">아직 문의를 작성하지 않으셨나요?</p>
              <Link href="/inquiry">
                <Button variant="outline" className="w-full rounded-xl">
                  새 문의 작성하기
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 도움말 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">문의 작성 시 입력한 이메일과 비밀번호로 로그인하세요</p>
        </div>
      </div>
    </div>
  );
}
