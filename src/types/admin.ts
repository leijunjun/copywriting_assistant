/**
 * 管理后台类型定义
 * 
 * 定义管理后台相关的TypeScript接口和类型
 */

// 管理员会话类型
export interface AdminSession {
  username: string;
  loginTime: number;
  expiresAt: number;
}

// 会员列表项类型
export interface MemberListItem {
  id: string;
  email: string;
  nickname: string;
  industry: string;
  created_at: string;
  last_login_at: string | null;
  credits: {
    balance: number;
    updated_at: string;
  };
}

// 会员详情类型
export interface MemberDetail extends MemberListItem {
  avatar_url: string | null;
  updated_at: string;
  credit_transactions: CreditTransaction[];
}

// 积分交易类型
export interface CreditTransaction {
  id: string;
  amount: number;
  transaction_type: 'deduction' | 'bonus' | 'refund' | 'recharge';
  description: string;
  created_at: string;
}

// 积分调整请求类型
export interface CreditAdjustmentRequest {
  user_id: string;
  amount: number;
  description: string;
  operation_type: 'add' | 'subtract';
}

// 积分调整响应类型
export interface CreditAdjustmentResponse {
  success: boolean;
  transaction_id?: string;
  new_balance?: number;
  error?: string;
}

// 管理员操作日志类型
export interface AdminOperationLog {
  id: string;
  admin_username: string;
  operation_type: 'create_member' | 'adjust_credits' | 'login' | 'logout';
  target_user_id: string | null;
  target_user_email: string | null;
  credit_amount: number;
  before_balance: number;
  after_balance: number;
  description: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// 余额核对结果类型
export interface BalanceCheckResult {
  user_id: string;
  user_email: string;
  calculated_balance: number;
  actual_balance: number;
  difference: number;
  is_balanced: boolean;
  transaction_count: number;
  last_transaction_date: string | null;
}

// 预警项类型
export interface AlertItem {
  id: string;
  admin_username: string;
  operation_type: string;
  target_user_email: string;
  credit_amount: number;
  before_balance: number;
  after_balance: number;
  description: string;
  created_at: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
}

// 会员创建请求类型
export interface CreateMemberRequest {
  email: string;
  password: string;
  nickname: string;
  industry: string;
}

// 会员创建响应类型
export interface CreateMemberResponse {
  success: boolean;
  user?: MemberListItem;
  error?: string;
}

// 会员列表查询参数类型
export interface MemberListParams {
  page?: number;
  limit?: number;
  search?: string;
  industry?: string;
  sort_by?: 'created_at' | 'last_login_at' | 'credits';
  sort_order?: 'asc' | 'desc';
}

// 会员列表响应类型
export interface MemberListResponse {
  success: boolean;
  members?: MemberListItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  error?: string;
}

// 操作日志查询参数类型
export interface OperationLogParams {
  page?: number;
  limit?: number;
  admin_username?: string;
  operation_type?: string;
  target_user_id?: string;
  start_date?: string;
  end_date?: string;
  sort_by?: 'created_at' | 'credit_amount';
  sort_order?: 'asc' | 'desc';
}

// 操作日志响应类型
export interface OperationLogResponse {
  success: boolean;
  logs?: AdminOperationLog[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  error?: string;
}

// 余额核对响应类型
export interface BalanceCheckResponse {
  success: boolean;
  results?: BalanceCheckResult[];
  summary?: {
    total_users: number;
    balanced_users: number;
    imbalanced_users: number;
    total_difference: number;
  };
  error?: string;
}

// 预警列表响应类型
export interface AlertListResponse {
  success: boolean;
  alerts?: AlertItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  error?: string;
}

// 仪表盘统计类型
export interface DashboardStats {
  total_members: number;
  active_members: number;
  total_credits: number;
  recent_operations: number;
  high_risk_operations: number;
  member_growth: {
    this_month: number;
    last_month: number;
    growth_rate: number;
  };
  credit_flow: {
    total_added: number;
    total_deducted: number;
    net_change: number;
  };
}

// 仪表盘响应类型
export interface DashboardResponse {
  success: boolean;
  stats?: DashboardStats;
  error?: string;
}

// 行业类型
export type IndustryType = 'general' | 'housekeeping' | 'beauty' | 'lifestyle-beauty';

// 行业选项类型
export interface IndustryOption {
  value: IndustryType;
  label: string;
  description: string;
}

// 风险等级类型
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

// 操作类型
export type OperationType = 'create_member' | 'adjust_credits' | 'login' | 'logout';

// 排序字段类型
export type SortField = 'created_at' | 'last_login_at' | 'credits' | 'credit_amount';

// 排序顺序类型
export type SortOrder = 'asc' | 'desc';

// 分页信息类型
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// 错误响应类型
export interface AdminErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    type: 'VALIDATION' | 'AUTHENTICATION' | 'DATABASE' | 'INTERNAL';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    details?: any;
  };
}

// 成功响应类型
export interface AdminSuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
}

// 通用API响应类型
export type AdminApiResponse<T = any> = AdminSuccessResponse<T> | AdminErrorResponse;

// 表单验证错误类型
export interface FormValidationError {
  field: string;
  message: string;
  value?: any;
}

// 表单验证结果类型
export interface FormValidationResult {
  isValid: boolean;
  errors: FormValidationError[];
}

// 搜索过滤器类型
export interface SearchFilters {
  search?: string;
  industry?: IndustryType;
  date_range?: {
    start: string;
    end: string;
  };
  credit_range?: {
    min: number;
    max: number;
  };
}

// 导出所有类型
export type {
  AdminSession,
  MemberListItem,
  MemberDetail,
  CreditTransaction,
  CreditAdjustmentRequest,
  CreditAdjustmentResponse,
  AdminOperationLog,
  BalanceCheckResult,
  AlertItem,
  CreateMemberRequest,
  CreateMemberResponse,
  MemberListParams,
  MemberListResponse,
  OperationLogParams,
  OperationLogResponse,
  BalanceCheckResponse,
  AlertListResponse,
  DashboardStats,
  DashboardResponse,
  IndustryType,
  IndustryOption,
  RiskLevel,
  OperationType,
  SortField,
  SortOrder,
  PaginationInfo,
  AdminErrorResponse,
  AdminSuccessResponse,
  AdminApiResponse,
  FormValidationError,
  FormValidationResult,
  SearchFilters,
};
