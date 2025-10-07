/**
 * Supabase Configuration
 * 
 * This file contains the configuration for Supabase client setup
 * for the Email Authentication and Credit System feature.
 */

export const supabaseConfig = {
  // Supabase project configuration
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  
  
  // Database configuration
  database: {
    url: process.env.DATABASE_URL || '',
  },
  
  // Security configuration
  security: {
    jwtSecret: process.env.NEXTAUTH_SECRET || '',
    cookieName: 'supabase-auth-token',
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  },
} as const;

// Validation function to ensure all required environment variables are set
export function validateSupabaseConfig() {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXTAUTH_SECRET',
  ];
  
  const missingVars = requiredVars.filter(
    (varName) => !process.env[varName]
  );
  
  if (missingVars.length > 0) {
    console.warn(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
    return false;
  }
  
  return true;
}
