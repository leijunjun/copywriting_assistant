"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageIcon, Edit, ExternalLink } from 'lucide-react';
import { ImageEditorModal } from '@/components/image/ImageEditorModal';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function ImageEditorTestPage() {
  const [imageUrl, setImageUrl] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // 预设测试图片
  const presetImages = [
    {
      name: '示例图片1',
      url: 'https://scaleflex.airstore.io/demo/stephen-walker-unsplash.jpg'
    },
    {
      name: '示例图片2', 
      url: 'https://scaleflex.airstore.io/demo/unsplash.jpg'
    }
  ];

  const handleOpenEditor = () => {
    if (!imageUrl.trim()) {
      alert('请输入图片URL');
      return;
    }
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
  };

  const handleSave = (editedImageObject: any, designState: any) => {
    console.log('图片已保存:', editedImageObject);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* 页面标题 */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl font-bold text-gray-800">
                <ImageIcon className="w-8 h-8 mr-3 text-purple-600" />
                图片编辑器测试页面
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                此页面用于测试图片编辑器的集成效果，与正式功能使用完全相同的编辑器组件。
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-sm">裁剪功能</Badge>
                <Badge variant="outline" className="text-sm">文本添加</Badge>
                <Badge variant="outline" className="text-sm">图片添加</Badge>
              </div>
            </CardContent>
          </Card>

          {/* 图片URL输入区 */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">
                测试图片设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="imageUrl" className="text-sm font-medium text-gray-700">
                  图片URL
                </Label>
                <Input
                  id="imageUrl"
                  placeholder="请输入图片URL或选择预设图片"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* 预设图片按钮 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  预设测试图片
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {presetImages.map((preset, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => setImageUrl(preset.url)}
                      className="justify-start text-left h-auto p-3"
                    >
                      <div>
                        <div className="font-medium">{preset.name}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {preset.url}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* 打开编辑器按钮 */}
              <div className="pt-4">
                <Button
                  onClick={handleOpenEditor}
                  disabled={!imageUrl.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  打开图片编辑器
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 功能说明 */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">
                编辑器功能说明
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">已启用功能</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• 图片裁剪 (多种比例预设)</li>
                    <li>• 文本添加和编辑</li>
                    <li>• 图片叠加</li>
                    <li>• 基础调整工具</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">使用说明</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• 编辑完成后点击保存</li>
                    <li>• 图片将自动下载到本地</li>
                    <li>• 支持多种图片格式</li>
                    <li>• 编辑器为全屏模态界面</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 返回链接 */}
          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="text-gray-600"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              返回上一页
            </Button>
          </div>
        </div>
      </div>

      {/* 图片编辑器模态弹窗 */}
      {isEditorOpen && (
        <ErrorBoundary>
          <ImageEditorModal
            imageUrl={imageUrl}
            onClose={handleCloseEditor}
            onSave={handleSave}
          />
        </ErrorBoundary>
      )}
    </div>
  );
}
