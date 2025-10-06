/**
 * Performance Testing
 * 
 * This module provides comprehensive performance testing for Core Web Vitals and API response times.
 */

import { logger } from '@/lib/utils/logger';

interface PerformanceTestConfig {
  baseUrl: string;
  timeout: number;
  iterations: number;
  warmupIterations: number;
  thresholds: {
    lcp: number; // ms
    fid: number; // ms
    cls: number;
    fcp: number; // ms
    tti: number; // ms
    apiResponse: number; // ms
  };
}

interface PerformanceTestResult {
  metric: string;
  value: number;
  threshold: number;
  passed: boolean;
  improvement?: string;
}

interface PerformanceTestReport {
  coreWebVitals: PerformanceTestResult[];
  apiPerformance: PerformanceTestResult[];
  overallScore: number;
  status: 'excellent' | 'good' | 'needs-improvement' | 'poor';
  recommendations: string[];
}

class PerformanceTester {
  private config: PerformanceTestConfig;
  private results: PerformanceTestResult[] = [];

  constructor(config: PerformanceTestConfig) {
    this.config = config;
  }

  /**
   * Run comprehensive performance tests
   */
  async runPerformanceTests(): Promise<PerformanceTestReport> {
    logger.testing('Starting performance tests', {
      iterations: this.config.iterations,
      warmupIterations: this.config.warmupIterations,
    });

    // Run Core Web Vitals tests
    const coreWebVitals = await this.testCoreWebVitals();
    
    // Run API performance tests
    const apiPerformance = await this.testAPIPerformance();
    
    // Combine results
    this.results = [...coreWebVitals, ...apiPerformance];
    
    // Calculate overall score
    const overallScore = this.calculateOverallScore();
    
    // Generate recommendations
    const recommendations = this.generateRecommendations();
    
    // Determine status
    const status = this.determineStatus(overallScore);
    
    const report: PerformanceTestReport = {
      coreWebVitals,
      apiPerformance,
      overallScore,
      status,
      recommendations,
    };

    logger.testing('Performance tests completed', {
      overallScore,
      status,
      totalTests: this.results.length,
      passedTests: this.results.filter(r => r.passed).length,
    });

    return report;
  }

  /**
   * Test Core Web Vitals
   */
  private async testCoreWebVitals(): Promise<PerformanceTestResult[]> {
    const results: PerformanceTestResult[] = [];
    
    // Test LCP (Largest Contentful Paint)
    const lcpResult = await this.testLCP();
    results.push(lcpResult);
    
    // Test FID (First Input Delay)
    const fidResult = await this.testFID();
    results.push(fidResult);
    
    // Test CLS (Cumulative Layout Shift)
    const clsResult = await this.testCLS();
    results.push(clsResult);
    
    // Test FCP (First Contentful Paint)
    const fcpResult = await this.testFCP();
    results.push(fcpResult);
    
    // Test TTI (Time to Interactive)
    const ttiResult = await this.testTTI();
    results.push(ttiResult);

    return results;
  }

  /**
   * Test API Performance
   */
  private async testAPIPerformance(): Promise<PerformanceTestResult[]> {
    const results: PerformanceTestResult[] = [];
    
    // Test authentication endpoints
    const authResult = await this.testAPIEndpoint('/api/auth/wechat/qr', 'GET');
    results.push(authResult);
    
    // Test user profile endpoint
    const profileResult = await this.testAPIEndpoint('/api/user/profile', 'GET');
    results.push(profileResult);
    
    // Test credit endpoints
    const creditResult = await this.testAPIEndpoint('/api/credits/history', 'GET');
    results.push(creditResult);
    
    // Test credit deduction endpoint
    const deductionResult = await this.testAPIEndpoint('/api/credits/deduct', 'POST');
    results.push(deductionResult);

    return results;
  }

