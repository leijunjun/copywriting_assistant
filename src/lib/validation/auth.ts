/**
 * Authentication Validation Schemas
 * 
 * This file contains Zod validation schemas for authentication functionality.
 */

import { z } from 'zod';

// WeChat OAuth validation schemas
export const WeChatQRCodeRequestSchema = z.object({
  // No additional parameters needed for QR code generation
});

export const WeChatCallbackRequestSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().min(1, 'State parameter is required'),
});

export const WeChatStatusRequestSchema = z.object({
  session_id: z.string().min(1, 'Session ID is required'),
});

// User validation schemas
export const UserCreateSchema = z.object({
  wechat_openid: z.string().min(1, 'WeChat OpenID is required'),
  wechat_unionid: z.string().optional(),
  nickname: z.string().min(1, 'Nickname is required').max(100, 'Nickname too long'),
  avatar_url: z.string().url('Invalid avatar URL').optional(),
});

export const UserUpdateSchema = z.object({
  nickname: z.string().min(1, 'Nickname is required').max(100, 'Nickname too long').optional(),
  avatar_url: z.string().url('Invalid avatar URL').optional(),
});

export const UserProfileSchema = z.object({
  id: z.string().uuid('Invalid user ID'),
  wechat_openid: z.string().min(1, 'WeChat OpenID is required'),
  wechat_unionid: z.string().optional(),
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
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().min(1, 'State parameter is required'),
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
    user_id: z.string(),
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
  details: z.any().optional(),
});

export const ValidationErrorSchema = z.object({
  field: z.string().min(1, 'Field name is required'),
  message: z.string().min(1, 'Error message is required'),
  value: z.any().optional(),
});

// Form validation schemas
export const LoginFormSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().min(1, 'State parameter is required'),
});

export const LoginFormErrorsSchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
  general: z.string().optional(),
});

// Configuration validation schemas
export const AuthConfigSchema = z.object({
  wechat: z.object({
    app_id: z.string().min(1, 'WeChat App ID is required'),
    app_secret: z.string().min(1, 'WeChat App Secret is required'),
    redirect_uri: z.string().url('Invalid redirect URI'),
    scope: z.string().min(1, 'Scope is required'),
  }),
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
    user_id: z.string(),
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
    user_id: z.string(),
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
export const AuthMethodSchema = z.enum(['wechat', 'email', 'phone']);

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
export function validateWeChatQRCodeRequest(data: unknown) {
  return WeChatQRCodeRequestSchema.parse(data);
}

export function validateWeChatCallbackRequest(data: unknown) {
  return WeChatCallbackRequestSchema.parse(data);
}

export function validateWeChatStatusRequest(data: unknown) {
  return WeChatStatusRequestSchema.parse(data);
}

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

export function validateLogoutRequest(data: unknown) {
  return LogoutRequestSchema.parse(data);
}

export function validateLoginResponse(data: unknown) {
  return LoginResponseSchema.parse(data);
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

export function validateLoginFormErrors(data: unknown) {
  return LoginFormErrorsSchema.parse(data);
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

