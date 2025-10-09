/**
 * Authentication Validation Schemas
 * 
 * This file contains Zod validation schemas for email/password authentication functionality.
 */

import { z } from 'zod';

// User validation schemas
export const UserCreateSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  nickname: z.string().min(1, 'Nickname is required').max(100, 'Nickname too long'),
  avatar_url: z.string().url('Invalid avatar URL').optional(),
});

export const UserUpdateSchema = z.object({
  nickname: z.string().min(1, 'Nickname is required').max(100, 'Nickname too long').optional(),
  avatar_url: z.string().url('Invalid avatar URL').optional(),
});

export const UserProfileSchema = z.object({
  id: z.string().uuid('Invalid user ID'),
  email: z.string().email('Invalid email format'),
  nickname: z.string().min(1, 'Nickname is required'),
  avatar_url: z.string().url('Invalid avatar URL'),
  created_at: z.string().datetime('Invalid created date'),
  updated_at: z.string().datetime('Invalid updated date'),
});

// Session validation schemas
export const SessionCreateSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  access_token: z.string().min(1, 'Access token is required'),
  refresh_token: z.string().min(1, 'Refresh token is required'),
  expires_at: z.number().positive('Expires at must be positive'),
});

export const SessionRefreshSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token is required'),
});

export const SessionValidateSchema = z.object({
  access_token: z.string().min(1, 'Access token is required'),
});

// Authentication request validation schemas
export const LoginRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const RegisterRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  nickname: z.string().min(1, 'Nickname is required').max(100, 'Nickname too long'),
});

export const LogoutRequestSchema = z.object({
  access_token: z.string().min(1, 'Access token is required'),
});

// Authentication response validation schemas
export const LoginResponseSchema = z.object({
  success: z.boolean(),
  user: UserProfileSchema.optional(),
  session: z.object({
    access_token: z.string(),
    refresh_token: z.string(),
    expires_at: z.number(),
  }).optional(),
  credits: z.object({
    balance: z.number(),
    updated_at: z.string(),
  }).optional(),
  error: z.string().optional(),
});

export const RegisterResponseSchema = z.object({
  success: z.boolean(),
  user: UserProfileSchema.optional(),
  session: z.object({
    access_token: z.string(),
    refresh_token: z.string(),
    expires_at: z.number(),
  }).optional(),
  credits: z.object({
    balance: z.number(),
    updated_at: z.string(),
  }).optional(),
  error: z.string().optional(),
});

export const RefreshTokenResponseSchema = z.object({
  success: z.boolean(),
  access_token: z.string().optional(),
  refresh_token: z.string().optional(),
  expires_at: z.number().optional(),
  error: z.string().optional(),
});

export const LogoutResponseSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});

// Error validation schemas
export const AuthErrorSchema = z.object({
  code: z.string().min(1, 'Error code is required'),
  message: z.string().min(1, 'Error message is required'),
  type: z.string().min(1, 'Error type is required'),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  details: z.any().optional(),
});

export const ValidationErrorSchema = z.object({
  field: z.string().min(1, 'Field name is required'),
  message: z.string().min(1, 'Error message is required'),
  value: z.any().optional(),
});

// Form validation schemas
export const LoginFormSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const RegisterFormSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
  nickname: z.string().min(1, 'Nickname is required').max(100, 'Nickname too long'),
});

export const LoginFormErrorsSchema = z.object({
  email: z.string().optional(),
  password: z.string().optional(),
  general: z.string().optional(),
});

export const RegisterFormErrorsSchema = z.object({
  email: z.string().optional(),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  nickname: z.string().optional(),
  general: z.string().optional(),
});

// Configuration validation schemas
export const AuthConfigSchema = z.object({
  session: z.object({
    access_token_expires_in: z.number().positive('Access token expiry must be positive'),
    refresh_token_expires_in: z.number().positive('Refresh token expiry must be positive'),
    cookie_name: z.string().min(1, 'Cookie name is required'),
    secure: z.boolean(),
    http_only: z.boolean(),
    same_site: z.enum(['strict', 'lax', 'none']),
  }),
  security: z.object({
    rate_limit: z.object({
      max_attempts: z.number().positive('Max attempts must be positive'),
      window_ms: z.number().positive('Window must be positive'),
    }),
    password_policy: z.object({
      min_length: z.number().positive('Min length must be positive'),
      require_uppercase: z.boolean(),
      require_lowercase: z.boolean(),
      require_numbers: z.boolean(),
      require_symbols: z.boolean(),
    }),
  }),
});

