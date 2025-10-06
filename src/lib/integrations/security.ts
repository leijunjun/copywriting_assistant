/**
 * Security Implementation
 * 
 * This module provides comprehensive security measures including XSS, CSRF protection, and input validation.
 */

import { logger } from '@/lib/utils/logger';
import { CustomError } from '@/lib/utils/error';

interface SecurityConfig {
  maxRequestSize: number; // bytes
  rateLimitWindow: number; // ms
  rateLimitMax: number; // requests per window
  allowedOrigins: string[];
  csrfTokenExpiry: number; // ms
  sessionTimeout: number; // ms
}

interface SecurityMetrics {
  blockedRequests: number;
  xssAttempts: number;
  csrfAttempts: number;
  rateLimitHits: number;
  suspiciousActivity: number;
}

interface SecurityRule {
  type: 'xss' | 'csrf' | 'rate-limit' | 'input-validation' | 'sql-injection';
  pattern: RegExp;
  action: 'block' | 'log' | 'warn';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class SecurityManager {
  private config: SecurityConfig;
  private metrics: SecurityMetrics;
  private rules: SecurityRule[] = [];
  private rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();
  private csrfTokens: Map<string, { token: string; expiry: number }> = new Map();

  constructor(config: SecurityConfig) {
    this.config = config;
    this.metrics = this.getInitialMetrics();
    this.initializeSecurityRules();
  }

  private getInitialMetrics(): SecurityMetrics {
    return {
      blockedRequests: 0,
      xssAttempts: 0,
      csrfAttempts: 0,
      rateLimitHits: 0,
      suspiciousActivity: 0,
    };
  }

  private initializeSecurityRules(): void {
    this.rules = [
      // XSS Protection
      {
        type: 'xss',
        pattern: /<script[^>]*>.*?<\/script>/gi,
        action: 'block',
        severity: 'high',
      },
      {
        type: 'xss',
        pattern: /javascript:/gi,
        action: 'block',
        severity: 'high',
      },
      {
        type: 'xss',
        pattern: /on\w+\s*=/gi,
        action: 'block',
        severity: 'medium',
      },
      
      // SQL Injection Protection
      {
        type: 'sql-injection',
        pattern: /(\bunion\b.*\bselect\b)|(\bselect\b.*\bunion\b)/gi,
        action: 'block',
        severity: 'critical',
      },
      {
        type: 'sql-injection',
        pattern: /(\bdrop\b.*\btable\b)|(\btable\b.*\bdrop\b)/gi,
        action: 'block',
        severity: 'critical',
      },
      {
        type: 'sql-injection',
        pattern: /(\binsert\b.*\binto\b)|(\binto\b.*\binsert\b)/gi,
        action: 'block',
        severity: 'high',
      },
      
      // Input Validation
      {
        type: 'input-validation',
        pattern: /[<>\"'%;()&+]/g,
        action: 'log',
        severity: 'low',
      },
    ];
  }

  /**
   * Validate request security
   */
  async validateRequest(request: Request, clientIP: string): Promise<{
    allowed: boolean;
    reason?: string;
    securityScore: number;
  }> {
    try {
      let securityScore = 100;
      const violations: string[] = [];

      // Check rate limiting
      const rateLimitResult = this.checkRateLimit(clientIP);
      if (!rateLimitResult.allowed) {
        this.metrics.rateLimitHits++;
        return {
          allowed: false,
          reason: 'Rate limit exceeded',
          securityScore: 0,
        };
      }

      // Check request size
      const contentLength = parseInt(request.headers.get('content-length') || '0');
      if (contentLength > this.config.maxRequestSize) {
        violations.push('Request size too large');
        securityScore -= 20;
      }

      // Check origin
      const origin = request.headers.get('origin');
      if (origin && !this.config.allowedOrigins.includes(origin)) {
        violations.push('Invalid origin');
        securityScore -= 30;
      }

      // Check for XSS patterns
      if (request.method !== 'GET') {
        const body = await request.text();
        const xssResult = this.checkXSS(body);
        if (!xssResult.allowed) {
          this.metrics.xssAttempts++;
          violations.push('XSS attempt detected');
          securityScore -= 50;
        }
      }

      // Check for SQL injection patterns
      const url = new URL(request.url);
      const sqlResult = this.checkSQLInjection(url.search);
      if (!sqlResult.allowed) {
        violations.push('SQL injection attempt detected');
        securityScore -= 40;
      }

      const allowed = securityScore >= 50;
      
      if (!allowed) {
        this.metrics.blockedRequests++;
        logger.security('Request blocked', {
          clientIP,
          violations,
          securityScore,
          url: request.url,
        });
      }

      return {
        allowed,
        reason: violations.join(', '),
        securityScore,
      };
    } catch (error) {
      logger.error('Security validation failed', error, 'SECURITY');
      return {
        allowed: false,
        reason: 'Security validation error',
        securityScore: 0,
      };
    }
  }

  /**
   * Check rate limiting
   */
  private checkRateLimit(clientIP: string): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const key = `rate_limit_${clientIP}`;
    const current = this.rateLimitStore.get(key);

    if (!current || now > current.resetTime) {
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: now + this.config.rateLimitWindow,
      });
      return { allowed: true, remaining: this.config.rateLimitMax - 1 };
    }