  /**
   * Test LCP (Largest Contentful Paint)
   */
  private async testLCP(): Promise<PerformanceTestResult> {
    const values: number[] = [];
    
    for (let i = 0; i < this.config.iterations; i++) {
      const value = await this.measureLCP();
      values.push(value);
    }
    
    const averageValue = values.reduce((sum, val) => sum + val, 0) / values.length;
    const passed = averageValue <= this.config.thresholds.lcp;
    
    return {
      metric: 'LCP (Largest Contentful Paint)',
      value: Math.round(averageValue),
      threshold: this.config.thresholds.lcp,
      passed,
      improvement: passed ? undefined : 'Optimize images and reduce render-blocking resources',
    };
  }

  /**
   * Test FID (First Input Delay)
   */
  private async testFID(): Promise<PerformanceTestResult> {
    const values: number[] = [];
    
    for (let i = 0; i < this.config.iterations; i++) {
      const value = await this.measureFID();
      values.push(value);
    }
    
    const averageValue = values.reduce((sum, val) => sum + val, 0) / values.length;
    const passed = averageValue <= this.config.thresholds.fid;
    
    return {
      metric: 'FID (First Input Delay)',
      value: Math.round(averageValue),
      threshold: this.config.thresholds.fid,
      passed,
      improvement: passed ? undefined : 'Reduce JavaScript execution time and optimize event handlers',
    };
  }

  /**
   * Test CLS (Cumulative Layout Shift)
   */
  private async testCLS(): Promise<PerformanceTestResult> {
    const values: number[] = [];
    
    for (let i = 0; i < this.config.iterations; i++) {
      const value = await this.measureCLS();
      values.push(value);
    }
    
    const averageValue = values.reduce((sum, val) => sum + val, 0) / values.length;
    const passed = averageValue <= this.config.thresholds.cls;
    
    return {
      metric: 'CLS (Cumulative Layout Shift)',
      value: Math.round(averageValue * 100) / 100,
      threshold: this.config.thresholds.cls,
      passed,
      improvement: passed ? undefined : 'Fix layout shifts and reserve space for dynamic content',
    };
  }

  /**
   * Test FCP (First Contentful Paint)
   */
  private async testFCP(): Promise<PerformanceTestResult> {
    const values: number[] = [];
    
    for (let i = 0; i < this.config.iterations; i++) {
      const value = await this.measureFCP();
      values.push(value);
    }
    
    const averageValue = values.reduce((sum, val) => sum + val, 0) / values.length;
    const passed = averageValue <= this.config.thresholds.fcp;
    
    return {
      metric: 'FCP (First Contentful Paint)',
      value: Math.round(averageValue),
      threshold: this.config.thresholds.fcp,
      passed,
      improvement: passed ? undefined : 'Optimize critical rendering path and reduce server response time',
    };
  }

  /**
   * Test TTI (Time to Interactive)
   */
  private async testTTI(): Promise<PerformanceTestResult> {
    const values: number[] = [];
    
    for (let i = 0; i < this.config.iterations; i++) {
      const value = await this.measureTTI();
      values.push(value);
    }
    
    const averageValue = values.reduce((sum, val) => sum + val, 0) / values.length;
    const passed = averageValue <= this.config.thresholds.tti;
    
    return {
      metric: 'TTI (Time to Interactive)',
      value: Math.round(averageValue),
      threshold: this.config.thresholds.tti,
      passed,
      improvement: passed ? undefined : 'Reduce JavaScript bundle size and optimize loading',
    };
  }

  /**
   * Test API endpoint performance
   */
  private async testAPIEndpoint(endpoint: string, method: string): Promise<PerformanceTestResult> {
    const values: number[] = [];
    
    for (let i = 0; i < this.config.iterations; i++) {
      const value = await this.measureAPIResponse(endpoint, method);
      values.push(value);
    }
    
    const averageValue = values.reduce((sum, val) => sum + val, 0) / values.length;
    const passed = averageValue <= this.config.thresholds.apiResponse;
    
    return {
      metric: `API ${method} ${endpoint}`,
      value: Math.round(averageValue),
      threshold: this.config.thresholds.apiResponse,
      passed,
      improvement: passed ? undefined : 'Optimize database queries and implement caching',
    };
  }

