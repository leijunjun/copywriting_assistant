/**
 * Chrome Extension Introduction Page
 * 
 * This page displays information about the Chrome extension and provides download options.
 */

'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Download, Check } from 'lucide-react';

interface Version {
  version: string;
  isLatest?: boolean;
  releaseDate?: string;
  changelog?: string[];
}

export default function ExtensionPage() {
  const t = useTranslations('Extension');
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());
  const [currentPlatform, setCurrentPlatform] = useState<'macos' | 'windows' | 'linux'>('macos');

  // Detect platform
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent.toLowerCase();
      if (userAgent.includes('win')) {
        setCurrentPlatform('windows');
      } else if (userAgent.includes('linux')) {
        setCurrentPlatform('linux');
      } else {
        setCurrentPlatform('macos');
      }
    }
  }, []);

  const versions: Version[] = [
    {
      version: '1.1',
      isLatest: true,
      releaseDate: '2025-12-17',
      changelog: [
        '新增智能文案生成功能',
        '优化用户体验',
        '支持商品/服务的个性化匹配',
        '增加二创设置功能'
      ]
    },
    {
      version: '1.0',
      releaseDate: '2025-12-10',
      changelog: [
        '初始版本发布',
        '基础功能实现',
        '支持小红书平台识别'
      ]
    }
  ];

  const toggleVersion = (version: string) => {
    const newExpanded = new Set(expandedVersions);
    if (newExpanded.has(version)) {
      newExpanded.delete(version);
    } else {
      newExpanded.add(version);
    }
    setExpandedVersions(newExpanded);
  };

  const handleDownload = () => {
    // 这里可以添加实际的下载逻辑
    const downloadUrls = {
      macos: '/extension/download/macos',
      windows: '/extension/download/windows',
      linux: '/extension/download/linux'
    };
    
    // 实际实现中，这里应该跳转到真实的下载链接
    window.open(downloadUrls[currentPlatform], '_blank');
  };

  const getPlatformName = (platform: 'macos' | 'windows' | 'linux'): string => {
    const names: Record<'macos' | 'windows' | 'linux', string> = {
      macos: 'macOS',
      windows: 'Windows',
      linux: 'Linux'
    };
    return names[platform];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Main Download Section */}
        <Card className="bg-white border-0 shadow-lg mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Extension Icon */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg 
                    className="w-12 h-12 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                    />
                  </svg>
                </div>
              </div>

              {/* Title and Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {t('downloadTitle')}
                </h1>
                <p className="text-sm text-gray-500 mb-4">
                  {t('compatibility')}
                  <a 
                    href="https://www.onlinedown.net/soft/7993.htm" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    {t('clickToDownload')}
                  </a>
                </p>
                
                <p className="text-sm text-gray-600 mb-4">
                  {t('extensionDescription')}
                </p>
                
                {/* Download Button */}
                <Button
                  onClick={handleDownload}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {t('downloadPackage')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Version List Section */}
        <Card className="bg-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-4">
              {versions.map((version, index) => {
                const isExpanded = expandedVersions.has(version.version);
                return (
                  <div key={version.version}>
                    <div 
                      className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                      onClick={() => toggleVersion(version.version)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base font-medium text-gray-900">
                          {version.version}
                        </span>
                        {version.isLatest && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            {t('latest')}
                          </span>
                        )}
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    
                    {isExpanded && version.changelog && (
                      <div className="mt-2 ml-4 pl-4 border-l-2 border-gray-200 pb-4">
                        {version.releaseDate && (
                          <p className="text-sm text-gray-500 mb-3">
                            {t('releaseDate')}: {version.releaseDate}
                          </p>
                        )}
                        <ul className="space-y-2">
                          {version.changelog.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

