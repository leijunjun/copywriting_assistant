import { generatePageMetadata } from "@/lib/seo/meta-generator";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const config = {
    siteName: "一推火AI文秘",
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com",
    defaultImage: "/logo.png",
    twitterHandle: "@your_twitter_handle",
    facebookAppId: process.env.FACEBOOK_APP_ID,
  };

  const titles = {
    zh: 'AI图片生成 | 智能配图工具 | 一推火AI文秘',
    en: 'AI Image Generation | Smart Image Creation Tool | AI Writing Assistant',
    ja: 'AI画像生成 | スマート画像作成ツール | AIライティングアシスタント'
  };

  const descriptions = {
    zh: '使用AI智能生成高质量图片，支持多种风格和尺寸。为你的内容创作提供专业的配图服务，让图文并茂的内容更加吸引人。',
    en: 'Generate high-quality images using AI with multiple styles and sizes. Provide professional image services for your content creation, making your content more engaging with visual elements.',
    ja: 'AIを使用して高品質な画像を生成し、複数のスタイルとサイズをサポートします。コンテンツ作成にプロフェッショナルな画像サービスを提供し、視覚的要素でコンテンツをより魅力的にします。'
  };

  return generatePageMetadata(
    config,
    params.locale,
    titles[params.locale as keyof typeof titles] || titles.en,
    descriptions[params.locale as keyof typeof descriptions] || descriptions.en,
    "/AI文案助手.png",
    "/ai-image-generation"
  );
}

export default function AIImageGenerationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
