import ky from "ky";
import OpenAI from "openai";
import { NextResponse } from 'next/server';
import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";

export async function POST(req: Request): Promise<Response> {
  const { prompt } = await req.json();

  const fetchUrl = process.env.NEXT_PUBLIC_API_URL

  const apiKey = process.env.NEXT_PUBLIC_API_KEY
  const model = process.env.NEXT_PUBLIC_MODEL_NAME || ''

  const openai = new OpenAI({ apiKey, baseURL: `${fetchUrl}/v1/chat/completions`, });

  const messages = [{
    role: "user",
    content: ` """Write a prompt for AI image generation as an AI expert.
Understand and think the best result for user instruction.
Write the result directly without any notes, do not add any other contents.
The image prompt must contains the style in flat icon and solid background, you should finish the other parts for the prompt.
Only describe the image in concise words, do not quote the result.

Examples:
Input: 工作日报
Output: flat icon design, solid white background, heavy line stroke and shadowless, inside filled with light blue, minimalist notebook and a pen, rounded icon design

Input: SEO optimize
Output: simpliest icon design, solid white background, heavy line stroke and shadowless, inside filled with dark green, abstract Internet icon, decorate with web link address

User instruction:<text>${prompt}</text>

Return the prompt result plain text in English.
"""`
  }] as ChatCompletionMessageParam[];

  const getImage = (img_prompt: string) => {
    return ky(`${fetchUrl}/302/submit/flux-schnell`, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "User-Agent": "Apifox/1.0.0 (https://apifox.com)",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "prompt": img_prompt,
        "image_size": {
          "width": 1024,
          "height": 1024
        },
        "num_inference_steps": 4
      })
    }).then(res => res.json())
      .then((res: any) => {
        return res;
      })
      .catch(async error => {
        if (error.response) {
          try {
            const errorData = await error.response.json();
            return errorData;
          } catch (parseError) {
            return 'Failed to parse error response';
          }
        } else {
          return error.message || 'Unknown error';
        }
      })
  }

  try {
    const response = await openai.chat.completions.create({
      model,
      stream: false,
      messages,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      n: 1,
    });
    if (response.choices[0].message.content) {
      const result = await getImage(response.choices[0].message.content)
      if (result?.images?.length) {
        return NextResponse.json({ url: result?.images[0]?.url || '' });
      }
      return NextResponse.json(result);
    }
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(error);
  }
}
