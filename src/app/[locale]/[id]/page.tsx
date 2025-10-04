// "use server";
import Details from "@/components/page/details";
import { detectLocale } from "@/lib/utils";
import type { Metadata, ResolvingMetadata } from "next";
import { headers } from "next/headers";

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
      title: "AI 文案助手",
      description: "文案创作的得力助手，让创意和效率并驾齐驱",
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
      site: `/${locale}`,
      images: [info[locale as keyof typeof info].image, ...previousImages],
    },
  };
}
export default async function Page({ params }: { params: { id: string } }) {
  return <Details params={params} />;
}
