import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { hasSufficientCredits } from '@/lib/credits/balance';
import { deductCredits } from '@/lib/credits/transactions';
import { logger } from '@/lib/utils/logger';
import { IMAGE_GENERATION_CREDITS } from '@/config/credit-config';
import { withSecurity, validateCreditOperation, logCreditOperation } from '@/lib/security/api-middleware';

// 风格映射常量
const STYLE_MAPPINGS: Record<string, string> = {
  '高级极简': '极简，干净线条，以白空间为主，柔和自然光，高分辨率，简单构图，minimalist, negative space强调留白，避免杂乱元素',
  '几何向量': '扁平设计，向量艺术，大胆颜色，几何形状，信息图风格，无渐变，flat design, 2D vector避免3D效果',
  '剪贴报拼接': 'collage of multiple images, scrapbook aesthetic',
  '融合（剪贴报+几何）': '扁平设计，向量艺术，大胆颜色，几何形状，信息图风格，无渐变，flat design, 2D vector避免3D效果，collage of multiple images, scrapbook aesthetic',
  '正面特写': '主体正面特写，柔和自然光，高分辨率',
  '时尚杂志': '高级时尚摄影风格，锐利细节，vogue style模拟杂志感，elegant pose，confident gaze，magazine layout，bold typography overlay，避免杂乱元素',
  '转发海报': '促销感，mobile-friendly，glow effect，floating tag',
  '多文列表': '文字列表排版，避免杂乱元素'
};

// 尺寸映射常量 - 2K分辨率
const SIZE_MAPPINGS: Record<string, string> = {
  '1:1': '2048x2048',
  '4:3': '2304x1728',
  '3:2': '2496x1664',
  '3:4': '1728x2304',  // 竖版
  '2:3': '1664x2496',  // 竖版
  '16:9': '2560x1440',
  '9:16': '1440x2560', // 竖版
  '21:9': '3024x1296'
};

// 行业名称映射
const INDUSTRY_NAMES: Record<string, string> = {
  'general': '通用',
  'housekeeping': '家政',
  'beauty': '医疗美容',
  'lifestyle-beauty': '生活美妆'
};

