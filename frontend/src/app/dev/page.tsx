"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Input } from "@/components/ui/input";
import { logger, LogEntry, LogLevel } from "@/lib/logger";
import { Trash2, Download, RefreshCw, Search, AlertCircle, Info, AlertTriangle, Bug } from "lucide-react";

export default function DevPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    loadLogs();
  }, []);

  const filterLogs = useCallback(() => {
    let filtered = logs;

    // 레벨 필터
    if (selectedLevel !== 'ALL') {
      filtered = filtered.filter(log => log.level === selectedLevel);
    }

    // 카테고리 필터
    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(log => log.category === selectedCategory);
    }

    // 검색어 필터
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.error?.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  }, [logs, selectedLevel, searchTerm, selectedCategory]);

  useEffect(() => {
    filterLogs();
  }, [filterLogs]);

  const loadLogs = () => {
    const allLogs = logger.getLogs();
    setLogs(allLogs.reverse()); // 최신 로그가 위에 오도록
  };

  const clearLogs = () => {
    logger.clearLogs();
    setLogs([]);
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getLevelIcon = (level: LogLevel) => {
    switch (level) {
      case LogLevel.ERROR:
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case LogLevel.WARN:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case LogLevel.DEBUG:
        return <Bug className="w-4 h-4 text-purple-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case LogLevel.ERROR:
        return 'bg-red-100 text-red-800';
      case LogLevel.WARN:
        return 'bg-yellow-100 text-yellow-800';
      case LogLevel.DEBUG:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const categories = ['ALL', ...Array.from(new Set(logs.map(log => log.category)))];
  const logCounts = {
    total: logs.length,
    error: logs.filter(log => log.level === LogLevel.ERROR).length,
    warn: logs.filter(log => log.level === LogLevel.WARN).length,
    info: logs.filter(log => log.level === LogLevel.INFO).length,
    debug: logs.filter(log => log.level === LogLevel.DEBUG).length,
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">개발자 도구</h1>
        <p className="text-muted-foreground">애플리케이션 로그 및 디버깅 정보</p>
      </div>

      <div className="space-y-6">
          {/* 통계 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{logCounts.total}</div>
                <div className="text-sm text-muted-foreground">전체 로그</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">{logCounts.error}</div>
                <div className="text-sm text-muted-foreground">에러</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">{logCounts.warn}</div>
                <div className="text-sm text-muted-foreground">경고</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{logCounts.info}</div>
                <div className="text-sm text-muted-foreground">정보</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">{logCounts.debug}</div>
                <div className="text-sm text-muted-foreground">디버그</div>
              </CardContent>
            </Card>
          </div>

          {/* 필터 및 액션 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>로그 필터</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={loadLogs}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    새로고침
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportLogs}>
                    <Download className="w-4 h-4 mr-2" />
                    내보내기
                  </Button>
                  <Button variant="destructive" size="sm" onClick={clearLogs}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    전체 삭제
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="로그 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value as LogLevel | 'ALL')}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="ALL">모든 레벨</option>
                  <option value={LogLevel.ERROR}>에러</option>
                  <option value={LogLevel.WARN}>경고</option>
                  <option value={LogLevel.INFO}>정보</option>
                  <option value={LogLevel.DEBUG}>디버그</option>
                </select>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'ALL' ? '모든 카테고리' : category}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* 로그 목록 */}
          <Card>
            <CardHeader>
              <CardTitle>로그 목록 ({filteredLogs.length}개)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    표시할 로그가 없습니다.
                  </div>
                ) : (
                  filteredLogs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getLevelIcon(log.level)}
                          <Badge className={getLevelColor(log.level)}>
                            {log.level}
                          </Badge>
                          <Badge variant="outline">{log.category}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString('ko-KR')}
                          </span>
                        </div>
                      </div>
                      <div className="font-medium">{log.message}</div>
                      {log.error && (
                        <div className="bg-red-50 border border-red-200 rounded p-3">
                          <div className="font-medium text-red-800">{log.error.name}: {log.error.message}</div>
                          {log.error.stack && (
                            <pre className="text-xs text-red-600 mt-2 overflow-x-auto">
                              {log.error.stack}
                            </pre>
                          )}
                        </div>
                      )}
                      {log.context && (
                        <details className="bg-gray-50 border rounded p-3">
                          <summary className="cursor-pointer font-medium">컨텍스트 정보</summary>
                          <pre className="text-xs mt-2 overflow-x-auto">
                            {JSON.stringify(log.context, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        
        {/* 네트워크 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>네트워크 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <strong>API Base URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}
              </div>
              <div>
                <strong>User Agent:</strong> {navigator.userAgent}
              </div>
              <div>
                <strong>Online Status:</strong> {navigator.onLine ? '온라인' : '오프라인'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 환경 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>환경 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <strong>NODE_ENV:</strong> {process.env.NODE_ENV}
              </div>
              <div>
                <strong>Next.js Version:</strong> {process.env.NEXT_PUBLIC_VERCEL_ENV || 'development'}
              </div>
              <div>
                <strong>Build Time:</strong> {new Date().toISOString()}
              </div>
              <div>
                <strong>Local Storage Available:</strong> {typeof Storage !== 'undefined' ? '예' : '아니오'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}