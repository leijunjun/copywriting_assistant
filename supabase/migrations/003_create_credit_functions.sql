-- Migration: Create Credit Management Functions
-- Description: Creates additional functions for credit operations and validation

-- Function to get user credit balance
CREATE OR REPLACE FUNCTION get_user_credit_balance(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  user_balance INTEGER;
BEGIN
  SELECT balance INTO user_balance
  FROM user_credits
  WHERE user_id = p_user_id;
  
  RETURN COALESCE(user_balance, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has sufficient credits
CREATE OR REPLACE FUNCTION has_sufficient_credits(p_user_id UUID, p_required_amount INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  SELECT balance INTO current_balance
  FROM user_credits
  WHERE user_id = p_user_id;
  
  RETURN COALESCE(current_balance, 0) >= p_required_amount;
END;
$$ LANGUAGE plpgsql;

-- Function to get user transaction history with pagination
CREATE OR REPLACE FUNCTION get_user_transactions(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_transaction_type VARCHAR(20) DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  amount INTEGER,
  transaction_type VARCHAR(20),
  description TEXT,
  reference_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ct.id,
    ct.amount,
    ct.transaction_type,
    ct.description,
    ct.reference_id,
    ct.created_at
  FROM credit_transactions ct
  WHERE ct.user_id = p_user_id
    AND (p_transaction_type IS NULL OR ct.transaction_type = p_transaction_type)
  ORDER BY ct.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Function to get transaction count for pagination
CREATE OR REPLACE FUNCTION get_user_transaction_count(
  p_user_id UUID,
  p_transaction_type VARCHAR(20) DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  transaction_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO transaction_count
  FROM credit_transactions
  WHERE user_id = p_user_id
    AND (p_transaction_type IS NULL OR transaction_type = p_transaction_type);
  
  RETURN transaction_count;
END;
$$ LANGUAGE plpgsql;

-- Function to add credits (for bonuses, refunds, etc.)
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_reference_id VARCHAR(100) DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Use the existing process_credit_transaction function
  SELECT process_credit_transaction(
    p_user_id,
    p_amount,
    'bonus',
    p_description
  ) INTO result;
  
  -- Update reference_id if provided
  IF p_reference_id IS NOT NULL THEN
    UPDATE credit_transactions
    SET reference_id = p_reference_id
    WHERE user_id = p_user_id
      AND transaction_type = 'bonus'
      AND description = p_description
      AND created_at > NOW() - INTERVAL '1 minute';
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to deduct credits for content generation
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_reference_id VARCHAR(100) DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Use the existing process_credit_transaction function with negative amount
  SELECT process_credit_transaction(
    p_user_id,
    -p_amount,
    'deduction',
    p_description
  ) INTO result;
  
  -- Update reference_id if provided
  IF p_reference_id IS NOT NULL THEN
    UPDATE credit_transactions
    SET reference_id = p_reference_id
    WHERE user_id = p_user_id
      AND transaction_type = 'deduction'
      AND description = p_description
      AND created_at > NOW() - INTERVAL '1 minute';
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get user profile with credit information
CREATE OR REPLACE FUNCTION get_user_profile_with_credits(p_user_id UUID)
RETURNS TABLE (
  user_id UUID,
  wechat_openid VARCHAR(100),
  wechat_unionid VARCHAR(100),
  nickname VARCHAR(100),
  avatar_url VARCHAR(500),
  credit_balance INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.wechat_openid,
    u.wechat_unionid,
    u.nickname,
    u.avatar_url,
    uc.balance,
    u.created_at,
    u.updated_at
  FROM users u
  LEFT JOIN user_credits uc ON u.id = uc.user_id
  WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql;
