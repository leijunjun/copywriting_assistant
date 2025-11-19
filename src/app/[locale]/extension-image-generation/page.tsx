"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/auth-context';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { LoginReminderModal } from '@/components/ui/login-reminder-modal';
import { Download, Loader2, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import dayjs from 'dayjs';

interface GenerateRecord {
  id: string;
  imageUrl: string;
  createdAt: number;
  error?: boolean;
}

export default function ExtensionImageGenerationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authState } = useAuth();
  const { isAuthenticated } = authState;
  const { withAuthCheck, showLoginModal, setShowLoginModal } = useAuthCheck();

  // 从 URL 参数获取数据
  const imageUrl = searchParams.get('imageUrl') || '';
  const description = searchParams.get('description') || '';
  const keywordsParam = searchParams.get('keywords') || '[]';
  const aspectRatio = searchParams.get('aspectRatio') || '1:1';

  const [keywords, setKeywords] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateRecords, setGenerateRecords] = useState<GenerateRecord[]>([]);
  const [error, setError] = useState<string>('');
  const [creditCost, setCreditCost] = useState(5);

  // 初始化关键词
  useEffect(() => {
    try {
      const parsedKeywords = JSON.parse(keywordsParam);
      if (Array.isArray(parsedKeywords)) {
        setKeywords(parsedKeywords.filter(k => k && k.trim()));
      }
    } catch (error) {
      console.error('Failed to parse keywords:', error);
    }
  }, [keywordsParam]);

  // 获取积分成本
  useEffect(() => {
    const fetchCreditCost = async () => {
      try {
        const response = await fetch('/api/credits/image-cost');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.cost) {
            setCreditCost(data.cost);
          }
        }
      } catch (error) {
        console.error('Failed to fetch credit cost:', error);
      }
    };
    fetchCreditCost();
  }, []);

  // 生成图片
  const generateImage = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (keywords.length === 0 && !description) {
      setError('请提供关键词或描述');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      // 构建提示词：使用关键词和描述
      const subject = keywords.join('，');
      // 如果有关键词，使用关键词；否则使用描述的前50个字符作为主题
      const mainSubject = subject || (description ? description.substring(0, 50) : '');

      const response = await fetch('/api/generateImage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          background: description || '', // 使用完整描述作为背景
          subject: mainSubject,
          mainTitle: keywords[0] || (description ? description.substring(0, 20) : ''),
          subtitle: keywords.slice(1).join('，') || '',
          style: '高级极简',
          size: aspectRatio, // 使用从 URL 参数获取的比例
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '生成失败');
      }

      if (data.success && data.images && data.images.length > 0) {
        const newRecords: GenerateRecord[] = data.images.map((img: string, index: number) => ({
          id: `img-${Date.now()}-${index}`,
          imageUrl: img,
          createdAt: Date.now(),
        }));
        setGenerateRecords(newRecords);
      } else {
        throw new Error('未生成图片');
      }
    } catch (err) {
      console.error('Error generating image:', err);
      setError(err instanceof Error ? err.message : '生成图片失败，请稍后重试');
      setGenerateRecords([{
        id: `error-${Date.now()}`,
        imageUrl: '',
        createdAt: Date.now(),
        error: true,
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  // 自动生成图片
  useEffect(() => {
    if (isAuthenticated && (keywords.length > 0 || description) && !isGenerating && generateRecords.length === 0) {
      generateImage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, keywords.length, description]);

  // 下载图片
  const downloadImage = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-image-${dayjs().format('YYYY-MM-DD-HHmmss')}-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
      alert('下载失败，请重试');
    }
  };

  return (
    <div className="min-h-screen relative pt-16" style={{ backgroundColor: 'var(--bg-100)' }}>
      <LoginReminderModal open={showLoginModal} onOpenChange={setShowLoginModal} />
      
      <div className="mx-auto px-4 py-6" style={{ maxWidth: '1200px' }}>
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-100">从浏览器插件生成图片</h1>
          <p className="text-sm text-gray-400 mt-1">
            {isGenerating ? '正在自动生成图片...' : generateRecords.length > 0 ? '生成完成' : '准备生成'}
          </p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200">
            <p className="font-medium">错误</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        )}

        {/* 生成状态 */}
        {isGenerating && generateRecords.length === 0 && (
          <div className="mb-6 p-4 bg-blue-900/50 border border-blue-500/50 rounded-lg">
            <div className="flex items-center gap-2 text-blue-200">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              <p>正在生成图片，请稍候...</p>
            </div>
          </div>
        )}

        {/* 生成结果 */}
        {generateRecords.length > 0 && (
          <div className="space-y-6">
            {generateRecords.map((record, index) => (
              <div
                key={record.id}
                className="group relative p-6 bg-gradient-to-br from-gray-900/80 via-gray-800/90 to-black/80 backdrop-blur-sm text-gray-100 rounded-2xl shadow-2xl border border-gray-700/50 hover:border-cyan-500/50 hover:shadow-cyan-500/20 transition-all duration-500 hover:scale-[1.02]"
              >
                {/* 批次编号标识 */}
                {generateRecords.length > 1 && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg z-10">
                    第 {index + 1} 张
                  </div>
                )}
                
                {/* 科技感装饰边框 */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent pointer-events-none"></div>
                
                {/* 内容区域 */}
                <div className="text-center">
                  {record.error ? (
                    <div className="text-red-400 py-8">
                      <div className="text-4xl mb-4">⚠️</div>
                      <p className="text-lg font-medium">生成失败</p>
                    </div>
                  ) : (
                    <div className="relative inline-block">
                      <img
                        src={record.imageUrl}
                        alt={`Generated image ${index + 1}`}
                        className="max-w-full h-auto rounded-lg shadow-xl"
                        style={{ maxHeight: '80vh' }}
                      />
                    </div>
                  )}
                </div>

                {/* 底部操作栏 */}
                {record.imageUrl && !record.error && (
                  <div className="flex items-end justify-between mt-6 pt-4 border-t border-gray-600/50">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                      <span>{dayjs(record.createdAt).format('MM-DD HH:mm')}</span>
                      <span className="text-gray-500 text-xs ml-2">以上图片由AI 生成，仅供学习交流</span>
                    </div>
                    <div className="flex items-center gap-3 relative z-10">
                      <Button 
                        variant="outline" 
                        size="default"
                        className="bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-600/50 hover:to-blue-600/50 border-cyan-400/70 text-white hover:text-cyan-100 shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 relative z-20 flex items-center gap-2" 
                        onClick={() => downloadImage(record.imageUrl, index)}
                      >
                        <Download className="w-4 h-4" />
                        下载图片
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 完成提示 */}
        {!isGenerating && generateRecords.length > 0 && !error && (
          <div className="mt-6 p-4 bg-green-900/50 border border-green-500/50 rounded-lg text-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <p className="font-medium">✓ 生成完成！</p>
            </div>
            <p className="text-sm mt-1">
              共生成 {generateRecords.filter(r => !r.error && r.imageUrl).length} 张图片
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

