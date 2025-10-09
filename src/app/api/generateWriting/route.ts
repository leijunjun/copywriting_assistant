import { NextResponse } from 'next/server';
import { toolParameter } from '../constant';
import { getCurrentUser } from '@/lib/auth/session';
import { getCreditDeductionRate } from '@/lib/database/system-config';
import { hasSufficientCredits } from '@/lib/credits/balance';
import { deductCredits } from '@/lib/credits/transactions';
import { logger } from '@/lib/utils/logger';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { toolList } from '@/constant/tool_list';

export async function POST(request: Request) {
  try {
    const { tool_name, prompt, params, language } = await request.json();
    const api_key = process.env.NEXT_PUBLIC_API_KEY
    const model = process.env.NEXT_PUBLIC_MODEL_NAME || ''

    if (!api_key || !model || !tool_name) {
      return NextResponse.json({ error: 'parameter is incorrect' }, { status: 400 });
    }

    // Get current user for credit checking
    const supabase = createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Get credit deduction rate from system config
    const creditDeductionRate = await getCreditDeductionRate();
    logger.api('Credit deduction rate retrieved', { rate: creditDeductionRate });

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
    const messages = prompt ? [{ role: 'user', content: prompt }] : toolParameter[tool_name]({ ...params });

    const myHeaders = {
      "Accept": "application/json",
      "Authorization": `Bearer ${api_key}`,
      "User-Agent": "Apifox/1.0.0 (https://apifox.com)",
      "Content-Type": "application/json"
    };

    const raw = JSON.stringify({ model, messages, stream: true });
    const fetchUrl = `${process.env.NEXT_PUBLIC_API_URL}/v1/chat/completions`;
    
    try {
      const response = await fetch(fetchUrl, {
        method: 'POST',
        headers: myHeaders,
        body: raw,
      });

      if (response.ok && response.body !== null) {
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
                      logger.error('Error during credit deduction after content generation', deductionError, undefined, {
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
                      const parsedChunk = JSON.parse(jsonString);
                      if (parsedChunk.choices[0]) {
                        const delta = parsedChunk.choices[0].delta;
                        if (delta && Object.keys(delta).length > 0) {
                          hasContent = true; // Mark that we received content
                          controller.enqueue(`data: ${JSON.stringify(delta)}\n\n`);
                        } else {
                          controller.enqueue(`data: ${JSON.stringify({ stop: parsedChunk.choices[0].finish_reason })}\n\n`);
                        }
                      }
                    }
                  }
                }
              }
              controller.close();
            } catch (error) {
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
        const resJson = await response.json();
        return NextResponse.json({ ...resJson }, { status: 400 });
      }
    } catch (error: any) {
      logger.error('Unexpected error in content generation', error, undefined, {
        tool_name,
        userId: user?.id
      });
      return NextResponse.json({ error: 'An error occurred', err_code: 500 }, { status: 500 });
    }
  } catch (error: any) {
    logger.error('Unexpected error in content generation', error, undefined, {
      tool_name: 'unknown',
      userId: 'unknown'
    });
    return NextResponse.json({ error: 'An error occurred', err_code: 500 }, { status: 500 });
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