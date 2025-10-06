# Data Model: WeChat Login and Credit System

## Entity Definitions

### User Entity
**Table**: `users`
**Purpose**: Store user information from WeChat OAuth

```typescript
interface User {
  id: string;                    // UUID primary key
  wechat_openid: string;        // WeChat OpenID (unique)
  wechat_unionid?: string;      // WeChat UnionID (optional)
  nickname: string;             // WeChat nickname
  avatar_url: string;           // WeChat avatar URL
  created_at: Date;             // Account creation timestamp
  updated_at: Date;             // Last update timestamp
}
```

**Validation Rules**:
- `wechat_openid` is required and unique
- `nickname` must be 1-100 characters
- `avatar_url` must be valid URL format
- `created_at` and `updated_at` are auto-generated

**State Transitions**:
- `created` → `active` (after first login)
- `active` → `suspended` (admin action)
- `suspended` → `active` (admin action)

### Credit Entity
**Table**: `user_credits`
**Purpose**: Track user credit balance

```typescript
interface UserCredits {
  id: string;                   // UUID primary key
  user_id: string;              // Foreign key to users.id
  balance: number;              // Current credit balance
  created_at: Date;             // Record creation timestamp
  updated_at: Date;             // Last update timestamp
}
```

**Validation Rules**:
- `user_id` is required and references users.id
- `balance` must be non-negative integer
- Default balance is 100 credits for new users
- Balance updates are atomic operations

**State Transitions**:
- `initial` → `active` (100 credits on account creation)
- `active` → `low` (balance < 20 credits)
- `low` → `active` (after recharge)
- `active` → `insufficient` (balance < required amount)

### Transaction Entity
**Table**: `credit_transactions`
**Purpose**: Log all credit operations

```typescript
interface CreditTransaction {
  id: string;                   // UUID primary key
  user_id: string;              // Foreign key to users.id
  amount: number;               // Transaction amount (positive/negative)
  transaction_type: 'recharge' | 'deduction' | 'bonus' | 'refund';
  description: string;          // Human-readable description
  reference_id?: string;        // External reference (payment ID, etc.)
  created_at: Date;             // Transaction timestamp
}
```

**Validation Rules**:
- `user_id` is required and references users.id
- `amount` is required (positive for credits, negative for deductions)
- `transaction_type` must be one of the defined values
- `description` is required and max 500 characters
- `reference_id` is optional for external system references

**State Transitions**:
- `pending` → `completed` (successful transaction)
- `pending` → `failed` (failed transaction)
- `completed` → `refunded` (refund processed)

### Payment Order Entity
**Table**: `payment_orders`
**Purpose**: Track credit recharge payments

```typescript
interface PaymentOrder {
  id: string;                   // UUID primary key
  user_id: string;              // Foreign key to users.id
  amount: number;               // Payment amount in cents
  credits: number;              // Credits to be added
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_method: 'wechat_pay'; // Payment method
  wechat_prepay_id?: string;    // WeChat prepay ID
  wechat_transaction_id?: string; // WeChat transaction ID
  created_at: Date;             // Order creation timestamp
  completed_at?: Date;          // Payment completion timestamp
}
```

**Validation Rules**:
- `user_id` is required and references users.id
- `amount` must be positive integer (cents)
- `credits` must be positive integer
- `status` must be one of the defined values
- `payment_method` is currently only 'wechat_pay'
- `wechat_prepay_id` is required for WeChat Pay orders

**State Transitions**:
- `pending` → `completed` (successful payment)
- `pending` → `failed` (payment failure)
- `pending` → `cancelled` (user cancellation)
- `completed` → `refunded` (refund processed)

## Relationships

### One-to-One Relationships
- `users` ←→ `user_credits` (each user has exactly one credit record)
- `users` ←→ `user_sessions` (each user has one active session)

### One-to-Many Relationships
- `users` ←→ `credit_transactions` (user has many transactions)
- `users` ←→ `payment_orders` (user has many payment orders)

