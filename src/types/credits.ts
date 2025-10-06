/**
 * Credit Management Types and Interfaces
 * 
 * This file defines TypeScript interfaces and types for credit management functionality.
 */

// Credit Balance Types
export interface CreditBalance {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface CreditBalanceResponse {
  success: boolean;
  balance?: number;
  updated_at?: string;
  error?: string;
}

// Credit Transaction Types
export type TransactionType = 'deduction' | 'bonus' | 'refund' | 'recharge';

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: TransactionType;
  description: string;
  created_at: string;
}

export interface CreditTransactionResponse {
  success: boolean;
  transaction?: CreditTransaction;
  new_balance?: number;
  error?: string;
}

export interface CreditTransactionListResponse {
  success: boolean;
  transactions?: CreditTransaction[];
  pagination?: PaginationInfo;
  error?: string;
}

// Credit Operation Types
export interface CreditDeductionRequest {
  user_id: string;
  amount: number;
  description: string;
  service_type?: string;
}

export interface CreditDeductionResponse {
  success: boolean;
  transaction_id?: string;
  new_balance?: number;
  error?: string;
}

export interface CreditAdditionRequest {
  user_id: string;
  amount: number;
  description: string;
  transaction_type: 'bonus' | 'refund';
}

export interface CreditAdditionResponse {
  success: boolean;
  transaction_id?: string;
  new_balance?: number;
  error?: string;
}

// Credit Validation Types
export interface CreditValidation {
  has_sufficient_credits: boolean;
  required_credits: number;
  current_balance: number;
  deficit?: number;
}

export interface CreditValidationResponse {
  success: boolean;
  validation?: CreditValidation;
  error?: string;
}

