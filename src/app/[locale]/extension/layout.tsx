import { generatePageMetadata } from "@/lib/seo/meta-generator";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const config = {
    siteName: "AI文秘",
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com",
    defaultImage: "/logo.png",
    twitterHandle: "@your_twitter_handle",
    facebookAppId: process.env.FACEBOOK_APP_ID,
  };

  const titles = {
    zh: 'Chrome 扩展下载 | AI文秘',
    en: 'Chrome Extension Download | AI Writing Assistant',
    ja: 'Chrome拡張機能ダウンロード | AIライティングアシスタント'
  };

  const descriptions = {
    zh: '下载 AI文秘 Chrome 扩展，在浏览器中快速使用 AI 文案生成功能。',
    en: 'Download AI Writing Assistant Chrome Extension to quickly use AI copywriting features in your browser.',
    ja: 'AIライティングアシスタントChrome拡張機能をダウンロードして、ブラウザでAIコピーライティング機能をすばやく使用できます。'
  };

  return generatePageMetadata(
    config,
    params.locale,
    titles[params.locale as keyof typeof titles] || titles.en,
    descriptions[params.locale as keyof typeof descriptions] || descriptions.en,
    "/logo.png",
    "/extension"
  );
}

export default function ExtensionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

