/**
 * WeChat OAuth Integration
 * 
 * This module provides comprehensive WeChat OAuth integration with QR code generation.
 */

import { generateWeChatQrCodeUrl, getWeChatUserInfo } from '@/lib/auth/wechat';
import { createUser, getUserByOpenId, initializeUserCredits } from '@/lib/database/models';
import { createSupabaseSession } from '@/lib/auth/session';
import { logger } from '@/lib/utils/logger';
import { CustomError } from '@/lib/utils/error';

interface WeChatIntegrationConfig {
  appId: string;
  appSecret: string;
  redirectUri: string;
  scope: string;
}

interface QRCodeSession {
  sessionId: string;
  state: string;
  expiresAt: number;
  status: 'pending' | 'completed' | 'expired' | 'failed';
  userId?: string;
  error?: string;
}

class WeChatOAuthIntegration {
  private config: WeChatIntegrationConfig;
  private sessions: Map<string, QRCodeSession> = new Map();

  constructor(config: WeChatIntegrationConfig) {
    this.config = config;
    this.validateConfig();
  }

  private validateConfig() {
    if (!this.config.appId || !this.config.appSecret || !this.config.redirectUri) {
      throw new CustomError('ConfigurationError', 'WeChat OAuth configuration is incomplete');
    }
  }

  /**
   * Generate QR code for WeChat login
   */
  async generateQRCode(): Promise<{ qrCodeUrl: string; sessionId: string; expiresAt: number }> {
    try {
      const sessionId = this.generateSessionId();
      const state = this.generateState();
      const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

      const qrCodeUrl = generateWeChatQrCodeUrl(state);

      const session: QRCodeSession = {
        sessionId,
        state,
        expiresAt,
        status: 'pending',
      };

      this.sessions.set(sessionId, session);

      logger.auth('QR code generated', {
        sessionId,
        expiresAt: new Date(expiresAt).toISOString(),
      });

      return {
        qrCodeUrl,
        sessionId,
        expiresAt,
      };
    } catch (error) {
      logger.error('Failed to generate QR code', error, 'WECHAT');
      throw error;
    }
  }

  /**
   * Handle WeChat OAuth callback
   */
  async handleCallback(code: string, state: string): Promise<{ user: any; session: any }> {
    try {
      // Find session by state
      const session = Array.from(this.sessions.values()).find(s => s.state === state);
      
      if (!session) {
        throw new CustomError('SessionError', 'Invalid or expired session');
      }

      if (session.status !== 'pending') {
        throw new CustomError('SessionError', 'Session is not in pending state');
      }

      // Get WeChat user info
      const weChatUserInfo = await getWeChatUserInfo(code);

      // Check if user exists
      let user = await getUserByOpenId(weChatUserInfo.openid);

      if (!user) {
        // Create new user
        user = await createUser(weChatUserInfo);
        await initializeUserCredits(user.id);
        
        logger.auth('New user created via WeChat', {
          userId: user.id,
          openid: user.wechat_openid,
        });
      } else {
        logger.auth('Existing user logged in via WeChat', {
          userId: user.id,
          openid: user.wechat_openid,
        });
      }

      // Create Supabase session
      const sessionData = await createSupabaseSession(user.id);

      // Update session status
      session.status = 'completed';
      session.userId = user.id;
      this.sessions.set(session.sessionId, session);

      logger.auth('WeChat OAuth callback completed', {
        userId: user.id,
        sessionId: session.sessionId,
      });

      return {
        user: {
          id: user.id,
          wechat_openid: user.wechat_openid,
          wechat_unionid: user.wechat_unionid,
          nickname: user.nickname,
          avatar_url: user.avatar_url,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
        session: sessionData,
      };
    } catch (error) {
      logger.error('WeChat OAuth callback failed', error, 'WECHAT');
      
      // Update session status to failed
      const session = Array.from(this.sessions.values()).find(s => s.state === state);
      if (session) {
        session.status = 'failed';
        session.error = error instanceof Error ? error.message : 'Unknown error';
        this.sessions.set(session.sessionId, session);
      }
      
      throw error;
    }
  }

  /**
   * Check login status
   */
  async checkLoginStatus(sessionId: string): Promise<{
    status: 'pending' | 'completed' | 'expired' | 'failed';
    userId?: string;
    error?: string;
  }> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return { status: 'expired' };
    }

    // Check if session has expired
    if (Date.now() > session.expiresAt) {
      session.status = 'expired';
      this.sessions.set(sessionId, session);
      return { status: 'expired' };
    }

    return {
      status: session.status,
      userId: session.userId,
      error: session.error,
    };
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions(): void {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(sessionId);
      }
    }
  }

  private generateSessionId(): string {
    return `wechat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateState(): string {
    return `state_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Create singleton instance
const weChatIntegration = new WeChatOAuthIntegration({
  appId: process.env.WECHAT_APP_ID || '',
  appSecret: process.env.WECHAT_APP_SECRET || '',
  redirectUri: process.env.WECHAT_REDIRECT_URI || '',
  scope: 'snsapi_login',
});

export default weChatIntegration;
export { WeChatOAuthIntegration };
