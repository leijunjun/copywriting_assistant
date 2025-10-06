/**
 * Performance Optimization
 * 
 * This module provides comprehensive performance optimization for Core Web Vitals and bundle size.
 */

import { logger } from '@/lib/utils/logger';

interface PerformanceConfig {
  targetLCP: number; // Largest Contentful Paint (ms)
  targetFID: number; // First Input Delay (ms)
  targetCLS: number; // Cumulative Layout Shift
  targetFCP: number; // First Contentful Paint (ms)
  targetTTI: number; // Time to Interactive (ms)
  maxBundleSize: number; // KB
  maxAPIResponseTime: number; // ms
}

interface PerformanceMetrics {
  lcp: number;
  fid: number;
  cls: number;
  fcp: number;
  tti: number;
  bundleSize: number;
  apiResponseTime: number;
}

interface PerformanceOptimization {
  type: 'bundle' | 'image' | 'api' | 'rendering' | 'caching';
  description: string;
  impact: 'high' | 'medium' | 'low';
  implementation: string;
}

class PerformanceOptimizer {
  private config: PerformanceConfig;
  private metrics: PerformanceMetrics;
  private optimizations: PerformanceOptimization[] = [];

  constructor(config: PerformanceConfig) {
    this.config = config;
    this.metrics = this.getInitialMetrics();
    this.initializeOptimizations();
  }

  private getInitialMetrics(): PerformanceMetrics {
    return {
      lcp: 0,
      fid: 0,
      cls: 0,
      fcp: 0,
      tti: 0,
      bundleSize: 0,
      apiResponseTime: 0,
    };
  }

  private initializeOptimizations(): void {
    this.optimizations = [
      {
        type: 'bundle',
        description: 'Code splitting and lazy loading',
        impact: 'high',
        implementation: 'Implement dynamic imports and route-based code splitting',
      },
      {
        type: 'image',
        description: 'Image optimization and WebP format',
        impact: 'high',
        implementation: 'Use Next.js Image component with WebP format and responsive sizing',
      },
      {
        type: 'api',
        description: 'API response caching and optimization',
        impact: 'medium',
        implementation: 'Implement Redis caching and database query optimization',
      },
      {
        type: 'rendering',
        description: 'Server-side rendering optimization',
        impact: 'high',
        implementation: 'Use React Server Components and optimize hydration',
      },
      {
        type: 'caching',
        description: 'Static asset caching',
        impact: 'medium',
        implementation: 'Implement CDN caching and browser caching strategies',
      },
    ];
  }

  /**
   * Measure Core Web Vitals
   */
  async measureCoreWebVitals(): Promise<PerformanceMetrics> {
    try {
      if (typeof window === 'undefined') {
        return this.metrics;
      }

      // Measure LCP
      const lcp = await this.measureLCP();
      
      // Measure FID
      const fid = await this.measureFID();
      
      // Measure CLS
      const cls = await this.measureCLS();
      
      // Measure FCP
      const fcp = await this.measureFCP();
      
      // Measure TTI
      const tti = await this.measureTTI();

      this.metrics = {
        lcp,
        fid,
        cls,
        fcp,
        tti,
        bundleSize: this.metrics.bundleSize,
        apiResponseTime: this.metrics.apiResponseTime,
      };

      logger.performance('Core Web Vitals measured', this.metrics);
      return this.metrics;
    } catch (error) {
      logger.error('Failed to measure Core Web Vitals', error, 'PERFORMANCE');
      return this.metrics;
    }
  }

