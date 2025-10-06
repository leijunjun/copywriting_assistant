# Research Findings: WeChat Login and Credit System

## WeChat OAuth 2.0 Integration for Next.js

**Decision**: Use WeChat Official Account OAuth 2.0 with QR code flow
**Rationale**: 
- WeChat Official Account provides the most reliable OAuth integration
- QR code flow is user-friendly and secure
- Supports both web and mobile users
- Official WeChat SDK provides comprehensive documentation

**Implementation Pattern**:
```typescript
// 1. Generate QR code with state parameter
const state = generateRandomState();
const qrUrl = `https://open.weixin.qq.com/connect/qrconnect?appid=${APP_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=snsapi_login&state=${state}`;

// 2. Poll for authorization completion
const pollAuthStatus = async (state: string) => {
  // Check if user has authorized
  const response = await fetch(`/api/auth/wechat/status?state=${state}`);
  return response.json();
};

// 3. Exchange code for access token
const exchangeCodeForToken = async (code: string) => {
  const response = await fetch('/api/auth/wechat/callback', {
    method: 'POST',
    body: JSON.stringify({ code })
  });
  return response.json();
};
```

**Alternatives Considered**:
- WeChat Mini Program login: Limited to mobile users only
- WeChat Web login: Less secure, requires additional verification
- Third-party OAuth providers: Not aligned with WeChat ecosystem

## Supabase Row Level Security Implementation

**Decision**: Use Supabase RLS policies with user-based isolation
**Rationale**:
- Automatic security enforcement at database level
- Prevents data leakage through application bugs
- Scales well with user growth
- Integrates seamlessly with Supabase Auth

**Implementation Pattern**:
```sql
-- Enable RLS on all user-related tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Credits are user-specific
CREATE POLICY "Users can view own credits" ON user_credits
  FOR SELECT USING (auth.uid() = user_id);

-- Transactions are user-specific
CREATE POLICY "Users can view own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);
```

**Alternatives Considered**:
- Application-level security: Prone to human error, harder to maintain
- Custom middleware: More complex, requires additional testing
- Database views: Limited flexibility, harder to modify

## WeChat Pay Integration for Credit Recharge

**Decision**: Use WeChat Pay JSAPI for web payments
**Rationale**:
- Native WeChat payment experience
- High conversion rates for WeChat users
- Secure payment processing
- Comprehensive documentation and support

**Implementation Pattern**:
```typescript
// 1. Create payment order
const createPaymentOrder = async (amount: number, userId: string) => {
  const order = await supabase
    .from('payment_orders')
    .insert({
      user_id: userId,
      amount,
      status: 'pending',
      payment_method: 'wechat_pay'
    })
    .select()
    .single();

  // Call WeChat Pay API to create prepay_id
  const prepayResponse = await fetch('/api/payment/wechat/create', {
    method: 'POST',
    body: JSON.stringify({
      order_id: order.id,
      amount: amount * 100, // Convert to cents
      description: `Credit Recharge - ${amount} credits`
    })
  });

  return prepayResponse.json();
};

// 2. Handle payment callback
const handlePaymentCallback = async (prepayId: string, result: string) => {
  if (result === 'SUCCESS') {
    // Update order status and add credits
    await supabase.rpc('process_payment_success', {
      prepay_id: prepayId
    });
  }
};
```

**Alternatives Considered**:
- Alipay: Limited to Chinese market, less integration with WeChat
- Stripe: International focus, higher fees, less WeChat integration
- Bank transfers: Manual process, poor user experience

## JWT Token Management with Supabase

**Decision**: Use Supabase Auth with httpOnly cookies for session management
**Rationale**:
- Built-in JWT handling with automatic refresh
- Secure cookie storage prevents XSS attacks
- Seamless integration with Supabase RLS
- Automatic token validation and renewal

**Implementation Pattern**:
```typescript
// 1. Configure Supabase client with auth
const supabase = createClientComponentClient();

