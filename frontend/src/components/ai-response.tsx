"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Star, User, Bot } from "lucide-react";

interface AIResponseProps {
  response?: string;
  isLoading?: boolean;
  onEscalate?: () => void;
  onRating?: (rating: number) => void;
}

export function AIResponse({ response, isLoading = false, onEscalate, onRating }: AIResponseProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [showRating, setShowRating] = useState(false);

  // 타이핑 애니메이션 효과
  useEffect(() => {
    if (response && !isLoading) {
      setIsTyping(true);
      setDisplayedText("");

      let index = 0;
      const timer = setInterval(() => {
        if (index < response.length) {
          setDisplayedText(response.slice(0, index + 1));
          index++;
        } else {
          setIsTyping(false);
          setShowRating(true);
          clearInterval(timer);
        }
      }, 30); // 30ms마다 한 글자씩

      return () => clearInterval(timer);
    }
  }, [response, isLoading]);

  const handleRating = (selectedRating: number) => {
    setRating(selectedRating);
    onRating?.(selectedRating);
  };

  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            AI 답변 생성 중...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <div className="flex gap-1">
                <div
                  className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground">AI가 답변을 생성하고 있습니다...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!response) return null;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-600" />
          AI 답변
          {isTyping && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI 응답 텍스트 (마크다운 지원) */}
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => <h1 className="text-xl font-bold mb-2">{children}</h1>,
              h2: ({ children }) => <h2 className="text-lg font-semibold mb-2">{children}</h2>,
              h3: ({ children }) => <h3 className="text-base font-medium mb-1">{children}</h3>,
              p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
              li: ({ children }) => <li className="ml-2">{children}</li>,
              code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">{children}</code>,
              pre: ({ children }) => (
                <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto text-sm">{children}</pre>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-gray-300 pl-4 italic">{children}</blockquote>
              ),
            }}
          >
            {displayedText}
          </ReactMarkdown>
          {isTyping && <span className="inline-block w-2 h-5 bg-blue-600 animate-pulse ml-1"></span>}
        </div>

        {/* 만족도 평가 (1-5점 별점) */}
        {showRating && !isTyping && (
          <div className="border-t pt-4">
            <div className="space-y-3">
              <p className="text-sm font-medium">이 답변이 도움이 되었나요?</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        rating && star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300 hover:text-yellow-400"
                      }`}
                    />
                  </button>
                ))}
                {rating && <span className="ml-2 text-sm text-muted-foreground">{rating}점 / 5점</span>}
              </div>
              {rating && rating <= 3 && (
                <p className="text-sm text-muted-foreground">
                  답변이 만족스럽지 않으시다면 담당자와 직접 상담하실 수 있습니다.
                </p>
              )}
            </div>
          </div>
        )}

        {/* "사람과 연결" 에스컬레이션 버튼 */}
        {showRating && !isTyping && (
          <div className="border-t pt-4">
            <Button variant="outline" onClick={onEscalate} className="w-full flex items-center gap-2">
              <User className="w-4 h-4" />
              사람과 연결하기
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              담당자가 직접 답변을 드립니다. (평균 응답시간: 2-4시간)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
