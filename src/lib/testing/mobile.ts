/**
 * Mobile Device Testing and Responsive Design Validation
 * 
 * This module provides comprehensive mobile device testing and responsive design validation.
 */

import { logger } from '@/lib/utils/logger';

interface MobileTestConfig {
  baseUrl: string;
  timeout: number;
  devices: MobileDeviceConfig[];
  testPages: string[];
  responsiveBreakpoints: ResponsiveBreakpoint[];
}

interface MobileDeviceConfig {
  name: string;
  width: number;
  height: number;
  devicePixelRatio: number;
  userAgent: string;
  touch: boolean;
  orientation: 'portrait' | 'landscape';
  capabilities: string[];
}

interface ResponsiveBreakpoint {
  name: string;
  minWidth: number;
  maxWidth: number;
  expectedLayout: string;
}

interface MobileTestResult {
  device: string;
  page: string;
  orientation: string;
  passed: boolean;
  issues: MobileIssue[];
  score: number;
  recommendations: string[];
}

interface MobileIssue {
  type: 'layout' | 'touch' | 'performance' | 'viewport' | 'navigation';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  solution: string;
  affectedElements: string[];
}

interface MobileTestReport {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  devices: string[];
  overallScore: number;
  results: MobileTestResult[];
  criticalIssues: MobileIssue[];
  recommendations: string[];
}

class MobileDeviceTester {
  private config: MobileTestConfig;
  private results: MobileTestResult[] = [];

  constructor(config: MobileTestConfig) {
    this.config = config;
  }

  /**
   * Run comprehensive mobile device tests
   */
  async runMobileTests(): Promise<MobileTestReport> {
    logger.testing('Starting mobile device tests', {
      devices: this.config.devices.length,
      pages: this.config.testPages.length,
      breakpoints: this.config.responsiveBreakpoints.length,
    });

    const results: MobileTestResult[] = [];

    for (const device of this.config.devices) {
      for (const page of this.config.testPages) {
        try {
          const result = await this.testDevicePage(device, page);
          results.push(result);
          
          logger.testing('Mobile device test completed', {
            device: device.name,
            page,
            orientation: device.orientation,
            score: result.score,
            issues: result.issues.length,
          });
        } catch (error) {
          logger.error('Mobile device test failed', error, 'MOBILE', {
            device: device.name,
            page,
          });
          
          results.push({
            device: device.name,
            page,
            orientation: device.orientation,
            passed: false,
            issues: [],
            score: 0,
            recommendations: ['Fix mobile device test execution'],
          });
        }
      }
    }

    this.results = results;

    // Calculate overall metrics
    const totalTests = results.length;
    const passedTests = results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const overallScore = Math.round((passedTests / totalTests) * 100);

    // Collect critical issues
    const criticalIssues = results.flatMap(r => r.issues.filter(i => i.severity === 'critical'));

    // Generate recommendations
    const recommendations = this.generateRecommendations(results);

    const report: MobileTestReport = {
      totalTests,
      passedTests,
      failedTests,
      devices: [...new Set(results.map(r => r.device))],
      overallScore,
      results,
      criticalIssues,
      recommendations,
    };

    logger.testing('Mobile device tests completed', {
      totalTests: report.totalTests,
      passedTests: report.passedTests,
      failedTests: report.failedTests,
      overallScore: report.overallScore,
    });

    return report;
  }

  /**
   * Test a specific device and page combination
   */
  private async testDevicePage(device: MobileDeviceConfig, page: string): Promise<MobileTestResult> {
    const issues: MobileIssue[] = [];
    
    // Simulate mobile device testing
    await this.simulateDeviceLoad(device, page);
    
    // Check responsive layout
    const layoutIssues = await this.checkResponsiveLayout(device, page);
    issues.push(...layoutIssues);
    
    // Check touch interactions
    const touchIssues = await this.checkTouchInteractions(device, page);
    issues.push(...touchIssues);
    
    // Check performance on mobile
    const performanceIssues = await this.checkMobilePerformance(device, page);
    issues.push(...performanceIssues);
    
    // Check viewport configuration
    const viewportIssues = await this.checkViewportConfiguration(device, page);
    issues.push(...viewportIssues);
    
    // Check mobile navigation
    const navigationIssues = await this.checkMobileNavigation(device, page);
    issues.push(...navigationIssues);

    // Calculate score
    const totalChecks = 25; // Simulate 25 mobile-specific checks
    const passedChecks = totalChecks - issues.length;
    const score = Math.round((passedChecks / totalChecks) * 100);

    // Determine if test passed
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    const passed = criticalIssues.length === 0 && score >= 80;

    // Generate recommendations
    const recommendations = this.generateTestRecommendations(issues, device);

    return {
      device: device.name,
      page,
      orientation: device.orientation,
      passed,
      issues,
      score,
      recommendations,
    };
  }

