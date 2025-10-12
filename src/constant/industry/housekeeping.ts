/**
 * Housekeeping Industry Presets
 * 
 * This file contains presets specifically for housekeeping industry users.
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

export const housekeepingPresets: IndustryPresets = {
  // 小红书帖子生成工具
  'xiaohongshu-post-generation': {
    role: [
      { chinese: "中介公司", english: "Agency", japanese: "仲介会社" },
      { chinese: "行业协会", english: "Industry Association", japanese: "業界団体" },
      { chinese: "月嫂", english: "Maternity Matron", japanese: "産後ケア" },
      { chinese: "育儿嫂", english: "Nanny", japanese: "ベビーシッター" },
      { chinese: "保洁员", english: "Cleaner", japanese: "清掃員" },
      { chinese: "钟点工", english: "Hourly Worker", japanese: "時間制労働者" },
      { chinese: "住家保姆", english: "Live-in Maid", japanese: "住み込みメイド" },
    ],
    background: [
      { 
        chinese: "提供专业家庭保洁服务，擅长深度清洁和整理收纳，服务过200+家庭", 
        english: "Providing professional housekeeping services, specializing in deep cleaning and organization, served 200+ families", 
        japanese: "プロの家事代行サービスを提供、深層清掃と整理収納に特化、200世帯以上にサービス提供" 
      },
      { 
        chinese: "从事母婴护理工作5年，擅长新生儿照护和产妇康复指导，持有专业证书", 
        english: "5 years of maternal and infant care experience, specializing in newborn care and postpartum recovery guidance, with professional certificates", 
        japanese: "母子ケア5年の経験、新生児ケアと産後回復指導に特化、専門資格保有" 
      },
      { 
        chinese: "专业育儿嫂，有丰富的婴幼儿照护经验，擅长科学喂养和早期教育", 
        english: "Professional nanny with extensive experience in infant and toddler care, specializing in scientific feeding and early education", 
        japanese: "プロのベビーシッター、乳幼児ケアの豊富な経験、科学的な育児と早期教育に特化" 
      },
    ],
    purpose: [
      { 
        chinese: "吸引本地客户预约家政服务，展示专业能力和服务案例", 
        english: "Attract local customers to book housekeeping services, showcase professional skills and service cases", 
        japanese: "地域の顧客に家事代行サービスの予約を促し、専門能力とサービス事例を紹介" 
      },
      { 
        chinese: "建立客户信任，通过真实案例展示服务质量", 
        english: "Build customer trust by showcasing service quality through real cases", 
        japanese: "実際の事例を通じてサービス品質を紹介し、顧客の信頼を構築" 
      },
      { 
        chinese: "推广母婴护理服务，分享专业知识和经验", 
        english: "Promote maternal and infant care services, share professional knowledge and experience", 
        japanese: "母子ケアサービスの普及、専門知識と経験の共有" 
      },
    ]
  },
  
  // 微信朋友圈回复工具
  'wechat-moments-reply': {
    content: [
      { 
        chinese: "客户晒出整洁的家：感谢信任，看到您满意的笑容是我最大的动力！", 
        english: "Customer showing their clean home: Thank you for your trust, seeing your satisfied smile is my greatest motivation!", 
        japanese: "お客様がきれいになった家を投稿：信頼していただきありがとうございます。満足の笑顔を見ることが私の最大の励みです！" 
      },
      { 
        chinese: "看到宝宝健康成长，作为月嫂的我感到无比欣慰", 
        english: "Seeing the baby grow healthy, as a maternity matron I feel incredibly gratified", 
        japanese: "赤ちゃんが健康に成長しているのを見て、産後ケアとして非常に嬉しく思います" 
      },
    ]
  },
  
  // 视频标题生成工具
  'video-title-generator': {
    keywords: [
      { chinese: "家政服务", english: "Housekeeping Service", japanese: "家事代行サービス" },
      { chinese: "清洁技巧", english: "Cleaning Tips", japanese: "清掃のコツ" },
      { chinese: "母婴护理", english: "Maternal and Infant Care", japanese: "母子ケア" },
      { chinese: "育儿经验", english: "Parenting Experience", japanese: "育児経験" },
      { chinese: "家庭保洁", english: "Home Cleaning", japanese: "家庭清掃" },
    ]
  },
  
  // 微博帖子生成工具
  'weibo-post-generation': {
    content: [
      { 
        chinese: "今天帮客户深度清洁了厨房，油烟机焕然一新！专业工具+细心服务=客户满意", 
        english: "Helped customer deep clean kitchen today, range hood looks brand new! Professional tools + careful service = customer satisfaction", 
        japanese: "今日はお客様のキッチンを深層清掃、換気扇が新品同様に！プロの道具+丁寧なサービス=お客様満足" 
      },
    ]
  },
  
  // 抖音图文生成工具
  'TikTok-post-generation': {
    content: [
      { 
        chinese: "月嫂的一天：从早到晚的专业照护，让新手妈妈安心坐月子", 
        english: "A day in the life of a maternity matron: Professional care from morning to night, giving new mothers peace of mind during confinement", 
        japanese: "産後ケアの一日：朝から晩までプロのケアで、新米ママが安心して産褥期を過ごせるように" 
      },
    ]
  },
  
  // 微信图文工具
  'weixin-generation': {
    content: [
      { 
        chinese: "家政服务不只是清洁，更是为家庭带来温馨和舒适", 
        english: "Housekeeping service is not just cleaning, but bringing warmth and comfort to families", 
        japanese: "家事代行サービスは清掃だけでなく、家庭に温かさと快適さをもたらすもの" 
      },
    ]
  },
  
  // 邮件生成工具
  'email-generation': {
    content: [
      { 
        chinese: "感谢您选择我们的家政服务，我们将为您提供专业、贴心的家庭保洁服务", 
        english: "Thank you for choosing our housekeeping service, we will provide you with professional and caring home cleaning services", 
        japanese: "家事代行サービスをお選びいただきありがとうございます。プロで心のこもった家庭清掃サービスを提供いたします" 
      },
    ]
  },
  
  // 评论回复生成工具
  'comment-reply-generation': {
    content: [
      { 
        chinese: "感谢您的信任！我们会继续提供优质的家政服务，让您的家更加温馨舒适", 
        english: "Thank you for your trust! We will continue to provide quality housekeeping services to make your home more warm and comfortable", 
        japanese: "信頼していただきありがとうございます！質の高い家事代行サービスを継続し、お客様の家をより温かく快適にいたします" 
      },
    ]
  }
};
