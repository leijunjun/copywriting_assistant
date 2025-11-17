/**
 * Industry Configuration Types and Exports
 * 
 * This file defines types and exports for industry-specific presets.
 */

// 行业类型定义
export type IndustryType = 'general' | 'housekeeping' | 'beauty' | 'lifestyle-beauty' | 'makeup';

// 多语言内容接口
export interface MultilingualContent {
  chinese: string;
  english: string;
  japanese: string;
}

// 人设预设接口（支持嵌套背景）
export interface PersonaPreset extends MultilingualContent {
  backgrounds?: MultilingualContent[];
}

// 工具预设内容接口
export interface ToolPresets {
  [fieldName: string]: MultilingualContent[] | PersonaPreset[];
}

// 行业预设配置接口
export interface IndustryPresets {
  [toolId: string]: ToolPresets;
}

// 导出各行业预设配置
import { generalPresets } from './general';
import { housekeepingPresets } from './housekeeping';
import { beautyPresets } from './beauty';
import { lifestyleBeautyPresets } from './lifestyle-beauty';
import { makeupPresets } from './makeup';

export { generalPresets, housekeepingPresets, beautyPresets, lifestyleBeautyPresets, makeupPresets };

// 行业配置映射
export const industryConfigMap: Record<IndustryType, IndustryPresets> = {
  general: generalPresets,
  housekeeping: housekeepingPresets,
  beauty: beautyPresets,
  'lifestyle-beauty': lifestyleBeautyPresets,
  makeup: makeupPresets,
};

// 获取行业预设的工具函数
export function getIndustryPresets(industry: IndustryType): IndustryPresets {
  return industryConfigMap[industry] || industryConfigMap.general;
}

// 获取特定工具的预设内容
export function getToolPresets(industry: IndustryType, toolId: string): ToolPresets | null {
  const industryPresets = getIndustryPresets(industry);
  return industryPresets[toolId] || null;
}

// 获取特定工具特定字段的预设内容
export function getFieldPresets(
  industry: IndustryType, 
  toolId: string, 
  fieldName: string
): MultilingualContent[] | null {
  const toolPresets = getToolPresets(industry, toolId);
  if (!toolPresets) return null;
  
  return toolPresets[fieldName] || null;
}
