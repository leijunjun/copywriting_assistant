import { NextResponse } from 'next/server';
import { toolParameter } from '../constant';
import { getCurrentUser } from '@/lib/auth/session';
import { CREDIT_CONFIG } from '@/config/credit-config';
import { hasSufficientCredits } from '@/lib/credits/balance';
import { deductCredits } from '@/lib/credits/transactions';
import { logger } from '@/lib/utils/logger';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { toolList } from '@/constant/tool_list';
import { convertToAppError } from '@/lib/utils/error';

export async function POST(request: Request) {
  try {
    const { tool_name, prompt, params, language } = await request.json();
    
    // 判断是否为小红书商品帖，如果是则使用 kimi API
    const isKimiTool = tool_name === 'xiaohongshu-post-generation-product';
    
    // 根据工具类型选择 API 配置
    const api_key = isKimiTool 
      ? (process.env.NEXT_PUBLIC_KIMI_API_KEY || process.env.NEXT_PUBLIC_API_KEY)
      : process.env.NEXT_PUBLIC_API_KEY;
    const model = isKimiTool
      ? (process.env.NEXT_PUBLIC_KIMI_MODEL || process.env.NEXT_PUBLIC_MODEL_NAME || '')
      : (process.env.NEXT_PUBLIC_MODEL_NAME || '');

    if (!api_key || !model || !tool_name) {
      return NextResponse.json({ error: 'parameter is incorrect' }, { status: 400 });
    }

    // Get current user for credit checking
    const supabase = createServerSupabaseClient();
    if (!supabase) {
      logger.error('Database connection failed', undefined, undefined, { tool_name });
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      const appError = convertToAppError(authError || new Error('User not found'), { tool_name });
      logger.error('User authentication failed', appError, undefined, { tool_name });
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Get user industry for tools that need it (like xiaohongshu-post-generation-product)
    let userIndustry = 'general';
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('industry')
        .eq('id', user.id)
        .single();
      
      if (!userError && userData) {
        const industry = (userData as { industry?: string })?.industry;
        if (industry) {
          userIndustry = industry;
        }
      }
    } catch (error) {
      logger.error('Failed to fetch user industry', convertToAppError(error), undefined, { userId: user.id });
      // Continue with default 'general' industry
    }

    // Get credit deduction rate from hardcoded config
    const creditDeductionRate = CREDIT_CONFIG.WRITING_GENERATION.COST;

    // Check if user has sufficient credits
    const creditCheck = await hasSufficientCredits(user.id, creditDeductionRate);
    if (!creditCheck.success) {
      logger.error('Failed to check user credits', undefined, undefined, { userId: user.id });
      return NextResponse.json({ 
        error: 'Failed to check credit balance',
        error_code: 'CREDIT_CHECK_FAILED'
      }, { status: 500 });
    }

    if (!creditCheck.validation?.has_sufficient_credits) {
      logger.credits('Insufficient credits for content generation', {
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
      }, { status: 402 }); // 402 Payment Required
    }

    // Get tool name in appropriate language for description
    const getToolName = (toolName: string, lang: string = 'chinese') => {
      for (const category in toolList) {
        for (const tool of toolList[category]) {
          if (tool.title === toolName) {
            switch (lang) {
              case 'english':
                return tool.name.english;
              case 'japanese':
                return tool.name.japanese;
              default:
                return tool.name.chinese;
            }
          }
        }
      }
      return toolName; // fallback to original name
    };

    // Generate localized description based on language
    const getDescription = (toolName: string, lang: string) => {
      const localizedToolName = getToolName(toolName, lang);
      switch (lang) {
        case 'english':
          return `Content generation using ${localizedToolName}`;
        case 'japanese':
          return `コンテンツ生成使用 ${localizedToolName}`;
        default:
          return `内容生成使用 ${localizedToolName}`;
      }
    };

    // Note: Credits will be deducted AFTER successful content generation

    // Proceed with content generation
    let messages;
    
    if (prompt && prompt.trim() !== '') {
      // 使用自定义prompt
      messages = [{ role: 'user', content: prompt }];
    } else {
      // 使用预设的toolParameter
      if (!toolParameter[tool_name]) {
        logger.error('Tool parameter not found', undefined, undefined, { tool_name, availableTools: Object.keys(toolParameter) });
        return NextResponse.json({ error: `Tool parameter not found for: ${tool_name}` }, { status: 400 });
      }
      
      try {
        // For xiaohongshu-post-generation-product, add industry information
        if (tool_name === 'xiaohongshu-post-generation-product') {
          messages = toolParameter[tool_name]({ ...params, industry: userIndustry });
        } else {
          messages = toolParameter[tool_name]({ ...params });
        }
      } catch (error) {
        const appError = convertToAppError(error, { tool_name, params });
        logger.error('Error generating tool parameters', appError, undefined, { tool_name, params });
        return NextResponse.json({ error: 'Failed to generate tool parameters' }, { status: 500 });
      }
    }

    const myHeaders = {
      "Accept": "application/json",
      "Authorization": `Bearer ${api_key}`,
      "User-Agent": "Apifox/1.0.0 (https://apifox.com)",
      "Content-Type": "application/json"
    };

    const raw = JSON.stringify({ model, messages, stream: true });
    
    // 根据工具类型选择 API URL
    const fetchUrl = isKimiTool
      ? 'https://api.302.ai/v1/chat/completions'
      : `${process.env.NEXT_PUBLIC_API_URL}/v1/chat/completions`;
    
    try {
      logger.api('Making API request to external service', { 
        url: fetchUrl, 
        tool_name, 
        userId: user.id,
        apiProvider: isKimiTool ? 'kimi' : 'default'
      });
      
      const response = await fetch(fetchUrl, {
        method: 'POST',
        headers: myHeaders,
        body: raw,
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('External API request failed', undefined, undefined, {
          status: response.status,
          statusText: response.statusText,
          errorText,
          tool_name,
          userId: user.id
        });
        return NextResponse.json({ 
          error: 'External API request failed', 
          details: errorText 
        }, { status: response.status });
      }

      if (response.body !== null) {
        const readableStream = new ReadableStream({
          async start(controller) {
            try {
              const reader: any = response?.body?.getReader();
              const decoder = new TextDecoder();
              let hasContent = false; // Track if we received any content
              
              while (true) {
                const { done, value } = await reader.read();
                if (done) {
                  // Only deduct credits after we've successfully streamed content
                  if (hasContent) {
                    try {
                      const deductionResult = await deductCredits({
                        user_id: user.id,
                        amount: creditDeductionRate,
                        description: getDescription(tool_name, language || 'chinese'),
                        service_type: 'content_generation'
                      });

                      if (!deductionResult.success) {
                        logger.error('Failed to deduct credits after successful generation', undefined, undefined, {
                          userId: user.id,
                          amount: creditDeductionRate,
                          error: deductionResult.error
                        });
                        
                        logger.credits('Warning: Content generated but credit deduction failed', {
                          userId: user.id,
                          amount: creditDeductionRate,
                          error: deductionResult.error
                        });
                      } else {
                        logger.credits('Credits deducted successfully after content generation', {
                          userId: user.id,
                          amount: creditDeductionRate,
                          transactionId: deductionResult.transaction_id,
                          newBalance: deductionResult.new_balance
                        });
                      }
                    } catch (deductionError) {
                      const appError = convertToAppError(deductionError, {
                        userId: user.id,
                        amount: creditDeductionRate
                      });
                      logger.error('Error during credit deduction after content generation', appError, undefined, {
                        userId: user.id,
                        amount: creditDeductionRate
                      });
                    }
                  }
                  break;
                }
                
                const strChunk = decoder.decode(value, { stream: true });
                if (strChunk && strChunk.length > 1) {
                  const arr = strChunk.split('data: ');
                  for (let index = 1; index < arr.length; index++) {
                    const jsonString = arr[index];
                    if (isValidJSONObject(jsonString)) {
                      try {
                        const parsedChunk = JSON.parse(jsonString);
                        
                        // 检查是否有错误信息（302 API 可能返回的错误格式）
                        if (parsedChunk.error) {
                          logger.error('Error in stream response from 302 API', undefined, undefined, {
                            error: parsedChunk.error,
                            tool_name,
                            userId: user.id
                          });
                          
                          // 提取错误代码，302 API 的错误代码通常在 error.code 或 error.err_code 中
                          const errorCode = parsedChunk.error.code || parsedChunk.error.err_code || parsedChunk.error.status || -10003;
                          const errorMessage = parsedChunk.error.message || parsedChunk.error.msg || '未知错误';
                          
                          // 通过流式响应发送错误信息
                          controller.enqueue(`data: ${JSON.stringify({ 
                            error: true, 
                            err_code: errorCode,
                            message: errorMessage 
                          })}\n\n`);
                          controller.close();
                          return;
                        }
                        
                        // 检查 choices 数组中的错误
                        if (parsedChunk.choices && parsedChunk.choices[0]) {
                          const choice = parsedChunk.choices[0];
                          
                          // 检查是否有错误
                          if (choice.error) {
                            logger.error('Error in choice from 302 API', undefined, undefined, {
                              error: choice.error,
                              tool_name,
                              userId: user.id
                            });
                            
                            const errorCode = choice.error.code || choice.error.err_code || -10003;
                            const errorMessage = choice.error.message || choice.error.msg || '未知错误';
                            
                            controller.enqueue(`data: ${JSON.stringify({ 
                              error: true, 
                              err_code: errorCode,
                              message: errorMessage 
                            })}\n\n`);
                            controller.close();
                            return;
                          }
                          
                          const delta = choice.delta;
                          if (delta && Object.keys(delta).length > 0) {
                            hasContent = true; // Mark that we received content
                            controller.enqueue(`data: ${JSON.stringify(delta)}\n\n`);
                          } else if (choice.finish_reason) {
                            controller.enqueue(`data: ${JSON.stringify({ stop: choice.finish_reason })}\n\n`);
                          }
                        }
                      } catch (parseError) {
                        // JSON 解析错误，记录但继续处理
                        logger.error('Failed to parse stream chunk', convertToAppError(parseError), undefined, {
                          jsonString: jsonString.substring(0, 200),
                          tool_name,
                          userId: user.id
                        });
                      }
                    }
                  }
                }
              }
              controller.close();
            } catch (error) {
              const appError = convertToAppError(error, { tool_name, userId: user.id });
              logger.error('Error in stream processing', appError, undefined, { 
                tool_name, 
                userId: user.id,
                errorMessage: error instanceof Error ? error.message : String(error),
                errorStack: error instanceof Error ? error.stack : undefined
              });
              
              // 通过流式响应发送错误信息，而不是直接调用 controller.error
              try {
                const errorMessage = error instanceof Error ? error.message : '流处理过程中发生未知错误';
                controller.enqueue(`data: ${JSON.stringify({ 
                  error: true, 
                  err_code: -10003,
                  message: errorMessage 
                })}\n\n`);
                controller.close();
              } catch (enqueueError) {
                // 如果发送错误信息也失败，直接关闭流
                logger.error('Failed to send error in stream', convertToAppError(enqueueError), undefined, {
                  tool_name,
                  userId: user.id
                });
                controller.close();
              }
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
        logger.error('Response body is null', undefined, undefined, { tool_name, userId: user.id });
        return NextResponse.json({ error: 'Response body is null' }, { status: 500 });
      }
    } catch (error: any) {
      logger.error('Unexpected error in content generation', error, undefined, {
        tool_name,
        userId: user?.id,
        errorMessage: error.message,
        errorStack: error.stack
      });
      return NextResponse.json({ 
        error: 'An error occurred during content generation', 
        err_code: 500,
        details: error.message 
      }, { status: 500 });
    }
  } catch (error: any) {
    logger.error('Unexpected error in content generation', error, undefined, {
      tool_name: 'unknown',
      userId: 'unknown',
      errorMessage: error.message,
      errorStack: error.stack
    });
    return NextResponse.json({ 
      error: 'An error occurred during content generation', 
      err_code: 500,
      details: error.message 
    }, { status: 500 });
  }
}

// Determine whether the string is a valid JSON object
function isValidJSONObject(str: string) {
  if (typeof str !== 'string' || str.trim() === '') {
    return false;
  }
  try {
    const parsed = JSON.parse(str);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed);
  } catch (e) {
    return false;
  }
}