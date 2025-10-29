import { Metadata } from 'next'
import { toolList } from '@/constant/tool_list'

export interface MetaConfig {
  siteName: string
  siteUrl: string
  defaultImage: string
  twitterHandle?: string
  facebookAppId?: string
}

export function generatePageMetadata(
  config: MetaConfig,
  locale: string,
  title: string,
  description: string,
  image?: string,
  path?: string
): Metadata {
  const url = path ? `${config.siteUrl}/${locale}${path}` : `${config.siteUrl}/${locale}`
  const ogImage = image || config.defaultImage
  const fullImageUrl = ogImage.startsWith('http') ? ogImage : `${config.siteUrl}${ogImage}`

  return {
    title,
    description,
    metadataBase: new URL(config.siteUrl),
    alternates: {
      canonical: url,
      languages: {
        'zh': `${config.siteUrl}/zh${path || ''}`,
        'en': `${config.siteUrl}/en${path || ''}`,
        'ja': `${config.siteUrl}/ja${path || ''}`,
      }
    },
    openGraph: {
      type: 'website',
      locale: locale === 'zh' ? 'zh_CN' : locale === 'ja' ? 'ja_JP' : 'en_US',
      url,
      siteName: config.siteName,
      title,
      description,
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      site: config.twitterHandle,
      creator: config.twitterHandle,
      title,
      description,
      images: [fullImageUrl]
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
      yahoo: process.env.YAHOO_VERIFICATION,
    }
  }
}

export function generateToolMetadata(
  config: MetaConfig,
  locale: string,
  toolId: string
): Metadata {
  const tool = Object.values(toolList).flat().find(t => t.title === toolId)
  
  if (!tool) {
    return generatePageMetadata(
      config,
      locale,
      'Tool Not Found',
      'The requested tool was not found.',
      config.defaultImage
    )
  }

  const toolName = tool.name[locale as keyof typeof tool.name] || tool.name.chinese
  const toolDescription = tool.describe[locale as keyof typeof tool.describe] || tool.describe.chinese
  const toolImage = tool.url ? `${config.siteUrl}${tool.url}` : config.defaultImage

  // 为每个工具生成更独立和描述性的title
  // 根据不同语言和工具类型生成更合适的title格式
  let toolTitle: string
  
  // 根据工具分类生成更具体的title
  const toolCategory = tool.classify[locale as keyof typeof tool.classify] || tool.classify.chinese
  
  if (locale === 'zh') {
    toolTitle = `${toolName} - ${toolCategory}工具 | ${config.siteName}`
  } else if (locale === 'ja') {
    toolTitle = `${toolName} | ${toolCategory}ツール | ${config.siteName}`
  } else {
    toolTitle = `${toolName} | ${toolCategory} Tool | ${config.siteName}`
  }
  
  return generatePageMetadata(
    config,
    locale,
    toolTitle,
    toolDescription,
    toolImage,
    `/${toolId}`
  )
}

export function generateHomeMetadata(
  config: MetaConfig,
  locale: string
): Metadata {
  const titles = {
    zh: '一推火AI文秘 | 批量写稿，一键配图 ｜更懂门店业务的智能创作助手',
    en: 'AI Writing Assistant - Smart Content Creation Tool',
    ja: 'AIライティングアシスタント - スマートコンテンツ作成ツール'
  }

  const descriptions = {
    zh: '还在为门店文案和作图发愁？每天发朋友圈、做短视频脚本，耗时又没效果？「一推火AI文秘」 ——专为门店打造的智能创作助手！不用学、不用教，输入关键词，马上出爆款内容！',
    en: 'A powerful AI-powered writing assistant that helps you create high-quality content for various platforms. Generate articles, social media posts, and marketing materials with ease.',
    ja: '創造性と効率を兼ね備えたコンテンツ作成の強力なツール。記事、ソーシャルメディア投稿、マーケティング資料を簡単に生成できます。'
  }

  const images = {
    zh: '/writing_zh.jpg',
    en: '/writing_en.jpg',
    ja: '/writing_ja.jpg'
  }

  return generatePageMetadata(
    config,
    locale,
    titles[locale as keyof typeof titles] || titles.en,
    descriptions[locale as keyof typeof descriptions] || descriptions.en,
    images[locale as keyof typeof images] || images.en
  )
}

export function generateKeywords(toolId?: string, locale: string = 'en'): string[] {
  const baseKeywords = {
    zh: ['AI写作', '文案生成', '内容创作', '智能助手', '营销工具', '社交媒体'],
    en: ['AI writing', 'content generation', 'copywriting', 'marketing tools', 'social media', 'content creation'],
    ja: ['AIライティング', 'コンテンツ生成', 'コピーライティング', 'マーケティングツール', 'ソーシャルメディア', 'コンテンツ作成']
  }

  const toolKeywords = {
    zh: {
      'grammar-checker': ['语法检查', '写作辅助', '文本优化'],
      'book-title-generator': ['书名生成', '标题创作', '创意命名'],
      'sentence-rewriting': ['句子改写', '文本重写', '语言优化'],
      'article-title-generation': ['标题生成', '文章标题', 'SEO标题'],
      'xiaohongshu-post-generation': ['小红书', '种草文案', '社交营销'],
      'weibo-post-generation': ['微博', '社交媒体', '营销推广'],
      'douyin-script-generation': ['抖音', '短视频', '脚本创作'],
      'ai-image-generation': ['AI图片生成', '智能配图', '图片创作', 'AI绘图', '图像生成', '配图工具']
    },
    en: {
      'grammar-checker': ['grammar check', 'writing assistance', 'text optimization'],
      'book-title-generator': ['title generation', 'creative naming', 'book titles'],
      'sentence-rewriting': ['sentence rewriting', 'text rewriting', 'language optimization'],
      'article-title-generation': ['title generation', 'article titles', 'SEO titles'],
      'xiaohongshu-post-generation': ['Xiaohongshu', 'social marketing', 'content creation'],
      'weibo-post-generation': ['Weibo', 'social media', 'marketing'],
      'douyin-script-generation': ['TikTok', 'short video', 'script writing'],
      'ai-image-generation': ['AI image generation', 'smart image creation', 'image creation', 'AI drawing', 'image generation', 'image tool']
    },
    ja: {
      'grammar-checker': ['文法チェック', 'ライティング支援', 'テキスト最適化'],
      'book-title-generator': ['タイトル生成', 'クリエイティブネーミング', '書籍タイトル'],
      'sentence-rewriting': ['文の書き換え', 'テキスト書き換え', '言語最適化'],
      'article-title-generation': ['タイトル生成', '記事タイトル', 'SEOタイトル'],
      'xiaohongshu-post-generation': ['小红书', 'ソーシャルマーケティング', 'コンテンツ作成'],
      'weibo-post-generation': ['微博', 'ソーシャルメディア', 'マーケティング'],
      'douyin-script-generation': ['抖音', 'ショート動画', 'スクリプト作成'],
      'ai-image-generation': ['AI画像生成', 'スマート画像作成', '画像作成', 'AI描画', '画像生成', '画像ツール']
    }
  }

  const keywords = baseKeywords[locale as keyof typeof baseKeywords] || baseKeywords.en
  
  if (toolId && toolKeywords[locale as keyof typeof toolKeywords]?.[toolId as keyof typeof toolKeywords[typeof locale]]) {
    keywords.push(...(toolKeywords[locale as keyof typeof toolKeywords]?.[toolId as keyof typeof toolKeywords[typeof locale]] || []))
  }

  return keywords
}
