-- Migration: Create WeChat Login and Credit System Tables
-- Description: Creates the database schema for user authentication and credit management

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wechat_openid VARCHAR(100) UNIQUE NOT NULL,
  wechat_unionid VARCHAR(100) UNIQUE,
  nickname VARCHAR(100) NOT NULL,
  avatar_url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_credits table
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 100 CHECK (balance >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create credit_transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount != 0),
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('recharge', 'deduction', 'bonus', 'refund')),
  description TEXT NOT NULL,
  reference_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_wechat_openid ON users(wechat_openid);
CREATE INDEX IF NOT EXISTS idx_users_wechat_unionid ON users(wechat_unionid);
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_created ON credit_transactions(user_id, created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON user_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to validate credit balance
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

-- Create function to validate transaction amount
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

-- Create function for atomic credit operations
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

-- Create function to initialize user credits
CREATE OR REPLACE FUNCTION initialize_user_credits(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_credits (user_id, balance)
  VALUES (p_user_id, 100)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to initialize credits when user is created
CREATE OR REPLACE FUNCTION trigger_initialize_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM initialize_user_credits(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER initialize_user_credits_trigger
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_initialize_user_credits();
