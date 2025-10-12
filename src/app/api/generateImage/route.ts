import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const headersList = headers();
    const authorization = headersList.get('authorization');
    
    if (!authorization) {
      return NextResponse.json(
        { success: false, message: '未授权访问' },
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

    // 构建提示词
    let prompt = `Create a high-quality image with the following specifications:
- Background: ${background}
- Main subject: ${subject}
- Main title text: "${mainTitle}"`;

    if (subtitle) {
      prompt += `\n- Subtitle text: "${subtitle}"`;
    }

    // 添加风格描述
    const styleDescriptions: { [key: string]: string } = {
      'realistic': 'photorealistic, high detail, professional photography',
      'cartoon': 'cartoon style, colorful, playful',
      'anime': 'anime style, manga art, Japanese animation',
      'watercolor': 'watercolor painting, soft colors, artistic',
      'oil-painting': 'oil painting style, classical art, rich colors',
      'sketch': 'pencil sketch, black and white, artistic drawing',
      'minimalist': 'minimalist design, clean, simple',
      'vintage': 'vintage style, retro, nostalgic'
    };

    if (style && styleDescriptions[style]) {
      prompt += `\n- Style: ${styleDescriptions[style]}`;
    }

    // 添加尺寸描述
    const sizeDescriptions: { [key: string]: string } = {
      '1:1': 'square aspect ratio',
      '4:3': 'landscape aspect ratio 4:3',
      '3:4': 'portrait aspect ratio 3:4',
      '16:9': 'wide landscape aspect ratio 16:9',
      '9:16': 'tall portrait aspect ratio 9:16'
    };

    if (size && sizeDescriptions[size]) {
      prompt += `\n- Aspect ratio: ${sizeDescriptions[size]}`;
    }

    prompt += '\n- High quality, professional, well-composed image';

    // 这里应该调用实际的AI图片生成API
    // 由于没有真实的API，我们返回模拟数据
    const mockImages = [
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=512&h=512&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=512&h=512&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=512&h=512&fit=crop&crop=center'
    ];

    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 2000));

    return NextResponse.json({
      success: true,
      images: mockImages,
      prompt: prompt,
      message: '图片生成成功'
    });

  } catch (error) {
    console.error('图片生成错误:', error);
    return NextResponse.json(
      { success: false, message: '图片生成失败，请稍后重试' },
      { status: 500 }
    );
  }
}