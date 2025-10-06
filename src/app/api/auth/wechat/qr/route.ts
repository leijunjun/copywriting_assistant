/**
 * WeChat OAuth QR Code Generation Endpoint
 * 
 * This endpoint generates a WeChat QR code for user authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateWeChatQRCodeRequest } from '@/lib/validation/auth';
import { logger } from '@/lib/utils/logger';
import { createErrorResponse } from '@/lib/utils/error';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    logger.api('WeChat QR code generation request received');

    // Parse request body (optional for QR code generation)
    let body = {};
    try {
      body = await request.json();
    } catch (error) {
      // Empty body is acceptable for QR code generation
      body = {};
    }

    // Generate WeChat QR code directly
    console.log('🔍 Starting WeChat QR code generation...');
    
    // Validate WeChat configuration
    const WECHAT_CONFIG = {
      appId: process.env.WECHAT_APP_ID || '',
      appSecret: process.env.WECHAT_APP_SECRET || '',
      redirectUri: process.env.WECHAT_REDIRECT_URI || '',
      scope: 'snsapi_userinfo',
    };

    if (!WECHAT_CONFIG.appId || !WECHAT_CONFIG.appSecret || !WECHAT_CONFIG.redirectUri) {
      throw new Error('Missing WeChat configuration');
    }

    console.log('✅ WeChat configuration validated');

    // Generate random state
    const state = 'wechat-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    console.log('✅ State generated:', state);
    
    // Build QR code URL
    const params = new URLSearchParams({
      appid: WECHAT_CONFIG.appId,
      redirect_uri: WECHAT_CONFIG.redirectUri,
      response_type: 'code',
      scope: WECHAT_CONFIG.scope,
      state,
    });

    const qrCodeUrl = `https://api.weixin.qq.com/connect/qrconnect?${params.toString()}`;
    console.log('✅ QR code URL built:', qrCodeUrl);

    // Store session state in database
    console.log('💾 Storing session state...');
    const supabaseServer = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data, error } = await supabaseServer
      .from('oauth_sessions')
      .insert({
        state,
        expires_at: new Date(Date.now() + 300000).toISOString(), // 5 minutes
      })
      .select();

    if (error) {
      throw new Error(`Failed to store session state: ${error.message}`);
    }

    console.log('✅ Session state stored successfully');

    logger.api('WeChat QR code generated successfully', {
      sessionId: state,
      expiresAt: Date.now() + 300000,
    });

    return NextResponse.json({
      success: true,
      qr_code_url: qrCodeUrl,
      session_id: state,
      expires_at: Date.now() + 300000,
    });

  } catch (error) {
    logger.error('Unexpected error in WeChat QR code generation', error, 'API');
    
    return NextResponse.json(
      createErrorResponse({
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        type: 'INTERNAL',
        severity: 'CRITICAL',
      }),
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    logger.api('WeChat QR code generation GET request received');

    // Generate WeChat QR code directly
    console.log('🔍 Starting WeChat QR code generation...');
    
    // Validate WeChat configuration
    const WECHAT_CONFIG = {
      appId: process.env.WECHAT_APP_ID || '',
      appSecret: process.env.WECHAT_APP_SECRET || '',
      redirectUri: process.env.WECHAT_REDIRECT_URI || '',
      scope: 'snsapi_userinfo',
    };

    if (!WECHAT_CONFIG.appId || !WECHAT_CONFIG.appSecret || !WECHAT_CONFIG.redirectUri) {
      throw new Error('Missing WeChat configuration');
    }

    console.log('✅ WeChat configuration validated');

    // Generate random state
    const state = 'wechat-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    console.log('✅ State generated:', state);
    
    // Build QR code URL
    const params = new URLSearchParams({
      appid: WECHAT_CONFIG.appId,
      redirect_uri: WECHAT_CONFIG.redirectUri,
      response_type: 'code',
      scope: WECHAT_CONFIG.scope,
      state,
    });

    const qrCodeUrl = `https://api.weixin.qq.com/connect/qrconnect?${params.toString()}`;
    console.log('✅ QR code URL built:', qrCodeUrl);

    // Store session state in database
    console.log('💾 Storing session state...');
    const supabaseServer = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data, error } = await supabaseServer
      .from('oauth_sessions')
      .insert({
        state,
        expires_at: new Date(Date.now() + 300000).toISOString(), // 5 minutes
      })
      .select();

    if (error) {
      throw new Error(`Failed to store session state: ${error.message}`);
    }

    console.log('✅ Session state stored successfully');

    logger.api('WeChat QR code generated successfully', {
      sessionId: state,
      expiresAt: Date.now() + 300000,
    });

    return NextResponse.json({
      success: true,
      qr_code_url: qrCodeUrl,
      session_id: state,
      expires_at: Date.now() + 300000,
    });

  } catch (error) {
    logger.error('Unexpected error in WeChat QR code generation', error, 'API');
    
    return NextResponse.json(
      createErrorResponse({
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        type: 'INTERNAL',
        severity: 'CRITICAL',
      }),
      { status: 500 }
    );
  }
}
