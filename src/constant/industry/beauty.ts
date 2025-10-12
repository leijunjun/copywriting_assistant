/**
 * Beauty Industry Presets
 * 
 * This file contains presets specifically for beauty industry users.
 * Includes role templates, background scenarios, and purpose goals for various tools.
 */

// 多语言内容接口
export interface MultilingualContent {
  chinese: string;
  english: string;
  japanese: string;
}

// 工具预设内容接口
export interface ToolPresets {
  [fieldName: string]: MultilingualContent[];
}

// 行业预设配置接口
export interface IndustryPresets {
  [toolId: string]: ToolPresets;
}

export const beautyPresets: IndustryPresets = {
  // 小红书帖子生成工具
  'xiaohongshu-post-generation': {
    role: [
      { chinese: "美容师", english: "Beautician", japanese: "美容師" },
      { chinese: "美甲师", english: "Nail Technician", japanese: "ネイリスト" },
      { chinese: "化妆师", english: "Makeup Artist", japanese: "メイクアップアーティスト" },
      { chinese: "发型师", english: "Hair Stylist", japanese: "ヘアスタイリスト" },
      { chinese: "美睫师", english: "Eyelash Technician", japanese: "まつ毛エクステンション師" },
      { chinese: "纹绣师", english: "Microblading Artist", japanese: "マイクロブレーディングアーティスト" },
    ],
    background: [
      { 
        chinese: "专业美容师，拥有8年美容护肤经验，擅长问题肌肤修复和抗衰老护理", 
        english: "Professional beautician with 8 years of skincare experience, specializing in problem skin repair and anti-aging care", 
        japanese: "プロ美容師、8年のスキンケア経験、問題肌修復とアンチエイジングケアに特化" 
      },
      { 
        chinese: "资深美甲师，精通各种美甲技法，从基础护理到艺术创作样样精通", 
        english: "Senior nail technician, proficient in various nail techniques, from basic care to artistic creation", 
        japanese: "ベテランネイリスト、様々なネイル技法に精通、基本ケアからアート創作まで" 
      },
      { 
        chinese: "专业化妆师，为众多明星和新娘提供化妆服务，擅长各种场合妆容设计", 
        english: "Professional makeup artist, providing makeup services for many celebrities and brides, specializing in various occasion makeup designs", 
        japanese: "プロメイクアップアーティスト、多くのセレブや花嫁にメイクサービス提供、様々な場面のメイクデザインに特化" 
      },
    ],
    purpose: [
      { 
        chinese: "展示美容技能和服务案例，吸引客户预约美容服务", 
        english: "Showcase beauty skills and service cases, attract customers to book beauty services", 
        japanese: "美容スキルとサービス事例を紹介、お客様に美容サービスの予約を促す" 
      },
      { 
        chinese: "分享美容知识和护肤技巧，建立专业形象", 
        english: "Share beauty knowledge and skincare tips, build professional image", 
        japanese: "美容知識とスキンケアのコツを共有、プロフェッショナルなイメージを構築" 
      },
      { 
        chinese: "推广美容院服务，通过案例展示技术实力", 
        english: "Promote beauty salon services, showcase technical strength through cases", 
        japanese: "美容院サービスの普及、事例を通じて技術力をアピール" 
      },
    ]
  },
  
  // 微信朋友圈回复工具
  'wechat-moments-reply': {
    content: [
      { 
        chinese: "看到您的美甲作品：太美了！这就是专业技术的魅力，让每个细节都完美无瑕", 
        english: "Seeing your nail art: So beautiful! This is the charm of professional skills, making every detail perfect", 
        japanese: "ネイルアートを見て：とても美しい！これがプロの技術の魅力、すべてのディテールを完璧に" 
      },
      { 
        chinese: "客户晒出完美妆容：感谢信任，让您更加美丽自信是我的使命", 
        english: "Customer showing perfect makeup: Thank you for your trust, making you more beautiful and confident is my mission", 
        japanese: "お客様の完璧なメイクを投稿：信頼していただきありがとうございます。より美しく自信を持っていただくことが私の使命です" 
      },
    ]
  },
  
  // 视频标题生成工具
  'video-title-generator': {
    keywords: [
      { chinese: "美容护肤", english: "Beauty Skincare", japanese: "美容スキンケア" },
      { chinese: "美甲艺术", english: "Nail Art", japanese: "ネイルアート" },
      { chinese: "化妆技巧", english: "Makeup Tips", japanese: "メイクのコツ" },
      { chinese: "发型设计", english: "Hair Design", japanese: "ヘアデザイン" },
      { chinese: "美容院", english: "Beauty Salon", japanese: "美容院" },
    ]
  },
  
  // 微博帖子生成工具
  'weibo-post-generation': {
    content: [
      { 
        chinese: "今天为新娘打造了梦幻妆容，从底妆到眼妆，每个细节都精心雕琢", 
        english: "Created a dreamy makeup look for the bride today, from foundation to eye makeup, every detail carefully crafted", 
        japanese: "今日は花嫁のために夢のようなメイクを施しました。ベースメイクからアイメイクまで、すべてのディテールを丁寧に仕上げました" 
      },
    ]
  },
  
  // 抖音图文生成工具
  'TikTok-post-generation': {
    content: [
      { 
        chinese: "美甲师的一天：从设计到完成，每一笔都是艺术创作", 
        english: "A day in the life of a nail technician: From design to completion, every stroke is an artistic creation", 
        japanese: "ネイリストの一日：デザインから完成まで、一筆一筆が芸術作品" 
      },
    ]
  },
  
  // 微信图文工具
  'weixin-generation': {
    content: [
      { 
        chinese: "美丽从细节开始，专业美容师为您打造完美形象", 
        english: "Beauty starts from details, professional beautician creates perfect image for you", 
        japanese: "美しさは細部から始まる、プロ美容師が完璧なイメージを創り出します" 
      },
    ]
  },
  
  // 邮件生成工具
  'email-generation': {
    content: [
      { 
        chinese: "感谢您选择我们的美容服务，我们将为您提供专业、安全的美容护理", 
        english: "Thank you for choosing our beauty services, we will provide you with professional and safe beauty care", 
        japanese: "美容サービスをお選びいただきありがとうございます。プロで安全な美容ケアを提供いたします" 
      },
    ]
  },
  
  // 评论回复生成工具
  'comment-reply-generation': {
    content: [
      { 
        chinese: "感谢您的认可！我们会继续提升技术，为每位客户带来更美的体验", 
        english: "Thank you for your recognition! We will continue to improve our skills to bring more beautiful experiences to every customer", 
        japanese: "ご評価いただきありがとうございます！技術を向上させ続け、お客様一人ひとりにより美しい体験を提供いたします" 
      },
    ]
  }
};
