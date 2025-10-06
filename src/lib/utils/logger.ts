/**
 * Logging Utilities
 * 
 * This file contains utilities for logging and monitoring.
 */

import { AppError, ErrorSeverity } from './error';

// Log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
}

// Log categories
export enum LogCategory {
  AUTH = 'AUTH',
  CREDITS = 'CREDITS',
  DATABASE = 'DATABASE',
  API = 'API',
  SECURITY = 'SECURITY',
  PERFORMANCE = 'PERFORMANCE',
  BUSINESS = 'BUSINESS',
  SYSTEM = 'SYSTEM',
}

// Log entry interface
export interface LogEntry {
  level: LogLevel;
  category: LogCategory;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
  error?: AppError;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  duration?: number;
  metadata?: Record<string, any>;
}

// Logger configuration
export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  enableRemote: boolean;
  filePath?: string;
  remoteEndpoint?: string;
  maxFileSize?: number;
  maxFiles?: number;
  enableColors: boolean;
  enableTimestamps: boolean;
  enableStackTraces: boolean;
}

// Default logger configuration
const DEFAULT_CONFIG: LoggerConfig = {
  level: LogLevel.INFO,
  enableConsole: true,
  enableFile: false,
  enableRemote: false,
  enableColors: true,
  enableTimestamps: true,
  enableStackTraces: true,
};

// Logger class
export class Logger {
  private config: LoggerConfig;
  private context: Record<string, any> = {};

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Set logger context
   */
  setContext(context: Record<string, any>): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Clear logger context
   */
  clearContext(): void {
    this.context = {};
  }

  /**
   * Add context to logger
   */
  addContext(key: string, value: any): void {
    this.context[key] = value;
  }

  /**
   * Remove context from logger
   */
  removeContext(key: string): void {
    delete this.context[key];
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, LogCategory.SYSTEM, message, context);
  }

  /**
   * Log info message
   */
  info(message: string, category: LogCategory = LogCategory.SYSTEM, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, category, message, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, category: LogCategory = LogCategory.SYSTEM, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, category, message, context);
  }

  /**
   * Log error message
   */
  error(message: string, error?: AppError, category: LogCategory = LogCategory.SYSTEM, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, category, message, { ...context, error });
  }

  /**
   * Log fatal message
   */
  fatal(message: string, error?: AppError, category: LogCategory = LogCategory.SYSTEM, context?: Record<string, any>): void {
    this.log(LogLevel.FATAL, category, message, { ...context, error });
  }

  /**
   * Log authentication event
   */
  auth(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, LogCategory.AUTH, message, context);
  }

  /**
   * Log credit event
   */
  credits(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, LogCategory.CREDITS, message, context);
  }

  /**
   * Log database event
   */
  database(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, LogCategory.DATABASE, message, context);
  }

  /**
   * Log API event
   */
  api(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, LogCategory.API, message, context);
  }

  /**
   * Log security event
   */
  security(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, LogCategory.SECURITY, message, context);
  }

  /**
   * Log performance event
   */
  performance(message: string, duration: number, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, LogCategory.PERFORMANCE, message, { ...context, duration });
  }

  /**
   * Log business event
   */
  business(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, LogCategory.BUSINESS, message, context);
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, category: LogCategory, message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      level,
      category,
      message,
      timestamp: new Date(),
      context: { ...this.context, ...context },
    };

    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    if (this.config.enableFile) {
      this.logToFile(entry);
    }

    if (this.config.enableRemote) {
      this.logToRemote(entry);
    }
  }

  /**
   * Check if should log based on level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * Log to console
   */
  private logToConsole(entry: LogEntry): void {
    const timestamp = this.config.enableTimestamps ? `[${entry.timestamp.toISOString()}]` : '';
    const level = this.config.enableColors ? this.colorizeLevel(entry.level) : entry.level;
    const category = `[${entry.category}]`;
    const message = entry.message;
    const context = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
    const error = entry.error ? `\n${this.formatError(entry.error)}` : '';

    console.log(`${timestamp} ${level} ${category} ${message}${context}${error}`);
  }

  /**
   * Log to file
   */
  private logToFile(entry: LogEntry): void {
    // File logging would be implemented here
    // For now, we'll just log to console
    console.log(`[FILE] ${JSON.stringify(entry)}`);
  }

  /**
   * Log to remote service
   */
  private logToRemote(entry: LogEntry): void {
    // Remote logging would be implemented here
    // For now, we'll just log to console
    console.log(`[REMOTE] ${JSON.stringify(entry)}`);
  }

  /**
   * Colorize log level
   */
  private colorizeLevel(level: LogLevel): string {
    const colors = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m',  // Green
      [LogLevel.WARN]: '\x1b[33m',  // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
      [LogLevel.FATAL]: '\x1b[35m', // Magenta
    };
    const reset = '\x1b[0m';
    return `${colors[level]}${level}${reset}`;
  }

  /**
   * Format error for logging
   */
  private formatError(error: AppError): string {
    let formatted = `Error: ${error.message}\n`;
    formatted += `Type: ${error.type}\n`;
    formatted += `Severity: ${error.severity}\n`;
    formatted += `Code: ${error.code}\n`;
    
    if (error.details) {
      formatted += `Details: ${JSON.stringify(error.details, null, 2)}\n`;
    }
    
    if (error.context) {
      formatted += `Context: ${JSON.stringify(error.context, null, 2)}\n`;
    }
    
    if (this.config.enableStackTraces && error.stack) {
      formatted += `Stack: ${error.stack}\n`;
    }
    
    return formatted;
  }
}

