"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Plus, Filter } from "lucide-react";
import { getMyInquiries, type Inquiry, getStatusLabel, getStatusColor } from "@/lib/api";

export default function MyInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadInquiries();
  }, []);

  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredInquiries(inquiries);
    } else {
      setFilteredInquiries(inquiries.filter(inquiry => inquiry.status === statusFilter));
    }
  }, [inquiries, statusFilter]);

  const loadInquiries = async () => {
    try {
      setIsLoading(true);
      const urlParams = new URLSearchParams(window.location.search);
      const email = urlParams.get('email') || localStorage.getItem('customerEmail');
      
      if (!email) {
        console.error('이메일이 없습니다. 로그인이 필요합니다.');
        return;
      }
      
      const data = await getMyInquiries(email);
      setInquiries(data);
    } catch (error) {
      console.error("문의 로드 실패:", error);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">문의 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-24 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">내 문의 목록</h1>
              <p className="text-gray-600">작성하신 문의 내역을 확인하고 답변을 확인하세요</p>
            </div>
            <Link href="/inquiry">
              <Button size="lg" className="rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                새 문의 작성
              </Button>
            </Link>
          </div>

          {/* 필터 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">상태별 필터:</span>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="pending">접수됨</SelectItem>
                <SelectItem value="ai_responded">AI 답변 완료</SelectItem>
                <SelectItem value="human_responded">상담사 답변 완료</SelectItem>
                <SelectItem value="resolved">해결됨</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 문의 목록 */}
        {filteredInquiries.length === 0 ? (
          <Card className="border-0 shadow-lg bg-white rounded-3xl">
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {statusFilter === "all" ? "문의 내역이 없습니다" : "해당 상태의 문의가 없습니다"}
              </h3>
              <p className="text-gray-600 mb-6">
                {statusFilter === "all" 
                  ? "첫 번째 문의를 작성해보세요" 
                  : "다른 상태의 문의를 확인해보세요"
                }
              </p>
              <Link href="/inquiry">
                <Button size="lg" className="rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  새 문의 작성하기
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredInquiries.map((inquiry) => {
              console.log('Inquiry ID:', inquiry.id, 'Full inquiry:', inquiry);
              return (
                <Card key={inquiry.id} className="border-0 shadow-lg bg-white rounded-3xl hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                            <Link href={`/inquiry-detail?id=${inquiry.id}`}>
                              {inquiry.title}
                            </Link>
                          </h3>
                          <Badge className={`${getStatusColor(inquiry.status)} border-0`}>
                            {getStatusLabel(inquiry.status)}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {inquiry.content}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>작성일: {formatDate(inquiry.created_at)}</span>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <Link href={`/inquiry-detail?id=${inquiry.id}`}>
                          <Button variant="outline" size="sm" className="rounded-xl">
                            상세보기
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* 통계 정보 */}
        {inquiries.length > 0 && (
          <Card className="mt-8 border-0 shadow-lg bg-white rounded-3xl">
            <CardHeader>
              <CardTitle className="text-lg">문의 현황</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{inquiries.length}</div>
                  <div className="text-sm text-gray-600">전체 문의</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {inquiries.filter(i => i.status === 'pending').length}
                  </div>
                  <div className="text-sm text-gray-600">접수됨</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {inquiries.filter(i => i.status === 'ai_responded').length}
                  </div>
                  <div className="text-sm text-gray-600">AI 답변</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {inquiries.filter(i => i.status === 'human_responded').length}
                  </div>
                  <div className="text-sm text-gray-600">상담사 답변</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}