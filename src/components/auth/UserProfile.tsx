/**
 * User Profile Display Component
 * 
 * This component displays the current user's profile information.
 */

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface UserProfileProps {
  user: {
    id: string;
    email?: string | null;
    phone?: string | null;
    nickname: string;
    avatar_url: string;
    industry?: string;
    created_at: string;
    updated_at: string;
    last_login_at?: string;
  };
  onLogout: () => void;
  className?: string;
}


export function UserProfile({ user, onLogout, className }: UserProfileProps) {
  const t = useTranslations('Common');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // 手机号脱敏函数
  const maskPhone = (phone: string): string => {
    if (!phone) return '';
    // 如果是11位手机号，显示前3位和后4位，中间4位用*代替
    if (phone.length === 11 && /^1[3-9]\d{9}$/.test(phone)) {
      return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
    }
    // 其他长度的手机号，显示前3位和后2位
    if (phone.length >= 7) {
      return `${phone.slice(0, 3)}${'*'.repeat(phone.length - 5)}${phone.slice(-2)}`;
    }
    // 长度不足7位的，只显示前2位和后1位
    return `${phone.slice(0, 2)}${'*'.repeat(phone.length - 3)}${phone.slice(-1)}`;
  };

  // 格式化显示的联系方式
  const formatContact = (): string => {
    if (user.phone) {
      return maskPhone(user.phone);
    }
    if (user.email) {
      return user.email;
    }
    return '';
  };


  return (
    <Card className={`bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 ${className}`}>
      <CardContent className="space-y-6 p-6">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
              <AvatarImage
                src={user.avatar_url || '/default-avatar.png'}
                alt={user.nickname}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
                {user.nickname.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1 flex-wrap">
              <h3 className="font-bold text-xl text-gray-800">{user.nickname}</h3>
              {(user.phone || user.email) && (
                <>
                  <span className="text-gray-300">|</span>
                  <span className="text-sm text-gray-500">
                    {formatContact()}
                  </span>
                </>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2">
              {t('memberSince')} {formatDate(user.created_at)}
            </p>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-600">在线</span>
            </div>
          </div>
        </div>

        {/* 账户信息区域 */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-700 mb-2">{t('accountStatus')}</p>
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                {t('active')}
              </div>
            </div>
            
            <div className="text-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-700 mb-2">{t('accountType')}</p>
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                {user.phone ? t('phoneAccount') : t('emailAccount')}
              </div>
            </div>

            <div className="text-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-700 mb-2">{t('industry')}</p>
              {(() => {
                const getIndustryStyle = () => {
                  if (!user.industry || user.industry === 'general') {
                    return {
                      bgColor: 'bg-gradient-to-r from-gray-100 to-gray-200',
                      textColor: 'text-gray-800',
                      dotColor: 'bg-gray-500',
                      borderColor: 'border-gray-300'
                    };
                  }
                  
                  if (user.industry === 'housekeeping') {
                    return {
                      bgColor: 'bg-gradient-to-r from-green-100 to-green-200',
                      textColor: 'text-green-800',
                      dotColor: 'bg-green-500',
                      borderColor: 'border-green-300'
                    };
                  }
                  
                  if (user.industry === 'beauty') {
                    return {
                      bgColor: 'bg-gradient-to-r from-pink-100 to-pink-200',
                      textColor: 'text-pink-800',
                      dotColor: 'bg-pink-500',
                      borderColor: 'border-pink-300'
                    };
                  }
                  
                  if (user.industry === 'lifestyle-beauty') {
                    return {
                      bgColor: 'bg-gradient-to-r from-rose-100 to-rose-200',
                      textColor: 'text-rose-800',
                      dotColor: 'bg-rose-500',
                      borderColor: 'border-rose-300'
                    };
                  }
                  
                  if (user.industry === 'makeup') {
                    return {
                      bgColor: 'bg-gradient-to-r from-orange-100 to-orange-200',
                      textColor: 'text-orange-800',
                      dotColor: 'bg-orange-500',
                      borderColor: 'border-orange-300'
                    };
                  }
                  
                  return {
                    bgColor: 'bg-gradient-to-r from-purple-100 to-purple-200',
                    textColor: 'text-purple-800',
                    dotColor: 'bg-purple-500',
                    borderColor: 'border-purple-300'
                  };
                };
                
                const style = getIndustryStyle();
                const industryName = (() => {
                  if (!user.industry || user.industry === 'general') {
                    return t('general');
                  }
                  
                  const industryNames = {
                    housekeeping: t('housekeeping'),
                    beauty: t('beauty'),
                    'lifestyle-beauty': t('lifestyle-beauty'),
                    makeup: t('makeup')
                  };
                  
                  return industryNames[user.industry as keyof typeof industryNames] || t('general');
                })();
                
                return (
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${style.bgColor} ${style.textColor} border ${style.borderColor}`}>
                    <div className={`w-2 h-2 ${style.dotColor} rounded-full mr-2`}></div>
                    {industryName}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* 账户统计 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-300 group">
            <p className="text-sm font-semibold text-blue-700 mb-1">{t('joinDate')}</p>
            <p className="text-lg font-bold text-blue-900">
              {formatDate(user.created_at)}
            </p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-md transition-all duration-300 group">
            <p className="text-sm font-semibold text-purple-700 mb-1">{t('lastActive')}</p>
            <p className="text-lg font-bold text-purple-900">
              {user.last_login_at ? formatDate(user.last_login_at) : '从未登录'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default UserProfile;
