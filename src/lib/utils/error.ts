/**
 * Error Handling Utilities
 * 
 * This file contains utilities for error handling and management.
 */

import type { AuthError } from '@/types/auth';
import type { CreditError } from '@/types/credits';

// Error types
export enum ErrorType {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  DATABASE = 'DATABASE',
  NETWORK = 'NETWORK',
  RATE_LIMIT = 'RATE_LIMIT',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL',
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// Custom error classes
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly severity: ErrorSeverity;
  public readonly code: string;
  public readonly details?: any;
  public readonly timestamp: Date;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    type: ErrorType = ErrorType.INTERNAL,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    code: string = 'UNKNOWN_ERROR',
    details?: any,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.code = code;
    this.details = details;
    this.timestamp = new Date();
    this.context = context;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string, code: string = 'AUTH_ERROR', details?: any, context?: Record<string, any>) {
    super(message, ErrorType.AUTHENTICATION, ErrorSeverity.HIGH, code, details, context);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string, code: string = 'AUTHZ_ERROR', details?: any, context?: Record<string, any>) {
    super(message, ErrorType.AUTHORIZATION, ErrorSeverity.HIGH, code, details, context);
    this.name = 'AuthorizationError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, code: string = 'VALIDATION_ERROR', details?: any, context?: Record<string, any>) {
    super(message, ErrorType.VALIDATION, ErrorSeverity.MEDIUM, code, details, context);
    this.name = 'ValidationError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, code: string = 'DATABASE_ERROR', details?: any, context?: Record<string, any>) {
    super(message, ErrorType.DATABASE, ErrorSeverity.HIGH, code, details, context);
    this.name = 'DatabaseError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string, code: string = 'NETWORK_ERROR', details?: any, context?: Record<string, any>) {
    super(message, ErrorType.NETWORK, ErrorSeverity.MEDIUM, code, details, context);
    this.name = 'NetworkError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string, code: string = 'RATE_LIMIT_ERROR', details?: any, context?: Record<string, any>) {
    super(message, ErrorType.RATE_LIMIT, ErrorSeverity.MEDIUM, code, details, context);
    this.name = 'RateLimitError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, code: string = 'NOT_FOUND_ERROR', details?: any, context?: Record<string, any>) {
    super(message, ErrorType.NOT_FOUND, ErrorSeverity.MEDIUM, code, details, context);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code: string = 'CONFLICT_ERROR', details?: any, context?: Record<string, any>) {
    super(message, ErrorType.CONFLICT, ErrorSeverity.MEDIUM, code, details, context);
    this.name = 'ConflictError';
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string, code: string = 'EXTERNAL_SERVICE_ERROR', details?: any, context?: Record<string, any>) {
    super(message, ErrorType.EXTERNAL, ErrorSeverity.HIGH, code, details, context);
    this.name = 'ExternalServiceError';
  }
}

// Error factory functions
export function createAuthenticationError(message: string, code?: string, details?: any, context?: Record<string, any>): AuthenticationError {
  return new AuthenticationError(message, code, details, context);
}

export function createAuthorizationError(message: string, code?: string, details?: any, context?: Record<string, any>): AuthorizationError {
  return new AuthorizationError(message, code, details, context);
}

export function createValidationError(message: string, code?: string, details?: any, context?: Record<string, any>): ValidationError {
  return new ValidationError(message, code, details, context);
}

export function createDatabaseError(message: string, code?: string, details?: any, context?: Record<string, any>): DatabaseError {
  return new DatabaseError(message, code, details, context);
}

export function createNetworkError(message: string, code?: string, details?: any, context?: Record<string, any>): NetworkError {
  return new NetworkError(message, code, details, context);
}

export function createRateLimitError(message: string, code?: string, details?: any, context?: Record<string, any>): RateLimitError {
  return new RateLimitError(message, code, details, context);
}

export function createNotFoundError(message: string, code?: string, details?: any, context?: Record<string, any>): NotFoundError {
  return new NotFoundError(message, code, details, context);
}

export function createConflictError(message: string, code?: string, details?: any, context?: Record<string, any>): ConflictError {
  return new ConflictError(message, code, details, context);
}

export function createExternalServiceError(message: string, code?: string, details?: any, context?: Record<string, any>): ExternalServiceError {
  return new ExternalServiceError(message, code, details, context);
}

// Error handling utilities
export function isAppError(error: any): error is AppError {
  return error instanceof AppError;
}

export function isAuthenticationError(error: any): error is AuthenticationError {
  return error instanceof AuthenticationError;
}

