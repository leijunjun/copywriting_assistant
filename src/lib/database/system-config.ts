/**
 * System Configuration Database Access
 * 
 * This module provides access to system configuration settings.
 */

import { supabase } from '@/lib/supabase/client';

export interface SystemConfig {
  id: string;
  config_key: string;
  config_value: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface SystemConfigResponse {
  success: boolean;
  config?: SystemConfig;
  error?: string;
}

export interface SystemConfigListResponse {
  success: boolean;
  configs?: SystemConfig[];
  error?: string;
}

/**
 * Get system configuration by key
 */
export async function getSystemConfig(configKey: string): Promise<SystemConfigResponse> {
  try {
    const { data, error } = await supabase
      .from('system_config')
      .select('*')
      .eq('config_key', configKey)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          success: false,
          error: `Configuration key '${configKey}' not found`,
        };
      }
      throw new Error(`Failed to get system config: ${error.message}`);
    }

    return {
      success: true,
      config: data,
    };
  } catch (error) {
    console.error('Error getting system config:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get system config',
    };
  }
}

/**
 * Get all system configurations
 */
export async function getAllSystemConfigs(): Promise<SystemConfigListResponse> {
  try {
    const { data, error } = await supabase
      .from('system_config')
      .select('*')
      .order('config_key');

    if (error) {
      throw new Error(`Failed to get system configs: ${error.message}`);
    }

    return {
      success: true,
      configs: data || [],
    };
  } catch (error) {
    console.error('Error getting all system configs:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get system configs',
    };
  }
}

/**
 * Get credit deduction rate from system config
 */
export async function getCreditDeductionRate(): Promise<number> {
  try {
    const result = await getSystemConfig('credit_deduction_rate');
    
    if (!result.success || !result.config) {
      // Return default value if config not found
      console.warn('Credit deduction rate not found in system config, using default value: 5');
      return 5;
    }

    const rate = parseFloat(result.config.config_value);
    if (isNaN(rate) || rate <= 0) {
      console.warn('Invalid credit deduction rate in system config, using default value: 5');
      return 5;
    }

    return rate;
  } catch (error) {
    console.error('Error getting credit deduction rate:', error);
    return 5; // Default fallback value
  }
}

/**
 * Get system configuration with type conversion
 */
export async function getSystemConfigValue<T = string>(
  configKey: string,
  defaultValue: T,
  converter?: (value: string) => T
): Promise<T> {
  try {
    const result = await getSystemConfig(configKey);
    
    if (!result.success || !result.config) {
      return defaultValue;
    }

    if (converter) {
      return converter(result.config.config_value);
    }

    return result.config.config_value as T;
  } catch (error) {
    console.error(`Error getting system config value for key '${configKey}':`, error);
    return defaultValue;
  }
}

/**
 * Get numeric system configuration
 */
export async function getNumericSystemConfig(configKey: string, defaultValue: number = 0): Promise<number> {
  return getSystemConfigValue(configKey, defaultValue, (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
  });
}

/**
 * Get boolean system configuration
 */
export async function getBooleanSystemConfig(configKey: string, defaultValue: boolean = false): Promise<boolean> {
  return getSystemConfigValue(configKey, defaultValue, (value) => {
    return value.toLowerCase() === 'true' || value === '1';
  });
}

/**
 * Get integer system configuration
 */
export async function getIntegerSystemConfig(configKey: string, defaultValue: number = 0): Promise<number> {
  return getSystemConfigValue(configKey, defaultValue, (value) => {
    const num = parseInt(value, 10);
    return isNaN(num) ? defaultValue : num;
  });
}

/**
 * Update system configuration
 */
export async function updateSystemConfig(
  configKey: string,
  configValue: string,
  description?: string
): Promise<SystemConfigResponse> {
  try {
    const { data, error } = await supabase
      .from('system_config')
      .upsert({
        config_key: configKey,
        config_value: configValue,
        description,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update system config: ${error.message}`);
    }

    return {
      success: true,
      config: data,
    };
  } catch (error) {
    console.error('Error updating system config:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update system config',
    };
  }
}

/**
 * Initialize default system configurations
 */
export async function initializeDefaultSystemConfigs(): Promise<void> {
  const defaultConfigs = [
    {
      config_key: 'credit_deduction_rate',
      config_value: '5',
      description: 'Number of credits deducted per content generation',
    },
    {
      config_key: 'default_credit_balance',
      config_value: '100',
      description: 'Initial credit balance for new users',
    },
    {
      config_key: 'min_credit_balance',
      config_value: '0',
      description: 'Minimum credit balance allowed',
    },
    {
      config_key: 'max_credit_balance',
      config_value: '10000',
      description: 'Maximum credit balance allowed',
    },
    {
      config_key: 'low_balance_threshold',
      config_value: '20',
      description: 'Credit balance threshold for low balance warning',
    },
  ];

  for (const config of defaultConfigs) {
    try {
      await updateSystemConfig(config.config_key, config.config_value, config.description);
      console.log(`Initialized system config: ${config.config_key}`);
    } catch (error) {
      console.error(`Failed to initialize system config ${config.config_key}:`, error);
    }
  }
}

/**
 * System configuration cache
 */
class SystemConfigCache {
  private cache: Map<string, { value: any; timestamp: number }> = new Map();
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes

  async get<T>(configKey: string, defaultValue: T, converter?: (value: string) => T): Promise<T> {
    const cached = this.cache.get(configKey);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < this.cacheTimeout) {
      return cached.value;
    }

    const value = await getSystemConfigValue(configKey, defaultValue, converter);
    this.cache.set(configKey, { value, timestamp: now });
    return value;
  }

  clear(): void {
    this.cache.clear();
  }

  invalidate(configKey: string): void {
    this.cache.delete(configKey);
  }
}

export const systemConfigCache = new SystemConfigCache();