async function handleImageGeneration(request: NextRequest) {
  try {
    logger.api('Image generation request received');

    // 获取当前用户信息
    const user = await getCurrentUser();
    if (!user) {
      logger.error('User not authenticated for image generation', undefined, 'API');
      return NextResponse.json(
        { success: false, message: '用户未登录' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { background, subject, mainTitle, subtitle, style, size } = body;

    // 验证必填字段
    if (!background || !subject || !mainTitle) {
      return NextResponse.json(
        { success: false, message: '请填写必填信息' },
        { status: 400 }
      );
    }

    // 使用硬编码配置，确保安全性和一致性
    const creditCost = IMAGE_GENERATION_CREDITS;
    console.log('✅ 使用硬编码积分扣除数量:', creditCost);
    logger.api('Credit cost retrieved', { cost: creditCost });

    // 安全验证：检查积分成本是否被篡改
    const securityValidation = validateCreditOperation(request, 'deduct', creditCost, user.id);
    if (!securityValidation.isValid) {
      logger.error('Security validation failed', undefined, 'API', { 
        error: securityValidation.error,
        userId: user.id,
        creditCost 
      });
      return NextResponse.json(
        { success: false, message: securityValidation.error },
        { status: 400 }
      );
    }

    // 检查用户积分是否充足
    const creditCheck = await hasSufficientCredits(user.id, creditCost);
    if (!creditCheck.success) {
      logger.error('Failed to check user credits', undefined, 'API', { userId: user.id });
      return NextResponse.json(
        { success: false, message: '积分检查失败' },
        { status: 500 }
      );
    }

    if (!creditCheck.validation?.has_sufficient_credits) {
      logger.credits('Insufficient credits for image generation', {
        userId: user.id,
        required: creditCost,
        current: creditCheck.validation?.current_balance || 0,
        deficit: creditCheck.validation?.deficit || 0
      });
      
      return NextResponse.json(
        { 
          success: false, 
          message: '积分不足',
          required_credits: creditCost,
          current_balance: creditCheck.validation?.current_balance || 0,
          deficit: creditCheck.validation?.deficit || 0
        },
        { status: 402 }
      );
    }

    // 获取用户行业名称
    const industryName = INDUSTRY_NAMES[user.industry || 'general'] || '通用';

    // 获取风格描述
    const styleDescription = STYLE_MAPPINGS[style] || STYLE_MAPPINGS['高级极简'];

    // 获取尺寸像素值
    const sizeInPixels = SIZE_MAPPINGS[size] || SIZE_MAPPINGS['1:1'];

    // 构建提示词模板
    let prompt;
    
    if (style === '多文列表') {
      // 多文列表风格使用特殊模板
      prompt = `背景是${background}和${subject}，前景是文字列表“${mainTitle} ${subtitle || ''}`;
      prompt += `
行业:${industryName}
风格:${styleDescription}
比例:${size}
分辨率:2K`;
    } else {
      // 其他风格使用原有模板
      prompt = `行业:${industryName}
背景:${background}
主体:${subject}
字魂剑气手书体标题:"${mainTitle}"`;

      if (subtitle) {
        prompt += `\n小标题:"${subtitle}"`;
      }

      prompt += `\n风格:${styleDescription}
比例:${size}
分辨率:2K`;
    }

    logger.api('Generated prompt for image generation', { 
      userId: user.id, 
      industry: user.industry,
      prompt: prompt.substring(0, 200) + '...' 
    });

    // 调用豆包API生成图片
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    if (!apiKey) {
      logger.error('API key not configured', undefined, 'API');
      return NextResponse.json(
        { success: false, message: 'API配置错误' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.302.ai/doubao/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'doubao-seedream-4-0-250828',
        prompt: prompt,
        size: sizeInPixels,
        sequential_image_generation: 'disabled',
        response_format: 'url',
        stream: false,
        watermark: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Doubao API request failed', undefined, 'API', {
        status: response.status,
        statusText: response.statusText,
        errorText,
        userId: user.id
      });
      return NextResponse.json(
        { success: false, message: '图片生成失败，请稍后重试' },
        { status: 500 }
      );
    }

    const apiResult = await response.json();
    
    if (!apiResult.data || !Array.isArray(apiResult.data) || apiResult.data.length === 0) {
      logger.error('Invalid response from Doubao API', undefined, 'API', { result: apiResult, userId: user.id });
      return NextResponse.json(
        { success: false, message: '图片生成失败，请稍后重试' },
        { status: 500 }
      );
    }

    // 提取图片URL
    const images = apiResult.data.map((item: any) => item.url).filter(Boolean);

    if (images.length === 0) {
      logger.error('No valid image URLs in response', undefined, 'API', { result: apiResult, userId: user.id });
      return NextResponse.json(
        { success: false, message: '图片生成失败，请稍后重试' },
        { status: 500 }
      );
    }

    // 生成成功后扣除积分
    try {
      const deductionResult = await deductCredits({
        user_id: user.id,
        amount: creditCost,
        description: `AI图片生成 - ${industryName}`,
        service_type: 'image_generation'
      });

      // 记录积分操作日志
      logCreditOperation('deduct', creditCost, user.id, deductionResult.success, {
        service: 'image_generation',
        industry: industryName,
        result: deductionResult
      });

      if (!deductionResult.success) {
        logger.error('Failed to deduct credits after successful image generation', undefined, 'API', {
          userId: user.id,
          amount: creditCost,
          error: deductionResult.error
        });
        
        // 即使积分扣除失败，也返回生成的图片，但记录警告
        logger.credits('Warning: Image generated but credit deduction failed', {
          userId: user.id,
          amount: creditCost,
          error: deductionResult.error
        });
      } else {
        logger.credits('Credits deducted successfully after image generation', {
          userId: user.id,
          amount: creditCost,
          transactionId: deductionResult.transaction_id,
          newBalance: deductionResult.new_balance
        });
      }
    } catch (deductionError) {
      logger.error('Error during credit deduction after image generation', deductionError, 'API', {
        userId: user.id,
        amount: creditCost
      });
    }

    logger.api('Image generation completed successfully', {
      userId: user.id,
      imageCount: images.length,
      industry: user.industry
    });

    return NextResponse.json({
      success: true,
      images: images,
      prompt: prompt,
      message: '图片生成成功'
    });

  } catch (error) {
    logger.error('Unexpected error in image generation', error, 'API');
    return NextResponse.json(
      { success: false, message: '图片生成失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// 使用安全中间件包装导出函数
export const POST = withSecurity(handleImageGeneration);