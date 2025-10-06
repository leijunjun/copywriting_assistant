/**
 * Internationalization Implementation
 * 
 * This module provides comprehensive internationalization support for all user-facing text.
 */

import { logger } from '@/lib/utils/logger';

interface I18nConfig {
  defaultLocale: string;
  supportedLocales: string[];
  fallbackLocale: string;
  namespaceSeparator: string;
}

interface TranslationData {
  [key: string]: string | TranslationData;
}

interface I18nState {
  locale: string;
  translations: TranslationData;
  isLoading: boolean;
  error: string | null;
}

class I18nManager {
  private config: I18nConfig;
  private state: I18nState;
  private listeners: Set<(state: I18nState) => void> = new Set();

  constructor(config: I18nConfig) {
    this.config = config;
    this.state = {
      locale: config.defaultLocale,
      translations: {},
      isLoading: false,
      error: null,
    };
  }

  /**
   * Initialize translations for a locale
   */
  async initializeLocale(locale: string): Promise<void> {
    try {
      this.state.isLoading = true;
      this.state.error = null;
      this.notifyListeners();

      const translations = await this.loadTranslations(locale);
      
      this.state.locale = locale;
      this.state.translations = translations;
      this.state.isLoading = false;
      
      this.notifyListeners();
      
      logger.i18n('Locale initialized successfully', { locale });
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Failed to load translations';
      this.state.isLoading = false;
      this.notifyListeners();
      
      logger.error('Failed to initialize locale', error, 'I18N', { locale });
      throw error;
    }
  }

  /**
   * Load translations for a locale
   */
  private async loadTranslations(locale: string): Promise<TranslationData> {
    try {
      const response = await fetch(`/locales/${locale}.json`);
      
      if (!response.ok) {
        throw new Error(`Failed to load translations for locale: ${locale}`);
      }
      
      return await response.json();
    } catch (error) {
      // Fallback to default locale if current locale fails
      if (locale !== this.config.fallbackLocale) {
        logger.warn('Falling back to default locale', { locale, fallback: this.config.fallbackLocale });
        return await this.loadTranslations(this.config.fallbackLocale);
      }
      throw error;
    }
  }

  /**
   * Get translation for a key
   */
  t(key: string, params?: Record<string, any>): string {
    try {
      const translation = this.getNestedValue(this.state.translations, key);
      
      if (typeof translation !== 'string') {
        logger.warn('Translation not found', { key, locale: this.state.locale });
        return key; // Return key if translation not found
      }

      // Replace parameters in translation
      if (params) {
        return this.replaceParameters(translation, params);
      }

      return translation;
    } catch (error) {
      logger.error('Failed to get translation', error, 'I18N', { key });
      return key;
    }
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split(this.config.namespaceSeparator).reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Replace parameters in translation string
   */
  private replaceParameters(text: string, params: Record<string, any>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] !== undefined ? String(params[key]) : match;
    });
  }

  /**
   * Get current locale
   */
  getCurrentLocale(): string {
    return this.state.locale;
  }

  /**
   * Check if locale is supported
   */
  isLocaleSupported(locale: string): boolean {
    return this.config.supportedLocales.includes(locale);
  }

  /**
   * Get supported locales
   */
  getSupportedLocales(): string[] {
    return [...this.config.supportedLocales];
  }

  /**
   * Subscribe to i18n state changes
   */
  subscribe(listener: (state: I18nState) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get current state
   */
  getCurrentState(): I18nState {
    return { ...this.state };
  }

  /**
   * Notify listeners of state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.state);
      } catch (error) {
        logger.error('Error in i18n listener', error, 'I18N');
      }
    });
  }

  /**
   * Format number according to locale
   */
  formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    try {
      return new Intl.NumberFormat(this.state.locale, options).format(value);
    } catch (error) {
      logger.error('Failed to format number', error, 'I18N', { value, locale: this.state.locale });
      return String(value);
    }
  }

  /**
   * Format currency according to locale
   */
  formatCurrency(value: number, currency: string = 'USD', options?: Intl.NumberFormatOptions): string {
    try {
      return new Intl.NumberFormat(this.state.locale, {
        style: 'currency',
        currency,
        ...options,
      }).format(value);
    } catch (error) {
      logger.error('Failed to format currency', error, 'I18N', { value, currency, locale: this.state.locale });
      return `${currency} ${value}`;
    }
  }

  /**
   * Format date according to locale
   */
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    try {
      return new Intl.DateTimeFormat(this.state.locale, options).format(date);
    } catch (error) {
      logger.error('Failed to format date', error, 'I18N', { date, locale: this.state.locale });
      return date.toLocaleDateString();
    }
  }

  /**
   * Format relative time according to locale
   */
  formatRelativeTime(value: number, unit: Intl.RelativeTimeFormatUnit): string {
    try {
      const rtf = new Intl.RelativeTimeFormat(this.state.locale, { numeric: 'auto' });
      return rtf.format(value, unit);
    } catch (error) {
      logger.error('Failed to format relative time', error, 'I18N', { value, unit, locale: this.state.locale });
      return `${value} ${unit}`;
    }
  }

  /**
   * Get locale-specific text direction
   */
  getTextDirection(): 'ltr' | 'rtl' {
    // Simple RTL detection for Arabic, Hebrew, etc.
    const rtlLocales = ['ar', 'he', 'fa', 'ur'];
    return rtlLocales.includes(this.state.locale) ? 'rtl' : 'ltr';
  }

  /**
   * Get locale-specific date format
   */
  getDateFormat(): string {
    const dateFormats: Record<string, string> = {
      'en': 'MM/dd/yyyy',
      'zh': 'yyyy/MM/dd',
      'ja': 'yyyy/MM/dd',
      'ar': 'dd/MM/yyyy',
      'he': 'dd/MM/yyyy',
    };
    
    return dateFormats[this.state.locale] || 'MM/dd/yyyy';
  }

  /**
   * Get locale-specific time format
   */
  getTimeFormat(): string {
    const timeFormats: Record<string, string> = {
      'en': 'h:mm a',
      'zh': 'HH:mm',
      'ja': 'HH:mm',
      'ar': 'h:mm a',
      'he': 'h:mm a',
    };
    
    return timeFormats[this.state.locale] || 'h:mm a';
  }
}

// Create singleton instance
const i18nManager = new I18nManager({
  defaultLocale: 'en',
  supportedLocales: ['en', 'zh', 'ja'],
  fallbackLocale: 'en',
  namespaceSeparator: '.',
});

export default i18nManager;
export { I18nManager };
