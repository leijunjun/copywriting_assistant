/**
 * 小红书美妆行业违禁词清单配置
 * 依据：国家药监局《化妆品标签管理办法》《广告法》《网络直播营销管理办法》及小红书2025年Q4内容安全规范
 * 适用范围：笔记、直播、评论区、商品详情页、话题标签
 */

// 违禁词分类配置
export const PROHIBITED_WORDS_CONFIG = {
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
      // 孕妇/儿童适用
      pregnancy: {
        words: ['孕妇可用', '宝宝可用', '婴儿级'],
        alternative: '温和配方，适合敏感肌'
      },
      // 减肥/瘦身
      weightLoss: {
        words: ['瘦脸', '溶脂', '燃脂', '代谢加速'],
        note: '美妆不得关联身体塑形功能'
      },
      // 比较性贬低
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
} as const;

// 获取所有违禁词列表（扁平化）
export const getAllProhibitedWords = (): string[] => {
  const words: string[] = [];
  
  // 绝对化用语
  words.push(...PROHIBITED_WORDS_CONFIG.absoluteTerms.words);
  
  // 医疗功效宣称
  words.push(...PROHIBITED_WORDS_CONFIG.medicalClaims.words);
  
  // 虚假/夸大宣传词
  words.push(...PROHIBITED_WORDS_CONFIG.exaggeratedClaims.words);
  
  // 敏感词
  const sensitive = PROHIBITED_WORDS_CONFIG.sensitiveTerms.categories;
  words.push(...sensitive.pregnancy.words);
  words.push(...sensitive.weightLoss.words);
  words.push(...sensitive.comparison.words);
  words.push(...sensitive.superstition.words);
  words.push(...sensitive.priceInducement.words);
  
  return words;
};

// 生成违禁词提示文本（用于AI提示词）
export const getProhibitedWordsPrompt = (): string => {
  const allWords = getAllProhibitedWords();
  const wordsList = allWords.join('、');
  
  return `【违禁词清单】严禁使用以下词汇：${wordsList}。如涉及相关概念，请使用替代表述，确保内容合规。`;
};

// 生成违禁词详细说明（用于AI提示词）
export const getProhibitedWordsDetailedPrompt = (): string => {
  const config = PROHIBITED_WORDS_CONFIG;
  
  let prompt = `【违禁词规范】请严格遵守以下违禁词规范，确保生成内容合规：\n\n`;
  
  // 绝对化用语
  prompt += `1. 绝对化用语（严禁使用）：${config.absoluteTerms.words.join('、')}\n`;
  prompt += `   替代建议：${config.absoluteTerms.alternatives.join('、')}\n\n`;
  
  // 医疗功效宣称
  prompt += `2. 医疗功效宣称（严禁虚构或暗示）：${config.medicalClaims.words.join('、')}\n`;
  prompt += `   替代建议：${config.medicalClaims.alternatives.join('、')}\n\n`;
  
  // 虚假/夸大宣传词
  prompt += `3. 虚假/夸大宣传词：${config.exaggeratedClaims.words.join('、')}\n`;
  prompt += `   替代建议：${config.exaggeratedClaims.alternatives.join('、')}\n\n`;
  
  // 敏感词
  const sensitive = config.sensitiveTerms.categories;
  prompt += `4. 敏感词 & 高风险表述：\n`;
  prompt += `   - 孕妇/儿童适用：${sensitive.pregnancy.words.join('、')} → ${sensitive.pregnancy.alternative}\n`;
  prompt += `   - 减肥/瘦身：${sensitive.weightLoss.words.join('、')}（美妆不得关联身体塑形功能）\n`;
  prompt += `   - 比较性贬低：${sensitive.comparison.words.join('、')}（禁止贬损竞品）\n`;
  prompt += `   - 迷信/玄学：${sensitive.superstition.words.join('、')}（严禁将产品与玄学功效绑定）\n`;
  prompt += `   - 价格诱导：${sensitive.priceInducement.words.join('、')}（禁用虚假促销话术）\n\n`;
  
  // 高风险标签
  prompt += `5. 高风险标签：避免使用 ${config.highRiskTags.prohibited.join('、')}\n`;
  prompt += `   建议使用：${config.highRiskTags.alternatives.join('、')}\n\n`;
  
  prompt += `请确保生成的内容完全避免使用上述违禁词，并使用相应的替代表述。`;
  
  return prompt;
};