export function isAuthorizationError(error: any): error is AuthorizationError {
  return error instanceof AuthorizationError;
}

export function isValidationError(error: any): error is ValidationError {
  return error instanceof ValidationError;
}

export function isDatabaseError(error: any): error is DatabaseError {
  return error instanceof DatabaseError;
}

export function isNetworkError(error: any): error is NetworkError {
  return error instanceof NetworkError;
}

export function isRateLimitError(error: any): error is RateLimitError {
  return error instanceof RateLimitError;
}

export function isNotFoundError(error: any): error is NotFoundError {
  return error instanceof NotFoundError;
}

export function isConflictError(error: any): error is ConflictError {
  return error instanceof ConflictError;
}

export function isExternalServiceError(error: any): error is ExternalServiceError {
  return error instanceof ExternalServiceError;
}

// Error conversion utilities
export function convertToAppError(error: any, context?: Record<string, any>): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(
      error.message,
      ErrorType.INTERNAL,
      ErrorSeverity.MEDIUM,
      'UNKNOWN_ERROR',
      { originalError: error.name, stack: error.stack },
      context
    );
  }

  return new AppError(
    'Unknown error occurred',
    ErrorType.INTERNAL,
    ErrorSeverity.MEDIUM,
    'UNKNOWN_ERROR',
    { originalError: error },
    context
  );
}

// Error response utilities
export function createErrorResponse(error: AppError | {
  code: string;
  message: string;
  type: ErrorType;
  severity: ErrorSeverity;
  details?: any;
}): {
  success: false;
  error: {
    code: string;
    message: string;
    type: ErrorType;
    severity: ErrorSeverity;
    timestamp: string;
    details?: any;
  };
} {
  const timestamp = error instanceof AppError ? error.timestamp : new Date();
  
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      type: error.type,
      severity: error.severity,
      timestamp: timestamp.toISOString(),
      details: error.details,
    },
  };
}

export function createAuthErrorResponse(error: AuthenticationError): {
  success: false;
  error: AuthError;
} {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      details: error.details,
    },
  };
}

export function createCreditErrorResponse(error: AppError): {
  success: false;
  error: CreditError;
} {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      field: error.context?.field,
      details: error.details,
    },
  };
}

// Error recovery utilities
export function isRecoverableError(error: AppError): boolean {
  switch (error.type) {
    case ErrorType.NETWORK:
    case ErrorType.RATE_LIMIT:
    case ErrorType.EXTERNAL:
      return true;
    case ErrorType.AUTHENTICATION:
    case ErrorType.AUTHORIZATION:
    case ErrorType.VALIDATION:
    case ErrorType.DATABASE:
    case ErrorType.NOT_FOUND:
    case ErrorType.CONFLICT:
    case ErrorType.INTERNAL:
      return false;
    default:
      return false;
  }
}

export function getRetryDelay(error: AppError): number {
  switch (error.type) {
    case ErrorType.RATE_LIMIT:
      return 60000; // 1 minute
    case ErrorType.NETWORK:
      return 5000; // 5 seconds
    case ErrorType.EXTERNAL:
      return 10000; // 10 seconds
    default:
      return 0;
  }
}

export function shouldRetry(error: AppError, attempt: number, maxAttempts: number = 3): boolean {
  if (attempt >= maxAttempts) {
    return false;
  }

  if (!isRecoverableError(error)) {
    return false;
  }

  return true;
}

// Error context utilities
export function addErrorContext(error: AppError, context: Record<string, any>): AppError {
  return new AppError(
    error.message,
    error.type,
    error.severity,
    error.code,
    error.details,
    { ...error.context, ...context }
  );
}

export function getErrorContext(error: AppError): Record<string, any> {
  return error.context || {};
}

// Error serialization utilities
export function serializeError(error: AppError): string {
  return JSON.stringify({
    name: error.name,
    message: error.message,
    type: error.type,
    severity: error.severity,
    code: error.code,
    details: error.details,
    timestamp: error.timestamp.toISOString(),
    context: error.context,
    stack: error.stack,
  });
}

export function deserializeError(serialized: string): AppError {
  const data = JSON.parse(serialized);
  const error = new AppError(
    data.message,
    data.type,
    data.severity,
    data.code,
    data.details,
    data.context
  );
  error.timestamp = new Date(data.timestamp);
  return error;
}

// Error boundary utilities
export function createErrorBoundary(component: string, error: AppError): AppError {
  return addErrorContext(error, { component, boundary: true });
}

export function handleErrorBoundary(error: any, component: string): AppError {
  const appError = convertToAppError(error, { component, boundary: true });
  return createErrorBoundary(component, appError);
}

