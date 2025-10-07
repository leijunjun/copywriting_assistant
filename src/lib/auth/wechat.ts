/**
 * WeChat Authentication Utilities
 * 
 * This file contains utilities for WeChat OAuth 2.0 authentication.
 */

import { supabase } from '@/lib/supabase/client';
import { supabaseServer } from '@/lib/supabase/client';
import { UserModel } from '@/lib/database/models';
import type {
  WeChatUserInfo,
  WeChatAccessToken,
  WeChatQRCodeResponse,
  WeChatCallbackResponse,
  WeChatStatusResponse,
  User,
  Session,
} from '@/types/auth';

// WeChat OAuth 2.0 Configuration
const WECHAT_CONFIG = {
  appId: process.env.WECHAT_APP_ID || '',
  appSecret: process.env.WECHAT_APP_SECRET || '',
  redirectUri: process.env.WECHAT_REDIRECT_URI || '',
  scope: 'snsapi_userinfo',
  baseUrl: 'https://api.weixin.qq.com',
};

// Validate WeChat configuration
function validateWeChatConfig(): void {
  if (!WECHAT_CONFIG.appId) {
    throw new Error('WECHAT_APP_ID is required');
  }
  if (!WECHAT_CONFIG.appSecret) {
    throw new Error('WECHAT_APP_SECRET is required');
  }
  if (!WECHAT_CONFIG.redirectUri) {
    throw new Error('WECHAT_REDIRECT_URI is required');
  }
}

// WeChat API endpoints
const WECHAT_ENDPOINTS = {
  qrCode: `${WECHAT_CONFIG.baseUrl}/connect/qrconnect`,
  accessToken: `${WECHAT_CONFIG.baseUrl}/sns/oauth2/access_token`,
  userInfo: `${WECHAT_CONFIG.baseUrl}/sns/userinfo`,
  refreshToken: `${WECHAT_CONFIG.baseUrl}/sns/oauth2/refresh_token`,
};

/**
 * Generate WeChat QR code URL for login
 */
export async function generateWeChatQRCode(): Promise<WeChatQRCodeResponse> {
  try {
    console.log('🔍 Starting WeChat QR code generation...');
    
    console.log('📱 Validating WeChat configuration...');
    validateWeChatConfig();
    console.log('✅ WeChat configuration validated');

    console.log('🎲 Generating random state...');
    const state = generateRandomState();
    console.log('✅ State generated:', state);
    
    console.log('🔗 Building QR code URL...');
    const params = new URLSearchParams({
      appid: WECHAT_CONFIG.appId,
      redirect_uri: WECHAT_CONFIG.redirectUri,
      response_type: 'code',
      scope: WECHAT_CONFIG.scope,
      state,
    });

    const qrCodeUrl = `${WECHAT_ENDPOINTS.qrCode}?${params.toString()}`;
    console.log('✅ QR code URL built:', qrCodeUrl);

    console.log('💾 Storing session state...');
    await storeSessionState(state);
    console.log('✅ Session state stored');

    console.log('🎉 WeChat QR code generation completed successfully');
    return {
      success: true,
      qr_code_url: qrCodeUrl,
      session_id: state,
      expires_at: Date.now() + 300000, // 5 minutes
    };
  } catch (error) {
    console.error('❌ Error generating WeChat QR code:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate QR code',
    };
  }
}

/**
 * Handle WeChat OAuth callback
 */
export async function handleWeChatCallback(
  code: string,
  state: string
): Promise<WeChatCallbackResponse> {
  try {
    validateWeChatConfig();

    // Validate state
    if (!(await validateSessionState(state))) {
      return {
        success: false,
        error: 'Invalid or expired state',
      };
    }

    // Exchange code for access token
    const accessToken = await exchangeCodeForToken(code);
    if (!accessToken) {
      return {
        success: false,
        error: 'Failed to exchange code for access token',
      };
    }

    // Get user info from WeChat
    const userInfo = await getWeChatUserInfo(accessToken.access_token, accessToken.openid);
    if (!userInfo) {
      return {
        success: false,
        error: 'Failed to get user info from WeChat',
      };
    }

    // Create or update user in database
    const user = await createOrUpdateUser(userInfo);
    if (!user) {
      return {
        success: false,
        error: 'Failed to create or update user',
      };
    }

    // Create session
    const session = await createUserSession(user.id);

    // Clean up session state
    await clearSessionState(state);

    return {
      success: true,
      user,
      session,
    };
  } catch (error) {
    console.error('Error handling WeChat callback:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to handle callback',
    };
  }
}

