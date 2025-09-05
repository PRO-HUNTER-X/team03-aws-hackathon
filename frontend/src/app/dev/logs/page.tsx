"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw, AlertCircle, Info, AlertTriangle } from "lucide-react";

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  requestId?: string;
  raw?: string;
}

interface LogsResponse {
  logs: LogEntry[];
  function: string;
  timeRange: string;
  count: number;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [rawLogs, setRawLogs] = useState("");
  const [selectedFunction, setSelectedFunction] = useState("ai-response");
  const [timeRange, setTimeRange] = useState(10);

  const fetchLogsFromAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/logs/${selectedFunction}?minutes=${timeRange}`
      );
      const result = await response.json();
      
      if (result.success) {
        setLogs(result.data.logs);
      } else {
        console.error('로그 조회 실패:', result.error);
      }
    } catch (error) {
      console.error('로그 조회 에러:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseLogs = () => {
    if (!rawLogs.trim()) return;
    
    const lines = rawLogs.split('\n');
    const parsedLogs: LogEntry[] = [];
    
    lines.forEach(line => {
      if (line.includes('[INFO]') || line.includes('[WARNING]') || line.includes('[ERROR]')) {
        const timestampMatch = line.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/);
        const levelMatch = line.match(/\[(INFO|WARNING|ERROR)\]/);
        const requestIdMatch = line.match(/([a-f0-9-]{36})/);
        
        if (timestampMatch && levelMatch) {
          const messageStart = line.indexOf(levelMatch[0]) + levelMatch[0].length;
          const message = line.substring(messageStart).trim();
          
          parsedLogs.push({
            timestamp: timestampMatch[1],
            level: levelMatch[1],
            message: message.replace(/^[a-f0-9-]{36}\s*/, ''),
            requestId: requestIdMatch?.[1]
          });
        }
      }
    });
    
    setLogs(parsedLogs);
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'ERROR':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          ERROR
        </Badge>;
      case 'WARNING':
        return <Badge variant="secondary" className="flex items-center gap-1 bg-yellow-100 text-yellow-800">
          <AlertTriangle className="w-3 h-3" />
          WARNING
        </Badge>;
      case 'INFO':
        return <Badge variant="outline" className="flex items-center gap-1">
          <Info className="w-3 h-3" />
          INFO
        </Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">개발 로그 뷰어</h1>
        <p className="text-muted-foreground">Lambda 함수의 CloudWatch 로그를 실시간으로 확인합니다</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>자동 로그 조회</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">함수 선택</label>
                  <select 
                    value={selectedFunction} 
                    onChange={(e) => setSelectedFunction(e.target.value)}
                    className="w-full mt-1 p-2 border rounded"
                  >
                    <option value="ai-response">AI 응답 생성기</option>
                    <option value="inquiry">문의 처리기</option>
                    <option value="health">헬스체크</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">시간 범위 (분)</label>
                  <select 
                    value={timeRange} 
                    onChange={(e) => setTimeRange(Number(e.target.value))}
                    className="w-full mt-1 p-2 border rounded"
                  >
                    <option value={5}>5분</option>
                    <option value={10}>10분</option>
                    <option value={30}>30분</option>
                    <option value={60}>1시간</option>
                  </select>
                </div>
              </div>
              <Button onClick={fetchLogsFromAPI} disabled={loading} className="w-full">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                자동 로그 가져오기
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>수동 로그 입력</span>
                <Button onClick={parseLogs} size="sm">
                  파싱하기
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="CloudWatch 로그를 여기에 붙여넣으세요..."
                value={rawLogs}
                onChange={(e) => setRawLogs(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>실시간 로그 ({logs.length}개)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {logs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                    <p>표시할 로그가 없습니다</p>
                    <p className="text-sm">왼쪽에 로그를 붙여넣고 파싱하기를 클릭하세요</p>
                  </div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        {getLevelBadge(log.level)}
                        <span className="text-xs text-muted-foreground font-mono">
                          {new Date(log.timestamp).toLocaleString('ko-KR')}
                        </span>
                      </div>
                      <p className="text-sm font-mono bg-gray-50 p-2 rounded">
                        {log.message}
                      </p>
                      {log.requestId && (
                        <p className="text-xs text-muted-foreground">
                          Request ID: {log.requestId}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>로그 분석 결과</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {logs.filter(log => log.level === 'ERROR').length}
                </div>
                <div className="text-sm text-red-600">에러</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {logs.filter(log => log.level === 'WARNING').length}
                </div>
                <div className="text-sm text-yellow-600">경고</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {logs.filter(log => log.level === 'INFO').length}
                </div>
                <div className="text-sm text-blue-600">정보</div>
              </div>
            </div>
            
            {logs.some(log => log.message.includes('model identifier is invalid')) && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">🚨 감지된 문제</h4>
                <p className="text-red-700 text-sm">
                  <strong>Bedrock 모델 ID 오류:</strong> 잘못된 모델 식별자가 사용되고 있습니다.
                  <br />
                  <strong>해결방법:</strong> 올바른 Bedrock 모델 ID로 수정 후 재배포가 필요합니다.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}