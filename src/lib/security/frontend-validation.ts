/**
 * 前端安全验证工具
 * 防范恶意输入和数值篡改
 */

import { CREDIT_CONFIG } from '@/config/credit-config';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedValue?: string;
}

/**
 * 验证用户输入
 */
export function validateUserInput(input: string, maxLength: number = 100): ValidationResult {
  // 1. 检查输入长度
  if (input.length > maxLength) {
    return {
      isValid: false,
      error: `输入内容不能超过 ${maxLength} 个字符`
    };
  }

  // 2. 检查是否为空
  if (!input.trim()) {
    return {
      isValid: false,
      error: '输入内容不能为空'
    };
  }

  // 3. 检查恶意字符
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

  // 4. 清理输入
  const sanitized = input
    .trim()
    .replace(/<[^>]*>/g, '') // 移除HTML标签
    .replace(/[<>]/g, '') // 移除尖括号
    .replace(/['"]/g, '') // 移除引号
    .slice(0, maxLength); // 限制长度

  return {
    isValid: true,
    sanitizedValue: sanitized
  };
}

/**
 * 验证标题输入
 */
export function validateTitle(title: string): ValidationResult {
  return validateUserInput(title, 50);
}

/**
 * 验证描述输入
 */
export function validateDescription(description: string): ValidationResult {
  return validateUserInput(description, 200);
}

/**
 * 验证积分相关输入
 */
export function validateCreditInput(input: any): ValidationResult {
  // 1. 类型检查
  if (typeof input !== 'number' && typeof input !== 'string') {
    return {
      isValid: false,
      error: '积分值必须是数字'
    };
  }

  // 2. 转换为数字
  const numericValue = typeof input === 'string' ? parseFloat(input) : input;
  
  // 3. 检查是否为有效数字
  if (isNaN(numericValue) || !isFinite(numericValue)) {
    return {
      isValid: false,
      error: '积分值必须是有效数字'
    };
  }

  // 4. 检查是否为整数
  if (!Number.isInteger(numericValue)) {
    return {
      isValid: false,
      error: '积分值必须是整数'
    };
  }

  // 5. 范围检查
  if (numericValue < CREDIT_CONFIG.IMAGE_GENERATION.MIN_COST) {
    return {
      isValid: false,
      error: `积分值不能小于 ${CREDIT_CONFIG.IMAGE_GENERATION.MIN_COST}`
    };
  }

  if (numericValue > CREDIT_CONFIG.IMAGE_GENERATION.MAX_COST) {
    return {
      isValid: false,
      error: `积分值不能大于 ${CREDIT_CONFIG.IMAGE_GENERATION.MAX_COST}`
    };
  }

  return {
    isValid: true,
    sanitizedValue: numericValue.toString()
  };
}

/**
 * 验证表单数据
 */
export function validateFormData(formData: any): ValidationResult {
  const errors: string[] = [];

  // 验证背景
  if (formData.background) {
    const backgroundValidation = validateUserInput(formData.background, 100);
    if (!backgroundValidation.isValid) {
      errors.push(`背景: ${backgroundValidation.error}`);
    }
  }

  // 验证主体
  if (formData.subject) {
    const subjectValidation = validateUserInput(formData.subject, 100);
    if (!subjectValidation.isValid) {
      errors.push(`主体: ${subjectValidation.error}`);
    }
  }

  // 验证主标题
  if (formData.mainTitle) {
    const titleValidation = validateTitle(formData.mainTitle);
    if (!titleValidation.isValid) {
      errors.push(`主标题: ${titleValidation.error}`);
    }
  }

  // 验证副标题
  if (formData.subtitle) {
    const subtitleValidation = validateTitle(formData.subtitle);
    if (!subtitleValidation.isValid) {
      errors.push(`副标题: ${subtitleValidation.error}`);
    }
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      error: errors.join('; ')
    };
  }

  return {
    isValid: true
  };
}

/**
 * 清理表单数据
 */
export function sanitizeFormData(formData: any): any {
  const sanitized = { ...formData };

  // 清理字符串字段
  const stringFields = ['background', 'subject', 'mainTitle', 'subtitle', 'style', 'size'];
  
  for (const field of stringFields) {
    if (sanitized[field] && typeof sanitized[field] === 'string') {
      sanitized[field] = sanitized[field]
        .trim()
        .replace(/<[^>]*>/g, '') // 移除HTML标签
        .replace(/[<>]/g, '') // 移除尖括号
        .replace(/['"]/g, ''); // 移除引号
    }
  }

  return sanitized;
}

/**
 * 检查请求频率
 */
class RequestRateLimiter {
  private requests: Map<string, number[]> = new Map();

  canMakeRequest(identifier: string, maxRequests: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    
    // 清理过期请求
    const validRequests = userRequests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return false;
    }
    
    // 添加当前请求
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }
}

export const requestRateLimiter = new RequestRateLimiter();
