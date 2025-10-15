/**
 * 积分调整表单组件
 * 
 * 用于管理员调整会员积分
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditAdjustmentRequest } from '@/types/admin';
import { Search, User, Mail } from 'lucide-react';

interface CreditAdjustmentFormProps {
  userId?: string;
  userEmail?: string;
  currentBalance?: number;
  onSuccess?: () => void;
  className?: string;
}

interface User {
  id: string;
  email: string;
  nickname: string;
  industry: string;
  created_at: string;
  last_login_at: string | null;
}

export function CreditAdjustmentForm({ 
  userId, 
  userEmail, 
  currentBalance = 0,
  onSuccess,
  className 
}: CreditAdjustmentFormProps) {
  const [formData, setFormData] = useState({
    user_id: userId || '',
    amount: '',
    description: '',
    operation_type: 'add' as 'add' | 'subtract',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 用户搜索相关状态
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // 点击外部区域关闭搜索结果
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-search-container')) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const requestData: CreditAdjustmentRequest = {
        user_id: formData.user_id,
        amount: parseInt(formData.amount),
        description: formData.description,
        operation_type: formData.operation_type,
      };

      const response = await fetch('/api/admin/credits/adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (result.success) {
        alert('积分调整成功！');
        setFormData({
          user_id: '',
          amount: '',
          description: '',
          operation_type: 'add',
        });
        onSuccess?.();
      } else {
        setError(result.error?.message || '操作失败');
      }
    } catch (error) {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 用户搜索功能
  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(`/api/admin/users/search?q=${encodeURIComponent(query)}&limit=10`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.users || []);
        setShowSearchResults(true);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('搜索用户失败:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // 处理搜索输入变化
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.length >= 2) {
      searchUsers(value);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  // 选择用户
  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setFormData(prev => ({
      ...prev,
      user_id: user.id,
    }));
    setSearchQuery(user.email);
    setShowSearchResults(false);
  };

  // 清除选择
  const handleClearSelection = () => {
    setSelectedUser(null);
    setFormData(prev => ({
      ...prev,
      user_id: '',
    }));
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const calculateNewBalance = () => {
    if (!formData.amount) return currentBalance;
    const amount = parseInt(formData.amount) || 0;
    const adjustment = formData.operation_type === 'add' ? amount : -amount;
    return currentBalance + adjustment;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>积分调整</CardTitle>
        <CardDescription>
          调整会员积分余额，请谨慎操作
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 用户信息显示 */}
          {userEmail && (
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>用户邮箱:</strong> {userEmail}
              </p>
              <p className="text-sm text-gray-600">
                <strong>当前余额:</strong> {currentBalance.toLocaleString()} 积分
              </p>
            </div>
          )}

          {/* 用户搜索 */}
          {!userId && (
            <div className="space-y-2">
              <Label htmlFor="user_search">选择用户 *</Label>
              <div className="relative user-search-container">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="user_search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="输入邮箱或昵称搜索用户..."
                    className="pl-10 pr-10"
                    required
                  />
                  {selectedUser && (
                    <button
                      type="button"
                      onClick={handleClearSelection}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  )}
                </div>
                
                {/* 搜索结果下拉列表 */}
                {showSearchResults && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {searchLoading ? (
                      <div className="p-3 text-center text-gray-500">
                        搜索中...
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => handleUserSelect(user)}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {user.email}
                                </p>
                              </div>
                              <p className="text-sm text-gray-500 truncate">
                                {user.nickname} • {user.industry}
                              </p>
                              <p className="text-xs text-gray-400">
                                注册时间: {new Date(user.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : searchQuery.length >= 2 ? (
                      <div className="p-3 text-center text-gray-500">
                        未找到匹配的用户
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
              
              {/* 已选择的用户信息 */}
              {selectedUser && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      已选择用户: {selectedUser.email}
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">
                    {selectedUser.nickname} • {selectedUser.industry}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 操作类型 */}
          <div className="space-y-2">
            <Label>操作类型 *</Label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="operation_type"
                  value="add"
                  checked={formData.operation_type === 'add'}
                  onChange={(e) => handleInputChange('operation_type', e.target.value)}
                  className="mr-2"
                />
                增加积分
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="operation_type"
                  value="subtract"
                  checked={formData.operation_type === 'subtract'}
                  onChange={(e) => handleInputChange('operation_type', e.target.value)}
                  className="mr-2"
                />
                扣减积分
              </label>
            </div>
          </div>

          {/* 积分金额 */}
          <div className="space-y-2">
            <Label htmlFor="amount">积分金额 *</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="请输入积分金额"
              required
            />
          </div>

          {/* 操作说明 */}
          <div className="space-y-2">
            <Label htmlFor="description">操作说明 *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="请输入操作说明，如：充值奖励、违规扣减等"
              rows={3}
              required
            />
          </div>

          {/* 余额预览 */}
          {formData.amount && (
            <div className="p-3 bg-blue-50 rounded-md">
              <p className="text-sm">
                <strong>调整后余额:</strong> {calculateNewBalance().toLocaleString()} 积分
              </p>
              {calculateNewBalance() < 0 && (
                <p className="text-sm text-red-600 mt-1">
                  警告：调整后余额将为负数！
                </p>
              )}
            </div>
          )}

          {/* 错误信息 */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 提交按钮 */}
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={loading || !formData.user_id || !formData.amount || !formData.description}
              className="flex-1"
            >
              {loading ? '处理中...' : '确认调整'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData({
                  user_id: userId || '',
                  amount: '',
                  description: '',
                  operation_type: 'add',
                });
                setError('');
              }}
            >
              重置
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
