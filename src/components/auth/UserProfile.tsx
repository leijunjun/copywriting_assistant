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
    email: string;
    nickname: string;
    avatar_url: string;
    industry?: string;
    created_at: string;
    updated_at: string;
  };
  onLogout: () => void;
  className?: string;
}


export function UserProfile({ user, onLogout, className }: UserProfileProps) {
  const t = useTranslations('Common');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };


  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>
          {t('profile')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16 border-2">
            <AvatarImage
              src={user.avatar_url || '/default-avatar.png'}
              alt={user.nickname}
            />
            <AvatarFallback>
              {user.nickname.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{user.nickname}</h3>
            <p className="text-sm text-muted-foreground">
              {t('memberSince')} {formatDate(user.created_at)}
            </p>
          </div>
        </div>

        {/* 账户信息区域 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 mb-2">{t('accountStatus')}</p>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                {t('active')}
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 mb-2">{t('accountType')}</p>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                {t('emailAccount')}
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 mb-2">{t('industry')}</p>
              {(() => {
                const getIndustryStyle = () => {
                  if (!user.industry || user.industry === 'general') {
                    return {
                      bgColor: 'bg-gray-100',
                      textColor: 'text-gray-800',
                      dotColor: 'bg-gray-500'
                    };
                  }
                  
                  if (user.industry === 'housekeeping') {
                    return {
                      bgColor: 'bg-green-100',
                      textColor: 'text-green-800',
                      dotColor: 'bg-green-500'
                    };
                  }
                  
                  if (user.industry === 'beauty') {
                    return {
                      bgColor: 'bg-pink-100',
                      textColor: 'text-pink-800',
                      dotColor: 'bg-pink-500'
                    };
                  }
                  
                  return {
                    bgColor: 'bg-purple-100',
                    textColor: 'text-purple-800',
                    dotColor: 'bg-purple-500'
                  };
                };
                
                const style = getIndustryStyle();
                const industryName = (() => {
                  if (!user.industry || user.industry === 'general') {
                    return t('general');
                  }
                  
                  const industryNames = {
                    housekeeping: t('housekeeping'),
                    beauty: t('beauty')
                  };
                  
                  return industryNames[user.industry as keyof typeof industryNames] || t('general');
                })();
                
                return (
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${style.bgColor} ${style.textColor}`}>
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
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-700">{t('joinDate')}</p>
            <p className="text-lg font-bold text-blue-900">
              {formatDate(user.created_at)}
            </p>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-sm font-medium text-purple-700">{t('lastActive')}</p>
            <p className="text-lg font-bold text-purple-900">
              {formatDate(user.updated_at)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default UserProfile;
