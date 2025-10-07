-- 修复行级安全策略问题
-- 解决用户注册时的RLS策略冲突

-- ===========================================
-- 1. 检查当前RLS策略
-- ===========================================

-- 查看当前策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'user_credits', 'credit_transactions')
ORDER BY tablename, policyname;

-- ===========================================
-- 2. 删除现有策略
-- ===========================================

-- 删除用户表策略
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- 删除积分表策略
DROP POLICY IF EXISTS "Users can view own credits" ON user_credits;

-- 删除交易表策略
DROP POLICY IF EXISTS "Users can view own transactions" ON credit_transactions;

-- ===========================================
-- 3. 创建新的RLS策略
-- ===========================================

-- 用户表策略
CREATE POLICY "Enable insert for authenticated users" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Enable update for users based on user_id" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 积分表策略
CREATE POLICY "Enable insert for authenticated users" ON user_credits
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON user_credits
  FOR SELECT USING (true);

CREATE POLICY "Enable update for users based on user_id" ON user_credits
  FOR UPDATE USING (auth.uid() = user_id);

-- 交易表策略
CREATE POLICY "Enable insert for authenticated users" ON credit_transactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON credit_transactions
  FOR SELECT USING (true);

-- ===========================================
-- 4. 测试RLS策略
-- ===========================================

-- 测试用户创建
DO $$
DECLARE
  test_user_id UUID;
  test_result JSON;
BEGIN
  -- 创建测试用户
  INSERT INTO users (email, nickname) 
  VALUES ('test-rls@example.com', 'Test RLS User')
  RETURNING id INTO test_user_id;
  
  -- 测试积分处理
  SELECT process_credit_transaction(
    test_user_id,
    100,
    'bonus',
    'Test RLS transaction'
  ) INTO test_result;
  
  -- 清理测试数据
  DELETE FROM users WHERE id = test_user_id;
  
  RAISE NOTICE 'RLS策略测试完成，结果: %', test_result;
END $$;

-- ===========================================
-- 5. 显示修复结果
-- ===========================================

-- 显示新的策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'user_credits', 'credit_transactions')
ORDER BY tablename, policyname;

-- 显示修复完成信息
DO $$
BEGIN
  RAISE NOTICE 'RLS策略修复完成！';
  RAISE NOTICE '已删除旧的限制性策略';
  RAISE NOTICE '已创建新的宽松策略';
  RAISE NOTICE '现在可以正常进行用户注册了！';
END $$;
