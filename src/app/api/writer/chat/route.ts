import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { logger } from '@/lib/utils/logger';
import { CREDIT_CONFIG } from '@/config/credit-config';
import { hasSufficientCredits } from '@/lib/credits/balance';
import { deductCredits } from '@/lib/credits/transactions';

/**
 * Writer Chat API
 * 为 Writer 页面提供智能对话生成功能
 * 使用 302.ai 的 OpenAI 兼容接口
 */
export async function POST(request: NextRequest) {
  try {
    logger.api('Writer chat request received');

    // 获取当前用户信息
    const user = await getCurrentUser();
    if (!user) {
      logger.error('User not authenticated for writer chat', undefined, 'API');
      return NextResponse.json(
        { success: false, message: '用户未登录' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      logger.error('Invalid prompt parameter', undefined, 'API', { userId: user.id });
      return NextResponse.json(
        { success: false, message: '提示语内容不能为空' },
        { status: 400 }
      );
    }

    // 获取 302 API 配置
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    // Writer 专用模型：可通过环境变量配置，默认使用 qwen3-235b-a22b-instruct-2507
    const model = process.env.NEXT_PUBLIC_WRITER_MODEL || 'qwen3-235b-a22b-instruct-2507';

    if (!apiKey || !apiUrl) {
      logger.error('302 API not configured', undefined, 'API');
      return NextResponse.json(
        { success: false, message: '302 API 配置错误' },
        { status: 500 }
      );
    }

    // 检查用户信用点
    const creditDeductionRate = CREDIT_CONFIG.WRITING_GENERATION.COST;
    const creditCheck = await hasSufficientCredits(user.id, creditDeductionRate);
    
    if (!creditCheck.success) {
      logger.error('Failed to check user credits', undefined, undefined, { userId: user.id });
      return NextResponse.json({ 
        error: 'Failed to check credit balance',
        error_code: 'CREDIT_CHECK_FAILED'
      }, { status: 500 });
    }

    if (!creditCheck.validation?.has_sufficient_credits) {
      logger.credits('Insufficient credits for writer chat', {
        userId: user.id,
        required: creditDeductionRate,
        current: creditCheck.validation?.current_balance || 0,
        deficit: creditCheck.validation?.deficit || 0
      });
      
      return NextResponse.json({ 
        error: 'Insufficient credits',
        error_code: 'INSUFFICIENT_CREDITS',
        required_credits: creditDeductionRate,
        current_balance: creditCheck.validation?.current_balance || 0,
        deficit: creditCheck.validation?.deficit || 0
      }, { status: 402 });
    }

    logger.api('Calling 302 AI API for Writer chat', { 
      userId: user.id,
      promptLength: prompt.length,
      model: model
    });

    // 调用 302 AI API
    const messages = [{ role: 'user', content: prompt }];
    
    const response = await fetch(`${apiUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('302 API request failed', undefined, 'API', {
        status: response.status,
        statusText: response.statusText,
        errorText,
        userId: user.id
      });
      return NextResponse.json(
        { success: false, message: '302 API 调用失败，请稍后重试' },
        { status: 500 }
      );
    }

    // 返回流式响应
    if (response.body !== null) {
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let hasContent = false;
            
            if (!reader) {
              controller.close();
              return;
            }
            
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                // 扣除信用点
                if (hasContent) {
                  try {
                    const deductionResult = await deductCredits({
                      user_id: user.id,
                      amount: creditDeductionRate,
                      description: '内容生成使用 Writer 智能写作',
                      service_type: 'content_generation'
                    });

                    if (!deductionResult.success) {
                      logger.error('Failed to deduct credits after generation', undefined, undefined, {
                        userId: user.id,
                        amount: creditDeductionRate,
                        error: deductionResult.error
                      });
                    } else {
                      logger.credits('Credits deducted successfully', {
                        userId: user.id,
                        amount: creditDeductionRate,
                        transactionId: deductionResult.transaction_id,
                        newBalance: deductionResult.new_balance
                      });
                    }
                  } catch (deductionError) {
                    logger.error('Error during credit deduction', deductionError, undefined, {
                      userId: user.id,
                      amount: creditDeductionRate
                    });
                  }
                }
                break;
              }
              
              const chunk = decoder.decode(value, { stream: true });
              
              // 解析 302 API 的 SSE 数据
              if (chunk && chunk.length > 1) {
                const arr = chunk.split('data: ');
                for (let index = 1; index < arr.length; index++) {
                  const jsonString = arr[index].trim();
                  if (jsonString && jsonString !== '[DONE]') {
                    try {
                      const parsed = JSON.parse(jsonString);
                      if (parsed.choices && parsed.choices[0]) {
                        const delta = parsed.choices[0].delta;
                        if (delta && delta.content) {
                          hasContent = true;
                          // 转换为统一的格式
                          controller.enqueue(`data: ${JSON.stringify({ 
                            type: 'text_chunk',
                            text: delta.content
                          })}\n\n`);
                        }
                      }
                    } catch (parseError) {
                      logger.error('Error parsing 302 API data', parseError, 'API', { 
                        userId: user.id,
                        data: jsonString 
                      });
                    }
                  }
                }
              }
            }
            
            // 发送完成事件
            controller.enqueue(`data: ${JSON.stringify({ 
              type: 'workflow_finished'
            })}\n\n`);
            
            controller.close();
            
            logger.api('Writer chat completed successfully', {
              userId: user.id
            });
          } catch (error) {
            logger.error('Error in Writer chat stream processing', error, 'API', { 
              userId: user.id 
            });
            controller.error(error);
          }
        }
      });

      return new NextResponse(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    } else {
      logger.error('302 API response body is null', undefined, 'API', { userId: user.id });
      return NextResponse.json(
        { success: false, message: '302 API 响应异常' },
        { status: 500 }
      );
    }

  } catch (error) {
    logger.error('Unexpected error in Writer chat', error, 'API');
    return NextResponse.json(
      { success: false, message: 'Writer 智能写作执行失败，请稍后重试' },
      { status: 500 }
    );
  }
}

