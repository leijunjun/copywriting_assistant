import { headers } from "next/headers";
import Home from "@/components/page/home";
import { detectLocale } from "@/lib/utils";
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

  const previousImages = (await parent).openGraph?.images || [];

  const info = {
    zh: {
      title: "一推火AI文秘 | 批量写稿，一键配图 ｜更懂门店业务的智能创作助手",
      description: "还在为门店文案和作图发愁？每天发朋友圈、做短视频脚本，耗时又没效果？「一推火AI文秘」 ——专为门店打造的智能创作助手！不用学、不用教，输入关键词，马上出爆款内容！",
      image: "/writing_zh.jpg",
    },
    en: {
      title: "AI Writing Assistant",
      description: "A powerful tool for content creation, combining creativity and efficiency.",
      image: "/writing_en.jpg",
    },
    ja: {
      title: "AIライティングアシスタント",
      description:
        "創造性と効率を兼ね備えたコンテンツ作成の強力なツール。",
      image: "/writing_ja.jpg",
    },
  };

  let locale = detectLocale(
    (searchParams && (searchParams.lang as string)) || params.locale || "en"
  ) as keyof typeof info;

  if (!(locale in info)) {
    locale = "en";
  }

  return {
    title: info[locale as keyof typeof info].title,
    description: info[locale as keyof typeof info].description,
    metadataBase: new URL(
      (hostname as string).includes("localhost")
        ? "http://localhost:3000"
        : `https://${hostname}`
    ),
    alternates: {
      canonical: `/${locale}`,
      languages: languages
        .filter((item) => item.locale !== locale)
        .map((item) => ({
          [item.locale]: `${item.url}`,
        }))
        .reduce((acc, curr) => Object.assign(acc, curr), {}),
    },
    openGraph: {
      url: `/${locale}`,
      images: [info[locale as keyof typeof info].image, ...previousImages],
    },
    twitter: {
      site: (hostname as string).includes("localhost")
        ? `http://localhost:3000/${locale}`
        : `https://${hostname}/${locale}`,
      images: [info[locale as keyof typeof info].image, ...previousImages],
    },
  };
}
export default async function Page() {
  return <Home />;
}
