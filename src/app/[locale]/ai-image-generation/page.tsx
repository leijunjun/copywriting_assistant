"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from '../../../../navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, Image as ImageIcon, Sparkles } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth/auth-context';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { LoginReminderModal } from '@/components/ui/login-reminder-modal';

// 风格选项
const STYLE_OPTIONS = [
  { value: 'realistic', label: '写实风格' },
  { value: 'cartoon', label: '卡通风格' },
  { value: 'anime', label: '动漫风格' },
  { value: 'watercolor', label: '水彩风格' },
  { value: 'oil-painting', label: '油画风格' },
  { value: 'sketch', label: '素描风格' },
  { value: 'minimalist', label: '极简风格' },
  { value: 'vintage', label: '复古风格' }
];

// 尺寸选项
const SIZE_OPTIONS = [
  { value: '1:1', label: '1:1 (正方形)' },
  { value: '4:3', label: '4:3 (横屏)' },
  { value: '3:4', label: '3:4 (竖屏)' },
  { value: '16:9', label: '16:9 (宽屏)' },
  { value: '9:16', label: '9:16 (竖屏宽屏)' }
];

export default function AIImageGenerationPage() {
  const router = useRouter();
  const { authState } = useAuth();
  const { isAuthenticated, credits } = authState;
  const { withAuthCheck, showLoginModal, setShowLoginModal } = useAuthCheck();

  const [formData, setFormData] = useState({
    background: '',
    subject: '',
    mainTitle: '',
    subtitle: '',
    style: '',
    size: ''
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);


  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerate = async () => {
    // 验证必填字段
    if (!formData.background || !formData.subject || !formData.mainTitle) {
      toast({
        title: "请填写必填信息",
        description: "图片背景、图片主体和主标题为必填项",
        variant: "destructive"
      });
      return;
    }

    // 使用withAuthCheck包装生成逻辑
    withAuthCheck(async () => {
      if (!credits || credits.balance < 50) {
        toast({
          title: "积分不足",
          description: "生成图片需要50积分，请先充值",
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
            background: formData.background,
            subject: formData.subject,
            mainTitle: formData.mainTitle,
            subtitle: formData.subtitle,
            style: formData.style || 'realistic',
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

  const handleDownload = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `ai-generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentImage = generatedImages[currentImageIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pt-16">
      <div className="container mx-auto px-4">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* 左侧：图片预览区域 */}
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                  <ImageIcon className="w-6 h-6 mr-2 text-purple-600" />
                  图片预览
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200">
                  {currentImage ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={currentImage} 
                        alt="Generated image"
                        className="w-full h-full object-cover"
                      />
                      {/* 图片上的标题覆盖层 */}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 max-w-xs">
                        <h3 className="font-bold text-lg text-gray-800 mb-1">
                          {formData.mainTitle}
                        </h3>
                        {formData.subtitle && (
                          <p className="text-sm text-gray-600">
                            {formData.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <ImageIcon className="w-16 h-16 mb-4" />
                      <p className="text-lg font-medium">暂无图片</p>
                      <p className="text-sm">填写表单后点击生成按钮</p>
                    </div>
                  )}
                </div>

                {/* 图片导航点 */}
                {generatedImages.length > 1 && (
                  <div className="flex justify-center space-x-2 mt-4">
                    {generatedImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentImageIndex 
                            ? 'bg-purple-600' 
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* 下载按钮 */}
                {currentImage && (
                  <div className="mt-4">
                    <Button
                      onClick={() => handleDownload(currentImage)}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      下载图片
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右侧：表单区域 */}
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                  <Sparkles className="w-6 h-6 mr-2 text-purple-600" />
                  AI 出图设置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 第一行：图片背景和图片主体 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="background" className="text-sm font-medium text-gray-700">
                      图片背景 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="background"
                      placeholder="描述图片的背景环境"
                      value={formData.background}
                      onChange={(e) => handleInputChange('background', e.target.value)}
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
                      图片主体 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="subject"
                      placeholder="描述图片的主要人物或物体"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* 第二行：主标题和小标题 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mainTitle" className="text-sm font-medium text-gray-700">
                      主标题 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="mainTitle"
                      placeholder="输入主标题文字"
                      value={formData.mainTitle}
                      onChange={(e) => handleInputChange('mainTitle', e.target.value)}
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subtitle" className="text-sm font-medium text-gray-700">
                      小标题
                    </Label>
                    <Input
                      id="subtitle"
                      placeholder="输入小标题文字（可选）"
                      value={formData.subtitle}
                      onChange={(e) => handleInputChange('subtitle', e.target.value)}
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* 第三行：风格和尺寸选择 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      风格
                    </Label>
                    <Select value={formData.style} onValueChange={(value) => handleInputChange('style', value)}>
                      <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                        <SelectValue placeholder="选择画面风格" />
                      </SelectTrigger>
                      <SelectContent>
                        {STYLE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      尺寸
                    </Label>
                    <Select value={formData.size} onValueChange={(value) => handleInputChange('size', value)}>
                      <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                        <SelectValue placeholder="选择宽高比" />
                      </SelectTrigger>
                      <SelectContent>
                        {SIZE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 生成按钮 */}
                <div className="pt-4">
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        AI 出图
                        <Badge variant="secondary" className="ml-2 bg-white/20 text-white">
                          50 积分/张
                        </Badge>
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* 登录提醒弹窗 */}
      <LoginReminderModal 
        open={showLoginModal} 
        onOpenChange={setShowLoginModal} 
      />
    </div>
  );
}