// 2. Handle WeChat OAuth callback
const handleWeChatCallback = async (code: string) => {
  // Exchange WeChat code for Supabase session
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'wechat',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: { code }
    }
  });

  if (error) throw error;
  return data;
};

// 3. Server-side session validation
const getServerSession = async (request: Request) => {
  const supabase = createServerComponentClient({ cookies: () => request.headers.get('cookie') });
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};
```

**Alternatives Considered**:
- Custom JWT implementation: More complex, security risks
- Session-based auth: Not stateless, harder to scale
- OAuth-only: Limited session management capabilities

## Atomic Credit Transaction Patterns

**Decision**: Use database transactions with Supabase RPC functions
**Rationale**:
- Ensures data consistency across credit operations
- Prevents race conditions in concurrent transactions
- Atomic operations prevent partial failures
- Built-in rollback on errors

**Implementation Pattern**:
```sql
-- RPC function for atomic credit operations
CREATE OR REPLACE FUNCTION process_credit_transaction(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type VARCHAR(20),
  p_description TEXT
) RETURNS JSON AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
  transaction_id UUID;
BEGIN
  -- Start transaction
  BEGIN
    -- Get current balance
    SELECT balance INTO current_balance 
    FROM user_credits 
    WHERE user_id = p_user_id;
    
    -- Calculate new balance
    new_balance := current_balance + p_amount;
    
    -- Check for negative balance
    IF new_balance < 0 THEN
      RAISE EXCEPTION 'Insufficient credits';
    END IF;
    
    -- Update balance
    UPDATE user_credits 
    SET balance = new_balance, updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Log transaction
    INSERT INTO credit_transactions (user_id, amount, transaction_type, description)
    VALUES (p_user_id, p_amount, p_transaction_type, p_description)
    RETURNING id INTO transaction_id;
    
    -- Return success
    RETURN json_build_object(
      'success', true,
      'transaction_id', transaction_id,
      'new_balance', new_balance
    );
    
  EXCEPTION WHEN OTHERS THEN
    -- Rollback on error
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
  END;
END;
$$ LANGUAGE plpgsql;
```

**Alternatives Considered**:
- Application-level transactions: Prone to race conditions
- Event sourcing: Over-engineered for this use case
- Two-phase commit: Complex, not needed for single database

## Performance Optimization Strategies

**Decision**: Implement caching, lazy loading, and database optimization
**Rationale**:
- Meets performance requirements (1.5s load time, 120KB bundle)
- Improves user experience
- Reduces server load
- Cost-effective scaling

**Implementation Strategies**:
1. **Database Optimization**:
   - Proper indexing on user_id, created_at columns
   - Connection pooling with Supabase
   - Query optimization for credit operations

2. **Frontend Optimization**:
   - Code splitting for auth components
   - Lazy loading of credit management pages
   - Image optimization for WeChat QR codes
   - Bundle analysis and tree shaking

3. **Caching Strategy**:
   - Redis caching for user sessions
   - CDN for static assets
   - Browser caching for API responses

**Alternatives Considered**:
- Server-side rendering: Not needed for this use case
- Microservices: Over-engineered for current scale
- GraphQL: Adds complexity without clear benefits

## Security Best Practices

**Decision**: Implement comprehensive security measures
**Rationale**:
- Protect user data and payment information
- Prevent common web vulnerabilities
- Ensure compliance with WeChat security requirements
- Maintain user trust

**Security Measures**:
1. **Input Validation**: Zod schemas for all API inputs
2. **Rate Limiting**: Prevent abuse of auth and payment endpoints
3. **HTTPS Enforcement**: All communications encrypted
4. **CSRF Protection**: Token-based protection for state-changing operations
5. **XSS Prevention**: Content Security Policy and input sanitization
6. **SQL Injection Prevention**: Parameterized queries with Supabase

**Alternatives Considered**:
- Basic validation: Insufficient for production
- Third-party security services: Additional cost and complexity
- Custom security implementation: Higher risk of vulnerabilities
