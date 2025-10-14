-- 添加图片生成积分配置
INSERT INTO system_config (config_key, config_value, description, created_at, updated_at)
VALUES (
  'image_generation_credits',
  '50',
  'AI图片生成所需积分数量',
  NOW(),
  NOW()
)
ON CONFLICT (config_key) DO UPDATE SET
  config_value = EXCLUDED.config_value,
  description = EXCLUDED.description,
  updated_at = NOW();
