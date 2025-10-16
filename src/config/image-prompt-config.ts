// 文生图提示词配置参数接口
export interface ImagePromptParams {
  background: string;
  subject: string;
  mainTitle: string;
  subtitle?: string;
  size: string;
}

// 提示词构建函数类型
export type PromptBuilder = (params: ImagePromptParams) => string;

// 高级极简风格配置函数
const buildMinimalistPrompt: PromptBuilder = (params) => {
  const { background, subject, mainTitle, subtitle, size } = params;
  
  let prompt = `极简风格设计，干净线条，以白空间为主，柔和自然光，高分辨率，简单构图，minimalist, negative space强调留白，避免杂乱元素
背景:${background}
主体:${subject}
字魂剑气手书体标题:"${mainTitle}"`;

  if (subtitle) {
    prompt += `\n小标题:"${subtitle}"`;
  }

  prompt += `\n比例:${size}
分辨率:2K`;

  return prompt;
};

// 几何向量风格配置函数
const buildGeometricVectorPrompt: PromptBuilder = (params) => {
  const { background, subject, mainTitle, subtitle, size } = params;
  
  let prompt = `扁平设计，向量艺术，大胆颜色，几何形状，信息图风格，无渐变，flat design, 2D vector避免3D效果
背景:${background}
主体:${subject}
字魂剑气手书体标题:"${mainTitle}"`;

  if (subtitle) {
    prompt += `\n小标题:"${subtitle}"`;
  }

  prompt += `\n比例:${size}
分辨率:2K`;

  return prompt;
};

// 剪贴报拼接风格配置函数
const buildCollagePrompt: PromptBuilder = (params) => {
  const { background, subject, mainTitle, subtitle, size } = params;
  
  let prompt = `collage of multiple images, scrapbook aesthetic
背景:${background}
主体:${subject}
字魂剑气手书体标题:"${mainTitle}"`;

  if (subtitle) {
    prompt += `\n小标题:"${subtitle}"`;
  }

  prompt += `\n比例:${size}
分辨率:2K`;

  return prompt;
};

// 融合（剪贴报+几何）风格配置函数
const buildFusionPrompt: PromptBuilder = (params) => {
  const { background, subject, mainTitle, subtitle, size } = params;
  
  let prompt = `扁平设计，向量艺术，大胆颜色，几何形状，信息图风格，无渐变，flat design, 2D vector避免3D效果，collage of multiple images, scrapbook aesthetic
背景:${background}
主体:${subject}
字魂剑气手书体标题:"${mainTitle}"`;

  if (subtitle) {
    prompt += `\n小标题:"${subtitle}"`;
  }

  prompt += `\n比例:${size}
分辨率:2K`;

  return prompt;
};

// 正面特写风格配置函数
const buildPortraitPrompt: PromptBuilder = (params) => {
  const { background, subject, mainTitle, subtitle, size } = params;
  
  let prompt = `主体正面特写，柔和自然光，高分辨率
背景:${background}
主体:${subject}
字魂剑气手书体标题:"${mainTitle}"`;

  if (subtitle) {
    prompt += `\n小标题:"${subtitle}"`;
  }

  prompt += `\n比例:${size}
分辨率:2K`;

  return prompt;
};

// 时尚杂志风格配置函数
const buildFashionMagazinePrompt: PromptBuilder = (params) => {
  const { background, subject, mainTitle, subtitle, size } = params;
  
  let prompt = `高级时尚摄影风格，锐利细节，vogue style模拟杂志感，elegant pose，confident gaze，magazine layout，bold typography overlay，避免杂乱元素
背景:${background}
主体:${subject}
字魂剑气手书体标题:"${mainTitle}"`;

  if (subtitle) {
    prompt += `\n小标题:"${subtitle}"`;
  }

  prompt += `\n比例:${size}
分辨率:2K`;

  return prompt;
};

// 转发海报风格配置函数
const buildRepostPosterPrompt: PromptBuilder = (params) => {
  const { background, subject, mainTitle, subtitle, size } = params;
  
  let prompt = `促销感，mobile-friendly，glow effect，floating tag
背景:${background}
主体:${subject}
字魂剑气手书体标题:"${mainTitle}"`;

  if (subtitle) {
    prompt += `\n小标题:"${subtitle}"`;
  }

  prompt += `\n比例:${size}
分辨率:2K`;

  return prompt;
};

// 多文列表风格配置函数
const buildTextListPrompt: PromptBuilder = (params) => {
  const { background, subject, mainTitle, subtitle, size } = params;
  
  const prompt = `背景是${background}和${subject}，前景是文字列表"${mainTitle} ${subtitle || ''}"
文字列表排版，避免杂乱元素
比例:${size}
分辨率:2K`;

  return prompt;
};

// 网格大文本风格配置函数
const buildGridTextPrompt: PromptBuilder = (params) => {
  const { background, subject, mainTitle, subtitle, size } = params;
  
  let prompt = `图片的背景是随机颜色方格纸（类似笔记本内页格式，呈现简洁的手写笔记质感）。图片以黑色粗体字垂直排版呈现文字信息
第一行文字："${mainTitle}"被橙色矩形背景高亮标注`;

  if (subtitle) {
    prompt += `\n"${subtitle}"`;
  }

  prompt += `\n比例:${size}
分辨率:2K`;

  return prompt;
};

// 风格配置映射对象
export const STYLE_PROMPT_BUILDERS: Record<string, PromptBuilder> = {
  '高级极简': buildMinimalistPrompt,
  '几何向量': buildGeometricVectorPrompt,
  '剪贴报拼接': buildCollagePrompt,
  '融合（剪贴报+几何）': buildFusionPrompt,
  '正面特写': buildPortraitPrompt,
  '时尚杂志': buildFashionMagazinePrompt,
  '转发海报': buildRepostPosterPrompt,
  '多文列表': buildTextListPrompt,
  '网格大文本': buildGridTextPrompt
};
