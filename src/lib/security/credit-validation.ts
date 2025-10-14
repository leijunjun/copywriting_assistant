/**
 * 积分安全验证工具
 * 防范恶意数值篡改和参数注入
 */

import { CREDIT_CONFIG, CREDIT_VALIDATION } from '@/config/credit-config';

export interface CreditValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedValue?: number;
}

/**
 * 验证积分成本是否合法
 */
export function validateCreditCost(cost: any): CreditValidationResult {
  // 1. 类型检查
  if (typeof cost !== 'number' && typeof cost !== 'string') {
    return {
      isValid: false,
      error: '积分成本必须是数字类型'
    };
  }

  // 2. 转换为数字
  const numericCost = typeof cost === 'string' ? parseFloat(cost) : cost;
  
  // 3. 检查是否为有效数字
  if (isNaN(numericCost) || !isFinite(numericCost)) {
    return {
      isValid: false,
      error: '积分成本必须是有效数字'
    };
  }

  // 4. 检查是否为整数
  if (!Number.isInteger(numericCost)) {
    return {
      isValid: false,
      error: '积分成本必须是整数'
    };
  }

  // 5. 范围检查
  if (numericCost < CREDIT_CONFIG.IMAGE_GENERATION.MIN_COST) {
    return {
      isValid: false,
      error: `积分成本不能小于 ${CREDIT_CONFIG.IMAGE_GENERATION.MIN_COST}`
    };
  }

  if (numericCost > CREDIT_CONFIG.IMAGE_GENERATION.MAX_COST) {
    return {
      isValid: false,
      error: `积分成本不能大于 ${CREDIT_CONFIG.IMAGE_GENERATION.MAX_COST}`
    };
  }

  // 6. 白名单检查
  if (!CREDIT_VALIDATION.ALLOWED_COSTS.includes(numericCost)) {
    return {
      isValid: false,
      error: `积分成本不在允许的范围内: ${CREDIT_VALIDATION.ALLOWED_COSTS.join(', ')}`
    };
  }

  return {
    isValid: true,
    sanitizedValue: numericCost
  };
}

/**
 * 验证用户输入是否安全
 */
export function validateUserInput(input: any): CreditValidationResult {
  // 1. 检查输入类型
  if (typeof input !== 'string' && typeof input !== 'number') {
    return {
      isValid: false,
      error: '输入必须是字符串或数字类型'
    };
  }

  // 2. 字符串长度检查
  if (typeof input === 'string') {
    if (input.length > 100) {
      return {
        isValid: false,
        error: '输入字符串过长'
      };
    }
    
    // 3. 检查是否包含恶意字符
    const maliciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /function\s*\(/i,
      /import\s+/i,
      /require\s*\(/i,
      /\.\.\//,
      /union\s+select/i,
      /drop\s+table/i,
      /delete\s+from/i,
      /insert\s+into/i,
      /update\s+set/i
    ];

    for (const pattern of maliciousPatterns) {
      if (pattern.test(input)) {
        return {
          isValid: false,
          error: '输入包含不安全的字符或代码'
        };
      }
    }
  }

  return {
    isValid: true,
    sanitizedValue: input
  };
}

/**
 * 验证积分操作是否合法
 */
export function validateCreditOperation(
  operation: string,
  amount: number,
  userId: string
): CreditValidationResult {
  // 1. 操作类型检查
  const allowedOperations = ['deduct', 'add', 'transfer'];
  if (!allowedOperations.includes(operation)) {
    return {
      isValid: false,
      error: '不支持的操作类型'
    };
  }

  // 2. 金额检查
  if (amount <= 0) {
    return {
      isValid: false,
      error: '积分金额必须大于0'
    };
  }

  if (amount > CREDIT_VALIDATION.MAX_SINGLE_DEDUCTION) {
    return {
      isValid: false,
      error: `单次操作金额不能超过 ${CREDIT_VALIDATION.MAX_SINGLE_DEDUCTION}`
    };
  }

  // 3. 用户ID检查
  if (!userId || typeof userId !== 'string' || userId.length < 1) {
    return {
      isValid: false,
      error: '无效的用户ID'
    };
  }

  return {
    isValid: true,
    sanitizedValue: amount
  };
}

/**
 * 清理和标准化输入
 */
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // 移除前后空格
    input = input.trim();
    
    // 移除HTML标签
    input = input.replace(/<[^>]*>/g, '');
    
    // 转义特殊字符
    input = input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }
  
  return input;
}

/**
 * 记录安全事件
 */
export function logSecurityEvent(
  event: string,
  details: any,
  userId?: string
): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    event,
    details,
    userId,
    ip: 'unknown', // 在实际应用中应该从请求中获取
    userAgent: 'unknown'
  };
  
  console.warn('🚨 安全事件:', logEntry);
  
  // 在实际应用中，这里应该写入安全日志系统
  // 例如：发送到安全监控系统、写入数据库等
}
