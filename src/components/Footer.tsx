/**
 * Footer Component
 * 
 * A compact footer with essential information and product links.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const t = useTranslations('footer');
  const tCommon = useTranslations('Common');
  const router = useRouter();
  
  return (
    <footer className={`footer-container ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Compact Features Section */}
        <div className="mb-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Feature 1 - Cost Savings */}
            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-800">50%-80%</div>
                <div className="text-xs text-gray-600">{t('costSavings')}</div>
              </div>
            </div>

            {/* Feature 2 - AI Brain */}
            <div className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg border border-purple-100">
              <div className="w-7 h-7 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-800">{t('intelligentBrain')}</div>
                <div className="text-xs text-gray-600">{t('intelligentBrainDesc')}</div>
              </div>
            </div>

            {/* Feature 3 - Templates */}
            <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-800">{t('industryTemplates')}</div>
                <div className="text-xs text-gray-600">{t('industryTemplatesDesc')}</div>
              </div>
            </div>

            {/* Feature 4 - Expansion */}
            <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg border border-orange-100">
              <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-800">{t('unlimitedExpansion')}</div>
                <div className="text-xs text-gray-600">{t('unlimitedExpansionDesc')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            {/* Left: Copyright & Company Info */}
            <div className="flex flex-col space-y-1">
              <p className="text-sm text-gray-600 font-medium">
                {t('copyright')}
              </p>
              <p className="text-xs text-gray-500">
                {t('tagline')}
              </p>
              <div className="flex items-center space-x-4">
                <p className="text-xs text-gray-400">
                  {t('icpNumber')}
                </p>
                <Link 
                  href="/sitemap.xml" 
                  className="text-xs text-gray-500 hover:text-blue-600 transition-colors duration-200"
                >
                  {t('sitemap')}
                </Link>
                <Link 
                  href="/LLM.txt" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-gray-500 hover:text-blue-600 transition-colors duration-200"
                >
                  {t('llmDoc')}
                </Link>
              </div>
            </div>

            {/* Center: Contact */}
            <div className="flex flex-col items-center lg:items-center space-y-2">
              <a 
                href="tel:4009-686-151" 
                className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg border border-blue-200 transition-all duration-200 hover:shadow-sm"
              >
                <svg 
                  className="h-4 w-4 text-blue-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" 
                  />
                </svg>
                <span className="text-sm text-blue-700 font-medium">
                  4009-686-151
                </span>
              </a>
              <p className="text-xs text-gray-500">
                {t('clickToCall')}
              </p>
            </div>

            {/* Right: Product Links */}
            <div className="flex flex-col items-start lg:items-end space-y-2">
              <div className="flex space-x-4">
                <Link 
                  href="/extension"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
                >
                  {tCommon('browserAssistant')}
                </Link>
                <button
                  onClick={() => router.push('/writer')}
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
                >
                  {tCommon('inspirationWriter')}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                {t('productMatrix')}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Border */}
      </div>
    </footer>
  );
}

export default Footer;