// Credit Policy Types
export interface CreditPolicy {
  id: string;
  name: string;
  description: string;
  rules: CreditRule[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreditRule {
  id: string;
  policy_id: string;
  condition: string;
  action: 'deduct' | 'add' | 'multiply' | 'divide';
  value: number;
  priority: number;
  is_active: boolean;
}

export interface CreditPolicyResponse {
  success: boolean;
  policy?: CreditPolicy;
  error?: string;
}

// Credit Recharge Types
export interface RechargeOption {
  id: string;
  credits: number;
  price: number;
  currency: string;
  bonus_credits?: number;
  is_popular?: boolean;
  is_active: boolean;
}

export interface RechargeRequest {
  user_id: string;
  option_id: string;
  payment_method: string;
  amount: number;
  currency: string;
}

export interface RechargeResponse {
  success: boolean;
  order_id?: string;
  payment_url?: string;
  error?: string;
}

export interface RechargeOptionsResponse {
  success: boolean;
  options?: RechargeOption[];
  error?: string;
}

// Credit History Types
export interface CreditHistoryRequest {
  user_id: string;
  page?: number;
  limit?: number;
  type?: TransactionType;
  start_date?: string;
  end_date?: string;
}

export interface CreditHistoryResponse {
  success: boolean;
  transactions?: CreditTransaction[];
  pagination?: PaginationInfo;
  error?: string;
}

// Pagination Types
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// Credit Service Types
export interface CreditService {
  getBalance: (userId: string) => Promise<CreditBalanceResponse>;
  deductCredits: (request: CreditDeductionRequest) => Promise<CreditDeductionResponse>;
  addCredits: (request: CreditAdditionRequest) => Promise<CreditAdditionResponse>;
  getHistory: (request: CreditHistoryRequest) => Promise<CreditHistoryResponse>;
  validateCredits: (userId: string, amount: number) => Promise<CreditValidationResponse>;
  getRechargeOptions: () => Promise<RechargeOptionsResponse>;
  processRecharge: (request: RechargeRequest) => Promise<RechargeResponse>;
}

// Credit Database Types
export interface CreditDatabase {
  balances: {
    create: (balance: Omit<CreditBalance, 'id' | 'created_at' | 'updated_at'>) => Promise<CreditBalance>;
    findByUserId: (userId: string) => Promise<CreditBalance | null>;
    update: (id: string, updates: Partial<CreditBalance>) => Promise<CreditBalance>;
    delete: (id: string) => Promise<boolean>;
  };
  transactions: {
    create: (transaction: Omit<CreditTransaction, 'id' | 'created_at'>) => Promise<CreditTransaction>;
    findByUserId: (userId: string, options?: CreditHistoryRequest) => Promise<CreditTransaction[]>;
    findById: (id: string) => Promise<CreditTransaction | null>;
    update: (id: string, updates: Partial<CreditTransaction>) => Promise<CreditTransaction>;
    delete: (id: string) => Promise<boolean>;
  };
  policies: {
    create: (policy: Omit<CreditPolicy, 'id' | 'created_at' | 'updated_at'>) => Promise<CreditPolicy>;
    findById: (id: string) => Promise<CreditPolicy | null>;
    findActive: () => Promise<CreditPolicy[]>;
    update: (id: string, updates: Partial<CreditPolicy>) => Promise<CreditPolicy>;
    delete: (id: string) => Promise<boolean>;
  };
}

// Credit Component Types
export interface CreditBalanceProps {
  balance: number;
  onRecharge: () => void;
  showWarning?: boolean;
  className?: string;
}

export interface CreditHistoryProps {
  transactions: CreditTransaction[];
  pagination?: PaginationInfo;
  onLoadMore: () => void;
  onFilter: (type: TransactionType) => void;
  className?: string;
}

export interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecharge: (option: RechargeOption) => void;
  options: RechargeOption[];
  className?: string;
}

// Credit Hook Types
export interface UseCreditsReturn {
  balance: number;
  transactions: CreditTransaction[];
  loading: boolean;
  error: string | null;
  deductCredits: (amount: number, description: string) => Promise<CreditDeductionResponse>;
  addCredits: (amount: number, description: string, type: 'bonus' | 'refund') => Promise<CreditAdditionResponse>;
  getHistory: (options?: CreditHistoryRequest) => Promise<CreditHistoryResponse>;
  refreshBalance: () => Promise<void>;
  canDeduct: (amount: number) => boolean;
}

// Credit Validation Types
export interface CreditValidationRule {
  field: string;
  required: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message: string;
}

export interface CreditValidationSchema {
  [key: string]: CreditValidationRule[];
}

// Credit Error Types
export interface CreditError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

export interface CreditErrorResponse {
  success: false;
  error: CreditError;
}

// Credit Event Types
export interface CreditEvent {
  type: 'deduction' | 'addition' | 'recharge' | 'error';
  user_id: string;
  amount: number;
  transaction_id?: string;
  description?: string;
  timestamp: number;
}

export interface CreditEventListener {
  (event: CreditEvent): void;
}

// Credit Configuration Types
export interface CreditConfig {
  default_balance: number;
  min_balance: number;
  max_balance: number;
  deduction_rate: number;
  bonus_rate: number;
  currency: string;
  policies: CreditPolicy[];
}

// Credit Analytics Types
export interface CreditAnalytics {
  total_credits: number;
  total_transactions: number;
  average_balance: number;
  top_users: Array<{
    user_id: string;
    balance: number;
    transaction_count: number;
  }>;
  transaction_breakdown: {
    [key in TransactionType]: number;
  };
}

export interface CreditAnalyticsResponse {
  success: boolean;
  analytics?: CreditAnalytics;
  error?: string;
}

// Credit Notification Types
export interface CreditNotification {
  id: string;
  user_id: string;
  type: 'low_balance' | 'transaction' | 'recharge' | 'bonus';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface CreditNotificationResponse {
  success: boolean;
  notifications?: CreditNotification[];
  error?: string;
}

// Export all types
export type {
  CreditBalance,
  CreditBalanceResponse,
  TransactionType,
  CreditTransaction,
  CreditTransactionResponse,
  CreditTransactionListResponse,
  CreditDeductionRequest,
  CreditDeductionResponse,
  CreditAdditionRequest,
  CreditAdditionResponse,
  CreditValidation,
  CreditValidationResponse,
  CreditPolicy,
  CreditRule,
  CreditPolicyResponse,
  RechargeOption,
  RechargeRequest,
  RechargeResponse,
  RechargeOptionsResponse,
  CreditHistoryRequest,
  CreditHistoryResponse,
  PaginationInfo,
  CreditService,
  CreditDatabase,
  CreditBalanceProps,
  CreditHistoryProps,
  RechargeModalProps,
  UseCreditsReturn,
  CreditValidationRule,
  CreditValidationSchema,
  CreditError,
  CreditErrorResponse,
  CreditEvent,
  CreditEventListener,
  CreditConfig,
  CreditAnalytics,
  CreditAnalyticsResponse,
  CreditNotification,
  CreditNotificationResponse,
};
