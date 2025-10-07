-- Migration: Create User Sessions Table
-- Description: Creates the user_sessions table for WeChat user session management

-- Create user_sessions table for WeChat user session management
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_token VARCHAR(255) UNIQUE NOT NULL,
  refresh_token VARCHAR(255),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_access_token ON user_sessions(access_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Enable RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for user_sessions (allow all operations for session management)
CREATE POLICY "Allow all operations on user_sessions" ON user_sessions
  FOR ALL USING (true);

-- Grant necessary permissions
GRANT ALL ON user_sessions TO anon, authenticated;
GRANT ALL ON user_sessions TO service_role;
