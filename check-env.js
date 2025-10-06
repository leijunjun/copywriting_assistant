// Environment Variables Check Script
// Run this with: node check-env.js

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_ROLE_KEY',
  'WECHAT_APP_ID',
  'WECHAT_APP_SECRET',
  'WECHAT_REDIRECT_URI',
  'NEXTAUTH_SECRET'
];

console.log('🔍 Checking environment variables...\n');

let allPresent = true;

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: MISSING`);
    allPresent = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPresent) {
  console.log('✅ All required environment variables are present!');
} else {
  console.log('❌ Some environment variables are missing!');
  console.log('\nPlease check your .env.local file and ensure all variables are set.');
}

console.log('\n📝 Required .env.local format:');
console.log(`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
WECHAT_APP_ID=your_wechat_app_id
WECHAT_APP_SECRET=your_wechat_app_secret
WECHAT_REDIRECT_URI=http://localhost:3000/api/auth/wechat/callback
NEXTAUTH_SECRET=your_nextauth_secret
`);