  /**
   * Measure Largest Contentful Paint
   */
  private async measureLCP(): Promise<number> {
    return new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry.startTime);
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      
      // Timeout after 5 seconds
      setTimeout(() => {
        observer.disconnect();
        resolve(0);
      }, 5000);
    });
  }

  /**
   * Measure First Input Delay
   */
  private async measureFID(): Promise<number> {
    return new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const firstEntry = entries[0];
        resolve(firstEntry.processingStart - firstEntry.startTime);
      });
      
      observer.observe({ entryTypes: ['first-input'] });
      
      // Timeout after 5 seconds
      setTimeout(() => {
        observer.disconnect();
        resolve(0);
      }, 5000);
    });
  }

  /**
   * Measure Cumulative Layout Shift
   */
  private async measureCLS(): Promise<number> {
    return new Promise((resolve) => {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
      
      // Timeout after 5 seconds
      setTimeout(() => {
        observer.disconnect();
        resolve(clsValue);
      }, 5000);
    });
  }

  /**
   * Measure First Contentful Paint
   */
  private async measureFCP(): Promise<number> {
    return new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const firstEntry = entries[0];
        resolve(firstEntry.startTime);
      });
      
      observer.observe({ entryTypes: ['paint'] });
      
      // Timeout after 5 seconds
      setTimeout(() => {
        observer.disconnect();
        resolve(0);
      }, 5000);
    });
  }

  /**
   * Measure Time to Interactive
   */
  private async measureTTI(): Promise<number> {
    return new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry.startTime);
      });
      
      observer.observe({ entryTypes: ['navigation'] });
      
      // Timeout after 5 seconds
      setTimeout(() => {
        observer.disconnect();
        resolve(0);
      }, 5000);
    });
  }

  /**
   * Measure bundle size
   */
  async measureBundleSize(): Promise<number> {
    try {
      if (typeof window === 'undefined') {
        return 0;
      }

      const resources = performance.getEntriesByType('resource');
      let totalSize = 0;

      resources.forEach((resource: any) => {
        if (resource.name.includes('.js') || resource.name.includes('.css')) {
          totalSize += resource.transferSize || 0;
        }
      });

      const bundleSizeKB = Math.round(totalSize / 1024);
      this.metrics.bundleSize = bundleSizeKB;

      logger.performance('Bundle size measured', { bundleSizeKB });
      return bundleSizeKB;
    } catch (error) {
      logger.error('Failed to measure bundle size', error, 'PERFORMANCE');
      return 0;
    }
  }

  /**
   * Measure API response time
   */
  async measureAPIResponseTime(url: string): Promise<number> {
    try {
      const startTime = performance.now();
      
      const response = await fetch(url);
      await response.json();
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      this.metrics.apiResponseTime = responseTime;
      
      logger.performance('API response time measured', { url, responseTime });
      return responseTime;
    } catch (error) {
      logger.error('Failed to measure API response time', error, 'PERFORMANCE');
      return 0;
    }
  }

  /**
   * Check if performance targets are met
   */
  checkPerformanceTargets(): {
    passed: boolean;
    failures: string[];
    recommendations: string[];
  } {
    const failures: string[] = [];
    const recommendations: string[] = [];

    if (this.metrics.lcp > this.config.targetLCP) {
      failures.push(`LCP: ${this.metrics.lcp}ms > ${this.config.targetLCP}ms`);
      recommendations.push('Optimize images and reduce render-blocking resources');
    }

    if (this.metrics.fid > this.config.targetFID) {
      failures.push(`FID: ${this.metrics.fid}ms > ${this.config.targetFID}ms`);
      recommendations.push('Reduce JavaScript execution time and optimize event handlers');
    }

    if (this.metrics.cls > this.config.targetCLS) {
      failures.push(`CLS: ${this.metrics.cls} > ${this.config.targetCLS}`);
      recommendations.push('Fix layout shifts and reserve space for dynamic content');
    }

    if (this.metrics.fcp > this.config.targetFCP) {
      failures.push(`FCP: ${this.metrics.fcp}ms > ${this.config.targetFCP}ms`);
      recommendations.push('Optimize critical rendering path and reduce server response time');
    }

    if (this.metrics.tti > this.config.targetTTI) {
      failures.push(`TTI: ${this.metrics.tti}ms > ${this.config.targetTTI}ms`);
      recommendations.push('Reduce JavaScript bundle size and optimize loading');
    }

    if (this.metrics.bundleSize > this.config.maxBundleSize) {
      failures.push(`Bundle size: ${this.metrics.bundleSize}KB > ${this.config.maxBundleSize}KB`);
      recommendations.push('Implement code splitting and remove unused dependencies');
    }

    if (this.metrics.apiResponseTime > this.config.maxAPIResponseTime) {
      failures.push(`API response: ${this.metrics.apiResponseTime}ms > ${this.config.maxAPIResponseTime}ms`);
      recommendations.push('Optimize database queries and implement caching');
    }

    return {
      passed: failures.length === 0,
      failures,
      recommendations,
    };
  }

  /**
   * Get performance optimizations
   */
  getOptimizations(): PerformanceOptimization[] {
    return [...this.optimizations];
  }

  /**
   * Get current metrics
   */
  getCurrentMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Generate performance report
   */
  generateReport(): {
    metrics: PerformanceMetrics;
    targets: PerformanceConfig;
    status: 'excellent' | 'good' | 'needs-improvement' | 'poor';
    optimizations: PerformanceOptimization[];
  } {
    const targets = this.checkPerformanceTargets();
    const status = targets.passed ? 'excellent' : 
                  targets.failures.length <= 2 ? 'good' :
                  targets.failures.length <= 4 ? 'needs-improvement' : 'poor';

    return {
      metrics: this.metrics,
      targets: this.config,
      status,
      optimizations: this.optimizations,
    };
  }
}

// Create singleton instance
const performanceOptimizer = new PerformanceOptimizer({
  targetLCP: 2500, // 2.5 seconds
  targetFID: 100, // 100ms
  targetCLS: 0.1, // 0.1
  targetFCP: 1800, // 1.8 seconds
  targetTTI: 3800, // 3.8 seconds
  maxBundleSize: 120, // 120KB
  maxAPIResponseTime: 500, // 500ms
});

export default performanceOptimizer;
export { PerformanceOptimizer };
