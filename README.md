# 一推火 AI 文案助手

一个基于 Next.js 14 的智能文案生成平台，专为家政行业提供AI驱动的文案创作和图片生成服务。

## 系统技术框架

### 前端技术栈
- **框架**: Next.js 14.2.5 (App Router)
- **UI库**: Radix UI + Tailwind CSS
- **状态管理**: Redux Toolkit
- **国际化**: next-intl
- **表单处理**: React Hook Form + Zod
- **类型检查**: TypeScript 5

### 后端技术栈
- **API框架**: Next.js API Routes
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **AI服务**: 豆包API (字节跳动)、阿里 Qwen MAX
- **图片生成**: 豆包图像生成API、阿里文字生成 API

### 开发工具
- **测试**: Jest + Playwright
- **代码质量**: ESLint + Prettier
- **部署**: Vercel
- **包管理**: pnpm

## 主要功能模块

### 1. 内容创作模块
- 语法检查和改进建议
- 文章标题生成
- 句子改写和扩展
- 博客大纲生成
- 内容摘要生成

### 2. 公域推广模块
- 视频标题和描述生成
- 小红书帖子生成
- 微博帖子生成
- 抖音短视频脚本
- 社交网络Bio生成

### 3. 营销活动模块
- SEO标题生成
- 节日活动策划
- 爆款活动标题生成

### 4. 微信私域模块
- 朋友圈回复生成
- 高情商对话生成

### 5. 顾客互动模块
- 语气分析
- 邮件生成和回复
- 评论回复生成
- 专业解释生成

### 6. 工作提效模块
- 文字转表格
- 任务拆解
- 日报/周报/月报生成
- 会议总结

### 7. AI图片生成模块
- 智能配图生成
- 多风格支持
- 多尺寸适配
- 行业定制化

## 各工具功能及表单字段配置

### 内容创作工具
1. **语法检查器**
   - 字段: content (文本域), type (选择器)
   - 支持: 文章、邮件、报告、社交媒体等类型

2. **书名生成器**
   - 字段: content (文本域), tone (选择器), audience (选择器)
   - 支持: 多种语气和目标用户类型

3. **句子改写**
   - 字段: content (文本域), tone (选择器)
   - 支持: 专业、礼貌、易读等改写风格

4. **文章标题生成**
   - 字段: content (文本域), keywords (输入框), type (选择器), style (选择器)
   - 支持: 新闻、博客、技术报告等类型

### 公域推广工具
1. **小红书帖子生成**
   - 字段: role (输入框), background (文本域), purpose (文本域), tone (选择器)
   - 支持: 多种角色模板和背景场景

2. **抖音短视频脚本**
   - 字段: promotionGoal (输入框), customerGroup (输入框), productHighlights (输入框), restrictions (输入框), tone (选择器)
   - 支持: 获客引流、建立信任、打造人设等目标

3. **视频标题生成**
   - 字段: content (文本域), keywords (输入框), tone (选择器), audience (选择器)
   - 支持: 生活博客、游戏玩家、学生等目标用户

### 工作提效工具
1. **日报生成**
   - 字段: workLog (文本域)
   - 功能: 总结工作内容，生成结构化日报

2. **任务拆解**
   - 字段: content (文本域)
   - 功能: 将复杂任务分解为可执行步骤

3. **文字转表格**
   - 字段: content (文本域)
   - 功能: 将冗长内容整理成清晰表格

## 外部接口使用

### 1. 豆包API (字节跳动)
- **用途**: 文本生成和图片生成
- **接口**: `/v1/chat/completions` (文本生成)
- **接口**: `/doubao/images/generations` (图片生成)
- **认证**: Bearer Token
- **模型**: doubao-seedream-4-0-250828

### 2. Supabase
- **用途**: 数据库和用户认证
- **功能**: 用户管理、积分系统、数据存储
- **认证**: JWT Token

### 3. 微信API
- **用途**: 微信登录和二维码生成
- **功能**: 用户身份验证

## 数据库结构

### 核心表结构

#### 1. users 表
```sql
- id: UUID (主键)
- email: VARCHAR (邮箱)
- nickname: VARCHAR (昵称)
- avatar_url: VARCHAR (头像URL)
- industry: VARCHAR (行业类型)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 2. user_credits 表
```sql
- id: UUID (主键)
- user_id: UUID (外键)
- balance: INTEGER (积分余额)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 3. credit_transactions 表
```sql
- id: UUID (主键)
- user_id: UUID (外键)
- amount: INTEGER (交易金额)
- transaction_type: VARCHAR (交易类型)
- description: TEXT (描述)
- service_type: VARCHAR (服务类型)
- created_at: TIMESTAMP
```

