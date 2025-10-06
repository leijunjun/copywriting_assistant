// Test WeChat QR Code Generation Function
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Testing WeChat QR Code Generation Function...\n');

// Mock the required modules
const mockSupabase = {
  from: (table) => ({
    insert: (data) => Promise.resolve({ data: null, error: null }),
    select: (fields) => ({
      eq: (field, value) => ({
        gt: (field, value) => ({
          single: () => Promise.resolve({ data: null, error: null })
        })
      })
    }),
    delete: () => ({
      eq: (field, value) => Promise.resolve({ data: null, error: null })
    })
  })
};

// Mock the generateWeChatQRCode function logic
function generateWeChatQRCode() {
  try {
    // Validate WeChat configuration
    const WECHAT_CONFIG = {
      appId: process.env.WECHAT_APP_ID || '',
      appSecret: process.env.WECHAT_APP_SECRET || '',
      redirectUri: process.env.WECHAT_REDIRECT_URI || '',
      scope: 'snsapi_userinfo',
      baseUrl: 'https://api.weixin.qq.com',
    };

    console.log('WeChat Config:', {
      appId: WECHAT_CONFIG.appId ? 'Set' : 'Missing',
      appSecret: WECHAT_CONFIG.appSecret ? 'Set' : 'Missing',
      redirectUri: WECHAT_CONFIG.redirectUri ? 'Set' : 'Missing',
    });

    if (!WECHAT_CONFIG.appId) {
      throw new Error('WECHAT_APP_ID is required');
    }
    if (!WECHAT_CONFIG.appSecret) {
      throw new Error('WECHAT_APP_SECRET is required');
    }
    if (!WECHAT_CONFIG.redirectUri) {
      throw new Error('WECHAT_REDIRECT_URI is required');
    }

    // Generate random state
    const state = 'test-state-' + Date.now();
    
    // Create QR code URL
    const params = new URLSearchParams({
      appid: WECHAT_CONFIG.appId,
      redirect_uri: WECHAT_CONFIG.redirectUri,
      response_type: 'code',
      scope: WECHAT_CONFIG.scope,
      state,
    });

    const qrCodeUrl = `${WECHAT_CONFIG.baseUrl}/connect/qrconnect?${params.toString()}`;

    console.log('✅ QR Code URL generated successfully');
    console.log('State:', state);
    console.log('URL:', qrCodeUrl);

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

// Test the function
const result = generateWeChatQRCode();
console.log('\n📊 Result:', JSON.stringify(result, null, 2));
