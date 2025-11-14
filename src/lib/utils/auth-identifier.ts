/**
 * Authentication Identifier Utilities
 * 
 * Utility functions to identify and normalize email and phone number inputs.
 */

/**
 * Check if the input is a valid email address
 */
export function isEmail(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input.trim());
}

/**
 * Check if the input is a valid Chinese phone number
 * Format: 11 digits, starting with 1, second digit 3-9
 */
export function isPhone(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }
  // Remove spaces and other non-digit characters except + at the start
  const cleaned = input.trim().replace(/\s+/g, '');
  // Check for Chinese phone number: 11 digits starting with 1, second digit 3-9
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(cleaned);
}

/**
 * Normalize phone number to standard format
 * Removes spaces and ensures consistent format
 */
export function normalizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    return '';
  }
  // Remove all spaces and non-digit characters except + at the start
  return phone.trim().replace(/\s+/g, '');
}

/**
 * Format phone number for Supabase (add +86 prefix if needed)
 * Supabase requires international format for phone numbers
 */
export function formatPhoneForSupabase(phone: string): string {
  const normalized = normalizePhone(phone);
  // If already has +86 prefix, return as is
  if (normalized.startsWith('+86')) {
    return normalized;
  }
  // Add +86 prefix for Chinese phone numbers
  return `+86${normalized}`;
}

/**
 * Determine if input is email or phone
 * Returns 'email' | 'phone' | null
 */
export function identifyAuthType(input: string): 'email' | 'phone' | null {
  if (!input || typeof input !== 'string') {
    return null;
  }
  
  const trimmed = input.trim();
  
  // Check phone first (more specific pattern)
  if (isPhone(trimmed)) {
    return 'phone';
  }
  
  // Check email
  if (isEmail(trimmed)) {
    return 'email';
  }
  
  return null;
}

