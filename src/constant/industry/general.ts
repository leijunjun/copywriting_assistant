/**
 * General Industry Presets
 * 
 * This file contains presets for general users (no specific industry).
 * General users will use default presets from language.ts
 */

// 多语言内容接口
export interface MultilingualContent {
  chinese: string;
  english: string;
  japanese: string;
}

// 工具预设内容接口
export interface ToolPresets {
  [fieldName: string]: MultilingualContent[];
}

// 行业预设配置接口
export interface IndustryPresets {
  [toolId: string]: ToolPresets;
}

export const generalPresets: IndustryPresets = {
  // 通用用户使用默认预设，这里保持空对象
  // 实际预设内容将从 src/constant/language.ts 中获取
};
