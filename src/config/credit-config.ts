/**
 * 积分配置常量
 * 统一管理所有积分相关的硬编码值
 */

// 图片生成积分成本配置
export const IMAGE_GENERATION_CREDITS = 50;

// 其他积分配置
export const CREDIT_CONFIG = {
  // 图片生成
  IMAGE_GENERATION: {
    COST: 50,
    MIN_COST: 1,
    MAX_COST: 100,
  },
  // 文案生成
  WRITING_GENERATION: {
    COST: 10,
    MIN_COST: 1,
    MAX_COST: 50,
  },
  // 用户注册奖励
  REGISTRATION_BONUS: 100,
  // 每日签到奖励
  DAILY_CHECKIN_BONUS: 10,
} as const;

// 积分验证规则
export const CREDIT_VALIDATION = {
  // 允许的积分成本范围
  ALLOWED_COSTS: [1, 2, 5, 10, 15, 20, 25, 30, 50, 100],
  // 最大单次扣除
  MAX_SINGLE_DEDUCTION: 100,
  // 最小积分余额
  MIN_BALANCE: 0,
} as const;

// 安全配置
export const SECURITY_CONFIG = {
  // API请求频率限制
  RATE_LIMIT: {
    WINDOW_MS: 60000, // 1分钟
    MAX_REQUESTS: 10,  // 最多10次请求
  },
  // 积分操作日志
  LOG_CREDIT_OPERATIONS: true,
  // 验证积分操作
  VALIDATE_CREDIT_OPERATIONS: true,
} as const;
