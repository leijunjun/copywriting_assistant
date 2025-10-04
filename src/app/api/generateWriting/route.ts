
import { NextResponse } from 'next/server';
import { toolParameter } from '../constant';

export async function POST(request: Request) {
  const { tool_name, prompt, params } = await request.json();
  const api_key = process.env.NEXT_PUBLIC_API_KEY
  const model = process.env.NEXT_PUBLIC_MODEL_NAME || ''

  if (!api_key || !model || !tool_name) {
    return NextResponse.json({ error: 'parameter is incorrect' }, { status: 400 });
  }

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
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
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