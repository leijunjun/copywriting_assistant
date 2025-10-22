export interface SEOConfig {
  siteName: string
  siteUrl: string
  defaultImage: string
  twitterHandle?: string
  facebookAppId?: string
  googleSiteVerification?: string
  yandexVerification?: string
  yahooVerification?: string
}

export interface StructuredDataConfig {
  siteName: string
  siteUrl: string
  logo: string
  description: string
  locale: string
}

export interface BreadcrumbItem {
  name: string
  url: string
}

export interface FAQItem {
  question: string
  answer: string
}

export interface SocialShareConfig {
  title: string
  description: string
  url: string
  image?: string
  hashtags?: string[]
}

export interface SocialPlatform {
  name: string
  icon: string
  color: string
  shareUrl: string
  isNative: boolean
}

export interface MetaTagConfig {
  title: string
  description: string
  keywords: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  locale?: string
}
