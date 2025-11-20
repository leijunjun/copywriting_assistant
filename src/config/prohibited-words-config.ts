/**
 * 违禁词清单配置
 * 依据：国家药监局《化妆品标签管理办法》《广告法》《网络直播营销管理办法》及小红书2025年Q4内容安全规范
 * 适用范围：笔记、直播、评论区、商品详情页、话题标签
 */

import { IndustryType } from '@/constant/industry';

// 违禁词配置接口
export interface ProhibitedWordsConfig {
  absoluteTerms: {
    words: string[];
    alternatives: string[];
  };
  medicalClaims?: {
    words: string[];
    alternatives: string[];
  };
  exaggeratedClaims: {
    words: string[];
    alternatives: string[];
  };
  sensitiveTerms: {
    categories: {
      comparison: {
        words: string[];
        note: string;
      };
      superstition: {
        words: string[];
        note: string;
      };
      priceInducement: {
        words: string[];
        note: string;
      };
      pregnancy?: {
        words: string[];
        alternative: string;
      };
      weightLoss?: {
        words: string[];
        note: string;
      };
    };
  };
  highRiskTags: {
    prohibited: string[];
    alternatives: string[];
  };
}

// 通用违禁词配置（所有行业共用）
const COMMON_PROHIBITED_WORDS: Partial<ProhibitedWordsConfig> = {
  // 一、绝对化用语（严禁使用）
  absoluteTerms: {
    words: [
      '最佳', '第一', '顶级', '国家级', '世界级',
      '神效', '奇迹', 'instantly', '0秒见效',
      '绝对不掉', '永不褪色', '永不长痘',
      '100%有效', 'guaranteed results'
    ],
    alternatives: [
      '热门', '高口碑', '用户推荐',
      '快速改善', '温和提亮', '持续使用可见效果',
      '持久持妆', '不易泛油', '有助改善闭口',
      '多数用户反馈有效', '临床测试显示改善'
    ]
  },
  // 比较性贬低
  sensitiveTerms: {
    categories: {
      comparison: {
        words: ['比XX更好', '吊打大牌', 'XX已过时'],
        note: '禁止贬损竞品'
      },
      // 迷信/玄学
      superstition: {
        words: ['开光', '风水', '转运', '招财'],
        note: '严禁将产品与玄学功效绑定'
      },
      // 价格诱导
      priceInducement: {
        words: ['全网最低', '最后X件', '亏本清仓'],
        note: '禁用虚假促销话术'
      }
    }
  }
};

// 美妆行业违禁词配置
const BEAUTY_PROHIBITED_WORDS: ProhibitedWordsConfig = {
  absoluteTerms: COMMON_PROHIBITED_WORDS.absoluteTerms!,
  // 二、医疗功效宣称（严禁虚构或暗示）
  medicalClaims: {
    words: [
      '治疗', '修复', '抗炎', '祛疤', '去痘印', '祛妊娠纹',
      '抑制黑色素生成', '阻断黑色素转运',
      '抗衰老', '逆转皱纹', '再生胶原',
      '激活细胞', '干细胞', '基因修复'
    ],
    alternatives: [
      '改善肤质', '淡化印痕', '舒缓泛红', '抚平肌理',
      '均匀肤色', '提亮暗沉', '减少色素沉积',
      '抚平细纹', '提升紧致感', '增强肌肤弹性',
      '滋养肌底', '促进代谢', '强化屏障'
    ]
  },
  // 三、虚假/夸大宣传词
  exaggeratedClaims: {
    words: [
      '医美级', '院线同款', '医生推荐',
      '无添加', '0添加', '纯天然',
      '一瓶搞定全脸', '一物多用',
      '速效美白', '7天变白'
    ],
    alternatives: [
      '专业配方', '实验室研发', '皮肤科医生测试',
      '不含酒精/香精/矿物油（需标注具体成分）',
      '多效合一', '适合日常叠加使用',
      '持续使用有助提亮', '均匀肤色'
    ]
  },
  // 四、敏感词 & 高风险表述
  sensitiveTerms: {
    categories: {
      comparison: COMMON_PROHIBITED_WORDS.sensitiveTerms!.categories.comparison,
      superstition: COMMON_PROHIBITED_WORDS.sensitiveTerms!.categories.superstition,
      priceInducement: COMMON_PROHIBITED_WORDS.sensitiveTerms!.categories.priceInducement,
      // 孕妇/儿童适用
      pregnancy: {
        words: ['孕妇可用', '宝宝可用', '婴儿级'],
        alternative: '温和配方，适合敏感肌'
      },
      // 减肥/瘦身
      weightLoss: {
        words: ['瘦脸', '溶脂', '燃脂', '代谢加速'],
        note: '美妆不得关联身体塑形功能'
      }
    }
  },
  // 五、高风险标签（#话题标签）
  highRiskTags: {
    prohibited: [
      '#医美级美白',
      '#祛痘神品',
      '#7天去黄',
      '#孕妇专用精华'
    ],
    alternatives: [
      '#日常提亮好物',
      '#温和养肤',
      '#敏感肌亲测',
      '#持久持妆推荐'
    ]
  }
};