/**
 * Check WeChat login status
 */
export async function checkWeChatLoginStatus(sessionId: string): Promise<WeChatStatusResponse> {
  try {
    // Check if session state exists and is valid
    const isValid = await validateSessionState(sessionId);
    if (!isValid) {
      return {
        success: false,
        status: 'expired',
        error: 'Session expired or invalid',
      };
    }

    // Check if user has completed login
    const user = await getSessionUser(sessionId);
    if (user) {
      return {
        success: true,
        status: 'completed',
        user,
      };
    }

    return {
      success: true,
      status: 'pending',
    };
  } catch (error) {
    console.error('Error checking WeChat login status:', error);
    return {
      success: false,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Failed to check login status',
    };
  }
}

/**
 * Exchange authorization code for access token
 */
async function exchangeCodeForToken(code: string): Promise<WeChatAccessToken | null> {
  try {
    console.log('🔄 Exchanging code for access token...');
    console.log('📱 App ID:', WECHAT_CONFIG.appId);
    console.log('🔑 App Secret:', WECHAT_CONFIG.appSecret ? 'Set' : 'Missing');
    console.log('🎫 Code:', code.substring(0, 10) + '...');

    const params = new URLSearchParams({
      appid: WECHAT_CONFIG.appId,
      secret: WECHAT_CONFIG.appSecret,
      code,
      grant_type: 'authorization_code',
    });

    const url = `${WECHAT_ENDPOINTS.accessToken}?${params.toString()}`;
    console.log('🌐 Requesting URL:', url.replace(WECHAT_CONFIG.appSecret, '***'));

    const response = await fetch(url);
    const data = await response.json();

    console.log('📥 WeChat API response:', data);

    if (data.errcode) {
      console.error('❌ WeChat API error:', data);
      console.error('Error code:', data.errcode);
      console.error('Error message:', data.errmsg);
      return null;
    }

    if (!data.access_token) {
      console.error('❌ No access token in response:', data);
      return null;
    }

    console.log('✅ Access token obtained successfully');
    return {
      access_token: data.access_token,
      expires_in: data.expires_in,
      refresh_token: data.refresh_token,
      openid: data.openid,
      scope: data.scope,
      unionid: data.unionid,
    };
  } catch (error) {
    console.error('❌ Error exchanging code for token:', error);
    return null;
  }
}

/**
 * Get user info from WeChat
 */
async function getWeChatUserInfo(accessToken: string, openid: string): Promise<WeChatUserInfo | null> {
  try {
    console.log('👤 Getting user info from WeChat...');
    console.log('🎫 Access token:', accessToken.substring(0, 10) + '...');
    console.log('🆔 OpenID:', openid);

    const params = new URLSearchParams({
      access_token: accessToken,
      openid,
      lang: 'zh_CN',
    });

    const url = `${WECHAT_ENDPOINTS.userInfo}?${params.toString()}`;
    console.log('🌐 Requesting user info URL:', url);

    const response = await fetch(url);
    const data = await response.json();

    console.log('📥 WeChat user info response:', data);

    if (data.errcode) {
      console.error('❌ WeChat user info API error:', data);
      console.error('Error code:', data.errcode);
      console.error('Error message:', data.errmsg);
      return null;
    }

    if (!data.openid) {
      console.error('❌ No openid in user info response:', data);
      return null;
    }

    console.log('✅ User info obtained successfully');
    return {
      openid: data.openid,
      unionid: data.unionid,
      nickname: data.nickname,
      headimgurl: data.headimgurl,
      sex: data.sex,
      language: data.language,
      city: data.city,
      province: data.province,
      country: data.country,
    };
  } catch (error) {
    console.error('❌ Error getting WeChat user info:', error);
    return null;
  }
}

