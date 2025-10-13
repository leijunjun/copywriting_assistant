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
      { 
        chinese: "资深住家保姆，拥有8年住家服务经验，擅长老人照护和慢性病护理，帮助空巢老人安享晚年", 
        english: "Senior live-in maid with 8 years of residential service experience, specializing in elderly care and chronic disease nursing, helping empty nesters enjoy their golden years", 
        japanese: "ベテラン住み込みメイド、8年の住み込みサービス経験、高齢者ケアと慢性疾患看護に特化、空の巣症候群の高齢者に安らかな老後を提供" 
      },
      { 
        chinese: "专业整理收纳师，持有国际整理师认证，擅长空间规划和物品分类，帮助客户打造极简生活", 
        english: "Professional organizing consultant with international organizing certification, specializing in space planning and item categorization, helping clients create minimalist living", 
        japanese: "プロの整理収納アドバイザー、国際整理士認証保有、空間計画と物品分類に特化、お客様にミニマルライフを提供" 
      },
      { 
        chinese: "资深钟点工，熟悉各类家庭清洁需求，擅长快速高效清洁，为忙碌上班族提供贴心服务", 
        english: "Senior hourly worker familiar with various household cleaning needs, specializing in quick and efficient cleaning, providing caring service for busy working professionals", 
        japanese: "ベテラン時間制労働者、様々な家庭清掃ニーズに精通、迅速で効率的な清掃に特化、忙しい働く人々に心のこもったサービスを提供" 
      },
      { 
        chinese: "专业月嫂，拥有10年母婴护理经验，精通产后恢复和新生儿护理，帮助新手妈妈顺利度过产褥期", 
        english: "Professional maternity matron with 10 years of maternal and infant care experience, proficient in postpartum recovery and newborn care, helping new mothers smoothly through the puerperium", 
        japanese: "プロ産後ケア、10年の母子ケア経験、産後回復と新生児ケアに精通、新米ママが産褥期をスムーズに過ごせるようサポート" 
      },
      { 
        chinese: "家政服务中介，拥有5年行业经验，熟悉各类家政服务需求，为雇主和家政人员搭建专业匹配平台", 
        english: "Housekeeping service agency with 5 years of industry experience, familiar with various housekeeping service needs, building professional matching platform for employers and domestic workers", 
        japanese: "家事代行サービス仲介、5年の業界経験、様々な家事代行サービスニーズに精通、雇用者と家政婦のプロマッチングプラットフォームを構築" 
      },
      { 
        chinese: "专业保洁团队负责人，管理20+保洁员，擅长大型清洁项目和特殊环境清洁，服务过医院、学校等机构", 
        english: "Professional cleaning team leader managing 20+ cleaners, specializing in large-scale cleaning projects and special environment cleaning, served hospitals, schools and other institutions", 
        japanese: "プロ清掃チームリーダー、20名以上の清掃員を管理、大規模清掃プロジェクトと特殊環境清掃に特化、病院、学校などの機関にサービス提供" 
      },
      { 
        chinese: "智能家居清洁专家，熟悉各种智能家电操作，擅长科技化清洁方案，为现代家庭提供高效清洁服务", 
        english: "Smart home cleaning expert familiar with various smart appliance operations, specializing in technology-based cleaning solutions, providing efficient cleaning services for modern families", 
        japanese: "スマートホーム清掃専門家、様々なスマート家電操作に精通、テクノロジーベースの清掃ソリューションに特化、現代家庭に効率的な清掃サービスを提供" 
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
      { 
        chinese: "解决空巢老人照护难题，推广专业老人护理服务，让子女安心工作", 
        english: "Solve elderly care challenges for empty nesters, promote professional elderly care services, giving children peace of mind to work", 
        japanese: "空の巣症候群の高齢者ケア課題を解決、プロの高齢者ケアサービスを推進、子供たちが安心して働けるように" 
      },
      { 
        chinese: "推广整理收纳服务，帮助现代人摆脱物品焦虑，打造极简生活方式", 
        english: "Promote organizing and decluttering services, help modern people overcome material anxiety, create minimalist lifestyle", 
        japanese: "整理収納サービスの推進、現代人の物品不安を解消、ミニマルライフスタイルを創造" 
      },
      { 
        chinese: "为忙碌上班族提供时间管理解决方案，通过专业家政服务释放个人时间", 
        english: "Provide time management solutions for busy working professionals, free up personal time through professional housekeeping services", 
        japanese: "忙しい働く人々に時間管理ソリューションを提供、プロ家事代行サービスで個人時間を解放" 
      },
      { 
        chinese: "分享科学育儿知识，帮助新手父母建立正确的育儿观念，减少育儿焦虑", 
        english: "Share scientific parenting knowledge, help new parents establish correct parenting concepts, reduce parenting anxiety", 
        japanese: "科学的な育児知識を共有、新米両親に正しい育児概念を構築、育児不安を軽減" 
      },
      { 
        chinese: "推广产后康复服务，关注新妈妈身心健康，帮助她们快速恢复自信", 
        english: "Promote postpartum recovery services, focus on new mothers' physical and mental health, help them quickly regain confidence", 
        japanese: "産後回復サービスの推進、新米ママの心身の健康に注目、自信を素早く取り戻すようサポート" 
      },
      { 
        chinese: "展示专业清洁技术，分享环保清洁方法，推广绿色家政理念", 
        english: "Showcase professional cleaning techniques, share eco-friendly cleaning methods, promote green housekeeping concepts", 
        japanese: "プロ清掃技術を展示、エコフレンドリーな清掃方法を共有、グリーン家事代行理念を推進" 
      },
      { 
        chinese: "解决家庭矛盾，通过专业服务减少家务负担，促进家庭和谐", 
        english: "Resolve family conflicts, reduce household burden through professional services, promote family harmony", 
        japanese: "家庭の矛盾を解決、プロサービスで家事負担を軽減、家庭の調和を促進" 
      },
      { 
        chinese: "推广智能家居清洁，展示科技化家政服务，吸引追求效率的年轻客户", 
        english: "Promote smart home cleaning, showcase technology-based housekeeping services, attract efficiency-seeking young customers", 
        japanese: "スマートホーム清掃を推進、テクノロジーベースの家事代行サービスを展示、効率を求める若い顧客を誘引" 
      },
      { 
        chinese: "分享家政行业职业发展机会，吸引更多人加入家政服务行业", 
        english: "Share career development opportunities in housekeeping industry, attract more people to join the housekeeping service industry", 
        japanese: "家事代行業界のキャリア発展機会を共有、より多くの人に家事代行サービス業界への参加を促す" 
      },
      { 
        chinese: "推广家政服务标准化，建立行业信任体系，提升整体服务质量", 
        english: "Promote housekeeping service standardization, establish industry trust system, improve overall service quality", 
        japanese: "家事代行サービスの標準化を推進、業界信頼システムを構築、全体的なサービス品質を向上" 
      },
      { 
        chinese: "关注家政人员权益，推广职业尊严，改变社会对家政行业的偏见", 
        english: "Focus on domestic workers' rights, promote professional dignity, change social prejudice against housekeeping industry", 
        japanese: "家政婦の権益に注目、職業的尊厳を推進、家事代行業界への社会偏見を変える" 
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
  
  // 抖音短视频脚本工具
  'TikTok-post-generation': {
    promotionGoal: [
      { chinese: "获客引流", english: "Attract customers and generate leads", japanese: "顧客を獲得し集客する" },
      { chinese: "建立专业信任", english: "Establish professional trust", japanese: "専門的な信頼を築く" },
      { chinese: "打造人设", english: "Build personal brand", japanese: "パーソナルブランドを構築する" },
      { chinese: "激发客户需求", english: "Stimulate customer demand", japanese: "顧客のニーズを喚起する" },
      { chinese: "提升服务溢价", english: "Enhance service premium", japanese: "サービスの付加価値を高める" },
      { chinese: "辅助招聘", english: "Assist in recruitment", japanese: "採用をサポートする" },
    ],
    customerGroup: [
      { chinese: "双职工家庭", english: "Dual-income families", japanese: "共働き家族" },
      { chinese: "新手父母", english: "New parents", japanese: "新米両親" },
      { chinese: "空巢老人", english: "Empty nesters", japanese: "空の巣症候群の高齢者" },
      { chinese: "忙碌白领", english: "Busy white-collar workers", japanese: "忙しいホワイトカラー" },
      { chinese: "产后妈妈", english: "Postpartum mothers", japanese: "産後ママ" },
      { chinese: "家有老人", english: "Families with elderly", japanese: "高齢者がいる家族" },
      { chinese: "职场女性", english: "Working women", japanese: "働く女性" },
      { chinese: "年轻夫妻", english: "Young couples", japanese: "若い夫婦" },
      { chinese: "单亲家庭", english: "Single-parent families", japanese: "シングルマザー・ファーザー家族" },
      { chinese: "多子女家庭", english: "Large families", japanese: "多子家族" },
      { chinese: "高收入家庭", english: "High-income families", japanese: "高収入家族" },
      { chinese: "中产家庭", english: "Middle-class families", japanese: "中産階級家族" },
    ],
    productHighlights: [
      { chinese: "专业认证", english: "Professional certification", japanese: "プロフェッショナル認証" },
      { chinese: "多年经验", english: "Years of experience", japanese: "豊富な経験" },
      { chinese: "客户好评", english: "Customer praise", japanese: "お客様の高評価" },
      { chinese: "价格实惠", english: "Affordable prices", japanese: "手頃な価格" },
      { chinese: "服务贴心", english: "Thoughtful service", japanese: "心のこもったサービス" },
      { chinese: "24小时服务", english: "24-hour service", japanese: "24時間サービス" },
      { chinese: "专业培训", english: "Professional training", japanese: "プロフェッショナル研修" },
      { chinese: "保险保障", english: "Insurance coverage", japanese: "保険保障" },
      { chinese: "背景调查", english: "Background checks", japanese: "身元調査" },
      { chinese: "定期回访", english: "Regular follow-up", japanese: "定期フォローアップ" },
      { chinese: "灵活时间", english: "Flexible scheduling", japanese: "柔軟なスケジュール" },
      { chinese: "口碑推荐", english: "Word-of-mouth recommendation", japanese: "口コミ推薦" },
    ],
    restrictions: [
      { chinese: "不使用'最好'、'第一'等绝对化用语", english: "Avoid absolute terms like 'best' or 'first'", japanese: "'最高''第一'などの絶対的表現は使用しない" },
      { chinese: "不夸大服务效果", english: "Don't exaggerate service effects", japanese: "サービス効果を誇大表現しない" },
      { chinese: "不承诺100%满意", english: "Don't promise 100% satisfaction", japanese: "100%満足を約束しない" },
      { chinese: "不贬低竞争对手", english: "Don't disparage competitors", japanese: "競合他社を貶めない" },
      { chinese: "不夸大个人能力", english: "Don't exaggerate personal abilities", japanese: "個人能力を誇大表現しない" },
      { chinese: "不使用'顶级'、'极品'等词汇", english: "Avoid terms like 'top-tier' or 'premium'", japanese: "'最高級''極品'などの用語は使用しない" },
      { chinese: "不承诺具体时间效果", english: "Don't promise specific time effects", japanese: "具体的な時間効果を約束しない" },
      { chinese: "不使用'唯一'、'独家'等排他性词汇", english: "Don't use exclusive terms like 'only' or 'exclusive'", japanese: "'唯一''独占'などの排他性用語は使用しない" },
      { chinese: "不夸大服务范围", english: "Don't exaggerate service scope", japanese: "サービス範囲を誇大表現しない" },
      { chinese: "不使用'完美'、'无缺'等绝对词汇", english: "Don't use absolute terms like 'perfect' or 'flawless'", japanese: "'完璧''無欠'などの絶対的用語は使用しない" },
      { chinese: "不承诺具体数据效果", english: "Don't promise specific data results", japanese: "具体的なデータ効果を約束しない" },
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
