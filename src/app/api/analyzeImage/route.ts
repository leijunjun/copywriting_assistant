import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { hasSufficientCredits } from '@/lib/credits/balance';
import { deductCredits } from '@/lib/credits/transactions';
import { logger } from '@/lib/utils/logger';
import { IMAGE_ANALYSIS_CREDITS } from '@/config/credit-config';
import { withSecurity, validateCreditOperation, logCreditOperation } from '@/lib/security/api-middleware';

async function handleImageAnalysis(request: NextRequest) {
  try {
    logger.api('Image analysis request received');

    // 获取当前用户信息
    const user = await getCurrentUser();
    if (!user) {
      logger.error('User not authenticated for image analysis', undefined, 'API');
      return NextResponse.json(
        { success: false, message: '用户未登录' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { imageUrl, imageBase64, aspectRatio } = body;

    if (!imageUrl && !imageBase64) {
      return NextResponse.json(
        { success: false, message: '请提供图片 URL 或 base64 数据' },
        { status: 400 }
      );
    }

    // 使用硬编码配置，确保安全性和一致性
    const creditCost = IMAGE_ANALYSIS_CREDITS;
    logger.api('Credit cost retrieved', { cost: creditCost });

    // 安全验证：检查积分成本是否被篡改
    const securityValidation = validateCreditOperation(request, 'deduct', creditCost, user.id, 'image_analysis');
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
      logger.credits('Insufficient credits for image analysis', {
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

    // 获取 API 配置
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.302.ai';
    const visionModel = process.env.NEXT_PUBLIC_VISION_MODEL || 'qwen3-vl-plus-2025-09-23';
    
    if (!apiKey || !apiBaseUrl) {
      logger.error('API key or URL not configured', undefined, 'API');
      return NextResponse.json(
        { success: false, message: 'API配置错误' },
        { status: 500 }
      );
    }

    logger.api('Calling vision API for image analysis', {
      userId: user.id,
      model: visionModel,
      hasImageUrl: !!imageUrl,
      hasImageBase64: !!imageBase64,
      aspectRatio: aspectRatio || 'not provided'
    });

    // 构建消息内容
    let imageContent: any;
    if (imageBase64) {
      // 如果提供了 base64，直接使用
      imageContent = {
        type: 'image_url',
        image_url: {
          url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
        }
      };
    } else if (imageUrl) {
      // 如果提供了 URL，使用 URL
      imageContent = {
        type: 'image_url',
        image_url: {
          url: imageUrl
        }
      };
    }

    // 构建提示词，要求模型用引号标记文字部分，并融合比例信息
    let prompt = '';
    if (aspectRatio) {
      prompt = `认真分析图片，并反向生成图片的生成提示词。请在生成的提示词中明确注明图片比例为 ${aspectRatio}。对于图片中的文字部分（包括标题、标签、说明文字等），请用双引号""标记出来。请直接输出提示词，不要有任何解释。`;
    } else {
      prompt = `认真分析图片，并反向生成图片的生成提示词，对于图片中的文字部分（包括标题、标签、说明文字等），请用双引号""标记出来。请直接输出提示词，不要有任何解释。`;
    }

    const messages = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt
          },
          imageContent
        ]
      }
    ];

    // 调用视觉模型 API - 确保 URL 格式正确
    const fetchUrl = apiBaseUrl.endsWith('/v1') 
      ? `${apiBaseUrl}/chat/completions` 
      : apiBaseUrl.endsWith('/')
        ? `${apiBaseUrl}v1/chat/completions`
        : `${apiBaseUrl}/v1/chat/completions`;
    const response = await fetch(fetchUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: visionModel,
        messages: messages,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Vision API request failed', undefined, 'API', {
        status: response.status,
        statusText: response.statusText,
        errorText,
        userId: user.id
      });
      return NextResponse.json(
        { success: false, message: '图片分析失败，请稍后重试' },
        { status: 500 }
      );
    }

    const apiResult = await response.json();
    
    if (!apiResult.choices || !apiResult.choices[0] || !apiResult.choices[0].message) {
      logger.error('Invalid response from Vision API', undefined, 'API', { result: apiResult, userId: user.id });
      return NextResponse.json(
        { success: false, message: '图片分析失败，请稍后重试' },
        { status: 500 }
      );
    }

    const description = apiResult.choices[0].message.content || '';

    // 分析成功后扣除积分
    try {
      const deductionResult = await deductCredits({
        user_id: user.id,
        amount: creditCost,
        description: `AI图片分析`,
        service_type: 'image_analysis'
      });

      // 记录积分操作日志
      logCreditOperation('deduct', creditCost, user.id, deductionResult.success, {
        service: 'image_analysis',
        result: deductionResult
      });

      if (!deductionResult.success) {
        logger.error('Failed to deduct credits after successful image analysis', undefined, 'API', {
          userId: user.id,
          amount: creditCost,
          error: deductionResult.error
        });
        
        logger.credits('Warning: Image analyzed but credit deduction failed', {
          userId: user.id,
          amount: creditCost,
          error: deductionResult.error
        });
      } else {
        logger.credits('Credits deducted successfully after image analysis', {
          userId: user.id,
          amount: creditCost,
          transactionId: deductionResult.transaction_id,
          newBalance: deductionResult.new_balance
        });
      }
    } catch (deductionError) {
      logger.error('Error during credit deduction after image analysis', deductionError, 'API', {
        userId: user.id,
        amount: creditCost
      });
    }

    logger.api('Image analysis completed successfully', {
      userId: user.id,
      descriptionLength: description.length
    });

    return NextResponse.json({
      success: true,
      description: description,
      message: '图片分析成功'
    });

  } catch (error) {
    logger.error('Unexpected error in image analysis', error, 'API');
    return NextResponse.json(
      { success: false, message: '图片分析失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// 使用安全中间件包装导出函数
export const POST = withSecurity(handleImageAnalysis);