// 一推火行业违禁词配置（营销工具/软件服务行业）
const YITUIHUO_PROHIBITED_WORDS: ProhibitedWordsConfig = {
  absoluteTerms: COMMON_PROHIBITED_WORDS.absoluteTerms!,
  // 三、虚假/夸大宣传词
  exaggeratedClaims: {
    words: [
      '100%有效', '保证效果', '绝对成功', '零风险',
      '秒杀同行', '行业第一', '唯一选择',
      '免费永久', '无限使用', '无限制',
      '立即见效', '马上赚钱', '躺赚'
    ],
    alternatives: [
      '多数用户反馈有效', '效果显著', '成功率较高',
      '市场表现优秀', '用户口碑良好', '值得尝试',
      '免费试用', '按需付费', '灵活定价',
      '持续使用可见效果', '帮助提升业绩', '助力业务增长'
    ]
  },
  // 四、敏感词 & 高风险表述
  sensitiveTerms: {
    categories: {
      comparison: COMMON_PROHIBITED_WORDS.sensitiveTerms!.categories.comparison,
      superstition: COMMON_PROHIBITED_WORDS.sensitiveTerms!.categories.superstition,
      // 价格诱导（营销工具行业特定）
      priceInducement: {
        words: ['全网最低', '最后X件', '亏本清仓', '限时免费', '永久免费'],
        note: '禁用虚假促销话术，需明确说明价格政策和限制条件'
      }
    }
  },
  // 五、高风险标签（#话题标签）
  highRiskTags: {
    prohibited: [
      '#100%有效',
      '#保证赚钱',
      '#零风险投资',
      '#永久免费工具'
    ],
    alternatives: [
      '#营销工具推荐',
      '#拓客好帮手',
      '#实用营销技巧',
      '#工具使用心得'
    ]
  }
};

// 通用行业违禁词配置（家政、通用等）
const GENERAL_PROHIBITED_WORDS: ProhibitedWordsConfig = {
  absoluteTerms: COMMON_PROHIBITED_WORDS.absoluteTerms!,
  // 三、虚假/夸大宣传词
  exaggeratedClaims: {
    words: [
      '100%有效', '保证效果', '绝对成功',
      '行业第一', '唯一选择', '最佳选择'
    ],
    alternatives: [
      '效果显著', '用户反馈良好', '值得信赖',
      '市场表现优秀', '口碑良好', '值得尝试'
    ]
  },
  // 四、敏感词 & 高风险表述
  sensitiveTerms: {
    categories: {
      comparison: COMMON_PROHIBITED_WORDS.sensitiveTerms!.categories.comparison,
      superstition: COMMON_PROHIBITED_WORDS.sensitiveTerms!.categories.superstition,
      priceInducement: COMMON_PROHIBITED_WORDS.sensitiveTerms!.categories.priceInducement
    }
  },
  // 五、高风险标签（#话题标签）
  highRiskTags: {
    prohibited: [
      '#100%有效',
      '#保证效果',
      '#绝对成功'
    ],
    alternatives: [
      '#实用工具',
      '#经验分享',
      '#使用心得'
    ]
  }
};

// 行业违禁词配置映射
const INDUSTRY_PROHIBITED_WORDS_MAP: Record<IndustryType, ProhibitedWordsConfig> = {
  'general': GENERAL_PROHIBITED_WORDS,
  'housekeeping': GENERAL_PROHIBITED_WORDS,
  'beauty': BEAUTY_PROHIBITED_WORDS,
  'lifestyle-beauty': BEAUTY_PROHIBITED_WORDS,
  'makeup': BEAUTY_PROHIBITED_WORDS,
  'yituihuo': YITUIHUO_PROHIBITED_WORDS,
};