    if (current.count >= this.config.rateLimitMax) {
      return { allowed: false, remaining: 0 };
    }

    current.count++;
    this.rateLimitStore.set(key, current);
    
    return { allowed: true, remaining: this.config.rateLimitMax - current.count };
  }

  /**
   * Check for XSS patterns
   */
  private checkXSS(input: string): { allowed: boolean; patterns: string[] } {
    const violations: string[] = [];
    
    for (const rule of this.rules) {
      if (rule.type === 'xss' && rule.pattern.test(input)) {
        violations.push(rule.pattern.source);
        
        if (rule.action === 'block') {
          return { allowed: false, patterns: violations };
        }
      }
    }

    return { allowed: true, patterns: violations };
  }

  /**
   * Check for SQL injection patterns
   */
  private checkSQLInjection(input: string): { allowed: boolean; patterns: string[] } {
    const violations: string[] = [];
    
    for (const rule of this.rules) {
      if (rule.type === 'sql-injection' && rule.pattern.test(input)) {
        violations.push(rule.pattern.source);
        
        if (rule.action === 'block') {
          return { allowed: false, patterns: violations };
        }
      }
    }

    return { allowed: true, patterns: violations };
  }

  /**
   * Generate CSRF token
   */
  generateCSRFToken(sessionId: string): string {
    const token = this.generateSecureToken();
    const expiry = Date.now() + this.config.csrfTokenExpiry;
    
    this.csrfTokens.set(sessionId, { token, expiry });
    
    logger.security('CSRF token generated', { sessionId });
    return token;
  }

  /**
   * Validate CSRF token
   */
  validateCSRFToken(sessionId: string, token: string): boolean {
    const stored = this.csrfTokens.get(sessionId);
    
    if (!stored) {
      this.metrics.csrfAttempts++;
      return false;
    }

    if (Date.now() > stored.expiry) {
      this.csrfTokens.delete(sessionId);
      this.metrics.csrfAttempts++;
      return false;
    }

    if (stored.token !== token) {
      this.metrics.csrfAttempts++;
      return false;
    }

    return true;
  }

  /**
   * Sanitize input
   */
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>\"'%;()&+]/g, '') // Remove potentially dangerous characters
      .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .trim();
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): {
    valid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length < 8) {
      feedback.push('Password must be at least 8 characters long');
    } else {
      score += 20;
    }

    if (!/[A-Z]/.test(password)) {
      feedback.push('Password must contain at least one uppercase letter');
    } else {
      score += 20;
    }

    if (!/[a-z]/.test(password)) {
      feedback.push('Password must contain at least one lowercase letter');
    } else {
      score += 20;
    }

    if (!/\d/.test(password)) {
      feedback.push('Password must contain at least one number');
    } else {
      score += 20;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      feedback.push('Password must contain at least one special character');
    } else {
      score += 20;
    }

    return {
      valid: score >= 80,
      score,
      feedback,
    };
  }

  /**
   * Generate secure token
   */
  private generateSecureToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Get security metrics
   */
  getSecurityMetrics(): SecurityMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset security metrics
   */
  resetMetrics(): void {
    this.metrics = this.getInitialMetrics();
    this.rateLimitStore.clear();
    this.csrfTokens.clear();
  }

  /**
   * Generate security report
   */
  generateSecurityReport(): {
    metrics: SecurityMetrics;
    status: 'secure' | 'warning' | 'critical';
    recommendations: string[];
  } {
    const totalThreats = this.metrics.blockedRequests + 
                        this.metrics.xssAttempts + 
                        this.metrics.csrfAttempts + 
                        this.metrics.rateLimitHits;

    const status = totalThreats === 0 ? 'secure' :
                  totalThreats < 10 ? 'warning' : 'critical';

    const recommendations: string[] = [];
    
    if (this.metrics.xssAttempts > 0) {
      recommendations.push('Implement stricter XSS filtering and Content Security Policy');
    }
    
    if (this.metrics.csrfAttempts > 0) {
      recommendations.push('Strengthen CSRF protection and token validation');
    }
    
    if (this.metrics.rateLimitHits > 0) {
      recommendations.push('Implement more aggressive rate limiting');
    }

    return {
      metrics: this.metrics,
      status,
      recommendations,
    };
  }
}

// Create singleton instance
const securityManager = new SecurityManager({
  maxRequestSize: 1024 * 1024, // 1MB
  rateLimitWindow: 15 * 60 * 1000, // 15 minutes
  rateLimitMax: 100, // 100 requests per window
  allowedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ],
  csrfTokenExpiry: 60 * 60 * 1000, // 1 hour
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
});

export default securityManager;
export { SecurityManager };
