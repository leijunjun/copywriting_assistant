/**
 * Credit Management Validation Schemas
 * 
 * This file contains Zod validation schemas for credit management functionality.
 */

import { z } from 'zod';

// Credit balance validation schemas
export const CreditBalanceSchema = z.object({
  id: z.string().uuid('Invalid credit balance ID'),
  user_id: z.string().uuid('Invalid user ID'),
  balance: z.number().int('Balance must be an integer').min(0, 'Balance cannot be negative'),
  created_at: z.string().datetime('Invalid created date'),
  updated_at: z.string().datetime('Invalid updated date'),
});

export const CreditBalanceResponseSchema = z.object({
  success: z.boolean(),
  balance: z.number().int().min(0).optional(),
  updated_at: z.string().datetime().optional(),
  error: z.string().optional(),
});

// Credit transaction validation schemas
export const TransactionTypeSchema = z.enum(['deduction', 'bonus', 'refund', 'recharge']);

export const CreditTransactionSchema = z.object({
  id: z.string().uuid('Invalid transaction ID'),
  user_id: z.string().uuid('Invalid user ID'),
  amount: z.number().int('Amount must be an integer'),
  transaction_type: TransactionTypeSchema,
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  created_at: z.string().datetime('Invalid created date'),
});

export const CreditTransactionResponseSchema = z.object({
  success: z.boolean(),
  transaction: CreditTransactionSchema.optional(),
  new_balance: z.number().int().min(0).optional(),
  error: z.string().optional(),
});

export const CreditTransactionListResponseSchema = z.object({
  success: z.boolean(),
  transactions: z.array(CreditTransactionSchema).optional(),
  pagination: z.object({
    page: z.number().int().positive('Page must be positive'),
    limit: z.number().int().positive('Limit must be positive'),
    total: z.number().int().min(0, 'Total cannot be negative'),
    total_pages: z.number().int().min(0, 'Total pages cannot be negative'),
    has_next: z.boolean(),
    has_prev: z.boolean(),
  }).optional(),
  error: z.string().optional(),
});

// Credit operation validation schemas
export const CreditDeductionRequestSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  amount: z.number().int('Amount must be an integer').positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  service_type: z.string().optional(),
});

export const CreditDeductionResponseSchema = z.object({
  success: z.boolean(),
  transaction_id: z.string().uuid().optional(),
  new_balance: z.number().int().min(0).optional(),
  error: z.string().optional(),
});

export const CreditAdditionRequestSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  amount: z.number().int('Amount must be an integer').positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  transaction_type: z.enum(['bonus', 'refund']),
});

export const CreditAdditionResponseSchema = z.object({
  success: z.boolean(),
  transaction_id: z.string().uuid().optional(),
  new_balance: z.number().int().min(0).optional(),
  error: z.string().optional(),
});

// Credit validation schemas
export const CreditValidationSchema = z.object({
  has_sufficient_credits: z.boolean(),
  required_credits: z.number().int().min(0),
  current_balance: z.number().int().min(0),
  deficit: z.number().int().min(0).optional(),
});

export const CreditValidationResponseSchema = z.object({
  success: z.boolean(),
  validation: CreditValidationSchema.optional(),
  error: z.string().optional(),
});

// Credit policy validation schemas
export const CreditRuleSchema = z.object({
  id: z.string().uuid('Invalid rule ID'),
  policy_id: z.string().uuid('Invalid policy ID'),
  condition: z.string().min(1, 'Condition is required'),
  action: z.enum(['deduct', 'add', 'multiply', 'divide']),
  value: z.number().positive('Value must be positive'),
  priority: z.number().int().min(0, 'Priority cannot be negative'),
  is_active: z.boolean(),
});

export const CreditPolicySchema = z.object({
  id: z.string().uuid('Invalid policy ID'),
  name: z.string().min(1, 'Policy name is required').max(100, 'Policy name too long'),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  rules: z.array(CreditRuleSchema),
  is_active: z.boolean(),
  created_at: z.string().datetime('Invalid created date'),
  updated_at: z.string().datetime('Invalid updated date'),
});

export const CreditPolicyResponseSchema = z.object({
  success: z.boolean(),
  policy: CreditPolicySchema.optional(),
  error: z.string().optional(),
});

// Credit recharge validation schemas
export const RechargeOptionSchema = z.object({
  id: z.string().uuid('Invalid option ID'),
  credits: z.number().int().positive('Credits must be positive'),
  price: z.number().positive('Price must be positive'),
  currency: z.string().min(3, 'Currency code must be at least 3 characters').max(3, 'Currency code must be at most 3 characters'),
  bonus_credits: z.number().int().min(0).optional(),
  is_popular: z.boolean().optional(),
  is_active: z.boolean(),
});

export const RechargeRequestSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  option_id: z.string().uuid('Invalid option ID'),
  payment_method: z.string().min(1, 'Payment method is required'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().min(3, 'Currency code must be at least 3 characters').max(3, 'Currency code must be at most 3 characters'),
});

