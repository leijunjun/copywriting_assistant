// Debug Supabase Connection
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Debugging Supabase Connection...\n');

// Check environment variables
console.log('Environment Variables:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');

// Test Supabase connection
const { createClient } = require('@supabase/supabase-js');

if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  console.log('\n🔗 Testing Supabase connection...');
  
  // Test basic connection
  supabase.from('oauth_sessions').select('count').then(({ data, error }) => {
    if (error) {
      console.log('❌ Supabase connection failed:', error.message);
    } else {
      console.log('✅ Supabase connection successful');
    }
  }).catch(err => {
    console.log('❌ Supabase connection error:', err.message);
  });
} else {
  console.log('❌ Missing required Supabase environment variables');
}
