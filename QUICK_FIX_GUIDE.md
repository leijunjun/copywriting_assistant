# 🚨 快速修复注册问题指南

## 📋 问题诊断

从终端日志看到两个主要错误：
1. **409错误** - 邮箱已存在
2. **500错误** - 创建用户档案失败

## 🔧 立即解决方案

### 步骤1: 执行数据库修复脚本

在Supabase Dashboard的SQL Editor中执行：

```sql
-- 执行文件: supabase/migrations/011_fix_registration_issues.sql
```

### 步骤2: 检查Supabase认证设置

在Supabase Dashboard中：

1. **进入 Authentication > Settings**
2. **检查以下设置**：
   - `Enable email confirmations`: **OFF**
   - `Password requirements`: 合理设置
   - `Rate limits`: 合理设置

### 步骤3: 运行诊断脚本

```bash
# 检查数据库状态
node debug-database-status.js

# 修复注册问题
node fix-registration-issues.js
```

## 🧪 测试注册功能

### 测试用户注册

```javascript
// 测试注册API
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123',
    nickname: 'Test User'
  })
});

const data = await response.json();
console.log('注册结果:', data);
```

### 预期结果

```json
{
  "success": true,
  "user": {
    "id": "user-id",
    "email": "test@example.com",
    "nickname": "Test User",
    "avatar_url": "",
    "created_at": "2025-01-07T...",
    "updated_at": "2025-01-07T..."
  },
  "session": {
    "access_token": "token",
    "refresh_token": "refresh-token",
    "expires_at": 1234567890
  },
  "credits": {
    "balance": 100,
    "updated_at": "2025-01-07T..."
  }
}
```

## 🔍 故障排除

### 常见问题及解决方案

#### 1. 表不存在错误
```sql
-- 检查表是否存在
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'user_credits', 'credit_transactions');
```

#### 2. 权限错误
```sql
-- 检查RLS策略
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

#### 3. 函数不存在错误
```sql
-- 检查函数是否存在
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('process_credit_transaction', 'initialize_user_credits');
```

#### 4. 认证设置问题
- 确保邮箱确认已关闭
- 检查密码要求设置
- 验证速率限制设置

## 📊 验证修复结果

### 检查数据库状态

```sql
-- 1. 检查表结构
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 2. 检查函数
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
ORDER BY routine_name;

-- 3. 检查索引
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;

-- 4. 检查触发器
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

### 测试核心功能

```sql
-- 1. 测试用户创建
INSERT INTO users (email, nickname) 
VALUES ('test@example.com', 'Test User');

-- 2. 测试积分初始化
SELECT initialize_user_credits(
  (SELECT id FROM users WHERE email = 'test@example.com')
);

-- 3. 测试积分处理
SELECT process_credit_transaction(
  (SELECT id FROM users WHERE email = 'test@example.com'),
  -10,
  'deduction',
  'Test deduction'
);

-- 4. 清理测试数据
DELETE FROM users WHERE email = 'test@example.com';
```

## 🎯 成功指标

修复完成后，您应该看到：

- ✅ 用户注册成功（200状态码）
- ✅ 用户档案创建成功
- ✅ 积分初始化成功（100积分）
- ✅ 会话创建成功
- ✅ 返回完整的用户信息

## 📞 如果问题仍然存在

1. **检查环境变量**：
   ```bash
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $SUPABASE_SERVICE_ROLE_KEY
   ```

2. **检查网络连接**：
   ```bash
   curl -I https://your-project.supabase.co
   ```

3. **查看详细错误日志**：
   - 检查浏览器控制台
   - 检查服务器日志
   - 检查Supabase Dashboard日志

4. **重新执行完整重建**：
   ```sql
   -- 执行完整重建脚本
   -- supabase/migrations/010_complete_database_rebuild.sql
   ```

## 🎉 完成确认

修复完成后，您应该能够：

- ✅ 成功注册新用户
- ✅ 用户自动获得100积分
- ✅ 登录功能正常
- ✅ 积分系统正常
- ✅ 会话管理正常

**注册问题修复完成！** 🎉