export const RechargeResponseSchema = z.object({
  success: z.boolean(),
  order_id: z.string().optional(),
  payment_url: z.string().url().optional(),
  error: z.string().optional(),
});

export const RechargeOptionsResponseSchema = z.object({
  success: z.boolean(),
  options: z.array(RechargeOptionSchema).optional(),
  error: z.string().optional(),
});

// Credit history validation schemas
export const CreditHistoryRequestSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  page: z.number().int().positive('Page must be positive').optional(),
  limit: z.number().int().positive('Limit must be positive').max(100, 'Limit cannot exceed 100').optional(),
  type: TransactionTypeSchema.optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});

export const CreditHistoryResponseSchema = z.object({
  success: z.boolean(),
  transactions: z.array(CreditTransactionSchema).optional(),
  pagination: z.object({
    page: z.number().int().positive('Page must be positive'),
    limit: z.number().int().positive('Limit must be positive'),
    total: z.number().int().min(0, 'Total cannot be negative'),
    total_pages: z.number().int().min(0, 'Total pages cannot be negative'),
    has_next: z.boolean(),
    has_prev: z.boolean(),
  }).optional(),
  error: z.string().optional(),
});

// Pagination validation schemas
export const PaginationInfoSchema = z.object({
  page: z.number().int().positive('Page must be positive'),
  limit: z.number().int().positive('Limit must be positive'),
  total: z.number().int().min(0, 'Total cannot be negative'),
  total_pages: z.number().int().min(0, 'Total pages cannot be negative'),
  has_next: z.boolean(),
  has_prev: z.boolean(),
});

// Credit component validation schemas
export const CreditBalancePropsSchema = z.object({
  balance: z.number().int().min(0),
  onRecharge: z.function(),
  showWarning: z.boolean().optional(),
  className: z.string().optional(),
});

export const CreditHistoryPropsSchema = z.object({
  transactions: z.array(CreditTransactionSchema),
  pagination: PaginationInfoSchema.optional(),
  onLoadMore: z.function(),
  onFilter: z.function(),
  className: z.string().optional(),
});

export const RechargeModalPropsSchema = z.object({
  isOpen: z.boolean(),
  onClose: z.function(),
  onRecharge: z.function(),
  options: z.array(RechargeOptionSchema),
  className: z.string().optional(),
});

// Credit hook validation schemas
export const UseCreditsReturnSchema = z.object({
  balance: z.number().int().min(0),
  transactions: z.array(CreditTransactionSchema),
  loading: z.boolean(),
  error: z.string().nullable(),
  deductCredits: z.function(),
  addCredits: z.function(),
  getHistory: z.function(),
  refreshBalance: z.function(),
  canDeduct: z.function(),
});

// Credit validation rule schemas
export const CreditValidationRuleSchema = z.object({
  field: z.string().min(1, 'Field name is required'),
  required: z.boolean(),
  min: z.number().optional(),
  max: z.number().optional(),
  pattern: z.instanceof(RegExp).optional(),
  custom: z.function().optional(),
  message: z.string().min(1, 'Error message is required'),
});

export const CreditValidationSchemaSchema = z.record(z.string(), z.array(CreditValidationRuleSchema));

// Credit error validation schemas
export const CreditErrorSchema = z.object({
  code: z.string().min(1, 'Error code is required'),
  message: z.string().min(1, 'Error message is required'),
  field: z.string().optional(),
  details: z.any().optional(),
});

export const CreditErrorResponseSchema = z.object({
  success: z.literal(false),
  error: CreditErrorSchema,
});

// Credit event validation schemas
export const CreditEventSchema = z.object({
  type: z.enum(['deduction', 'addition', 'recharge', 'error']),
  user_id: z.string().uuid('Invalid user ID'),
  amount: z.number().int(),
  transaction_id: z.string().uuid().optional(),
  description: z.string().optional(),
  timestamp: z.number().positive('Timestamp must be positive'),
});

// Credit configuration validation schemas
export const CreditConfigSchema = z.object({
  default_balance: z.number().int().min(0, 'Default balance cannot be negative'),
  min_balance: z.number().int().min(0, 'Min balance cannot be negative'),
  max_balance: z.number().int().positive('Max balance must be positive'),
  deduction_rate: z.number().positive('Deduction rate must be positive'),
  bonus_rate: z.number().positive('Bonus rate must be positive'),
  currency: z.string().min(3, 'Currency code must be at least 3 characters').max(3, 'Currency code must be at most 3 characters'),
  policies: z.array(CreditPolicySchema),
});

