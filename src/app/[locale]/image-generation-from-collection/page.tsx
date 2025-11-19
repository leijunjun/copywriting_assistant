"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, Image as ImageIcon, Sparkles, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth/auth-context';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { LoginReminderModal } from '@/components/ui/login-reminder-modal';

// 风格选项
const STYLE_OPTIONS = [
  { value: '高级极简', label: '高级极简' },
  { value: '几何向量', label: '几何向量' },
  { value: '剪贴报拼接', label: '剪贴报拼接' },
  { value: '融合（剪贴报+几何）', label: '融合（剪贴报+几何）' },
  { value: '正面特写', label: '正面特写' },
  { value: '时尚杂志', label: '时尚杂志' },
  { value: '转发海报', label: '转发海报' },
  { value: '多文列表', label: '多文列表' },
  { value: '网格大文本', label: '网格大文本' }
];

// 尺寸选项
const SIZE_OPTIONS = [
  { value: '1:1', label: '1:1 (正方形)' },
  { value: '4:3', label: '4:3 (横屏)' },
  { value: '3:4', label: '3:4 (竖屏)' },
  { value: '16:9', label: '16:9 (宽屏)' },
  { value: '9:16', label: '9:16 (竖屏宽屏)' }
];

export default function ImageGenerationFromCollectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authState } = useAuth();
  const { isAuthenticated, credits } = authState;
  const { withAuthCheck, showLoginModal, setShowLoginModal } = useAuthCheck();

  // 从 URL 参数获取数据
  const imageUrl = searchParams.get('imageUrl') || '';
  const originalDescription = searchParams.get('description') || '';
  const keywordsParam = searchParams.get('keywords') || '[]';

  const [keywords, setKeywords] = useState<string[]>([]);
  const [editedKeywords, setEditedKeywords] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    background: '',
    subject: '',
    mainTitle: '',
    subtitle: '',
    style: '高级极简',
    size: '1:1'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [creditCost, setCreditCost] = useState(5);
  const [isDownloading, setIsDownloading] = useState(false);

  // 初始化关键词
  useEffect(() => {
    try {
      const parsedKeywords = JSON.parse(keywordsParam);
      if (Array.isArray(parsedKeywords)) {
        setKeywords(parsedKeywords);
        setEditedKeywords(parsedKeywords);
      }
    } catch (error) {
      console.error('Failed to parse keywords:', error);
    }
  }, [keywordsParam]);

  // 从关键词构建表单数据
  useEffect(() => {
    if (editedKeywords.length > 0) {
      // 将关键词组合成 subject
      const subjectText = editedKeywords.join('，');
      setFormData(prev => ({
        ...prev,
        subject: subjectText
      }));
    }
  }, [editedKeywords]);

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

  // 编辑关键词
  const handleKeywordEdit = (index: number, value: string) => {
    const newKeywords = [...editedKeywords];
    newKeywords[index] = value;
    setEditedKeywords(newKeywords);
  };

  // 删除关键词
  const handleKeywordDelete = (index: number) => {
    const newKeywords = editedKeywords.filter((_, i) => i !== index);
    setEditedKeywords(newKeywords);
  };

  // 添加关键词
  const handleKeywordAdd = () => {
    setEditedKeywords([...editedKeywords, '']);
  };

  // 生成图片
  const handleGenerate = async () => {
    if (!formData.subject.trim()) {
      toast({
        title: "提示",
        description: "请至少填写一个关键词",
        variant: "destructive"
      });
      return;
    }

    withAuthCheck(async () => {
      if (!credits || credits.balance < creditCost) {
        toast({
          title: "积分不足",
          description: `生成图片需要${creditCost}积分，当前余额${credits?.balance || 0}积分，请先充值`,
          variant: "destructive"
        });
        return;
      }

      setIsGenerating(true);

      try {
        const response = await fetch('/api/generateImage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            background: formData.background || editedKeywords.join('，'),
            subject: formData.subject,
            mainTitle: formData.mainTitle || editedKeywords[0] || '',
            subtitle: formData.subtitle || editedKeywords.slice(1).join('，') || '',
            style: formData.style || '高级极简',
            size: formData.size || '1:1'
          }),
        });

        if (!response.ok) {
          throw new Error('生成失败');
        }

        const data = await response.json();
        
        if (data.success && data.images) {
          setGeneratedImages(data.images);
          setCurrentImageIndex(0);
          toast({
            title: "生成成功",
            description: "图片已生成完成",
          });
        } else {
          throw new Error(data.message || '生成失败');
        }
      } catch (error) {
        console.error('生成图片失败:', error);
        toast({
          title: "生成失败",
          description: "请稍后重试或联系客服",
          variant: "destructive"
        });
      } finally {
        setIsGenerating(false);
      }
    }, window.location.pathname + window.location.search);
  };

  const handleDownload = async (imageUrl: string) => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    
    try {
      toast({
        title: "开始下载",
        description: "正在准备图片文件...",
      });

      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-generated-image-${Date.now()}.png`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "下载成功",
        description: "图片已保存到本地",
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "下载失败",
        description: "请稍后重试或联系客服",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const currentImage = generatedImages[currentImageIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">图片仿制生成</h1>
            <p className="text-gray-600">基于采集的图片，修改关键词后生成新图片</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左侧：原图预览和关键词编辑 */}
            <div className="space-y-6">
              {/* 原图预览 */}
              {imageUrl && (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                      <ImageIcon className="w-6 h-6 mr-2 text-purple-600" />
                      采集的原图
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={imageUrl}
                        alt="采集的原图"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 关键词编辑 */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                    <Sparkles className="w-6 h-6 mr-2 text-purple-600" />
                    关键词编辑
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      提取的关键词（可编辑）
                    </Label>
                    <div className="space-y-2">
                      {editedKeywords.map((keyword, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={keyword}
                            onChange={(e) => handleKeywordEdit(index, e.target.value)}
                            placeholder={`关键词 ${index + 1}`}
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleKeywordDelete(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={handleKeywordAdd}
                        className="w-full"
                      >
                        + 添加关键词
                      </Button>
                    </div>
                  </div>

                  {/* 原始描述 */}
                  {originalDescription && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        AI 分析描述
                      </Label>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 max-h-40 overflow-y-auto">
                        {originalDescription}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 右侧：生成表单和结果 */}
            <div className="space-y-6">
              {/* 生成表单 */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-xl font-bold text-gray-800">
                    <div className="flex items-center">
                      <Sparkles className="w-6 h-6 mr-2 text-purple-600" />
                      生成设置
                    </div>
                    <Badge variant="outline" className="text-sm">
                      消耗 {creditCost} 积分
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      特点
                    </Label>
                    <Input
                      value={formData.background}
                      onChange={(e) => setFormData(prev => ({ ...prev, background: e.target.value }))}
                      placeholder="描述图片的特点或背景"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      讨论主体
                    </Label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="讨论的主体内容"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      主标题
                    </Label>
                    <Input
                      value={formData.mainTitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, mainTitle: e.target.value }))}
                      placeholder="主标题文字"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      副标题
                    </Label>
                    <Input
                      value={formData.subtitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                      placeholder="副标题文字"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      风格
                    </Label>
                    <select
                      value={formData.style}
                      onChange={(e) => setFormData(prev => ({ ...prev, style: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {STYLE_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      尺寸
                    </Label>
                    <select
                      value={formData.size}
                      onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {SIZE_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !formData.subject.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        生成图片
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* 生成结果 */}
              {currentImage && (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-xl font-bold text-gray-800">
                      <div className="flex items-center">
                        <ImageIcon className="w-6 h-6 mr-2 text-purple-600" />
                        生成结果
                      </div>
                      {generatedImages.length > 1 && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentImageIndex === 0}
                          >
                            上一张
                          </Button>
                          <span className="text-sm text-gray-600">
                            {currentImageIndex + 1} / {generatedImages.length}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentImageIndex(prev => Math.min(generatedImages.length - 1, prev + 1))}
                            disabled={currentImageIndex === generatedImages.length - 1}
                          >
                            下一张
                          </Button>
                        </div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
                      <img
                        src={currentImage}
                        alt="生成的图片"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <Button
                      onClick={() => handleDownload(currentImage)}
                      disabled={isDownloading}
                      className="w-full"
                      variant="outline"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          下载中...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          下载图片
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <LoginReminderModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={() => {
          setShowLoginModal(false);
          router.push('/login');
        }}
      />
    </div>
  );
}

