import { toolList } from '@/constant/tool_list'

export interface StructuredDataConfig {
  siteName: string
  siteUrl: string
  logo: string
  description: string
  locale: string
}

export function generateOrganizationSchema(config: StructuredDataConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": config.siteName,
    "url": config.siteUrl,
    "logo": {
      "@type": "ImageObject",
      "url": config.logo
    },
    "description": config.description,
    "sameAs": [
      "https://github.com/302ai/302_copywriting_assistant"
    ]
  }
}

export function generateWebSiteSchema(config: StructuredDataConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": config.siteName,
    "url": config.siteUrl,
    "description": config.description,
    "inLanguage": config.locale,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${config.siteUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  }
}

export function generateWebPageSchema(config: StructuredDataConfig, pageUrl: string, title: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": title,
    "description": description,
    "url": pageUrl,
    "inLanguage": config.locale,
    "isPartOf": {
      "@type": "WebSite",
      "name": config.siteName,
      "url": config.siteUrl
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "首页",
          "item": config.siteUrl
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": title,
          "item": pageUrl
        }
      ]
    }
  }
}

export function generateSoftwareApplicationSchema(config: StructuredDataConfig, tool: any, locale: string) {
  const toolName = tool.name[locale as keyof typeof tool.name] || tool.name.chinese
  const toolDescription = tool.describe[locale as keyof typeof tool.describe] || tool.describe.chinese
  
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": toolName,
    "description": toolDescription,
    "url": `${config.siteUrl}/${locale}/${tool.title}`,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "creator": {
      "@type": "Organization",
      "name": config.siteName,
      "url": config.siteUrl
    }
  }
}

export function generateBreadcrumbSchema(config: StructuredDataConfig, breadcrumbs: Array<{name: string, url: string}>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }
}

export function generateFAQSchema(faqs: Array<{question: string, answer: string}>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }
}

export function generateToolListSchema(config: StructuredDataConfig, locale: string) {
  const tools = Object.values(toolList).flat()
  
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "AI Writing Tools",
    "description": "Collection of AI-powered writing and content creation tools",
    "url": `${config.siteUrl}/${locale}`,
    "numberOfItems": tools.length,
    "itemListElement": tools.map((tool, index) => ({
      "@type": "SoftwareApplication",
      "position": index + 1,
      "name": tool.name[locale as keyof typeof tool.name] || tool.name.chinese,
      "description": tool.describe[locale as keyof typeof tool.describe] || tool.describe.chinese,
      "url": `${config.siteUrl}/${locale}/${tool.title}`
    }))
  }
}