// Credit analytics validation schemas
export const CreditAnalyticsSchema = z.object({
  total_credits: z.number().int().min(0),
  total_transactions: z.number().int().min(0),
  average_balance: z.number().min(0),
  top_users: z.array(z.object({
    user_id: z.string().uuid('Invalid user ID'),
    balance: z.number().int().min(0),
    transaction_count: z.number().int().min(0),
  })),
  transaction_breakdown: z.record(TransactionTypeSchema, z.number().int().min(0)),
});

export const CreditAnalyticsResponseSchema = z.object({
  success: z.boolean(),
  analytics: CreditAnalyticsSchema.optional(),
  error: z.string().optional(),
});

// Credit notification validation schemas
export const CreditNotificationSchema = z.object({
  id: z.string().uuid('Invalid notification ID'),
  user_id: z.string().uuid('Invalid user ID'),
  type: z.enum(['low_balance', 'transaction', 'recharge', 'bonus']),
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  message: z.string().min(1, 'Message is required').max(500, 'Message too long'),
  is_read: z.boolean(),
  created_at: z.string().datetime('Invalid created date'),
});

export const CreditNotificationResponseSchema = z.object({
  success: z.boolean(),
  notifications: z.array(CreditNotificationSchema).optional(),
  error: z.string().optional(),
});

// Validation utility functions
export function validateCreditBalance(data: unknown) {
  return CreditBalanceSchema.parse(data);
}

export function validateCreditBalanceResponse(data: unknown) {
  return CreditBalanceResponseSchema.parse(data);
}

export function validateCreditTransaction(data: unknown) {
  return CreditTransactionSchema.parse(data);
}

export function validateCreditTransactionResponse(data: unknown) {
  return CreditTransactionResponseSchema.parse(data);
}

export function validateCreditTransactionListResponse(data: unknown) {
  return CreditTransactionListResponseSchema.parse(data);
}

export function validateCreditDeductionRequest(data: unknown) {
  return CreditDeductionRequestSchema.parse(data);
}

export function validateCreditDeductionResponse(data: unknown) {
  return CreditDeductionResponseSchema.parse(data);
}

export function validateCreditAdditionRequest(data: unknown) {
  return CreditAdditionRequestSchema.parse(data);
}

export function validateCreditAdditionResponse(data: unknown) {
  return CreditAdditionResponseSchema.parse(data);
}

export function validateCreditValidation(data: unknown) {
  return CreditValidationSchema.parse(data);
}

export function validateCreditValidationResponse(data: unknown) {
  return CreditValidationResponseSchema.parse(data);
}

export function validateCreditPolicy(data: unknown) {
  return CreditPolicySchema.parse(data);
}

export function validateCreditPolicyResponse(data: unknown) {
  return CreditPolicyResponseSchema.parse(data);
}

export function validateRechargeOption(data: unknown) {
  return RechargeOptionSchema.parse(data);
}

export function validateRechargeRequest(data: unknown) {
  return RechargeRequestSchema.parse(data);
}

export function validateRechargeResponse(data: unknown) {
  return RechargeResponseSchema.parse(data);
}

export function validateRechargeOptionsResponse(data: unknown) {
  return RechargeOptionsResponseSchema.parse(data);
}

export function validateCreditHistoryRequest(data: unknown) {
  return CreditHistoryRequestSchema.parse(data);
}

export function validateCreditHistoryResponse(data: unknown) {
  return CreditHistoryResponseSchema.parse(data);
}

export function validatePaginationInfo(data: unknown) {
  return PaginationInfoSchema.parse(data);
}

export function validateCreditBalanceProps(data: unknown) {
  return CreditBalancePropsSchema.parse(data);
}

export function validateCreditHistoryProps(data: unknown) {
  return CreditHistoryPropsSchema.parse(data);
}

export function validateRechargeModalProps(data: unknown) {
  return RechargeModalPropsSchema.parse(data);
}

export function validateUseCreditsReturn(data: unknown) {
  return UseCreditsReturnSchema.parse(data);
}

export function validateCreditValidationRule(data: unknown) {
  return CreditValidationRuleSchema.parse(data);
}

export function validateCreditValidationSchema(data: unknown) {
  return CreditValidationSchemaSchema.parse(data);
}

export function validateCreditError(data: unknown) {
  return CreditErrorSchema.parse(data);
}

export function validateCreditErrorResponse(data: unknown) {
  return CreditErrorResponseSchema.parse(data);
}

export function validateCreditEvent(data: unknown) {
  return CreditEventSchema.parse(data);
}

export function validateCreditConfig(data: unknown) {
  return CreditConfigSchema.parse(data);
}

export function validateCreditAnalytics(data: unknown) {
  return CreditAnalyticsSchema.parse(data);
}

export function validateCreditAnalyticsResponse(data: unknown) {
  return CreditAnalyticsResponseSchema.parse(data);
}

export function validateCreditNotification(data: unknown) {
  return CreditNotificationSchema.parse(data);
}

export function validateCreditNotificationResponse(data: unknown) {
  return CreditNotificationResponseSchema.parse(data);
}

