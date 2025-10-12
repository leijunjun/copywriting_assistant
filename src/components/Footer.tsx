/**
 * Footer Component
 * 
 * A minimalist footer with copyright information, contact details, and product links.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const t = useTranslations('footer');
  
  return (
    <footer className={`footer-container ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Service Features Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="flex flex-col lg:flex-row items-center text-center lg:text-left p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-3 lg:mb-0 lg:mr-4 flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">50%-80%</h3>
                <p className="text-sm text-gray-600">{t('costSavings')}</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col lg:flex-row items-center text-center lg:text-left p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mb-3 lg:mb-0 lg:mr-4 flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('intelligentBrain')}</h3>
                <p className="text-sm text-gray-600">{t('intelligentBrainDesc')}</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col lg:flex-row items-center text-center lg:text-left p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-3 lg:mb-0 lg:mr-4 flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('industryTemplates')}</h3>
                <p className="text-sm text-gray-600">{t('industryTemplatesDesc')}</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex flex-col lg:flex-row items-center text-center lg:text-left p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mb-3 lg:mb-0 lg:mr-4 flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('unlimitedExpansion')}</h3>
                <p className="text-sm text-gray-600">{t('unlimitedExpansionDesc')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Copyright Information */}
          <div className="flex flex-col items-center md:items-start space-y-2">
            <p className="text-sm text-gray-600">
              {t('copyright')}
            </p>
            <p className="text-xs text-gray-500">
              {t('tagline')}
            </p>
            <p className="text-xs text-gray-400">
              {t('icpNumber')}
            </p>
          </div>

          {/* Contact Information */}
          <div className="flex flex-col items-center md:items-center space-y-2">
            <a 
              href="tel:4009-686-151" 
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 px-4 py-2 rounded-lg border border-blue-200 transition-all duration-200 hover:shadow-md hover:scale-105"
            >
              <svg 
                className="h-5 w-5 text-blue-600" 
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
              <span className="text-sm text-blue-700 font-semibold">
                4009-686-151
              </span>
              <svg 
                className="h-4 w-4 text-blue-500" 
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
            </a>
            <p className="text-xs text-gray-500">
              {t('clickToCall')}
            </p>
          </div>

          {/* Product Links */}
          <div className="flex flex-col items-center md:items-end space-y-2">
            <div className="flex space-x-6">
              <Link 
                href="https://www.yituihuo.cn" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                {t('lietianbao')}
              </Link>
              <Link 
                href="https://#" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                {t('aiChampion')}
              </Link>
            </div>
            <p className="text-xs text-gray-500">
              {t('productMatrix')}
            </p>
          </div>
        </div>

        {/* Bottom Border */}
      </div>
    </footer>
  );
}

export default Footer;
