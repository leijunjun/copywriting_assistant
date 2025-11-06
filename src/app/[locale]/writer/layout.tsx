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
    zh: 'AI启发创作器-AI内容永动机',
    en: 'AI Inspiration Writer - AI Content Perpetual Motion Machine',
    ja: 'AIインスピレーション作成 - AIコンテンツ永久機関'
  };

  const descriptions = {
    zh: '基于Dan Koe的"AI内容永动机方法论"开发的启发式创作工具，通过AI的启发和辅导完成有参考、有个性、有温度的文章创作。',
    en: 'An inspirational writing tool based on Dan Koe\'s "AI Content Perpetual Motion Machine Methodology", helping you create referenced, personalized, and warm content through AI inspiration and guidance.',
    ja: 'Dan Koeの「AIコンテンツ永久機関方法論」に基づいて開発されたインスピレーション作成ツール。AIのインスピレーションとガイダンスを通じて、参考に基づいた、個性的で温かみのある記事作成を実現します。'
  };

  return generatePageMetadata(
    config,
    params.locale,
    titles[params.locale as keyof typeof titles] || titles.en,
    descriptions[params.locale as keyof typeof descriptions] || descriptions.en,
    "/logo.png",
    "/writer"
  );
}

export default function WriterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

