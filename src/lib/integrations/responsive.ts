/**
 * Responsive Design Implementation
 * 
 * This module provides comprehensive responsive design utilities and breakpoint management.
 */

import { logger } from '@/lib/utils/logger';

interface ResponsiveConfig {
  breakpoints: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
  };
  containerMaxWidths: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
}

interface ResponsiveState {
  currentBreakpoint: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
}

class ResponsiveDesignManager {
  private config: ResponsiveConfig;
  private listeners: Set<(state: ResponsiveState) => void> = new Set();
  private currentState: ResponsiveState;

  constructor(config: ResponsiveConfig) {
    this.config = config;
    this.currentState = this.getInitialState();
    this.setupResizeListener();
  }

  private getInitialState(): ResponsiveState {
    if (typeof window === 'undefined') {
      return {
        currentBreakpoint: 'lg',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        width: 1024,
        height: 768,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    return this.calculateResponsiveState(width, height);
  }

  private calculateResponsiveState(width: number, height: number): ResponsiveState {
    const { breakpoints } = this.config;
    
    let currentBreakpoint = '2xl';
    if (width < breakpoints.sm) {
      currentBreakpoint = 'xs';
    } else if (width < breakpoints.md) {
      currentBreakpoint = 'sm';
    } else if (width < breakpoints.lg) {
      currentBreakpoint = 'md';
    } else if (width < breakpoints.xl) {
      currentBreakpoint = 'lg';
    } else if (width < breakpoints['2xl']) {
      currentBreakpoint = 'xl';
    }

    return {
      currentBreakpoint,
      isMobile: width < breakpoints.md,
      isTablet: width >= breakpoints.md && width < breakpoints.lg,
      isDesktop: width >= breakpoints.lg,
      width,
      height,
    };
  }

  private setupResizeListener(): void {
    if (typeof window === 'undefined') return;

    let timeoutId: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const newState = this.calculateResponsiveState(window.innerWidth, window.innerHeight);
        
        if (this.hasStateChanged(newState)) {
          this.currentState = newState;
          this.notifyListeners();
          
          logger.debug('Responsive state changed', {
            breakpoint: newState.currentBreakpoint,
            width: newState.width,
            height: newState.height,
          });
        }
      }, 100); // Debounce resize events
    };

    window.addEventListener('resize', handleResize);
  }

  private hasStateChanged(newState: ResponsiveState): boolean {
    return (
      this.currentState.currentBreakpoint !== newState.currentBreakpoint ||
      this.currentState.isMobile !== newState.isMobile ||
      this.currentState.isTablet !== newState.isTablet ||
      this.currentState.isDesktop !== newState.isDesktop
    );
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentState);
      } catch (error) {
        logger.error('Error in responsive design listener', error, 'RESPONSIVE');
      }
    });
  }

  /**
   * Get current responsive state
   */
  getCurrentState(): ResponsiveState {
    return { ...this.currentState };
  }

  /**
   * Subscribe to responsive state changes
   */
  subscribe(listener: (state: ResponsiveState) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get responsive classes for a component
   */
  getResponsiveClasses(baseClasses: string, responsiveClasses: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
  }): string {
    const classes = [baseClasses];
    
    Object.entries(responsiveClasses).forEach(([breakpoint, className]) => {
      if (className) {
        classes.push(`${breakpoint}:${className}`);
      }
    });

    return classes.join(' ');
  }

  /**
   * Get container max width for current breakpoint
   */
  getContainerMaxWidth(): string {
    const { currentBreakpoint } = this.currentState;
    return this.config.containerMaxWidths[currentBreakpoint as keyof typeof this.config.containerMaxWidths] || '100%';
  }

  /**
   * Check if current breakpoint matches
   */
  isBreakpoint(breakpoint: string): boolean {
    return this.currentState.currentBreakpoint === breakpoint;
  }

  /**
   * Check if current breakpoint is above
   */
  isBreakpointAbove(breakpoint: string): boolean {
    const { breakpoints } = this.config;
    const currentWidth = this.currentState.width;
    
    switch (breakpoint) {
      case 'sm':
        return currentWidth >= breakpoints.sm;
      case 'md':
        return currentWidth >= breakpoints.md;
      case 'lg':
        return currentWidth >= breakpoints.lg;
      case 'xl':
        return currentWidth >= breakpoints.xl;
      case '2xl':
        return currentWidth >= breakpoints['2xl'];
      default:
        return false;
    }
  }

  /**
   * Check if current breakpoint is below
   */
  isBreakpointBelow(breakpoint: string): boolean {
    const { breakpoints } = this.config;
    const currentWidth = this.currentState.width;
    
    switch (breakpoint) {
      case 'sm':
        return currentWidth < breakpoints.sm;
      case 'md':
        return currentWidth < breakpoints.md;
      case 'lg':
        return currentWidth < breakpoints.lg;
      case 'xl':
        return currentWidth < breakpoints.xl;
      case '2xl':
        return currentWidth < breakpoints['2xl'];
      default:
        return false;
    }
  }

  /**
   * Get responsive grid columns
   */
  getGridColumns(columns: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  }): string {
    const classes = [`grid-cols-${columns.default}`];
    
    Object.entries(columns).forEach(([breakpoint, count]) => {
      if (breakpoint !== 'default' && count) {
        classes.push(`${breakpoint}:grid-cols-${count}`);
      }
    });

    return classes.join(' ');
  }

  /**
   * Get responsive spacing
   */
  getSpacing(spacing: {
    default: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
  }): string {
    const classes = [spacing.default];
    
    Object.entries(spacing).forEach(([breakpoint, value]) => {
      if (breakpoint !== 'default' && value) {
        classes.push(`${breakpoint}:${value}`);
      }
    });

    return classes.join(' ');
  }

  /**
   * Get responsive text size
   */
  getTextSize(size: {
    default: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
  }): string {
    const classes = [size.default];
    
    Object.entries(size).forEach(([breakpoint, value]) => {
      if (breakpoint !== 'default' && value) {
        classes.push(`${breakpoint}:${value}`);
      }
    });

    return classes.join(' ');
  }
}

// Create singleton instance
const responsiveDesignManager = new ResponsiveDesignManager({
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
  containerMaxWidths: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
});

export default responsiveDesignManager;
export { ResponsiveDesignManager };
