import { headers } from "next/headers";
import Home from "@/components/page/home";
import { detectLocale } from "@/lib/utils";
import { generateHomeMetadata } from "@/lib/seo/meta-generator";
import { generateOrganizationSchema, generateWebSiteSchema, generateToolListSchema } from "@/lib/seo/structured-data";
import type { Metadata, ResolvingMetadata } from "next";

const languages = [
  { locale: "zh", url: "/zh" },
  { locale: "en", url: "/en" },
  { locale: "ja", url: "/ja" },
  { locale: "de", url: "/de" },
  { locale: "fr", url: "/fr" },
  { locale: "ko", url: "/ko" },
];

type Props = {
  params: { locale: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const headers_ = headers();
  const hostname = headers_.get("host");

  let locale = detectLocale(
    (searchParams && (searchParams.lang as string)) || params.locale || "en"
  ) as keyof typeof info;

  const siteUrl = (hostname as string).includes("localhost")
    ? "http://localhost:3000"
    : `https://${hostname}`;

  const config = {
    siteName: "一推火AI文秘",
    siteUrl,
    defaultImage: "/logo.png",
    twitterHandle: "@your_twitter_handle",
    facebookAppId: process.env.FACEBOOK_APP_ID,
  };

  return generateHomeMetadata(config, locale);
}
export default async function Page({ params }: { params: { locale: string } }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com';
  
  // 生成结构化数据
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      generateOrganizationSchema({
        siteName: "一推火AI文秘",
        siteUrl,
        logo: `${siteUrl}/logo.png`,
        description: "专为门店打造的智能创作助手",
        locale: params.locale
      }),
      generateWebSiteSchema({
        siteName: "一推火AI文秘",
        siteUrl,
        logo: `${siteUrl}/logo.png`,
        description: "专为门店打造的智能创作助手",
        locale: params.locale
      }),
      generateToolListSchema({
        siteName: "一推火AI文秘",
        siteUrl,
        logo: `${siteUrl}/logo.png`,
        description: "专为门店打造的智能创作助手",
        locale: params.locale
      }, params.locale)
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Home />
    </>
  );
}
