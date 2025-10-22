'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Share2, 
  Copy, 
  Check, 
  QrCode, 
  Wechat, 
  MessageCircle, 
  MessageSquare, 
  Heart, 
  Video, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Send,
  ExternalLink
} from 'lucide-react'
import { 
  socialPlatforms, 
  generateShareUrl, 
  copyToClipboard, 
  generateQRCodeUrl, 
  openShareWindow, 
  isMobile, 
  getShareText 
} from '@/lib/share/social-share'
import { SocialShareConfig } from '@/types/seo'

interface SocialShareProps {
  config: SocialShareConfig
  className?: string
  showTitle?: boolean
  compact?: boolean
}

const iconMap = {
  Wechat,
  MessageCircle,
  MessageSquare,
  Heart,
  Video,
  Facebook,
  Twitter,
  Linkedin,
  Send
}

export default function SocialShare({ 
  config, 
  className = '', 
  showTitle = true, 
  compact = false 
}: SocialShareProps) {
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [customText, setCustomText] = useState('')

  const handleShare = async (platform: typeof socialPlatforms[0]) => {
    if (platform.isNative && isMobile()) {
      // 移动端原生分享
      if (navigator.share) {
        try {
          await navigator.share({
            title: config.title,
            text: config.description,
            url: config.url
          })
        } catch (err) {
          console.log('Share cancelled')
        }
      } else {
        // 降级到复制链接
        await handleCopyLink()
      }
    } else {
      // 桌面端或非原生分享
      const shareUrl = generateShareUrl(platform, config)
      if (platform.name === '微信' || platform.name === '小红书' || platform.name === '抖音') {
        // 这些平台不支持直接分享，显示二维码或复制链接
        if (platform.name === '微信') {
          setShowQR(true)
        } else {
          await handleCopyLink()
        }
      } else {
        openShareWindow(shareUrl)
      }
    }
  }

  const handleCopyLink = async () => {
    const success = await copyToClipboard(config.url)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCopyText = async () => {
    const text = customText || getShareText(config, '')
    const success = await copyToClipboard(text)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleWeChatQR = () => {
    setShowQR(true)
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className="flex items-center gap-2"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? '已复制' : '复制链接'}
        </Button>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              分享
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>分享到社交媒体</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-2">
              {socialPlatforms.map((platform) => {
                const IconComponent = iconMap[platform.icon as keyof typeof iconMap]
                return (
                  <Button
                    key={platform.name}
                    variant="outline"
                    onClick={() => handleShare(platform)}
                    className="flex items-center gap-2"
                    style={{ borderColor: platform.color }}
                  >
                    {IconComponent && <IconComponent className="h-4 w-4" style={{ color: platform.color }} />}
                    {platform.name}
                  </Button>
                )
              })}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          分享到社交媒体
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 快速操作 */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handleCopyLink}
            className="flex items-center gap-2"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? '已复制链接' : '复制链接'}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleWeChatQR}
            className="flex items-center gap-2"
          >
            <QrCode className="h-4 w-4" />
            微信二维码
          </Button>
        </div>

        {/* 社交媒体平台 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {socialPlatforms.map((platform) => {
            const IconComponent = iconMap[platform.icon as keyof typeof iconMap]
            return (
              <Button
                key={platform.name}
                variant="outline"
                onClick={() => handleShare(platform)}
                className="flex flex-col items-center gap-1 h-auto p-3"
                style={{ borderColor: platform.color }}
              >
                {IconComponent && <IconComponent className="h-5 w-5" style={{ color: platform.color }} />}
                <span className="text-xs">{platform.name}</span>
              </Button>
            )
          })}
        </div>

        {/* 自定义分享文本 */}
        <div className="space-y-2">
          <Label htmlFor="custom-text">自定义分享文本</Label>
          <Textarea
            id="custom-text"
            placeholder="输入自定义的分享文本..."
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            rows={3}
          />
          <Button
            variant="outline"
            onClick={handleCopyText}
            className="flex items-center gap-2"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? '已复制文本' : '复制文本'}
          </Button>
        </div>

        {/* 微信二维码弹窗 */}
        <Dialog open={showQR} onOpenChange={setShowQR}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>微信分享</DialogTitle>
            </DialogHeader>
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                扫描二维码在微信中打开
              </p>
              <div className="flex justify-center">
                <img
                  src={generateQRCodeUrl(config.url)}
                  alt="微信分享二维码"
                  className="w-48 h-48"
                />
              </div>
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="w-full"
              >
                <Copy className="h-4 w-4 mr-2" />
                复制链接
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