// Global logger instance
export const logger = new Logger();

// Logger factory functions
export function createLogger(config: Partial<LoggerConfig> = {}): Logger {
  return new Logger(config);
}

export function createAuthLogger(): Logger {
  return new Logger({
    level: LogLevel.INFO,
    enableConsole: true,
    enableFile: true,
    enableRemote: false,
  });
}

export function createCreditsLogger(): Logger {
  return new Logger({
    level: LogLevel.INFO,
    enableConsole: true,
    enableFile: true,
    enableRemote: false,
  });
}

export function createApiLogger(): Logger {
  return new Logger({
    level: LogLevel.INFO,
    enableConsole: true,
    enableFile: true,
    enableRemote: true,
  });
}

export function createSecurityLogger(): Logger {
  return new Logger({
    level: LogLevel.WARN,
    enableConsole: true,
    enableFile: true,
    enableRemote: true,
  });
}

// Logging middleware
export function createLoggingMiddleware(logger: Logger) {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    logger.setContext({
      requestId,
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    });

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;
      
      if (statusCode >= 400) {
        logger.error(`Request failed with status ${statusCode}`, undefined, LogCategory.API, {
          statusCode,
          duration,
        });
      } else {
        logger.api(`Request completed`, {
          statusCode,
          duration,
        });
      }
    });

    next();
  };
}

// Performance monitoring
export class PerformanceMonitor {
  private logger: Logger;
  private timers: Map<string, number> = new Map();

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Start timing an operation
   */
  startTimer(operation: string): void {
    this.timers.set(operation, Date.now());
  }

  /**
   * End timing an operation
   */
  endTimer(operation: string, context?: Record<string, any>): void {
    const startTime = this.timers.get(operation);
    if (startTime) {
      const duration = Date.now() - startTime;
      this.logger.performance(`Operation '${operation}' completed`, duration, context);
      this.timers.delete(operation);
    }
  }

  /**
   * Time an operation
   */
  async timeOperation<T>(operation: string, fn: () => Promise<T>, context?: Record<string, any>): Promise<T> {
    this.startTimer(operation);
    try {
      const result = await fn();
      this.endTimer(operation, context);
      return result;
    } catch (error) {
      this.endTimer(operation, { ...context, error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }
}

// Business metrics
export class BusinessMetrics {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Log user registration
   */
  logUserRegistration(userId: string, method: string): void {
    this.logger.business('User registered', {
      userId,
      method,
      event: 'user_registration',
    });
  }

  /**
   * Log user login
   */
  logUserLogin(userId: string, method: string): void {
    this.logger.business('User logged in', {
      userId,
      method,
      event: 'user_login',
    });
  }

  /**
   * Log credit transaction
   */
  logCreditTransaction(userId: string, amount: number, type: string, description: string): void {
    this.logger.business('Credit transaction', {
      userId,
      amount,
      type,
      description,
      event: 'credit_transaction',
    });
  }

  /**
   * Log credit recharge
   */
  logCreditRecharge(userId: string, amount: number, method: string): void {
    this.logger.business('Credit recharge', {
      userId,
      amount,
      method,
      event: 'credit_recharge',
    });
  }
}

