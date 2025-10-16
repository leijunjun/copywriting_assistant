"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from '../../../../navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, Image as ImageIcon, Sparkles, HelpCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth/auth-context';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { useIndustryPresets } from '@/hooks/useIndustryPresets';
import { LoginReminderModal } from '@/components/ui/login-reminder-modal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { validateFormData, sanitizeFormData, requestRateLimiter } from '@/lib/security/frontend-validation';

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

export default function AIImageGenerationPage() {
  const router = useRouter();
  const { authState } = useAuth();
  const { isAuthenticated, credits } = authState;
  const { withAuthCheck, showLoginModal, setShowLoginModal } = useAuthCheck();
  const { getFieldPresets, userIndustry } = useIndustryPresets();

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
  const [creditCost, setCreditCost] = useState(10); // 临时硬编码，应该从数据库获取
  const [isDownloading, setIsDownloading] = useState(false);
  const [showStylePreview, setShowStylePreview] = useState(false);

  // 获取角色预设选项
  const rolePresets = getFieldPresets('xiaohongshu-post-generation', 'role') || [];

  // 处理预设选项点击
  const handlePresetClick = (presetText: string) => {
    setFormData(prev => ({
      ...prev,
      subject: presetText
    }));
  };

  // 根据尺寸比例计算预览容器的样式
  const getPreviewContainerStyle = () => {
    if (!formData.size) return {};
    
    const aspectRatios: Record<string, string> = {
      '1:1': 'aspect-square',
      '4:3': 'aspect-[4/3]',
      '3:2': 'aspect-[3/2]',
      '3:4': 'aspect-[3/4]',
      '2:3': 'aspect-[2/3]',
      '16:9': 'aspect-video',
      '9:16': 'aspect-[9/16]',
      '21:9': 'aspect-[21/9]'
    };
    
    return {
      className: aspectRatios[formData.size] || 'aspect-square'
    };
  };

  // 获取积分成本
  useEffect(() => {
    const fetchCreditCost = async () => {
      try {
        console.log('🔄 正在获取积分成本...');
        // 使用新的简化API
        const response = await fetch('/api/credits/image-cost');
        console.log('📡 API响应状态:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📊 API返回数据:', data);
          
          if (data.success && data.cost) {
            console.log('✅ 设置积分成本:', data.cost);
            setCreditCost(data.cost);
          } else {
            console.warn('⚠️ API返回数据格式不正确:', data);
            // 如果API失败，使用硬编码值
            setCreditCost(10);
          }
        } else {
          console.error('❌ API请求失败:', response.status, response.statusText);
          // 如果API失败，使用硬编码值
          setCreditCost(10);
        }
      } catch (error) {
        console.error('❌ 获取积分成本失败:', error);
        // 如果API失败，使用硬编码值
        setCreditCost(10);
      }
    };

    fetchCreditCost();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerate = async () => {
    // 1. 获取行业预设
    const backgroundPresets = getFieldPresets('ai-image-generation', 'background') || [];
    const subjectPresets = getFieldPresets('ai-image-generation', 'subject') || [];
    const mainTitlePresets = getFieldPresets('ai-image-generation', 'mainTitle') || [];
    const subtitlePresets = getFieldPresets('ai-image-generation', 'subtitle') || [];

    // 2. 如果字段为空，使用行业预设
    const finalFormData = {
      background: formData.background || (backgroundPresets.length > 0 ? backgroundPresets[0].chinese : '温馨的家庭环境'),
      subject: formData.subject || (subjectPresets.length > 0 ? subjectPresets[0].chinese : '专业服务人员'),
      mainTitle: formData.mainTitle || (mainTitlePresets.length > 0 ? mainTitlePresets[0].chinese : '专业服务'),
      subtitle: formData.subtitle || (subtitlePresets.length > 0 ? subtitlePresets[0].chinese : '用心服务，值得信赖'),
      style: formData.style || '高级极简',
      size: formData.size || '1:1'
    };

    // 3. 安全验证：检查请求频率
    const userId = authState.user?.id || 'anonymous';
    if (!requestRateLimiter.canMakeRequest(userId, 3, 60000)) { // 1分钟内最多3次请求
      toast({
        title: "请求过于频繁",
        description: "请稍后再试，避免频繁请求",
        variant: "destructive"
      });
      return;
    }

    // 4. 表单数据安全验证
    const formValidation = validateFormData(finalFormData);
    if (!formValidation.isValid) {
      toast({
        title: "输入内容不安全",
        description: formValidation.error,
        variant: "destructive"
      });
      return;
    }

    // 5. 清理表单数据
    const sanitizedFormData = sanitizeFormData(finalFormData);

    // 使用withAuthCheck包装生成逻辑
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
            background: sanitizedFormData.background,
            subject: sanitizedFormData.subject,
            mainTitle: sanitizedFormData.mainTitle,
            subtitle: sanitizedFormData.subtitle,
            style: sanitizedFormData.style || '高级极简',
            size: sanitizedFormData.size || '1:1'
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
    if (isDownloading) return; // 防止重复下载
    
    setIsDownloading(true);
    
    try {
      // 显示下载开始提示
      toast({
        title: "开始下载",
        description: "正在准备图片文件...",
      });

      // 获取图片数据
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }
      
      const blob = await response.blob();
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-generated-image-${Date.now()}.png`;
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 清理临时URL
      window.URL.revokeObjectURL(url);
      
      // 显示下载成功提示
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
      <div className="container mx-auto px-4">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* 左侧：图片预览区域 */}
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-xl font-bold text-gray-800">
                  <div className="flex items-center">
                    <ImageIcon className="w-6 h-6 mr-2 text-purple-600" />
                    图片预览
                  </div>
                  {formData.size && (
                    <Badge variant="outline" className="text-sm">
                      {formData.size}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 ${getPreviewContainerStyle().className || 'aspect-square'}`}>
                  {currentImage ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={currentImage} 
                        alt="Generated image"
                        className="w-full h-full object-contain"
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
                  ) : isGenerating ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <Loader2 className="w-16 h-16 mb-4 animate-spin text-purple-600" />
                      <p className="text-lg font-medium text-purple-600">AI 思考中...</p>
                      <p className="text-sm">正在生成您的专属图片</p>
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
                      disabled={isDownloading}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <p className="text-xs text-amber-600 mt-2 text-center">
                      ⚠️ 图片为临时文件，请及时下载保存！
                    </p>
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
                    <div className="flex items-center justify-between">
                      <Label htmlFor="background" className="text-sm font-medium text-gray-700">
                        图片背景
                      </Label>
                      <div className="w-20 h-8"></div>
                    </div>
                    <Input
                      id="background"
                      placeholder="所处的环境（例如：办公室）"
                      value={formData.background}
                      onChange={(e) => handleInputChange('background', e.target.value)}
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
                        图片主体
                      </Label>
                      {rolePresets.length > 0 && (
                        <Select onValueChange={(value) => handlePresetClick(value)}>
                          <SelectTrigger className="w-auto h-8 text-xs border-purple-200 focus:border-purple-500 focus:ring-purple-500">
                            <SelectValue placeholder="选择角色" />
                          </SelectTrigger>
                          <SelectContent>
                            {rolePresets.map((preset, index) => (
                              <SelectItem key={index} value={preset.chinese} className="text-xs">
                                {preset.chinese}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <Input
                      id="subject"
                      placeholder="图片的主要人物或物体"
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
                      主标题
                    </Label>
                    <Input
                      id="mainTitle"
                      placeholder="建议 4-8字"
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
                      placeholder="主标题解释文字，建议 10-20 字"
                      value={formData.subtitle}
                      onChange={(e) => handleInputChange('subtitle', e.target.value)}
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* 第三行：风格和尺寸选择 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium text-gray-700">
                        风格
                      </Label>
                      <Dialog open={showStylePreview} onOpenChange={setShowStylePreview}>
                        <DialogTrigger asChild>
                          <button
                            type="button"
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            onClick={() => setShowStylePreview(true)}
                          >
                            <HelpCircle className="w-4 h-4" />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>风格效果预览</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <img 
                              src="/demo.png" 
                              alt="风格效果预览" 
                              className="w-full h-auto rounded-lg border"
                            />
                            <p className="text-sm text-gray-600 text-center">
                              图片效果仅供示意参考，具体以 AI 创作为准
                            </p>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
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
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium text-gray-700">
                        尺寸
                      </Label>
                    </div>
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
                          {creditCost} 积分/张
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
