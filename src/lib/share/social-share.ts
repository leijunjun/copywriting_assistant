import { SocialShareConfig, SocialPlatform } from '@/types/seo'

export const socialPlatforms: SocialPlatform[] = [
  // 国内平台
  {
    name: '微信',
    icon: 'Wechat',
    color: '#07C160',
    shareUrl: 'weixin://dl/chat',
    isNative: true
  },
  {
    name: '微博',
    icon: 'MessageCircle',
    color: '#E6162D',
    shareUrl: 'https://service.weibo.com/share/share.php',
    isNative: false
  },
  {
    name: 'QQ',
    icon: 'MessageSquare',
    color: '#12B7F5',
    shareUrl: 'https://connect.qq.com/widget/shareqq/index.html',
    isNative: false
  },
  {
    name: '小红书',
    icon: 'Heart',
    color: '#FF2442',
    shareUrl: 'https://www.xiaohongshu.com/explore',
    isNative: false
  },
  {
    name: '抖音',
    icon: 'Video',
    color: '#000000',
    shareUrl: 'https://www.douyin.com',
    isNative: false
  },
  // 国际平台
  {
    name: 'Facebook',
    icon: 'Facebook',
    color: '#1877F2',
    shareUrl: 'https://www.facebook.com/sharer/sharer.php',
    isNative: false
  },
  {
    name: 'Twitter',
    icon: 'Twitter',
    color: '#1DA1F2',
    shareUrl: 'https://twitter.com/intent/tweet',
    isNative: false
  },
  {
    name: 'LinkedIn',
    icon: 'Linkedin',
    color: '#0077B5',
    shareUrl: 'https://www.linkedin.com/sharing/share-offsite/',
    isNative: false
  },
  {
    name: 'WhatsApp',
    icon: 'MessageCircle',
    color: '#25D366',
    shareUrl: 'https://wa.me/',
    isNative: true
  },
  {
    name: 'Telegram',
    icon: 'Send',
    color: '#0088CC',
    shareUrl: 'https://t.me/share/url',
    isNative: false
  }
]

export function generateShareUrl(platform: SocialPlatform, config: SocialShareConfig): string {
  const encodedUrl = encodeURIComponent(config.url)
  const encodedTitle = encodeURIComponent(config.title)
  const encodedDescription = encodeURIComponent(config.description)
  const encodedImage = config.image ? encodeURIComponent(config.image) : ''
  const encodedHashtags = config.hashtags ? encodeURIComponent(config.hashtags.join(',')) : ''

  switch (platform.name) {
    case '微信':
      // 微信分享需要特殊处理，通常通过二维码或复制链接
      return `weixin://dl/chat?url=${encodedUrl}`
    
    case '微博':
      return `${platform.shareUrl}?url=${encodedUrl}&title=${encodedTitle}&pic=${encodedImage}`
    
    case 'QQ':
      return `${platform.shareUrl}?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}&pics=${encodedImage}`
    
    case '小红书':
      // 小红书不支持直接分享，引导用户复制链接
      return `https://www.xiaohongshu.com/explore`
    
    case '抖音':
      // 抖音不支持直接分享，引导用户复制链接
      return `https://www.douyin.com`
    
    case 'Facebook':
      return `${platform.shareUrl}?u=${encodedUrl}&quote=${encodedTitle}`
    
    case 'Twitter':
      return `${platform.shareUrl}?url=${encodedUrl}&text=${encodedTitle}&hashtags=${encodedHashtags}`
    
    case 'LinkedIn':
      return `${platform.shareUrl}?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`
    
    case 'WhatsApp':
      return `${platform.shareUrl}?text=${encodedTitle}%20${encodedUrl}`
    
    case 'Telegram':
      return `${platform.shareUrl}?url=${encodedUrl}&text=${encodedTitle}`
    
    default:
      return config.url
  }
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false)
  } else {
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    try {
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      return Promise.resolve(successful)
    } catch (err) {
      document.body.removeChild(textArea)
      return Promise.resolve(false)
    }
  }
}

export function generateQRCodeUrl(text: string, size: number = 200): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`
}

export function openShareWindow(url: string, width: number = 600, height: number = 400): void {
  const left = (window.screen.width - width) / 2
  const top = (window.screen.height - height) / 2
  
  window.open(
    url,
    'share',
    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
  )
}

export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export function getShareText(config: SocialShareConfig, platform: string): string {
  const hashtags = config.hashtags ? `\n\n#${config.hashtags.join(' #')}` : ''
  return `${config.title}\n\n${config.description}\n\n${config.url}${hashtags}`
}
