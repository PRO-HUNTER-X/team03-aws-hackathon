export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  category: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  context?: Record<string, any>;
}

export interface LoggerConfig {
  maxLogs: number;
  enableConsole: boolean;
}

export class Logger {
  private config: LoggerConfig;
  private readonly STORAGE_KEY = 'app_logs';

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      maxLogs: 1000,
      enableConsole: true,
      ...config
    };
  }

  log(level: LogLevel, message: string, error?: Error, context?: Record<string, any>, category = 'general'): void {
    const logEntry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level,
      message,
      category,
      context
    };

    if (error) {
      logEntry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }

    this.saveLog(logEntry);

    if (this.config.enableConsole) {
      this.logToConsole(logEntry);
    }
  }

  info(message: string, context?: Record<string, any>, category?: string): void {
    this.log(LogLevel.INFO, message, undefined, context, category);
  }

  warn(message: string, context?: Record<string, any>, category?: string): void {
    this.log(LogLevel.WARN, message, undefined, context, category);
  }

  error(message: string, error?: Error, context?: Record<string, any>, category?: string): void {
    this.log(LogLevel.ERROR, message, error, context, category);
  }

  debug(message: string, context?: Record<string, any>, category?: string): void {
    this.log(LogLevel.DEBUG, message, undefined, context, category);
  }

  getLogs(level?: LogLevel): LogEntry[] {
    const logs = this.getStoredLogs();
    if (level) {
      return logs.filter(log => log.level === level);
    }
    return logs;
  }

  clearLogs(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private saveLog(logEntry: LogEntry): void {
    const logs = this.getStoredLogs();
    logs.push(logEntry);

    // 최대 로그 개수 제한
    if (logs.length > this.config.maxLogs) {
      logs.splice(0, logs.length - this.config.maxLogs);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
  }

  private getStoredLogs(): LogEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private logToConsole(logEntry: LogEntry): void {
    const { level, message, error, context } = logEntry;
    const consoleMessage = `[${level}] ${message}`;

    switch (level) {
      case LogLevel.ERROR:
        console.error(consoleMessage, error, context);
        break;
      case LogLevel.WARN:
        console.warn(consoleMessage, context);
        break;
      case LogLevel.DEBUG:
        console.debug(consoleMessage, context);
        break;
      default:
        console.log(consoleMessage, context);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// 전역 로거 인스턴스
export const logger = new Logger();