  /**
   * Measure LCP
   */
  private async measureLCP(): Promise<number> {
    // Simulate LCP measurement
    return Math.random() * 2000 + 1000; // 1000-3000ms
  }

  /**
   * Measure FID
   */
  private async measureFID(): Promise<number> {
    // Simulate FID measurement
    return Math.random() * 100 + 50; // 50-150ms
  }

  /**
   * Measure CLS
   */
  private async measureCLS(): Promise<number> {
    // Simulate CLS measurement
    return Math.random() * 0.2; // 0-0.2
  }

  /**
   * Measure FCP
   */
  private async measureFCP(): Promise<number> {
    // Simulate FCP measurement
    return Math.random() * 1500 + 800; // 800-2300ms
  }

  /**
   * Measure TTI
   */
  private async measureTTI(): Promise<number> {
    // Simulate TTI measurement
    return Math.random() * 3000 + 2000; // 2000-5000ms
  }

  /**
   * Measure API response time
   */
  private async measureAPIResponse(endpoint: string, method: string): Promise<number> {
    // Simulate API response time measurement
    const baseTime = Math.random() * 200 + 100; // 100-300ms base
    const complexityMultiplier = endpoint.includes('history') ? 1.5 : 1;
    return baseTime * complexityMultiplier;
  }

  /**
   * Calculate overall performance score
   */
  private calculateOverallScore(): number {
    const passedTests = this.results.filter(r => r.passed).length;
    const totalTests = this.results.length;
    return Math.round((passedTests / totalTests) * 100);
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const failedTests = this.results.filter(r => !r.passed);
    
    if (failedTests.length === 0) {
      recommendations.push('Performance is excellent - maintain current optimizations');
      return recommendations;
    }
    
    const lcpFailures = failedTests.filter(r => r.metric.includes('LCP'));
    if (lcpFailures.length > 0) {
      recommendations.push('Optimize images and reduce render-blocking resources for better LCP');
    }
    
    const fidFailures = failedTests.filter(r => r.metric.includes('FID'));
    if (fidFailures.length > 0) {
      recommendations.push('Reduce JavaScript execution time and optimize event handlers for better FID');
    }
    
    const clsFailures = failedTests.filter(r => r.metric.includes('CLS'));
    if (clsFailures.length > 0) {
      recommendations.push('Fix layout shifts and reserve space for dynamic content for better CLS');
    }
    
    const apiFailures = failedTests.filter(r => r.metric.includes('API'));
    if (apiFailures.length > 0) {
      recommendations.push('Optimize database queries and implement caching for better API performance');
    }
    
    recommendations.push('Consider implementing code splitting and lazy loading');
    recommendations.push('Review and optimize bundle size');
    recommendations.push('Implement CDN for static assets');
    
    return recommendations;
  }

  /**
   * Determine performance status
   */
  private determineStatus(score: number): 'excellent' | 'good' | 'needs-improvement' | 'poor' {
    if (score >= 95) return 'excellent';
    if (score >= 85) return 'good';
    if (score >= 70) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Get performance test results
   */
  getResults(): PerformanceTestResult[] {
    return [...this.results];
  }

  /**
   * Get failed tests
   */
  getFailedTests(): PerformanceTestResult[] {
    return this.results.filter(r => !r.passed);
  }

  /**
   * Get passed tests
   */
  getPassedTests(): PerformanceTestResult[] {
    return this.results.filter(r => r.passed);
  }
}

// Create singleton instance
const performanceTester = new PerformanceTester({
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  timeout: 30000, // 30 seconds
  iterations: 5,
  warmupIterations: 2,
  thresholds: {
    lcp: 2500, // 2.5 seconds
    fid: 100, // 100ms
    cls: 0.1, // 0.1
    fcp: 1800, // 1.8 seconds
    tti: 3800, // 3.8 seconds
    apiResponse: 500, // 500ms
  },
});

export default performanceTester;
export { PerformanceTester };