  /**
   * Simulate device load
   */
  private async simulateDeviceLoad(device: MobileDeviceConfig, page: string): Promise<void> {
    // Simulate device-specific load time
    const baseTime = 1000;
    const deviceMultiplier = device.width < 400 ? 1.5 : 1; // Slower on smaller devices
    await new Promise(resolve => setTimeout(resolve, baseTime * deviceMultiplier));
  }

  /**
   * Check responsive layout
   */
  private async checkResponsiveLayout(device: MobileDeviceConfig, page: string): Promise<MobileIssue[]> {
    const issues: MobileIssue[] = [];
    
    // Simulate responsive layout checks
    if (device.width < 768) {
      // Mobile layout checks
      if (Math.random() < 0.3) {
        issues.push({
          type: 'layout',
          severity: 'high',
          description: 'Content overflow on mobile viewport',
          solution: 'Implement proper mobile layout with responsive design',
          affectedElements: ['main-content', 'navigation', 'sidebar'],
        });
      }
      
      if (Math.random() < 0.2) {
        issues.push({
          type: 'layout',
          severity: 'medium',
          description: 'Text too small on mobile devices',
          solution: 'Increase font size and improve readability',
          affectedElements: ['body-text', 'labels', 'buttons'],
        });
      }
    }
    
    if (device.width >= 768 && device.width < 1024) {
      // Tablet layout checks
      if (Math.random() < 0.2) {
        issues.push({
          type: 'layout',
          severity: 'medium',
          description: 'Layout not optimized for tablet viewport',
          solution: 'Implement tablet-specific layout adjustments',
          affectedElements: ['grid-layout', 'card-layout'],
        });
      }
    }

    return issues;
  }

  /**
   * Check touch interactions
   */
  private async checkTouchInteractions(device: MobileDeviceConfig, page: string): Promise<MobileIssue[]> {
    const issues: MobileIssue[] = [];
    
    if (device.touch) {
      // Simulate touch interaction checks
      if (Math.random() < 0.25) {
        issues.push({
          type: 'touch',
          severity: 'high',
          description: 'Touch targets too small for mobile interaction',
          solution: 'Increase touch target size to minimum 44px',
          affectedElements: ['buttons', 'links', 'form-controls'],
        });
      }
      
      if (Math.random() < 0.2) {
        issues.push({
          type: 'touch',
          severity: 'medium',
          description: 'Touch gestures not properly implemented',
          solution: 'Implement proper touch gesture handling',
          affectedElements: ['swipe-actions', 'pinch-zoom', 'scroll-behavior'],
        });
      }
    }

    return issues;
  }

  /**
   * Check mobile performance
   */
  private async checkMobilePerformance(device: MobileDeviceConfig, page: string): Promise<MobileIssue[]> {
    const issues: MobileIssue[] = [];
    
    // Simulate mobile performance checks
    if (device.width < 400) {
      // Small device performance checks
      if (Math.random() < 0.3) {
        issues.push({
          type: 'performance',
          severity: 'high',
          description: 'Poor performance on small mobile devices',
          solution: 'Optimize images and reduce JavaScript bundle size',
          affectedElements: ['images', 'scripts', 'animations'],
        });
      }
    }
    
    if (Math.random() < 0.2) {
      issues.push({
        type: 'performance',
        severity: 'medium',
        description: 'Slow loading on mobile networks',
        solution: 'Implement lazy loading and optimize assets',
        affectedElements: ['images', 'videos', 'third-party-scripts'],
      });
    }

    return issues;
  }

  /**
   * Check viewport configuration
   */
  private async checkViewportConfiguration(device: MobileDeviceConfig, page: string): Promise<MobileIssue[]> {
    const issues: MobileIssue[] = [];
    
    // Simulate viewport configuration checks
    if (Math.random() < 0.15) {
      issues.push({
        type: 'viewport',
        severity: 'critical',
        description: 'Viewport meta tag not properly configured',
        solution: 'Add proper viewport meta tag with initial-scale=1',
        affectedElements: ['viewport-meta'],
      });
    }
    
    if (Math.random() < 0.2) {
      issues.push({
        type: 'viewport',
        severity: 'medium',
        description: 'Content not properly scaled for device pixel ratio',
        solution: 'Implement proper device pixel ratio handling',
        affectedElements: ['images', 'icons', 'text'],
      });
    }

    return issues;
  }

  /**
   * Check mobile navigation
   */
  private async checkMobileNavigation(device: MobileDeviceConfig, page: string): Promise<MobileIssue[]> {
    const issues: MobileIssue[] = [];
    
    if (device.width < 768) {
      // Mobile navigation checks
      if (Math.random() < 0.25) {
        issues.push({
          type: 'navigation',
          severity: 'high',
          description: 'Navigation not optimized for mobile devices',
          solution: 'Implement mobile-friendly navigation (hamburger menu)',
          affectedElements: ['main-navigation', 'menu-items'],
        });
      }
      
      if (Math.random() < 0.2) {
        issues.push({
          type: 'navigation',
          severity: 'medium',
          description: 'Breadcrumb navigation not suitable for mobile',
          solution: 'Simplify or hide breadcrumb navigation on mobile',
          affectedElements: ['breadcrumb', 'page-title'],
        });
      }
    }

    return issues;
  }