// Event validation schemas
export const AuthEventSchema = z.object({
  type: z.enum(['login', 'logout', 'refresh', 'error']),
  user: UserProfileSchema.optional(),
  session: z.object({
    access_token: z.string(),
    refresh_token: z.string(),
    expires_at: z.number(),
  }).optional(),
  error: AuthErrorSchema.optional(),
  timestamp: z.number().positive('Timestamp must be positive'),
});

// Hook validation schemas
export const UseAuthReturnSchema = z.object({
  user: UserProfileSchema.nullable(),
  session: z.object({
    access_token: z.string(),
    refresh_token: z.string(),
    expires_at: z.number(),
  }).nullable(),
  status: z.enum(['authenticated', 'unauthenticated', 'loading', 'error']),
  error: z.string().nullable(),
  login: z.function(),
  logout: z.function(),
  refresh: z.function(),
  isAuthenticated: z.boolean(),
  isLoading: z.boolean(),
});

// Component props validation schemas
export const AuthProviderPropsSchema = z.object({
  children: z.any(), // React.ReactNode
  config: AuthConfigSchema,
});

export const LoginButtonPropsSchema = z.object({
  onLogin: z.function(),
  disabled: z.boolean().optional(),
  loading: z.boolean().optional(),
  className: z.string().optional(),
});

export const UserProfilePropsSchema = z.object({
  user: UserProfileSchema,
  onLogout: z.function(),
  className: z.string().optional(),
});

// Utility validation schemas
export const AuthMethodSchema = z.enum(['email']);

export const AuthMethodConfigSchema = z.object({
  method: AuthMethodSchema,
  enabled: z.boolean(),
  config: z.any(),
});

export const AuthProviderSchema = z.object({
  name: z.string().min(1, 'Provider name is required'),
  type: AuthMethodSchema,
  config: AuthMethodConfigSchema,
  service: z.any(), // AuthService interface
});

// Validation utility functions
export function validateUserCreate(data: unknown) {
  return UserCreateSchema.parse(data);
}

export function validateUserUpdate(data: unknown) {
  return UserUpdateSchema.parse(data);
}

export function validateUserProfile(data: unknown) {
  return UserProfileSchema.parse(data);
}

export function validateSessionCreate(data: unknown) {
  return SessionCreateSchema.parse(data);
}

export function validateSessionRefresh(data: unknown) {
  return SessionRefreshSchema.parse(data);
}

export function validateSessionValidate(data: unknown) {
  return SessionValidateSchema.parse(data);
}

export function validateLoginRequest(data: unknown) {
  return LoginRequestSchema.parse(data);
}

export function validateRegisterRequest(data: unknown) {
  return RegisterRequestSchema.parse(data);
}

export function validateLogoutRequest(data: unknown) {
  return LogoutRequestSchema.parse(data);
}

export function validateLoginResponse(data: unknown) {
  return LoginResponseSchema.parse(data);
}

export function validateRegisterResponse(data: unknown) {
  return RegisterResponseSchema.parse(data);
}

export function validateRefreshTokenResponse(data: unknown) {
  return RefreshTokenResponseSchema.parse(data);
}

export function validateLogoutResponse(data: unknown) {
  return LogoutResponseSchema.parse(data);
}

export function validateAuthError(data: unknown) {
  return AuthErrorSchema.parse(data);
}

export function validateValidationError(data: unknown) {
  return ValidationErrorSchema.parse(data);
}

export function validateLoginForm(data: unknown) {
  return LoginFormSchema.parse(data);
}

export function validateRegisterForm(data: unknown) {
  return RegisterFormSchema.parse(data);
}

export function validateLoginFormErrors(data: unknown) {
  return LoginFormErrorsSchema.parse(data);
}

export function validateRegisterFormErrors(data: unknown) {
  return RegisterFormErrorsSchema.parse(data);
}

export function validateAuthConfig(data: unknown) {
  return AuthConfigSchema.parse(data);
}

export function validateAuthEvent(data: unknown) {
  return AuthEventSchema.parse(data);
}

export function validateUseAuthReturn(data: unknown) {
  return UseAuthReturnSchema.parse(data);
}

export function validateAuthProviderProps(data: unknown) {
  return AuthProviderPropsSchema.parse(data);
}

export function validateLoginButtonProps(data: unknown) {
  return LoginButtonPropsSchema.parse(data);
}

export function validateUserProfileProps(data: unknown) {
  return UserProfilePropsSchema.parse(data);
}

export function validateAuthMethod(data: unknown) {
  return AuthMethodSchema.parse(data);
}

export function validateAuthMethodConfig(data: unknown) {
  return AuthMethodConfigSchema.parse(data);
}

export function validateAuthProvider(data: unknown) {
  return AuthProviderSchema.parse(data);
}