/**
 * User Profile Display Component
 * 
 * This component displays the current user's profile information.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { logger } from '@/lib/utils/logger';

interface UserProfileProps {
  user: {
    id: string;
    wechat_openid: string;
    wechat_unionid?: string;
    nickname: string;
    avatar_url: string;
    created_at: string;
    updated_at: string;
  };
  onLogout: () => void;
  className?: string;
}

interface UserProfileData {
  user: UserProfileProps['user'];
  credits: {
    balance: number;
    updated_at: string;
  };
}

export function UserProfile({ user, onLogout, className }: UserProfileProps) {
  const t = useTranslations('Common');
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfileData();
  }, [user.id]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/user/profile');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch profile data');
      }

      setProfileData({
        user: data.user,
        credits: data.credits,
      });

      logger.api('User profile data fetched successfully', {
        userId: user.id,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile data';
      setError(errorMessage);
      logger.error('Failed to fetch profile data', err, 'API');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (balance: number) => {
    if (balance < 20) {
      return <Badge variant="destructive">Low Balance</Badge>;
    } else if (balance < 100) {
      return <Badge variant="warning">Medium Balance</Badge>;
    } else {
      return <Badge variant="success">Good Balance</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-6">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <ErrorMessage message={error} />
          <Button onClick={fetchProfileData} variant="outline" size="sm" className="mt-2">
            {t('retry')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>{t('profile')}</span>
          {profileData && getStatusBadge(profileData.credits.balance)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar
            src={user.avatar_url}
            alt={user.nickname}
            size="lg"
            className="border-2"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{user.nickname}</h3>
            <p className="text-sm text-muted-foreground">
              {t('memberSince')} {formatDate(user.created_at)}
            </p>
          </div>
        </div>

        {profileData && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-1">
              <p className="text-sm font-medium">{t('creditBalance')}</p>
              <p className="text-2xl font-bold text-primary">
                {profileData.credits.balance.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('lastUpdated')} {formatDate(profileData.credits.updated_at)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">{t('accountStatus')}</p>
              <p className="text-sm">{t('active')}</p>
              <p className="text-xs text-muted-foreground">
                {t('wechatConnected')}
              </p>
            </div>
          </div>
        )}

        <div className="flex space-x-2 pt-4 border-t">
          <Button onClick={fetchProfileData} variant="outline" size="sm">
            {t('refresh')}
          </Button>
          <Button onClick={onLogout} variant="destructive" size="sm">
            {t('logout')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default UserProfile;
