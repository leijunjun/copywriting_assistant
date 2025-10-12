/**
 * useIndustryPresets Hook
 * 
 * This hook provides industry-specific presets based on the current user's industry selection.
 * It dynamically loads presets for different tools based on the user's industry.
 */

import { useMemo } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { getIndustryPresets, getToolPresets, getFieldPresets, IndustryType, MultilingualContent } from '@/constant/industry';

export interface UseIndustryPresetsReturn {
  // 获取特定工具的预设内容
  getToolPresets: (toolId: string) => Record<string, MultilingualContent[]> | null;
  
  // 获取特定工具特定字段的预设内容
  getFieldPresets: (toolId: string, fieldName: string) => MultilingualContent[] | null;
  
  // 获取当前用户的行业类型
  userIndustry: IndustryType;
  
  // 检查是否有行业特定预设
  hasIndustryPresets: (toolId: string) => boolean;
  
  // 检查特定字段是否有行业特定预设
  hasFieldPresets: (toolId: string, fieldName: string) => boolean;
}

export function useIndustryPresets(): UseIndustryPresetsReturn {
  const { authState } = useAuth();
  const { user } = authState;
  
  // 获取用户行业，默认为 'general'
  const userIndustry = useMemo((): IndustryType => {
    if (!user?.industry) return 'general';
    return user.industry as IndustryType;
  }, [user?.industry]);
  
  // 获取行业预设内容
  const industryPresets = useMemo(() => {
    return getIndustryPresets(userIndustry);
  }, [userIndustry]);
  
  // 获取特定工具的预设内容
  const getToolPresetsForTool = useMemo(() => {
    return (toolId: string) => {
      return getToolPresets(userIndustry, toolId);
    };
  }, [userIndustry]);
  
  // 获取特定工具特定字段的预设内容
  const getFieldPresetsForField = useMemo(() => {
    return (toolId: string, fieldName: string) => {
      return getFieldPresets(userIndustry, toolId, fieldName);
    };
  }, [userIndustry]);
  
  // 检查是否有行业特定预设
  const hasIndustryPresets = useMemo(() => {
    return (toolId: string) => {
      const toolPresets = getToolPresetsForTool(toolId);
      return toolPresets !== null && Object.keys(toolPresets).length > 0;
    };
  }, [getToolPresetsForTool]);
  
  // 检查特定字段是否有行业特定预设
  const hasFieldPresets = useMemo(() => {
    return (toolId: string, fieldName: string) => {
      const fieldPresets = getFieldPresetsForField(toolId, fieldName);
      return fieldPresets !== null && fieldPresets.length > 0;
    };
  }, [getFieldPresetsForField]);
  
  return {
    getToolPresets: getToolPresetsForTool,
    getFieldPresets: getFieldPresetsForField,
    userIndustry,
    hasIndustryPresets,
    hasFieldPresets,
  };
}
