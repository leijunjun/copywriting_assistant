/**
 * 认证调试组件
 * 用于调试认证状态问题
 */

'use client';

import React from 'react';
import { useAuth } from '@/lib/auth/auth-context';

export function AuthDebug() {
  const { authState, refreshAuthState } = useAuth();
  
  const handleRefresh = () => {
    console.log('AuthDebug: Manual refresh triggered');
    refreshAuthState();
  };

  const handleTestAPI = async () => {
    console.log('AuthDebug: Testing API directly');
    try {
      const response = await fetch('/api/user/profile');
      const data = await response.json();
      console.log('AuthDebug: Direct API response:', { status: response.status, data });
    } catch (error) {
      console.error('AuthDebug: Direct API error:', error);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '1px solid #ccc', 
      padding: '10px', 
      zIndex: 9999,
      fontSize: '12px',
      maxWidth: '300px'
    }}>
      <h4>Auth Debug</h4>
      <div>
        <strong>isAuthenticated:</strong> {authState.isAuthenticated ? 'true' : 'false'}
      </div>
      <div>
        <strong>isLoading:</strong> {authState.isLoading ? 'true' : 'false'}
      </div>
      <div>
        <strong>user:</strong> {authState.user ? 'exists' : 'null'}
      </div>
      <div>
        <strong>credits:</strong> {authState.credits ? 'exists' : 'null'}
      </div>
      <div style={{ marginTop: '10px' }}>
        <button onClick={handleRefresh} style={{ marginRight: '5px' }}>
          Refresh Auth
        </button>
        <button onClick={handleTestAPI}>
          Test API
        </button>
      </div>
    </div>
  );
}