#### 4. system_config 表
```sql
- id: UUID (主键)
- config_key: VARCHAR (配置键)
- config_value: VARCHAR (配置值)
- description: TEXT (描述)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### 数据库迁移
- `20241201_add_industry_to_users.sql`: 添加行业字段
- `20241213_add_lifestyle_beauty_industry.sql`: 添加生活美妆行业
- `20241215_add_image_generation_credits.sql`: 添加图片生成积分配置

## 积分增删改机制

### 积分配置
```typescript
export const CREDIT_CONFIG = {
  // 文案生成
  WRITING_GENERATION: {
    COST: 10,
    MIN_COST: 1,
    MAX_COST: 50,
  },
  // 图片生成
  IMAGE_GENERATION: {
    COST: 50,
    MIN_COST: 1,
    MAX_COST: 100,
  },
  // 用户注册奖励
  REGISTRATION_BONUS: 100,
  // 每日签到奖励（没有启用）
  DAILY_CHECKIN_BONUS: 10,
}
```

### 积分操作流程
1. **扣除积分**: 使用服务前检查余额，成功后扣除
2. **增加积分**: 注册奖励、签到奖励、充值等
3. **积分验证**: 防止恶意操作，确保数据一致性
4. **交易记录**: 所有积分变动都有详细记录

### 安全机制
- 积分操作验证
- 防重复扣费
- 操作日志记录
- 异常处理机制

## 登录及账号机制

### 认证方式
1. **邮箱注册**: 邮箱+密码注册
2. **微信登录**: 微信扫码登录
3. **会话管理**: JWT Token + Refresh Token

### 用户注册流程
1. 邮箱验证
2. 密码强度检查
3. 行业选择
4. 创建用户档案
5. 初始化积分账户
6. 发送欢迎积分

### 会话管理
- **访问令牌**: 1小时有效期
- **刷新令牌**: 自动续期
- **会话验证**: 实时验证用户身份
- **安全退出**: 清除所有会话数据

### 权限控制
- 用户身份验证
- 积分余额检查
- 服务权限验证
- 操作日志记录

## 预设内容配置文件及路径

### 配置文件结构
```
src/constant/
├── industry/           # 行业预设配置
│   ├── index.ts        # 行业配置入口
│   ├── general.ts      # 通用行业配置
│   ├── housekeeping.ts # 家政行业配置
│   ├── beauty.ts       # 美容行业配置
│   └── lifestyle-beauty.ts # 生活美妆配置
├── language.ts         # 多语言配置
└── tool_list.tsx      # 工具列表配置
```

### 行业预设内容
每个行业都有针对性的预设内容，包括：
- **角色模板**: 不同身份角色的预设
- **背景场景**: 常见业务场景描述
- **目的需求**: 营销目标设定
- **客户群体**: 目标客户画像
- **产品亮点**: 服务特色描述
- **限制条件**: 合规要求说明

### 多语言支持
- **中文**: 简体中文界面和内容
- **英文**: English interface and content
- **日文**: 日本語インターフェースとコンテンツ

### 工具配置
每个工具都有详细的字段配置：
- **字段类型**: Input、Select、Textarea
- **多语言标签**: 中英日三语标签
- **选项列表**: 预定义选项
- **验证规则**: 字段验证逻辑

## 部署和运行

### 环境变量配置
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_API_KEY=your_doubao_api_key
NEXT_PUBLIC_API_URL=your_api_url
NEXT_PUBLIC_MODEL_NAME=your_model_name
```

### 开发环境启动
```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 运行测试
pnpm test

# 代码格式化
pnpm format
```

### 生产环境部署
```bash
# 构建项目
pnpm build

# 启动生产服务器
pnpm start
```

## 项目特色

1. **行业定制化**: 针对家政行业深度定制
2. **多语言支持**: 中英日三语界面
3. **智能配图**: AI驱动的图片生成
4. **积分系统**: 完善的用户激励机制
5. **安全可靠**: 多重安全验证机制
6. **易于扩展**: 模块化架构设计

## 技术亮点

- **流式响应**: 实时显示生成过程
- **错误处理**: 完善的异常处理机制
- **性能优化**: 代码分割和懒加载
- **类型安全**: 全面的TypeScript支持
- **测试覆盖**: 单元测试和E2E测试
- **代码质量**: ESLint和Prettier规范
