# 🗄️ 数据库重建指南

## 📋 概述

本指南将帮助您完全重建数据库，删除所有历史数据，创建一个全新的邮件认证系统。

## ⚠️ 重要警告

**此操作将删除所有现有数据！请确保已备份重要数据！**

## 🚀 执行步骤

### 步骤1: 登录Supabase Dashboard

1. 打开 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择您的项目
3. 进入 **SQL Editor**

### 步骤2: 执行重建脚本

**复制并执行以下完整SQL脚本：**

```sql
-- 执行文件: supabase/migrations/010_complete_database_rebuild.sql
```

### 步骤3: 验证重建结果

执行以下查询来验证数据库结构：

```sql
-- 检查所有表
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 检查所有函数
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
ORDER BY routine_name;

-- 检查系统配置
SELECT * FROM system_config;

-- 检查行级安全策略
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

## 📊 重建后的数据库结构

### 核心表
- ✅ `users` - 用户表（邮件认证）
- ✅ `user_credits` - 用户积分表
- ✅ `credit_transactions` - 积分交易表
- ✅ `user_sessions` - 用户会话表
- ✅ `system_config` - 系统配置表
- ✅ `audit_logs` - 审计日志表

### 功能特性
- ✅ 邮件+密码认证
- ✅ 积分系统（新用户100积分）
- ✅ 会话管理
- ✅ 审计日志
- ✅ 行级安全策略
- ✅ 数据验证
- ✅ 用户统计视图

### 系统配置
- ✅ 初始积分：100
- ✅ 最小密码长度：6
- ✅ 最大登录尝试：5次
- ✅ 会话超时：3600秒
- ✅ 每用户最大会话：3个

## 🔧 后续配置

### 1. 环境变量检查
确保以下环境变量已正确设置：

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Supabase认证设置
在Supabase Dashboard中配置：

**Authentication > Settings:**
- `Enable email confirmations`: **OFF**
- `Password requirements`: 合理设置
- `Rate limits`: 合理设置

### 3. 测试数据库连接
运行以下测试查询：

```sql
-- 测试用户创建
SELECT process_credit_transaction(
  '00000000-0000-0000-0000-000000000000'::UUID,
  100,
  'bonus',
  'Test transaction'
);

-- 测试数据验证
SELECT validate_user_data('test@example.com', 'Test User');

-- 测试用户统计
SELECT * FROM user_stats LIMIT 5;
```

## 📈 性能优化

### 索引优化
- ✅ 邮箱查找索引
- ✅ 用户ID索引
- ✅ 时间戳索引
- ✅ 复合索引

### 查询优化
- ✅ 行级安全策略
- ✅ 数据验证约束
- ✅ 触发器优化
- ✅ 视图缓存

## 🧪 测试建议

### 功能测试
1. **用户注册测试**
   ```sql
   -- 测试用户注册流程
   INSERT INTO users (email, nickname) 
   VALUES ('test@example.com', 'Test User');
   ```

2. **积分系统测试**
   ```sql
   -- 测试积分交易
   SELECT process_credit_transaction(
     (SELECT id FROM users WHERE email = 'test@example.com'),
     -10,
     'deduction',
     'Test deduction'
   );
   ```

3. **会话管理测试**
   ```sql
   -- 测试会话创建
   INSERT INTO user_sessions (user_id, session_token, expires_at)
   VALUES (
     (SELECT id FROM users WHERE email = 'test@example.com'),
     'test_token_123',
     NOW() + INTERVAL '1 hour'
   );
   ```

### 安全测试
1. **行级安全测试**
   ```sql
   -- 测试数据隔离
   SET LOCAL role TO 'authenticated';
   SET LOCAL "request.jwt.claims" TO '{"sub": "test-user-id"}';
   SELECT * FROM users; -- 应该只返回当前用户的数据
   ```

2. **数据验证测试**
   ```sql
   -- 测试邮箱验证
   SELECT validate_user_data('invalid-email', 'Test User');
   
   -- 测试重复邮箱
   SELECT validate_user_data('test@example.com', 'Test User');
   ```

## 🔍 故障排除

### 常见问题

1. **表创建失败**
   - 检查是否有权限错误
   - 确认Supabase连接正常

2. **函数创建失败**
   - 检查SQL语法
   - 确认函数名不冲突

3. **索引创建失败**
   - 检查表是否存在
   - 确认索引名不冲突

4. **策略创建失败**
   - 检查RLS是否已启用
   - 确认策略名不冲突

### 调试查询

```sql
-- 检查表状态
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public';

-- 检查函数状态
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_schema = 'public';

-- 检查策略状态
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public';
```

## 📞 技术支持

如果遇到问题，请检查：

1. **Supabase连接状态**
2. **环境变量配置**
3. **权限设置**
4. **SQL语法错误**

## 🎉 完成确认

重建完成后，您应该看到：

- ✅ 6个核心表已创建
- ✅ 8个函数已创建
- ✅ 1个视图已创建
- ✅ 行级安全策略已启用
- ✅ 系统配置已插入
- ✅ 所有索引已创建

**数据库重建完成！** 🎉

现在您可以开始使用全新的邮件认证系统了！
