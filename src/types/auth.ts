/**
 * Authentication Types and Interfaces
 * 
 * This file defines TypeScript interfaces and types for email authentication functionality.
 */

// User Types
export interface User {
  id: string;
  email: string;
  nickname: string;
  avatar_url?: string;
  industry?: string;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
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
// Note: 'email' field name is kept for backward compatibility, but it can contain either email or phone number
export interface LoginRequest {
  email: string; // Can be email or phone number
  password: string;
}

export interface RegisterRequest {
  email: string; // Can be email or phone number
  password: string;
  nickname?: string;
  industry?: string;
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
  credits?: {
    balance: number;
    updated_at: string;
  };
  error?: string;
}

export interface RegisterResponse {
  success: boolean;
  user?: User;
  session?: Session;
  credits?: {
    balance: number;
    updated_at: string;
  };
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
  type: 'VALIDATION' | 'AUTHENTICATION' | 'DATABASE' | 'INTERNAL';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
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
  credits: {
    balance: number;
    updated_at: string;
  } | null;
  error: string | null;
}

// API Endpoint Types
export interface AuthEndpoints {
  login: string;
  register: string;
  logout: string;
  refresh: string;
  profile: string;
}

// Configuration Types
export interface AuthConfig {
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
  credits: {
    initial_balance: number;
    min_balance: number;
  };
}

// Event Types
export interface AuthEvent {
  type: 'login' | 'logout' | 'register' | 'refresh' | 'error';
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
  credits: {
    balance: number;
    updated_at: string;
  } | null;
  status: AuthStatus;
  error: string | null;
  login: (email: string, password: string) => Promise<LoginResponse>;
  register: (email: string, password: string, nickname?: string) => Promise<RegisterResponse>;
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

export interface LoginFormProps {
  onLogin: (email: string, password: string) => void;
  onRegister: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export interface RegisterFormProps {
  onRegister: (email: string, password: string, nickname?: string) => void;
  onLogin: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export interface UserProfileProps {
  user: User;
  credits: {
    balance: number;
    updated_at: string;
  };
  onLogout: () => void;
  className?: string;
}

// Form Types
// Note: 'email' field name is kept for backward compatibility, but it can contain either email or phone number
export interface LoginFormData {
  email: string; // Can be email or phone number
  password: string;
}

export interface RegisterFormData {
  email: string; // Can be email or phone number
  password: string;
  confirmPassword: string;
  nickname?: string;
  industry?: string;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export interface RegisterFormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  nickname?: string;
  general?: string;
}

// Validation Types
export interface AuthValidation {
  validateLoginRequest: (data: LoginFormData) => ValidationError[];
  validateRegisterRequest: (data: RegisterFormData) => ValidationError[];
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
    findByEmail: (email: string) => Promise<User | null>;
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
  login: (email: string, password: string) => Promise<LoginResponse>;
  register: (email: string, password: string, nickname?: string) => Promise<RegisterResponse>;
  logout: (accessToken: string) => Promise<LogoutResponse>;
  refreshSession: (refreshToken: string) => Promise<RefreshTokenResponse>;
  getCurrentUser: (accessToken: string) => Promise<User | null>;
  validatePassword: (password: string) => ValidationError[];
  hashPassword: (password: string) => Promise<string>;
  comparePassword: (password: string, hash: string) => Promise<boolean>;
}

// Utility Types
export type AuthMethod = 'email';

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
  User,
  UserProfile,
  Session,
  SessionData,
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  LogoutRequest,
  LoginResponse,
  RegisterResponse,
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
  LoginFormProps,
  RegisterFormProps,
  UserProfileProps,
  LoginFormData,
  RegisterFormData,
  LoginFormErrors,
  RegisterFormErrors,
  AuthValidation,
  AuthMiddleware,
  AuthDatabase,
  AuthService,
  AuthMethod,
  AuthMethodConfig,
  AuthProvider,
};