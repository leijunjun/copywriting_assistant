/**
 * Lifestyle Beauty Industry Presets
 * 
 * This file contains presets specifically for lifestyle beauty industry users.
 * Focus on basic skincare, facial treatments, anti-aging, hydration, and body care services.
 * Distinguished from medical beauty with non-invasive, cosmetic-focused treatments.
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

export const lifestyleBeautyPresets: IndustryPresets = {
  // 小红书帖子生成工具
  'xiaohongshu-post-generation': {
    role: [
      { chinese: "皮肤管理师", english: "Skin Management Specialist", japanese: "スキン管理専門家" },
      { chinese: "护理技师", english: "Beauty Care Technician", japanese: "美容ケア技術者" },
      { chinese: "美容顾问", english: "Beauty Consultant", japanese: "美容コンサルタント" },
      { chinese: "店长", english: "Store Manager", japanese: "店長" },
      { chinese: "前台接待", english: "Receptionist", japanese: "受付" },
      { chinese: "美容导师", english: "Beauty Mentor", japanese: "美容メンター" },
    ],
    background: [
      { 
        chinese: "资深皮肤管理师，拥有8年专业护肤经验，精通各种肌肤问题诊断和护理方案制定，帮助数千位客户重获健康肌肤", 
        english: "Senior skin management specialist with 8 years of professional skincare experience, expert in various skin problem diagnosis and care plan development, helping thousands of clients regain healthy skin", 
        japanese: "ベテランスキン管理専門家、8年のプロスキンケア経験、様々な肌問題診断とケアプラン開発に精通、数千人のお客様に健康的な肌を取り戻していただきました" 
      },
      { 
        chinese: "专业护理技师，熟练掌握各种美容仪器操作和手法技巧，擅长面部护理、身体护理、抗衰老项目，为客户提供舒适安全的美容体验", 
        english: "Professional beauty care technician, proficient in various beauty device operations and technique skills, expert in facial care, body care, and anti-aging treatments, providing comfortable and safe beauty experiences for clients", 
        japanese: "プロ美容ケア技術者、様々な美容機器操作と技術スキルに精通、顔ケア、ボディケア、アンチエイジング治療に特化、お客様に快適で安全な美容体験を提供" 
      },
      { 
        chinese: "资深美容顾问，深谙护肤之道，擅长为不同肤质客户制定个性化护肤方案，通过专业建议帮助客户建立正确的护肤习惯", 
        english: "Senior beauty consultant, deeply understanding skincare principles, expert in creating personalized skincare plans for different skin types, helping clients establish correct skincare habits through professional advice", 
        japanese: "ベテラン美容コンサルタント、スキンケアの原理を深く理解、異なる肌質の顧客に個別化されたスキンケアプランを作成、プロのアドバイスで正しいスキンケア習慣をサポート" 
      },
      { 
        chinese: "美容院店长，拥有丰富的团队管理经验，深谙生活美容行业发展趋势，致力于为客户提供高品质的美容服务和舒适的体验环境", 
        english: "Beauty salon manager with rich team management experience, deeply understanding lifestyle beauty industry trends, committed to providing high-quality beauty services and comfortable experience environments for clients", 
        japanese: "美容院店長、豊富なチーム管理経験、生活美容業界トレンドを深く理解、お客様に高品質な美容サービスと快適な体験環境を提供することに専念" 
      },
    ],
    purpose: [
      { 
        chinese: "分享专业护肤知识和日常护理技巧，帮助客户建立正确的护肤观念，让美丽从日常开始", 
        english: "Share professional skincare knowledge and daily care tips, help clients establish correct skincare concepts, making beauty start from daily life", 
        japanese: "プロのスキンケア知識と日常ケアのコツを共有、お客様に正しいスキンケア概念を構築、美しさを日常生活から始めていただきます" 
      },
      { 
        chinese: "展示真实护理效果和客户反馈，通过前后对比证明专业护理的价值和效果，建立客户信任", 
        english: "Showcase real care effects and customer feedback, demonstrate the value and effectiveness of professional care through before/after comparisons, build customer trust", 
        japanese: "実際のケア効果と顧客フィードバックを紹介、ビフォーアフター比較でプロケアの価値と効果を証明、顧客信頼を構築" 
      },
      { 
        chinese: "科普不同肌肤类型的护理要点和注意事项，帮助客户了解自己的肌肤需求，选择适合的护理方案", 
        english: "Educate about care points and precautions for different skin types, help clients understand their skin needs and choose suitable care plans", 
        japanese: "異なる肌タイプのケアポイントと注意事項を科学普及、お客様に自分の肌ニーズを理解してもらい、適切なケアプランを選択していただきます" 
      },
      { 
        chinese: "推广健康美丽的生活方式，倡导内外兼修的美容理念，让客户从内而外散发自然美丽", 
        english: "Promote healthy and beautiful lifestyle, advocate the beauty concept of both internal and external cultivation, help clients radiate natural beauty from within", 
        japanese: "健康的で美しいライフスタイルを推進、内外兼修の美容理念を提唱、お客様に内から外へ自然な美しさを放っていただきます" 
      },
    ]
  },
  
  // 微信朋友圈回复工具
  'wechat-moments-reply': {
    content: [
      { 
        chinese: "看到您的护肤心得分享：太棒了！正确的护肤方法确实能让肌肤越来越好，感谢您的分享", 
        english: "Seeing your skincare experience sharing: Amazing! The correct skincare methods can indeed make skin better and better, thank you for sharing", 
        japanese: "スキンケア体験の共有を見て：素晴らしい！正しいスキンケア方法は確かに肌をより良くできます、共有していただきありがとうございます" 
      },
      { 
        chinese: "客户分享护理后的肌肤状态：看到您肌肤状态这么好，我们团队都很开心！专业护理就是要让客户重获健康美丽", 
        english: "Customer sharing skin condition after care: We're all happy to see your skin in such good condition! Professional care is about helping clients regain healthy beauty", 
        japanese: "お客様のケア後の肌状態を共有：肌状態が良好で私たちチームも嬉しいです！プロケアはお客様に健康的な美しさを取り戻していただくことです" 
      },
      { 
        chinese: "看到您分享的护肤小贴士：非常实用！日常护肤确实需要坚持和耐心，感谢您传播正确的护肤知识", 
        english: "Seeing your skincare tips: Very practical! Daily skincare indeed requires persistence and patience, thank you for spreading correct skincare knowledge", 
        japanese: "スキンケアのコツを共有：非常に実用的！日常スキンケアは確かに継続と忍耐が必要、正しいスキンケア知識の普及ありがとうございます" 
      },
    ]
  },
  
  // 视频标题生成工具
  'video-title-generator': {
    keywords: [
      { chinese: "护肤技巧", english: "Skincare Tips", japanese: "スキンケアのコツ" },
      { chinese: "面部护理", english: "Facial Care", japanese: "顔ケア" },
      { chinese: "抗衰老", english: "Anti-aging", japanese: "アンチエイジング" },
      { chinese: "补水保湿", english: "Hydration & Moisturizing", japanese: "水分補給・保湿" },
      { chinese: "身体护理", english: "Body Care", japanese: "ボディケア" },
      { chinese: "美容院", english: "Beauty Salon", japanese: "美容院" },
      { chinese: "肌肤管理", english: "Skin Management", japanese: "肌管理" },
      { chinese: "生活美容", english: "Lifestyle Beauty", japanese: "生活美容" },
    ]
  },
  
  // 微博帖子生成工具
  'weibo-post-generation': {
    content: [
      { 
        chinese: "今天为一位敏感肌客户完成了温和护理，通过专业手法和适合的产品，帮助她重获健康肌肤", 
        english: "Completed gentle care for a sensitive skin client today, helping her regain healthy skin through professional techniques and suitable products", 
        japanese: "今日は敏感肌のお客様に優しいケアを施しました。プロの技術と適切な製品で健康的な肌を取り戻していただきました" 
      },
      { 
        chinese: "分享护肤小知识：不同季节肌肤需求不同，春季要注重保湿，夏季要防晒，秋季要修复，冬季要滋养", 
        english: "Sharing skincare knowledge: Different seasons have different skin needs, spring focuses on hydration, summer on sun protection, autumn on repair, winter on nourishment", 
        japanese: "スキンケアの知識を共有：季節によって肌ニーズが異なり、春は保湿、夏は日焼け止め、秋は修復、冬は滋養に重点を置きます" 
      },
    ]
  },
  
  // 抖音图文生成工具
  'TikTok-post-generation': {
    content: [
      { 
        chinese: "美容师的一天：从清洁到护理，每一个步骤都关乎客户的美丽", 
        english: "A day in the life of a beautician: From cleansing to care, every step concerns client beauty", 
        japanese: "美容師の一日：クレンジングからケアまで、すべてのステップがお客様の美しさに関わります" 
      },
      { 
        chinese: "护肤小课堂：如何正确选择护肤品？了解自己的肌肤类型是关键", 
        english: "Skincare class: How to correctly choose skincare products? Understanding your skin type is key", 
        japanese: "スキンケア教室：スキンケア製品を正しく選ぶには？自分の肌タイプを理解することが鍵です" 
      },
    ]
  },
  
  // 微信图文工具
  'weixin-generation': {
    content: [
      { 
        chinese: "美丽从日常开始，专业美容师为您打造健康肌肤", 
        english: "Beauty starts from daily life, professional beautician creates healthy skin for you", 
        japanese: "美しさは日常生活から始まる、プロ美容師が健康的な肌を創り出します" 
      },
      { 
        chinese: "生活美容：让美丽成为生活的一部分，从内而外散发自然光彩", 
        english: "Lifestyle beauty: Make beauty part of life, radiate natural brilliance from within", 
        japanese: "生活美容：美しさを生活の一部に、内から外へ自然な輝きを放つ" 
      },
    ]
  },
  
  // 邮件生成工具
  'email-generation': {
    content: [
      { 
        chinese: "感谢您选择我们的美容服务，我们将为您提供专业、安全、舒适的美容护理体验", 
        english: "Thank you for choosing our beauty services, we will provide you with professional, safe, and comfortable beauty care experience", 
        japanese: "美容サービスをお選びいただきありがとうございます。プロで安全で快適な美容ケア体験を提供いたします" 
      },
      { 
        chinese: "美容护理预约确认：您的美丽之旅即将开始，专业团队为您提供贴心服务", 
        english: "Beauty care appointment confirmation: Your beauty journey is about to begin, professional team provides attentive service", 
        japanese: "美容ケア予約確認：美しさの旅が始まります、プロチームが心のこもったサービスを提供します" 
      },
    ]
  },
  
  // 评论回复生成工具
  'comment-reply-generation': {
    content: [
      { 
        chinese: "感谢您的信任！我们会继续提升美容技术，为每位客户提供更专业、更贴心的美容服务", 
        english: "Thank you for your trust! We will continue to improve our beauty techniques to provide more professional and caring beauty services for every client", 
        japanese: "信頼していただきありがとうございます！美容技術を向上させ続け、お客様一人ひとりによりプロで心のこもった美容サービスを提供いたします" 
      },
      { 
        chinese: "看到您肌肤状态这么好，我们团队都很欣慰！专业美容就是要让客户重获健康美丽，散发自信光彩", 
        english: "We're all pleased to see your skin in such good condition! Professional beauty is about helping clients regain healthy beauty and radiate confident brilliance", 
        japanese: "肌状態が良好で私たちチームも安心しています！プロ美容はお客様に健康的な美しさを取り戻し、自信に満ちた輝きを放っていただくことです" 
      },
      { 
        chinese: "美丽需要坚持和耐心，感谢您选择专业美容服务，我们会用最专业的态度为您提供最优质的服务", 
        english: "Beauty requires persistence and patience, thank you for choosing professional beauty services, we will provide the highest quality service with the most professional attitude", 
        japanese: "美しさには継続と忍耐が必要、プロ美容サービスを選択していただきありがとうございます。最もプロな態度で最高品質のサービスを提供いたします" 
      },
    ]
  }
};
