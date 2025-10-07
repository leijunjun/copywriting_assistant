/**
 * Supabase Server Configuration
 * 
 * This file contains the server-side Supabase configuration
 * for the Email Authentication and Credit System feature.
 */

import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { supabaseConfig, validateSupabaseConfig } from './config';
import type { Database } from './client';

// Validate configuration on import
validateSupabaseConfig();

// Create Supabase client for server components
export const createServerSupabaseClient = () => {
  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    return null;
  }
  
  const cookieStore = cookies();
  
  return createServerClient<Database>(
    supabaseConfig.url,
    supabaseConfig.anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};

// Create Supabase client for server actions
export const createServerSupabaseClientForActions = () => {
  if (!supabaseConfig.url || !supabaseConfig.serviceRoleKey) {
    return null;
  }
  
  return createClient<Database>(
    supabaseConfig.url,
    supabaseConfig.serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};

// Create Supabase client for middleware
export const createServerSupabaseClientForMiddleware = () => {
  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    return null;
  }
  
  return createClient<Database>(
    supabaseConfig.url,
    supabaseConfig.anonKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};

// Helper function to get user session
export async function getServerSession() {
  const supabase = createServerSupabaseClient();
  if (!supabase) {
    console.log('⚠️ Supabase client not available');
    return null;
  }
  
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Error getting session:', error);
    return null;
  }

  if (!session) {
    console.log('⚠️ No server session found');
    return null;
  }

  console.log('✅ Server session found:', {
    user_id: session.user?.id,
    expires_at: session.expires_at
  });

  return session;
}

// Helper function to get user
export async function getServerUser() {
  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return null;
  }
  
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Error getting user:', error);
    return null;
  }

  return user;
}

// Helper function to check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const session = await getServerSession();
  return !!session;
}

// Helper function to get user ID
export async function getUserId(): Promise<string | null> {
  const user = await getServerUser();
  return user?.id || null;
}
