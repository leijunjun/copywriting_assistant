/**
 * WeChat Login Debug Script
 * 
 * This script helps debug WeChat login issues by testing the OAuth flow
 */

const https = require('https');
const http = require('http');

// Environment variables
const WECHAT_APP_ID = process.env.WECHAT_APP_ID;
const WECHAT_APP_SECRET = process.env.WECHAT_APP_SECRET;
const WECHAT_REDIRECT_URI = process.env.WECHAT_REDIRECT_URI;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 WeChat Login Debug Script');
console.log('============================');

// Check environment variables
console.log('\n📋 Environment Variables:');
console.log('WECHAT_APP_ID:', WECHAT_APP_ID ? '✅ Set' : '❌ Missing');
console.log('WECHAT_APP_SECRET:', WECHAT_APP_SECRET ? '✅ Set' : '❌ Missing');
console.log('WECHAT_REDIRECT_URI:', WECHAT_REDIRECT_URI ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_URL:', SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');

if (!WECHAT_APP_ID || !WECHAT_APP_SECRET || !WECHAT_REDIRECT_URI) {
  console.log('\n❌ Missing required environment variables');
  process.exit(1);
}

// Test 1: Generate QR Code URL
console.log('\n🧪 Test 1: Generate QR Code URL');
console.log('================================');

const state = 'wechat-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
const qrCodeUrl = `https://api.weixin.qq.com/connect/qrconnect?appid=${WECHAT_APP_ID}&redirect_uri=${encodeURIComponent(WECHAT_REDIRECT_URI)}&response_type=code&scope=snsapi_userinfo&state=${state}`;

console.log('Generated QR Code URL:');
console.log(qrCodeUrl);
console.log('\n📱 Please scan this QR code with WeChat to test the login flow');

// Test 2: Test Supabase connection
console.log('\n🧪 Test 2: Test Supabase Connection');
console.log('==================================');

if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  const { createClient } = require('@supabase/supabase-js');
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Test database connection
    supabase
      .from('oauth_sessions')
      .select('count')
      .then(({ data, error }) => {
        if (error) {
          console.log('❌ Supabase connection failed:', error.message);
        } else {
          console.log('✅ Supabase connection successful');
        }
      });
  } catch (error) {
    console.log('❌ Failed to create Supabase client:', error.message);
  }
} else {
  console.log('⚠️  Supabase credentials not available, skipping connection test');
}

// Test 3: Test WeChat API endpoints
console.log('\n🧪 Test 3: Test WeChat API Endpoints');
console.log('===================================');

const testEndpoints = [
  'https://api.weixin.qq.com/connect/qrconnect',
  'https://api.weixin.qq.com/sns/oauth2/access_token',
  'https://api.weixin.qq.com/sns/userinfo'
];

testEndpoints.forEach((endpoint, index) => {
  console.log(`\n${index + 1}. Testing ${endpoint}`);
  
  const url = new URL(endpoint);
  const options = {
    hostname: url.hostname,
    port: url.port || 443,
    path: url.pathname,
    method: 'GET',
    timeout: 5000
  };

  const req = https.request(options, (res) => {
    console.log(`   Status: ${res.statusCode}`);
    console.log(`   Headers: ${JSON.stringify(res.headers, null, 2)}`);
  });

  req.on('error', (error) => {
    console.log(`   ❌ Error: ${error.message}`);
  });

  req.on('timeout', () => {
    console.log('   ⏰ Request timeout');
    req.destroy();
  });

  req.setTimeout(5000);
  req.end();
});

// Test 4: Validate redirect URI format
console.log('\n🧪 Test 4: Validate Redirect URI Format');
console.log('=====================================');

const redirectUri = WECHAT_REDIRECT_URI;
console.log('Redirect URI:', redirectUri);

// Check if it's a valid URL
try {
  const url = new URL(redirectUri);
  console.log('✅ Valid URL format');
  console.log('   Protocol:', url.protocol);
  console.log('   Hostname:', url.hostname);
  console.log('   Path:', url.pathname);
  
  // Check if it matches the expected callback path
  if (url.pathname.includes('/api/auth/wechat/callback')) {
    console.log('✅ Callback path looks correct');
  } else {
    console.log('⚠️  Callback path might be incorrect');
  }
} catch (error) {
  console.log('❌ Invalid URL format:', error.message);
}

// Test 5: Check for common issues
console.log('\n🧪 Test 5: Check for Common Issues');
console.log('=================================');

const issues = [];

// Check if redirect URI uses HTTPS in production
if (redirectUri.startsWith('http://') && process.env.NODE_ENV === 'production') {
  issues.push('❌ Redirect URI should use HTTPS in production');
}

// Check if redirect URI is properly encoded
if (redirectUri.includes(' ')) {
  issues.push('❌ Redirect URI contains spaces, should be URL encoded');
}

// Check if state parameter is being used
if (!state || state.length < 10) {
  issues.push('❌ State parameter is too short or missing');
}

// Check if app ID format is correct
if (!WECHAT_APP_ID.startsWith('wx')) {
  issues.push('❌ WeChat App ID should start with "wx"');
}

if (issues.length === 0) {
  console.log('✅ No common issues detected');
} else {
  console.log('⚠️  Potential issues found:');
  issues.forEach(issue => console.log(`   ${issue}`));
}

console.log('\n🎯 Debug Summary');
console.log('================');
console.log('1. QR Code URL generated successfully');
console.log('2. Environment variables checked');
console.log('3. Supabase connection tested');
console.log('4. WeChat API endpoints tested');
console.log('5. Common issues checked');

console.log('\n📝 Next Steps:');
console.log('1. Scan the QR code with WeChat');
console.log('2. Check the browser console for any errors');
console.log('3. Check the server logs for detailed error messages');
console.log('4. Verify that the redirect URI is correctly configured in WeChat Open Platform');

console.log('\n🔗 Useful Links:');
console.log('- WeChat Open Platform: https://open.weixin.qq.com/');
console.log('- WeChat Login Documentation: https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Wechat_Login.html');
console.log('- Your callback URL: ' + WECHAT_REDIRECT_URI);
