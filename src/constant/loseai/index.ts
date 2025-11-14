/**
 * Loseai Configuration System
 * 
 * This file defines the loseai optimization configuration for different industries and tools.
 * Each industry can have specific optimization rules for different tools.
 */

import { IndustryType } from '../industry';

// Loseai配置接口 - 工具ID到优化要求的映射
export interface LoseaiConfig {
  [toolId: string]: string; // 工具ID -> markdown优化要求
}

// 行业Loseai配置接口
export interface LoseaiIndustryConfig {
  [industry: string]: LoseaiConfig;
}

// 导入各行业的loseai配置
import { generalLoseaiConfig } from './general';
import { housekeepingLoseaiConfig } from './housekeeping';
import { beautyLoseaiConfig } from './beauty';
import { lifestyleBeautyLoseaiConfig } from './lifestyle-beauty';

// 行业loseai配置映射
export const loseaiConfigMap: LoseaiIndustryConfig = {
  general: generalLoseaiConfig,
  housekeeping: housekeepingLoseaiConfig,
  beauty: beautyLoseaiConfig,
  'lifestyle-beauty': lifestyleBeautyLoseaiConfig,
  makeup: generalLoseaiConfig, // 美妆行业暂时使用通用配置
};

/**
 * 获取指定行业和工具的loseai优化要求
 * @param industry 行业类型
 * @param toolId 工具ID
 * @returns markdown格式的优化要求，如果未配置则返回空字符串
 */
export function getLoseaiConfig(industry: IndustryType, toolId: string): string {
  const industryConfig = loseaiConfigMap[industry];
  if (!industryConfig) {
    return '';
  }
  
  return industryConfig[toolId] || '';
}

