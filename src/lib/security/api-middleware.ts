/**
 * API安全中间件
 * 防范恶意请求和参数篡改
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateCreditCost, validateUserInput, logSecurityEvent } from './credit-validation';
import { IMAGE_GENERATION_CREDITS, IMAGE_ANALYSIS_CREDITS, CREDIT_CONFIG } from '@/config/credit-config';

// 请求频率限制存储（生产环境应使用Redis等）
const requestCounts = new Map<string, { count: number; resetTime: number }>();

/**
 * 检查请求频率限制
 */
export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60000; // 1分钟
  const maxRequests = 10; // 最多10次请求
  
  const current = requestCounts.get(ip);
  
  if (!current || now > current.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= maxRequests) {
    return false;
  }
  
  current.count++;
  return true;
}

/**
 * 验证请求头
 */
export function validateHeaders(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent');
  const contentType = request.headers.get('content-type');
  
  // 检查User-Agent
  if (!userAgent || userAgent.length < 10) {
    return false;
  }
  
  // 检查Content-Type（对于POST请求）
  if (request.method === 'POST' && !contentType?.includes('application/json')) {
    return false;
  }
  
  return true;
}

/**
 * 验证请求参数
 */
export function validateRequestParams(request: NextRequest): { isValid: boolean; error?: string } {
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams);
    
    // 检查每个参数
    for (const [key, value] of Object.entries(params)) {
      const validation = validateUserInput(value);
      if (!validation.isValid) {
        return {
          isValid: false,
          error: `参数 ${key}: ${validation.error}`
        };
      }
    }
    
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: '请求参数解析失败'
    };
  }
}

/**
 * 安全中间件
 */
export function withSecurity(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // 1. 获取客户端IP
      const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
      
      // 2. 检查请求频率
      if (!checkRateLimit(ip)) {
        logSecurityEvent('RATE_LIMIT_EXCEEDED', { ip }, undefined);
        return NextResponse.json(
          { success: false, error: '请求过于频繁，请稍后再试' },
          { status: 429 }
        );
      }
      
      // 3. 验证请求头
      if (!validateHeaders(request)) {
        logSecurityEvent('INVALID_HEADERS', { ip }, undefined);
        return NextResponse.json(
          { success: false, error: '无效的请求头' },
          { status: 400 }
        );
      }
      
      // 4. 验证请求参数
      const paramValidation = validateRequestParams(request);
      if (!paramValidation.isValid) {
        logSecurityEvent('INVALID_PARAMS', { 
          ip, 
          error: paramValidation.error 
        }, undefined);
        return NextResponse.json(
          { success: false, error: paramValidation.error },
          { status: 400 }
        );
      }
      
      // 5. 执行原始处理器
      return await handler(request);
      
    } catch (error) {
      logSecurityEvent('API_ERROR', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, undefined);
      
      return NextResponse.json(
        { success: false, error: '服务器内部错误' },
        { status: 500 }
      );
    }
  };
}

/**
 * 积分操作安全验证
 */
export function validateCreditOperation(
  request: NextRequest,
  operation: string,
  amount: number,
  userId: string,
  serviceType?: string
): { isValid: boolean; error?: string } {
  // 1. 验证积分成本
  const costValidation = validateCreditCost(amount);
  if (!costValidation.isValid) {
    logSecurityEvent('INVALID_CREDIT_COST', { 
      amount, 
      error: costValidation.error,
      userId 
    }, userId);
    return {
      isValid: false,
      error: costValidation.error
    };
  }
  
  // 2. 根据服务类型检查是否与硬编码配置一致
  if (operation === 'deduct') {
    let expectedAmount: number;
    
    // 根据服务类型确定期望的积分值
    if (serviceType === 'image_analysis') {
      expectedAmount = IMAGE_ANALYSIS_CREDITS;
    } else if (serviceType === 'image_generation') {
      expectedAmount = IMAGE_GENERATION_CREDITS;
    } else if (serviceType === 'content_generation' || serviceType === 'writing_generation') {
      expectedAmount = CREDIT_CONFIG.WRITING_GENERATION.COST;
    } else {
      // 默认检查图片生成积分（向后兼容）
      expectedAmount = IMAGE_GENERATION_CREDITS;
    }
    
    if (amount !== expectedAmount) {
      logSecurityEvent('CREDIT_COST_TAMPERING', { 
        expected: expectedAmount,
        received: amount,
        serviceType,
        userId 
      }, userId);
      return {
        isValid: false,
        error: '积分成本不匹配，可能存在篡改行为'
      };
    }
  }
  
  return { isValid: true };
}

/**
 * 记录积分操作
 */
export function logCreditOperation(
  operation: string,
  amount: number,
  userId: string,
  success: boolean,
  details?: any
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    operation,
    amount,
    userId,
    success,
    details
  };
  
  console.log('💰 积分操作:', logEntry);
  
  // 在实际应用中，这里应该写入审计日志
}
