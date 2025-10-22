import { MetadataRoute } from 'next'
import { toolList } from '@/constant/tool_list'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com'
const locales = ['zh', 'en', 'ja']

export default function sitemap(): MetadataRoute.Sitemap {
  const sitemap: MetadataRoute.Sitemap = []

  // 首页多语言版本
  locales.forEach(locale => {
    sitemap.push({
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    })
  })

  // 工具页面多语言版本
  Object.values(toolList).flat().forEach(tool => {
    locales.forEach(locale => {
      sitemap.push({
        url: `${baseUrl}/${locale}/${tool.title}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    })
  })

  // 静态页面
  const staticPages = [
    { path: '/about', priority: 0.6 },
    { path: '/privacy', priority: 0.4 },
    { path: '/terms', priority: 0.4 },
  ]

  staticPages.forEach(page => {
    locales.forEach(locale => {
      sitemap.push({
        url: `${baseUrl}/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: page.priority,
      })
    })
  })

  return sitemap
}
