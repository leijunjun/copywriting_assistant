-- Migration: Create OAuth Sessions Table
-- Description: Creates the oauth_sessions table for WeChat OAuth state management

-- Create oauth_sessions table for WeChat OAuth state management
CREATE TABLE IF NOT EXISTS oauth_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  state VARCHAR(100) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_oauth_sessions_state ON oauth_sessions(state);
CREATE INDEX IF NOT EXISTS idx_oauth_sessions_expires_at ON oauth_sessions(expires_at);

-- Enable RLS
ALTER TABLE oauth_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for oauth_sessions (allow all operations for OAuth flow)
CREATE POLICY "Allow all operations on oauth_sessions" ON oauth_sessions
  FOR ALL USING (true);

-- Grant necessary permissions
GRANT ALL ON oauth_sessions TO anon, authenticated;
GRANT ALL ON oauth_sessions TO service_role;