// 获取行业违禁词配置
export function getProhibitedWordsConfig(industry: IndustryType = 'general'): ProhibitedWordsConfig {
  return INDUSTRY_PROHIBITED_WORDS_MAP[industry] || GENERAL_PROHIBITED_WORDS;
}

// 获取所有违禁词列表（扁平化）
export function getAllProhibitedWords(industry: IndustryType = 'general'): string[] {
  const config = getProhibitedWordsConfig(industry);
  const words: string[] = [];
  
  // 绝对化用语
  words.push(...config.absoluteTerms.words);
  
  // 医疗功效宣称（如果存在）
  if (config.medicalClaims) {
    words.push(...config.medicalClaims.words);
  }
  
  // 虚假/夸大宣传词
  words.push(...config.exaggeratedClaims.words);
  
  // 敏感词
  const sensitive = config.sensitiveTerms.categories;
  if (sensitive.pregnancy) {
    words.push(...sensitive.pregnancy.words);
  }
  if (sensitive.weightLoss) {
    words.push(...sensitive.weightLoss.words);
  }
  words.push(...sensitive.comparison.words);
  words.push(...sensitive.superstition.words);
  words.push(...sensitive.priceInducement.words);
  
  return words;
}

// 生成违禁词提示文本（用于AI提示词）
export function getProhibitedWordsPrompt(industry: IndustryType = 'general'): string {
  const allWords = getAllProhibitedWords(industry);
  const wordsList = allWords.join('、');
  
  return `【违禁词清单】严禁使用以下词汇：${wordsList}。如涉及相关概念，请使用替代表述，确保内容合规。`;
}

// 生成违禁词详细说明（用于AI提示词）
export function getProhibitedWordsDetailedPrompt(industry: IndustryType = 'general'): string {
  const config = getProhibitedWordsConfig(industry);
  
  let prompt = `【违禁词规范】请严格遵守以下违禁词规范，确保生成内容合规：\n\n`;
  
  // 绝对化用语
  prompt += `1. 绝对化用语（严禁使用）：${config.absoluteTerms.words.join('、')}\n`;
  prompt += `   替代建议：${config.absoluteTerms.alternatives.join('、')}\n\n`;
  
  // 医疗功效宣称（如果存在）
  if (config.medicalClaims) {
    prompt += `2. 医疗功效宣称（严禁虚构或暗示）：${config.medicalClaims.words.join('、')}\n`;
    prompt += `   替代建议：${config.medicalClaims.alternatives.join('、')}\n\n`;
  }
  
  // 虚假/夸大宣传词
  prompt += `${config.medicalClaims ? '3' : '2'}. 虚假/夸大宣传词：${config.exaggeratedClaims.words.join('、')}\n`;
  prompt += `   替代建议：${config.exaggeratedClaims.alternatives.join('、')}\n\n`;
  
  // 敏感词
  const sensitive = config.sensitiveTerms.categories;
  const sectionNum = config.medicalClaims ? '4' : '3';
  prompt += `${sectionNum}. 敏感词 & 高风险表述：\n`;
  
  if (sensitive.pregnancy) {
    prompt += `   - 孕妇/儿童适用：${sensitive.pregnancy.words.join('、')} → ${sensitive.pregnancy.alternative}\n`;
  }
  if (sensitive.weightLoss) {
    prompt += `   - 减肥/瘦身：${sensitive.weightLoss.words.join('、')}（${sensitive.weightLoss.note}）\n`;
  }
  prompt += `   - 比较性贬低：${sensitive.comparison.words.join('、')}（${sensitive.comparison.note}）\n`;
  prompt += `   - 迷信/玄学：${sensitive.superstition.words.join('、')}（${sensitive.superstition.note}）\n`;
  prompt += `   - 价格诱导：${sensitive.priceInducement.words.join('、')}（${sensitive.priceInducement.note}）\n\n`;
  
  // 高风险标签
  const tagSectionNum = config.medicalClaims ? '5' : '4';
  prompt += `${tagSectionNum}. 高风险标签：避免使用 ${config.highRiskTags.prohibited.join('、')}\n`;
  prompt += `   建议使用：${config.highRiskTags.alternatives.join('、')}\n\n`;
  
  prompt += `请确保生成的内容完全避免使用上述违禁词，并使用相应的替代表述。`;
  
  return prompt;
}

