/**
 * 新增会员页面
 * 
 * 管理员创建新会员账号
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { identifyAuthType } from '@/lib/utils/auth-identifier';

interface CreateMemberForm {
  email: string;
  password: string;
  nickname: string;
  industry: string;
}

const industryOptions = [
  { value: 'general', label: '通用' },
  { value: 'housekeeping', label: '家政服务' },
  { value: 'beauty', label: '医疗美容' },
  { value: 'lifestyle-beauty', label: '生活美容' },
  { value: 'makeup', label: '美妆' },
  { value: 'yituihuo', label: '一推火' },
];

export default function CreateMemberPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<CreateMemberForm>({
    email: '',
    password: '',
    nickname: '',
    industry: '',
  });

  const handleInputChange = (field: keyof CreateMemberForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate identifier (email or phone)
    const authType = identifyAuthType(formData.email);
    if (!authType) {
      toast({
        title: '验证失败',
        description: '请输入有效的邮箱地址或手机号',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch('/api/admin/members/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: '创建成功',
          description: '会员创建成功！',
        });
        router.push('/admin/members');
      } else {
        // 提取错误消息
        const errorMessage = data.error?.message || data.error || '创建失败，请重试';
        console.error('创建会员失败:', {
          status: response.status,
          error: data.error,
          fullResponse: data,
        });
        toast({
          title: '创建失败',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('创建会员异常:', error);
      toast({
        title: '创建失败',
        description: error instanceof Error ? error.message : '创建失败，请重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.email && formData.password && formData.nickname && formData.industry;

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>返回</span>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">新增会员</h1>
          <p className="text-gray-600">创建新的会员账号</p>
        </div>
      </div>

      {/* 表单 */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5" />
            <span>会员信息</span>
          </CardTitle>
          <CardDescription>
            填写会员的基本信息，系统将自动为新用户分配初始积分
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 邮箱/手机号 */}
            <div className="space-y-2">
              <Label htmlFor="email">邮箱/手机号 *</Label>
              <Input
                id="email"
                type="text"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="请输入邮箱地址或手机号"
                required
                autoComplete="username"
              />
              <p className="text-sm text-gray-500">
                邮箱或手机号将作为用户的登录账号
              </p>
            </div>

            {/* 密码 */}
            <div className="space-y-2">
              <Label htmlFor="password">登录密码 *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="请输入登录密码"
                  required
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-sm text-gray-500">
                密码长度至少6位字符
              </p>
            </div>

            {/* 昵称 */}
            <div className="space-y-2">
              <Label htmlFor="nickname">昵称 *</Label>
              <Input
                id="nickname"
                type="text"
                value={formData.nickname}
                onChange={(e) => handleInputChange('nickname', e.target.value)}
                placeholder="请输入用户昵称"
                required
                autoComplete="name"
              />
              <p className="text-sm text-gray-500">
                昵称将显示在用户界面中
              </p>
            </div>

            {/* 行业 */}
            <div className="space-y-2">
              <Label htmlFor="industry">所属行业 *</Label>
              <Select
                value={formData.industry}
                onValueChange={(value) => handleInputChange('industry', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择所属行业" />
                </SelectTrigger>
                <SelectContent>
                  {industryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                选择行业将影响用户可用的AI工具和内容
              </p>
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid || loading}
                className="flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>创建中...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>创建会员</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 说明信息 */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-lg">创建说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <p className="text-sm text-gray-700">
                <strong>初始积分：</strong>新用户将自动获得 10 积分作为注册奖励
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <p className="text-sm text-gray-700">
                <strong>账号状态：</strong>创建的账号将立即生效，用户可以使用邮箱/手机号和密码登录
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
            <div>
              <p className="text-sm text-gray-700">
                <strong>行业选择：</strong>不同行业将提供不同的AI工具和内容模板
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
