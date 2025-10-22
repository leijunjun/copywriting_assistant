import { NAVIGATION } from "@/constant/language";
import { generatePageMetadata } from "@/lib/seo/meta-generator";
import type { Metadata } from "next";
import AboutContent from './AboutContent';

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
    zh: '关于一推火AI文秘 | 让创作更简单高效',
    en: 'About Us - AI Writing Assistant | Making Creation Simple and Efficient',
    ja: '私たちについて - AIライティングアシスタント | 創作をより簡単で効率的に'
  };

  const descriptions = {
    zh: '了解一推火AI文秘的使命和愿景，我们致力于让文案创作更简单、更高效，帮助每一位用户轻松写出打动人心的文案。',
    en: 'Learn about our mission and vision. We are dedicated to making copywriting simpler and more efficient, helping every user easily write compelling copy.',
    ja: '私たちのミッションとビジョンについて学んでください。コピーライティングをより簡単で効率的にし、すべてのユーザーが感動的なコピーを簡単に書けるよう支援します。'
  };

  return generatePageMetadata(
    config,
    params.locale,
    titles[params.locale as keyof typeof titles] || titles.en,
    descriptions[params.locale as keyof typeof descriptions] || descriptions.en,
    "/logo.png",
    "/about"
  );
}

export default function AboutPage() {
  return <AboutContent />;
}