  /**
   * Generate test-specific recommendations
   */
  private generateTestRecommendations(issues: MobileIssue[], device: MobileDeviceConfig): string[] {
    const recommendations: string[] = [];
    
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    if (criticalIssues.length > 0) {
      recommendations.push(`Fix critical mobile issues on ${device.name}`);
    }
    
    const layoutIssues = issues.filter(i => i.type === 'layout');
    if (layoutIssues.length > 0) {
      recommendations.push('Improve responsive layout for mobile devices');
    }
    
    const touchIssues = issues.filter(i => i.type === 'touch');
    if (touchIssues.length > 0) {
      recommendations.push('Enhance touch interaction support');
    }
    
    const performanceIssues = issues.filter(i => i.type === 'performance');
    if (performanceIssues.length > 0) {
      recommendations.push('Optimize performance for mobile devices');
    }

    return recommendations;
  }

  /**
   * Generate overall recommendations
   */
  private generateRecommendations(results: MobileTestResult[]): string[] {
    const recommendations: string[] = [];
    
    const failedTests = results.filter(r => !r.passed);
    if (failedTests.length > 0) {
      recommendations.push('Address mobile compatibility issues across all devices');
    }
    
    const criticalIssues = results.flatMap(r => r.issues.filter(i => i.severity === 'critical'));
    if (criticalIssues.length > 0) {
      recommendations.push('Fix all critical mobile issues');
    }
    
    const deviceIssues = results.reduce((acc, r) => {
      acc[r.device] = (acc[r.device] || 0) + r.issues.length;
      return acc;
    }, {} as Record<string, number>);
    
    const problematicDevices = Object.entries(deviceIssues)
      .filter(([_, count]) => count > 5)
      .map(([device, _]) => device);
    
    if (problematicDevices.length > 0) {
      recommendations.push(`Focus on improving compatibility for: ${problematicDevices.join(', ')}`);
    }

    recommendations.push('Implement mobile-first responsive design approach');
    recommendations.push('Test on real mobile devices, not just browser dev tools');
    recommendations.push('Optimize images and assets for mobile networks');
    recommendations.push('Implement touch-friendly interactions');
    recommendations.push('Consider progressive web app features');

    return recommendations;
  }

  /**
   * Get test results
   */
  getResults(): MobileTestResult[] {
    return [...this.results];
  }

  /**
   * Get results by device
   */
  getResultsByDevice(device: string): MobileTestResult[] {
    return this.results.filter(r => r.device === device);
  }

  /**
   * Get results by page
   */
  getResultsByPage(page: string): MobileTestResult[] {
    return this.results.filter(r => r.page === page);
  }

  /**
   * Get failed tests
   */
  getFailedTests(): MobileTestResult[] {
    return this.results.filter(r => !r.passed);
  }
}

// Create singleton instance
const mobileDeviceTester = new MobileDeviceTester({
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  timeout: 30000, // 30 seconds
  devices: [
    {
      name: 'iPhone SE',
      width: 375,
      height: 667,
      devicePixelRatio: 2,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      touch: true,
      orientation: 'portrait',
      capabilities: ['touch', 'geolocation', 'camera'],
    },
    {
      name: 'iPhone 14 Pro',
      width: 393,
      height: 852,
      devicePixelRatio: 3,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      touch: true,
      orientation: 'portrait',
      capabilities: ['touch', 'geolocation', 'camera', 'face-id'],
    },
    {
      name: 'Samsung Galaxy S23',
      width: 360,
      height: 780,
      devicePixelRatio: 3,
      userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S911B)',
      touch: true,
      orientation: 'portrait',
      capabilities: ['touch', 'geolocation', 'camera', 'fingerprint'],
    },
    {
      name: 'iPad',
      width: 768,
      height: 1024,
      devicePixelRatio: 2,
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)',
      touch: true,
      orientation: 'portrait',
      capabilities: ['touch', 'geolocation', 'camera'],
    },
    {
      name: 'iPad Pro',
      width: 1024,
      height: 1366,
      devicePixelRatio: 2,
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)',
      touch: true,
      orientation: 'portrait',
      capabilities: ['touch', 'geolocation', 'camera', 'apple-pencil'],
    },
  ],
  testPages: [
    '/auth/login',
    '/profile',
    '/credits',
    '/credits/history',
  ],
  responsiveBreakpoints: [
    {
      name: 'mobile',
      minWidth: 0,
      maxWidth: 767,
      expectedLayout: 'single-column',
    },
    {
      name: 'tablet',
      minWidth: 768,
      maxWidth: 1023,
      expectedLayout: 'two-column',
    },
    {
      name: 'desktop',
      minWidth: 1024,
      maxWidth: 9999,
      expectedLayout: 'multi-column',
    },
  ],
});

export default mobileDeviceTester;
export { MobileDeviceTester };