## Database Constraints

### Primary Keys
- All tables use UUID primary keys
- Primary keys are immutable

### Foreign Keys
- `user_credits.user_id` → `users.id` (CASCADE DELETE)
- `credit_transactions.user_id` → `users.id` (CASCADE DELETE)
- `payment_orders.user_id` → `users.id` (CASCADE DELETE)

### Unique Constraints
- `users.wechat_openid` (unique)
- `users.wechat_unionid` (unique, nullable)

### Check Constraints
- `user_credits.balance >= 0`
- `credit_transactions.amount != 0`
- `payment_orders.amount > 0`
- `payment_orders.credits > 0`

## Indexes

### Performance Indexes
```sql
-- User lookup by WeChat OpenID
CREATE INDEX idx_users_wechat_openid ON users(wechat_openid);

-- Credit balance queries
CREATE INDEX idx_user_credits_user_id ON user_credits(user_id);

-- Transaction history queries
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);

-- Payment order queries
CREATE INDEX idx_payment_orders_user_id ON payment_orders(user_id);
CREATE INDEX idx_payment_orders_status ON payment_orders(status);
CREATE INDEX idx_payment_orders_created_at ON payment_orders(created_at DESC);
```

### Composite Indexes
```sql
-- User transaction history with date range
CREATE INDEX idx_credit_transactions_user_created ON credit_transactions(user_id, created_at DESC);

-- Payment orders by user and status
CREATE INDEX idx_payment_orders_user_status ON payment_orders(user_id, status);
```

## Row Level Security (RLS) Policies

### Users Table
```sql
-- Users can only view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

### User Credits Table
```sql
-- Users can only view their own credits
CREATE POLICY "Users can view own credits" ON user_credits
  FOR SELECT USING (auth.uid() = user_id);

-- System can update credits (via RPC functions)
CREATE POLICY "System can update credits" ON user_credits
  FOR UPDATE USING (auth.role() = 'service_role');
```

### Credit Transactions Table
```sql
-- Users can only view their own transactions
CREATE POLICY "Users can view own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- System can insert transactions (via RPC functions)
CREATE POLICY "System can insert transactions" ON credit_transactions
  FOR INSERT WITH CHECK (auth.role() = 'service_role');
```

### Payment Orders Table
```sql
-- Users can only view their own payment orders
CREATE POLICY "Users can view own payment orders" ON payment_orders
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own payment orders
CREATE POLICY "Users can create own payment orders" ON payment_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- System can update payment orders (via webhooks)
CREATE POLICY "System can update payment orders" ON payment_orders
  FOR UPDATE USING (auth.role() = 'service_role');
```

## Data Validation Functions

### Credit Balance Validation
```sql
CREATE OR REPLACE FUNCTION validate_credit_balance(p_user_id UUID, p_amount INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  SELECT balance INTO current_balance 
  FROM user_credits 
  WHERE user_id = p_user_id;
  
  RETURN (current_balance + p_amount) >= 0;
END;
$$ LANGUAGE plpgsql;
```

### Transaction Amount Validation
```sql
CREATE OR REPLACE FUNCTION validate_transaction_amount(p_amount INTEGER, p_type VARCHAR(20))
RETURNS BOOLEAN AS $$
BEGIN
  IF p_type = 'deduction' THEN
    RETURN p_amount < 0;
  ELSIF p_type IN ('recharge', 'bonus', 'refund') THEN
    RETURN p_amount > 0;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

## Audit Trail

### Automatic Timestamps
- All tables have `created_at` timestamp
- All tables have `updated_at` timestamp (auto-updated on changes)

### Transaction Logging
- All credit operations are logged in `credit_transactions`
- Payment operations are logged in `payment_orders`
- Failed operations are logged with error details

### Data Retention
- Transaction history: 2 years
- Payment orders: 7 years (for tax/audit purposes)
- User data: Until account deletion
