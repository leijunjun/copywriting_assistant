// Debug WeChat API Issues
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Debugging WeChat API Issues...\n');

// Check environment variables
console.log('Environment Variables:');
console.log('WECHAT_APP_ID:', process.env.WECHAT_APP_ID ? '✅ Set' : '❌ Missing');
console.log('WECHAT_APP_SECRET:', process.env.WECHAT_APP_SECRET ? '✅ Set' : '❌ Missing');
console.log('WECHAT_REDIRECT_URI:', process.env.WECHAT_REDIRECT_URI ? '✅ Set' : '❌ Missing');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');

// Test Supabase connection
const { createClient } = require('@supabase/supabase-js');

if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('\n🔗 Testing Supabase server connection...');
  
  // Test oauth_sessions table
  supabase.from('oauth_sessions').select('count').then(({ data, error }) => {
    if (error) {
      console.log('❌ oauth_sessions table error:', error.message);
    } else {
      console.log('✅ oauth_sessions table accessible');
    }
  }).catch(err => {
    console.log('❌ oauth_sessions table error:', err.message);
  });

  // Test inserting into oauth_sessions
  const testState = 'test-state-' + Date.now();
  supabase.from('oauth_sessions').insert({
    state: testState,
    expires_at: new Date(Date.now() + 300000).toISOString()
  }).then(({ data, error }) => {
    if (error) {
      console.log('❌ oauth_sessions insert error:', error.message);
    } else {
      console.log('✅ oauth_sessions insert successful');
      
      // Clean up test data
      supabase.from('oauth_sessions').delete().eq('state', testState);
    }
  }).catch(err => {
    console.log('❌ oauth_sessions insert error:', err.message);
  });
} else {
  console.log('❌ Missing required Supabase environment variables');
}

// Test WeChat configuration
console.log('\n📱 WeChat Configuration:');
console.log('App ID:', process.env.WECHAT_APP_ID);
console.log('Redirect URI:', process.env.WECHAT_REDIRECT_URI);
console.log('Base URL: https://api.weixin.qq.com');

// Generate test QR code URL
if (process.env.WECHAT_APP_ID && process.env.WECHAT_REDIRECT_URI) {
  const testState = 'test-state-' + Date.now();
  const params = new URLSearchParams({
    appid: process.env.WECHAT_APP_ID,
    redirect_uri: process.env.WECHAT_REDIRECT_URI,
    response_type: 'code',
    scope: 'snsapi_userinfo',
    state: testState,
  });
  
  const qrCodeUrl = `https://api.weixin.qq.com/connect/qrconnect?${params.toString()}`;
  console.log('\n🔗 Test QR Code URL:');
  console.log(qrCodeUrl);
}
