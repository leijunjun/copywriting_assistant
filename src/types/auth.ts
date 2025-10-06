/**
 * Authentication Types and Interfaces
 * 
 * This file defines TypeScript interfaces and types for authentication functionality.
 */

// WeChat OAuth 2.0 Types
export interface WeChatUserInfo {
  openid: string;
  unionid?: string;
  nickname: string;
  headimgurl: string;
  sex?: number;
  language?: string;
  city?: string;
  province?: string;
  country?: string;
}

export interface WeChatAccessToken {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  openid: string;
  scope: string;
  unionid?: string;
}

export interface WeChatQRCodeResponse {
  success: boolean;
  qr_code_url?: string;
  session_id?: string;
  expires_at?: number;
  error?: string;
}

export interface WeChatCallbackResponse {
  success: boolean;
  user?: User;
  session?: Session;
  error?: string;
}

export interface WeChatStatusResponse {
  success: boolean;
  status: 'pending' | 'completed' | 'expired' | 'failed';
  user?: User;
  error?: string;
}

// User Types
export interface User {
  id: string;
  wechat_openid: string;
  wechat_unionid?: string;
  nickname: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile extends User {
  credits: {
    balance: number;
    updated_at: string;
  };
}

// Session Types
export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user_id: string;
}

export interface SessionData {
  user: User;
  session: Session;
}

// Authentication Request Types
export interface LoginRequest {
  code: string;
  state: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface LogoutRequest {
  access_token: string;
}

// Authentication Response Types
export interface LoginResponse {
  success: boolean;
  user?: User;
  session?: Session;
  error?: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  error?: string;
}

export interface LogoutResponse {
  success: boolean;
  error?: string;
}

// Error Types
export interface AuthError {
  code: string;
  message: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Utility Types
export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading' | 'error';

export interface AuthState {
  status: AuthStatus;
  user: User | null;
  session: Session | null;
  error: string | null;
}

// API Endpoint Types
export interface AuthEndpoints {
  wechat: {
    qr: string;
    callback: string;
    status: string;
  };
  session: {
    me: string;
    refresh: string;
    logout: string;
  };
}

// Configuration Types
export interface AuthConfig {
  wechat: {
    app_id: string;
    app_secret: string;
    redirect_uri: string;
    scope: string;
  };
  session: {
    access_token_expires_in: number;
    refresh_token_expires_in: number;
    cookie_name: string;
    secure: boolean;
    http_only: boolean;
    same_site: 'strict' | 'lax' | 'none';
  };
  security: {
    rate_limit: {
      max_attempts: number;
      window_ms: number;
    };
    password_policy: {
      min_length: number;
      require_uppercase: boolean;
      require_lowercase: boolean;
      require_numbers: boolean;
      require_symbols: boolean;
    };
  };
}

// Event Types
export interface AuthEvent {
  type: 'login' | 'logout' | 'refresh' | 'error';
  user?: User;
  session?: Session;
  error?: AuthError;
  timestamp: number;
}

export interface AuthEventListener {
  (event: AuthEvent): void;
}

// Hook Types
export interface UseAuthReturn {
  user: User | null;
  session: Session | null;
  status: AuthStatus;
  error: string | null;
  login: (code: string, state: string) => Promise<LoginResponse>;
  logout: () => Promise<LogoutResponse>;
  refresh: () => Promise<RefreshTokenResponse>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Component Props Types
export interface AuthProviderProps {
  children: React.ReactNode;
  config: AuthConfig;
}

export interface LoginButtonProps {
  onLogin: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export interface UserProfileProps {
  user: User;
  onLogout: () => void;
  className?: string;
}

// Form Types
export interface LoginFormData {
  code: string;
  state: string;
}

export interface LoginFormErrors {
  code?: string;
  state?: string;
  general?: string;
}

// Validation Types
export interface AuthValidation {
  validateLoginRequest: (data: LoginFormData) => ValidationError[];
  validateRefreshToken: (token: string) => ValidationError[];
  validateSession: (session: Session) => ValidationError[];
}

// Middleware Types
export interface AuthMiddleware {
  authenticate: (req: any) => Promise<User | null>;
  authorize: (user: User, resource: string, action: string) => Promise<boolean>;
  rateLimit: (req: any) => Promise<boolean>;
}

// Database Types
export interface AuthDatabase {
  users: {
    create: (user: Omit<User, 'id' | 'created_at' | 'updated_at'>) => Promise<User>;
    findById: (id: string) => Promise<User | null>;
    findByWeChatOpenId: (openid: string) => Promise<User | null>;
    update: (id: string, updates: Partial<User>) => Promise<User>;
    delete: (id: string) => Promise<boolean>;
  };
  sessions: {
    create: (session: Omit<Session, 'expires_at'>) => Promise<Session>;
    findByToken: (token: string) => Promise<Session | null>;
    update: (id: string, updates: Partial<Session>) => Promise<Session>;
    delete: (id: string) => Promise<boolean>;
    deleteExpired: () => Promise<number>;
  };
}

// Service Types
export interface AuthService {
  generateQRCode: () => Promise<WeChatQRCodeResponse>;
  handleCallback: (code: string, state: string) => Promise<WeChatCallbackResponse>;
  checkStatus: (sessionId: string) => Promise<WeChatStatusResponse>;
  refreshSession: (refreshToken: string) => Promise<RefreshTokenResponse>;
  logout: (accessToken: string) => Promise<LogoutResponse>;
  getCurrentUser: (accessToken: string) => Promise<User | null>;
}

// Utility Types
export type AuthMethod = 'wechat' | 'email' | 'phone';

export interface AuthMethodConfig {
  method: AuthMethod;
  enabled: boolean;
  config: any;
}

export interface AuthProvider {
  name: string;
  type: AuthMethod;
  config: AuthMethodConfig;
  service: AuthService;
}

// Export all types
export type {
  WeChatUserInfo,
  WeChatAccessToken,
  WeChatQRCodeResponse,
  WeChatCallbackResponse,
  WeChatStatusResponse,
  User,
  UserProfile,
  Session,
  SessionData,
  LoginRequest,
  RefreshTokenRequest,
  LogoutRequest,
  LoginResponse,
  RefreshTokenResponse,
  LogoutResponse,
  AuthError,
  ValidationError,
  AuthStatus,
  AuthState,
  AuthEndpoints,
  AuthConfig,
  AuthEvent,
  AuthEventListener,
  UseAuthReturn,
  AuthProviderProps,
  LoginButtonProps,
  UserProfileProps,
  LoginFormData,
  LoginFormErrors,
  AuthValidation,
  AuthMiddleware,
  AuthDatabase,
  AuthService,
  AuthMethod,
  AuthMethodConfig,
  AuthProvider,
};