/**
 * Create or update user in database
 */
async function createOrUpdateUser(userInfo: WeChatUserInfo): Promise<User | null> {
  try {
    // Check if user exists
    let user = await UserModel.findByWeChatOpenId(userInfo.openid);

    if (user) {
      // Update existing user
      user = await UserModel.update(user.id, {
        nickname: userInfo.nickname,
        avatar_url: userInfo.headimgurl,
        wechat_unionid: userInfo.unionid,
        updated_at: new Date().toISOString(),
      });
    } else {
      // Create new user
      user = await UserModel.create({
        wechat_openid: userInfo.openid,
        wechat_unionid: userInfo.unionid,
        nickname: userInfo.nickname,
        avatar_url: userInfo.headimgurl,
      });
    }

    return user;
  } catch (error) {
    console.error('Error creating or updating user:', error);
    return null;
  }
}

/**
 * Create user session
 */
async function createUserSession(userId: string): Promise<Session> {
  try {
    const accessToken = generateAccessToken();
    const refreshToken = generateRefreshToken();
    const expiresAt = Date.now() + 3600000; // 1 hour

    // Store session in database
    const { data, error } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: new Date(expiresAt).toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create session: ${error.message}`);
    }

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiresAt,
      user_id: userId,
    };
  } catch (error) {
    console.error('Error creating user session:', error);
    throw error;
  }
}

/**
 * Generate random state for OAuth
 */
function generateRandomState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Generate access token
 */
function generateAccessToken(): string {
  return 'access_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Generate refresh token
 */
function generateRefreshToken(): string {
  return 'refresh_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Store session state
 */
async function storeSessionState(state: string): Promise<void> {
  try {
    console.log('🔍 Checking Supabase server client...');
    if (!supabaseServer) {
      console.error('❌ Supabase server client is null');
      throw new Error('Supabase server client not initialized');
    }
    console.log('✅ Supabase server client is available');

    console.log('💾 Inserting session state into database...');
    const { data, error } = await supabaseServer
      .from('oauth_sessions')
      .insert({
        state,
        expires_at: new Date(Date.now() + 300000).toISOString(), // 5 minutes
      })
      .select();

    if (error) {
      console.error('❌ Database insert error:', error);
      throw new Error(`Failed to store session state: ${error.message}`);
    }
    
    console.log('✅ Session state stored successfully:', data);
  } catch (error) {
    console.error('❌ Error storing session state:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    throw error;
  }
}

/**
 * Validate session state
 */
async function validateSessionState(state: string): Promise<boolean> {
  try {
    if (!supabaseServer) {
      throw new Error('Supabase server client not initialized');
    }

    const { data, error } = await supabaseServer
      .from('oauth_sessions')
      .select('*')
      .eq('state', state)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating session state:', error);
    return false;
  }
}

/**
 * Clear session state
 */
async function clearSessionState(state: string): Promise<void> {
  try {
    if (!supabaseServer) {
      throw new Error('Supabase server client not initialized');
    }

    const { error } = await supabaseServer
      .from('oauth_sessions')
      .delete()
      .eq('state', state);

    if (error) {
      console.error('Error clearing session state:', error);
    }
  } catch (error) {
    console.error('Error clearing session state:', error);
  }
}

/**
 * Get session user
 */
async function getSessionUser(sessionId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('oauth_sessions')
      .select(`
        user_sessions (
          user_id,
          users (
            id,
            wechat_openid,
            wechat_unionid,
            nickname,
            avatar_url,
            created_at,
            updated_at
          )
        )
      `)
      .eq('state', sessionId)
      .single();

    if (error || !data) {
      return null;
    }

    return data.user_sessions?.users || null;
  } catch (error) {
    console.error('Error getting session user:', error);
    return null;
  }
}

