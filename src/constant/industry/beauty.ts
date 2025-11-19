/**
 * Medical Beauty Industry Presets
 * 
 * This file contains presets specifically for medical beauty industry users.
 * Includes role templates, background scenarios, and purpose goals for various tools.
 * Focus on medical aesthetics, cosmetic procedures, and professional medical beauty services.
 */

// 多语言内容接口
export interface MultilingualContent {
  chinese: string;
  english: string;
  japanese: string;
}

// 商品类预设 - 带有 label 和 value 的结构
export interface PresetOption {
  label: MultilingualContent;
  value: string;
}

// 人设预设接口（支持嵌套背景）
export interface PersonaPreset extends MultilingualContent {
  backgrounds?: MultilingualContent[];
}

// 工具预设内容接口
export interface ToolPresets {
  [fieldName: string]: MultilingualContent[] | PresetOption[] | PersonaPreset[];
}

// 行业预设配置接口
export interface IndustryPresets {
  [toolId: string]: ToolPresets;
}

export const beautyPresets: IndustryPresets = {
  // 微信朋友圈回复工具
  'wechat-moments-reply': {
    content: [
      { 
        chinese: "看到您的医美效果分享：太棒了！这就是专业医美技术的魅力，安全变美，效果自然持久", 
        english: "Seeing your medical beauty results: Amazing! This is the charm of professional medical aesthetic technology, safe beauty enhancement with natural and lasting results", 
        japanese: "医療美容効果の投稿を見て：素晴らしい！これがプロの医療美容技術の魅力、安全な美しさ、自然で持続的な効果" 
      },
      { 
        chinese: "客户分享术后恢复过程：感谢您的信任！看到您恢复得这么好，我们团队都很开心，专业安全是我们不变的承诺", 
        english: "Customer sharing post-operative recovery process: Thank you for your trust! We're all happy to see your excellent recovery, professional safety is our unwavering commitment", 
        japanese: "お客様の術後回復過程を共有：信頼していただきありがとうございます！回復が良好で私たちチームも嬉しいです。プロで安全なことが私たちの変わらない約束です" 
      },
      { 
        chinese: "看到您分享的医美科普内容：非常专业！医美需要科学理性对待，感谢您传播正确的医美知识", 
        english: "Seeing your medical beauty science content: Very professional! Medical aesthetics requires scientific and rational approach, thank you for spreading correct medical beauty knowledge", 
        japanese: "医療美容科学普及コンテンツを見て：非常にプロフェッショナル！医療美容は科学的で合理的なアプローチが必要、正しい医療美容知識の普及ありがとうございます" 
      },
    ]
  },
  
  // 视频标题生成工具
  'video-title-generator': {
    keywords: [
      { chinese: "医美科普", english: "Medical Beauty Science", japanese: "医療美容科学" },
      { chinese: "面部年轻化", english: "Facial Rejuvenation", japanese: "顔の若返り" },
      { chinese: "微整形", english: "Micro-plastic Surgery", japanese: "マイクロ整形" },
      { chinese: "皮肤管理", english: "Skin Management", japanese: "肌管理" },
      { chinese: "医美安全", english: "Medical Beauty Safety", japanese: "医療美容安全" },
      { chinese: "术后护理", english: "Post-operative Care", japanese: "術後ケア" },
      { chinese: "抗衰老", english: "Anti-aging", japanese: "アンチエイジング" },
      { chinese: "医美机构", english: "Medical Beauty Clinic", japanese: "医療美容クリニック" },
      { chinese: "玻尿酸注射", english: "Hyaluronic Acid Injection", japanese: "ヒアルロン酸注射" },
      { chinese: "肉毒素", english: "Botulinum Toxin", japanese: "ボツリヌストキシン" },
      { chinese: "激光美肤", english: "Laser Skin Treatment", japanese: "レーザー美肌" },
      { chinese: "热玛吉", english: "Thermage", japanese: "サーモージ" },
      { chinese: "超声刀", english: "Ultrasound Therapy", japanese: "超音波治療" },
      { chinese: "整形手术", english: "Plastic Surgery", japanese: "整形手術" },
      { chinese: "注射美容", english: "Injectable Beauty", japanese: "注射美容" },
      { chinese: "激光治疗", english: "Laser Treatment", japanese: "レーザー治療" },
    ]
  },
  
  // 微博帖子生成工具
  'weibo-post-generation': {
    content: [
      { 
        chinese: "今天完成了一例面部年轻化项目，通过科学合理的医美方案，帮助客户重获青春自信", 
        english: "Completed a facial rejuvenation case today, helping client regain youthful confidence through scientific and rational medical aesthetic approach", 
        japanese: "今日は顔の若返りプロジェクトを完成、科学的で合理的な医療美容アプローチでお客様に若々しい自信を取り戻していただきました" 
      },
      { 
        chinese: "分享医美安全知识：选择正规机构、专业医生、合格产品，安全变美从科学认知开始", 
        english: "Sharing medical beauty safety knowledge: Choose certified institutions, professional doctors, qualified products, safe beauty enhancement starts with scientific understanding", 
        japanese: "医療美容安全知識を共有：正規機関、プロ医師、合格製品を選択、安全な美しさは科学的理解から始まります" 
      },
      { 
        chinese: "玻尿酸注射案例分享：通过精准注射技术，为客户打造自然立体的面部轮廓，效果立竿见影", 
        english: "Hyaluronic acid injection case sharing: Through precise injection techniques, create natural and three-dimensional facial contours for clients with immediate results", 
        japanese: "ヒアルロン酸注射事例共有：精密な注射技術でお客様に自然で立体的な顔の輪郭を創り出し、即座に効果を実現" 
      },
      { 
        chinese: "热玛吉治疗体验：无创紧肤技术，帮助客户实现面部紧致提升，安全有效的美容选择", 
        english: "Thermage treatment experience: Non-invasive skin tightening technology, helping clients achieve facial firming and lifting, a safe and effective beauty choice", 
        japanese: "サーモージ治療体験：非侵襲的肌引き締め技術、お客様に顔の引き締めとリフトアップを実現、安全で効果的な美容選択" 
      },
      { 
        chinese: "激光美肤项目：通过专业激光设备，为客户解决色斑、痘印等肌肤问题，重获光滑肌肤", 
        english: "Laser skin treatment project: Through professional laser equipment, help clients solve skin problems like pigmentation and acne scars, regain smooth skin", 
        japanese: "レーザー美肌プロジェクト：プロのレーザー機器でお客様のシミ、ニキビ跡などの肌問題を解決、滑らかな肌を取り戻す" 
      },
    ]
  },
  
  // 抖音短视频脚本工具
  'TikTok-post-generation': {
    promotionGoal: [
      { chinese: "引流到店", english: "Drive traffic to store", japanese: "店舗への誘導" },
      { chinese: "推广新品", english: "Promote new products", japanese: "新商品のプロモーション" },
      { chinese: "打造人设", english: "Build personal brand", japanese: "個人ブランドの構築" },
      { chinese: "促销活动", english: "Promotional activities", japanese: "プロモーション活動" },
    ],
    customerGroup: [
      { chinese: "25-35岁轻熟女性", english: "25-35 year old young mature women", japanese: "25-35歳の軽熟女性" },
      { chinese: "抗衰需求客户", english: "Anti-aging clients", japanese: "アンチエイジング需要のお客様" },
      { chinese: "微整形咨询者", english: "Micro-plastic surgery consultants", japanese: "マイクロ整形相談者" },
      { chinese: "职场精英女性", english: "Professional elite women", japanese: "職場エリート女性" },
      { chinese: "产后恢复妈妈", english: "Postpartum recovery mothers", japanese: "産後回復ママ" },
      { chinese: "追求完美女性", english: "Perfection-seeking women", japanese: "完璧を求める女性" },
      { chinese: "高收入女性", english: "High-income women", japanese: "高収入女性" },
      { chinese: "时尚达人", english: "Fashion enthusiasts", japanese: "ファッション愛好家" },
      { chinese: "医美新手", english: "Medical beauty beginners", japanese: "医療美容初心者" },
      { chinese: "成熟女性", english: "Mature women", japanese: "成熟女性" },
      { chinese: "学生群体", english: "Student groups", japanese: "学生グループ" },
      { chinese: "中年女性", english: "Middle-aged women", japanese: "中年女性" },
    ],
    productHighlights: [
      { chinese: "正规资质", english: "Official qualifications", japanese: "正規資格" },
      { chinese: "进口设备", english: "Imported equipment", japanese: "輸入機器" },
      { chinese: "专业医师", english: "Professional doctors", japanese: "プロ医師" },
      { chinese: "安全无痛", english: "Safe and painless", japanese: "安全で無痛" },
      { chinese: "国际认证", english: "International certification", japanese: "国際認証" },
      { chinese: "先进技术", english: "Advanced technology", japanese: "先進技術" },
      { chinese: "个性化方案", english: "Personalized plans", japanese: "個別化プラン" },
      { chinese: "术后保障", english: "Post-operative guarantee", japanese: "術後保障" },
      { chinese: "隐私保护", english: "Privacy protection", japanese: "プライバシー保護" },
      { chinese: "效果持久", english: "Long-lasting results", japanese: "持続的な効果" },
      { chinese: "自然效果", english: "Natural results", japanese: "自然な効果" },
      { chinese: "专业团队", english: "Professional team", japanese: "プロフェッショナルチーム" },
    ],
    restrictions: [
      { chinese: "不承诺疗效", english: "Don't promise therapeutic effects", japanese: "治療効果を約束しない" },
      { chinese: "不使用'包治'等词汇", english: "Don't use terms like 'cure all'", japanese: "'万能薬'などの用語は使用しない" },
      { chinese: "不夸大效果", english: "Don't exaggerate effects", japanese: "効果を誇大表現しない" },
      { chinese: "不使用前后对比", english: "Don't use before/after comparisons", japanese: "ビフォーアフター比較は使用しない" },
      { chinese: "不承诺具体时间", english: "Don't promise specific timeframes", japanese: "具体的な時間を約束しない" },
      { chinese: "不使用'永久'等词汇", english: "Don't use terms like 'permanent'", japanese: "'永久'などの用語は使用しない" },
      { chinese: "不贬低其他机构", english: "Don't disparage other institutions", japanese: "他の機関を貶めない" },
      { chinese: "不夸大个人能力", english: "Don't exaggerate personal abilities", japanese: "個人能力を誇大表現しない" },
      { chinese: "不使用'100%'等绝对词汇", english: "Don't use absolute terms like '100%'", japanese: "'100%'などの絶対的用語は使用しない" },
      { chinese: "不承诺具体数据", english: "Don't promise specific data", japanese: "具体的なデータを約束しない" },
      { chinese: "不使用'唯一'等排他性词汇", english: "Don't use exclusive terms like 'only'", japanese: "'唯一'などの排他性用語は使用しない" },
      { chinese: "不夸大技术优势", english: "Don't exaggerate technical advantages", japanese: "技術優位性を誇大表現しない" },
    ]
  },
  
  // 微信图文工具
  'weixin-generation': {
    customerPainPoints: [
      { 
        chinese: "担心手术安全和风险", 
        english: "Worried about surgical safety and risks", 
        japanese: "手術の安全性とリスクが心配" 
      },
      { 
        chinese: "不知道如何选择适合自己的项目", 
        english: "Don't know how to choose the right procedure for themselves", 
        japanese: "自分に合った施術の選び方がわからない" 
      },
      { 
        chinese: "害怕效果不理想或出现副作用", 
        english: "Afraid of unsatisfactory results or side effects", 
        japanese: "効果が期待通りでない、副作用が心配" 
      },
      { 
        chinese: "价格昂贵，怕花冤枉钱", 
        english: "Expensive prices, afraid of wasting money", 
        japanese: "価格が高く、無駄遣いが心配" 
      },
      { 
        chinese: "术后恢复期长，影响工作生活", 
        english: "Long recovery period affects work and life", 
        japanese: "術後の回復期間が長く、仕事や生活に影響" 
      },
      { 
        chinese: "不知道如何选择正规医美机构", 
        english: "Don't know how to choose legitimate medical aesthetic institutions", 
        japanese: "正規の医療美容機関の選び方がわからない" 
      },
      { 
        chinese: "担心医生资质和经验", 
        english: "Worried about doctor qualifications and experience", 
        japanese: "医師の資格と経験が心配" 
      },
      { 
        chinese: "害怕被过度营销和诱导消费", 
        english: "Afraid of being over-marketed and induced to consume", 
        japanese: "過度なマーケティングや消費誘導が心配" 
      },
    ]
  },
  
  // 邮件生成工具
  'email-generation': {
    content: [
      { 
        chinese: "感谢您选择我们的医美服务，我们将为您提供专业、安全、科学的医疗美容解决方案", 
        english: "Thank you for choosing our medical beauty services, we will provide you with professional, safe, and scientific medical aesthetic solutions", 
        japanese: "医療美容サービスをお選びいただきありがとうございます。プロで安全で科学的な医療美容ソリューションを提供いたします" 
      },
      { 
        chinese: "医美咨询预约确认：您的安全变美之旅即将开始，专业团队全程护航", 
        english: "Medical beauty consultation appointment confirmation: Your safe beauty enhancement journey is about to begin, professional team provides full support", 
        japanese: "医療美容相談予約確認：安全な美しさの旅が始まります、プロチームが全行程をサポートします" 
      },
      { 
        chinese: "玻尿酸注射预约确认：专业医生将为您进行详细面诊，制定个性化注射方案", 
        english: "Hyaluronic acid injection appointment confirmation: Professional doctor will conduct detailed consultation and create personalized injection plan for you", 
        japanese: "ヒアルロン酸注射予約確認：プロ医師が詳細な面談を行い、個別化された注射プランを作成します" 
      },
      { 
        chinese: "热玛吉治疗预约提醒：无创紧肤技术，让您重获年轻肌肤，请提前做好皮肤准备", 
        english: "Thermage treatment appointment reminder: Non-invasive skin tightening technology to help you regain youthful skin, please prepare your skin in advance", 
        japanese: "サーモージ治療予約リマインダー：非侵襲的肌引き締め技術で若々しい肌を取り戻す、事前に肌の準備をお願いします" 
      },
      { 
        chinese: "激光美肤治疗确认：专业激光设备，精准解决肌肤问题，术后护理指导已准备就绪", 
        english: "Laser skin treatment confirmation: Professional laser equipment for precise skin problem solving, post-treatment care guidance ready", 
        japanese: "レーザー美肌治療確認：プロレーザー機器で肌問題を精密解決、術後ケア指導準備完了" 
      },
    ]
  },
  
  // 评论回复生成工具
  'comment-reply-generation': {
    content: [
      { 
        chinese: "感谢您的信任！我们会继续提升医美技术，为每位客户提供更安全、更有效的变美方案", 
        english: "Thank you for your trust! We will continue to improve our medical aesthetic techniques to provide safer and more effective beauty enhancement solutions for every client", 
        japanese: "信頼していただきありがとうございます！医療美容技術を向上させ続け、お客様一人ひとりにより安全で効果的な美しさソリューションを提供いたします" 
      },
      { 
        chinese: "医美安全是我们的首要责任，感谢您选择专业机构，我们会用最严谨的态度对待每一个项目", 
        english: "Medical beauty safety is our top priority, thank you for choosing a professional institution, we will treat every procedure with the most rigorous attitude", 
        japanese: "医療美容安全が私たちの最優先事項、プロ機関を選択していただきありがとうございます。すべてのプロジェクトを最も厳格な態度で取り組みます" 
      },
      { 
        chinese: "看到您恢复得这么好，我们团队都很欣慰！专业医美就是要让客户安全变美，效果自然持久", 
        english: "We're all pleased to see your excellent recovery! Professional medical aesthetics is about helping clients safely enhance beauty with natural and lasting results", 
        japanese: "回復が良好で私たちチームも安心しています！プロの医療美容はお客様に安全に美しくなっていただき、自然で持続的な効果を提供することです" 
      },
      { 
        chinese: "玻尿酸注射效果确实立竿见影！我们使用进口优质产品，配合专业注射技术，确保安全有效", 
        english: "Hyaluronic acid injection results are indeed immediate! We use imported high-quality products with professional injection techniques to ensure safety and effectiveness", 
        japanese: "ヒアルロン酸注射の効果は確かに即座に現れます！輸入高品質製品とプロ注射技術で安全性と有効性を確保" 
      },
      { 
        chinese: "热玛吉治疗无创无痛，效果持久！我们的专业医生会根据您的肌肤状况制定个性化方案", 
        english: "Thermage treatment is non-invasive and painless with lasting results! Our professional doctors will create personalized plans based on your skin condition", 
        japanese: "サーモージ治療は非侵襲で無痛、持続的な効果！プロ医師がお客様の肌状態に基づいて個別化プランを作成" 
      },
      { 
        chinese: "激光美肤技术越来越成熟，我们采用最新设备，确保治疗效果的同时保证安全性", 
        english: "Laser skin treatment technology is becoming more mature, we use the latest equipment to ensure treatment effectiveness while guaranteeing safety", 
        japanese: "レーザー美肌技術はますます成熟、最新機器を使用して治療効果を確保しながら安全性を保証" 
      },
    ]
  },

  // 小红书热帖生成工具
  'xiaohongshu-post-generation-product': {
    persona: [
      {
        chinese: "专业医美医生",
        english: "Professional Medical Aesthetic Doctor",
        japanese: "プロの医療美容医師型",
        backgrounds: [
          {
            chinese: "从事医疗美容工作10年，拥有医学博士学位和执业医师资格，擅长面部年轻化、微整形注射和激光美肤，累计完成5000+例医美项目，以专业技术和安全理念获得客户信赖",
            english: "10 years of experience in medical aesthetics, holds medical doctorate and practicing physician qualification, expert in facial rejuvenation, micro-plastic injections and laser skin treatments, completed 5000+ medical aesthetic procedures, trusted by clients for professional skills and safety principles",
            japanese: "医療美容10年の経験、医学博士号と医師免許保有、顔の若返り、マイクロ整形注射、レーザー美肌に精通、5000件以上の医療美容プロジェクトを完了、プロの技術と安全理念でお客様から信頼"
          },
          {
            chinese: "资深医美医生，拥有15年临床经验，精通各类医美项目的诊断和治疗，擅长为不同肤质和需求的客户制定个性化方案，注重术前评估和术后跟踪，确保安全有效",
            english: "Senior medical aesthetic doctor with 15 years of clinical experience, proficient in diagnosis and treatment of various medical aesthetic procedures, expert in creating personalized plans for clients with different skin types and needs, emphasizes pre-operative assessment and post-operative follow-up to ensure safety and effectiveness",
            japanese: "ベテラン医療美容医師、15年の臨床経験、様々な医療美容プロジェクトの診断と治療に精通、異なる肌質とニーズのお客様に個別化プランを作成、術前評価と術後フォローを重視、安全性と有効性を確保"
          },
          {
            chinese: "专业医美医生，持有国际医美认证资质，拥有8年经验，专精热玛吉、超声刀等抗衰项目，熟悉最新医美技术和设备，注重医美安全科普，帮助客户理性选择医美项目",
            english: "Professional medical aesthetic doctor with international medical aesthetic certification, 8 years of experience, specializing in anti-aging procedures like Thermage and ultrasound therapy, familiar with latest medical aesthetic technologies and equipment, emphasizes medical beauty safety education, helping clients make rational choices",
            japanese: "プロの医療美容医師、国際医療美容認証保有、8年の経験、サーモージ、超音波治療などのアンチエイジングプロジェクトに特化、最新の医療美容技術と機器に精通、医療美容安全の普及を重視、お客様が合理的な選択ができるようサポート"
          }
        ]
      },
      {
        chinese: "资深医美咨询师",
        english: "Senior Medical Aesthetic Consultant",
        japanese: "ベテラン医療美容コンサルタント型",
        backgrounds: [
          {
            chinese: "从事医美咨询工作6年，拥有丰富的客户沟通经验，擅长分析客户需求并推荐合适的医美项目，熟悉各类医美项目的效果和注意事项，帮助客户制定个性化变美方案",
            english: "6 years of experience in medical aesthetic consultation, rich customer communication experience, expert in analyzing client needs and recommending suitable medical aesthetic procedures, familiar with effects and precautions of various procedures, helping clients create personalized beauty enhancement plans",
            japanese: "医療美容相談6年の経験、豊富な顧客コミュニケーション経験、お客様のニーズを分析し適切な医療美容プロジェクトを推薦、様々な医療美容プロジェクトの効果と注意事項に精通、お客様に個別化された美しさプランを作成"
          },
          {
            chinese: "专业医美咨询师，拥有8年咨询经验，精通面部美学设计和医美方案规划，擅长为客户解答医美疑问，消除顾虑，建立信任关系，累计服务2000+位客户，获得高度认可",
            english: "Professional medical aesthetic consultant with 8 years of consultation experience, proficient in facial aesthetic design and medical aesthetic plan planning, expert in answering client questions and concerns, building trust relationships, served 2000+ clients with high recognition",
            japanese: "プロの医療美容コンサルタント、8年の相談経験、顔の美学設計と医療美容プラン計画に精通、お客様の疑問と懸念に答える、信頼関係を構築、2000人以上のお客様にサービス提供、高い評価"
          },
          {
            chinese: "资深医美咨询师，持有医美咨询师认证，拥有10年经验，熟悉各类医美项目的适应症和禁忌症，擅长术前沟通和术后回访，注重客户体验，帮助客户安全变美",
            english: "Senior medical aesthetic consultant with medical aesthetic consultant certification, 10 years of experience, familiar with indications and contraindications of various medical aesthetic procedures, expert in pre-operative communication and post-operative follow-up, emphasizes customer experience, helping clients safely enhance beauty",
            japanese: "ベテラン医療美容コンサルタント、医療美容コンサルタント認証保有、10年の経験、様々な医療美容プロジェクトの適応症と禁忌症に精通、術前コミュニケーションと術後フォローアップに特化、顧客体験を重視、お客様が安全に美しくなれるようサポート"
          }
        ]
      },
      {
        chinese: "医美护士",
        english: "Medical Aesthetic Nurse",
        japanese: "医療美容看護師型",
        backgrounds: [
          {
            chinese: "从事医美护理工作5年，拥有护士执业资格，擅长协助医生进行医美治疗，提供专业的术前准备和术后护理，熟悉各类医美项目的护理要点，确保客户安全舒适",
            english: "5 years of experience in medical aesthetic nursing, holds nursing practice qualification, expert in assisting doctors with medical aesthetic treatments, providing professional pre-operative preparation and post-operative care, familiar with nursing essentials of various procedures, ensuring client safety and comfort",
            japanese: "医療美容看護5年の経験、看護師免許保有、医師の医療美容治療をサポート、プロの術前準備と術後ケアを提供、様々な医療美容プロジェクトの看護の要点に精通、お客様の安全と快適さを確保"
          },
          {
            chinese: "专业医美护士，拥有7年护理经验，精通注射类项目的辅助操作和术后观察，擅长为客户提供详细的术后护理指导，包括敷料更换、注意事项等，帮助客户顺利恢复",
            english: "Professional medical aesthetic nurse with 7 years of nursing experience, proficient in assisting with injection procedures and post-operative observation, expert in providing detailed post-operative care guidance including dressing changes and precautions, helping clients recover smoothly",
            japanese: "プロの医療美容看護師、7年の看護経験、注射プロジェクトの補助操作と術後観察に精通、お客様に詳細な術後ケア指導を提供、包帯交換や注意事項など、お客様がスムーズに回復できるようサポート"
          },
          {
            chinese: "资深医美护士，持有高级护理证书，拥有10年经验，熟悉激光、射频等设备的操作和护理，擅长处理术后常见问题和并发症，注重客户沟通，提供贴心专业的护理服务",
            english: "Senior medical aesthetic nurse with advanced nursing certificate, 10 years of experience, familiar with operation and care of laser and radiofrequency equipment, expert in handling common post-operative issues and complications, emphasizes client communication, providing caring and professional nursing services",
            japanese: "ベテラン医療美容看護師、上級看護資格保有、10年の経験、レーザー、ラジオ波などの機器の操作とケアに精通、術後の一般的な問題と合併症の処理に特化、顧客コミュニケーションを重視、思いやりとプロの看護サービスを提供"
          }
        ]
      },
      {
        chinese: "皮肤管理师",
        english: "Skin Management Specialist",
        japanese: "肌管理スペシャリスト型",
        backgrounds: [
          {
            chinese: "从事皮肤管理工作4年，拥有美容师资格证书，擅长日常护肤指导和皮肤问题分析，熟悉各类护肤产品和仪器使用，帮助客户改善肌肤状态，预防皮肤问题",
            english: "4 years of experience in skin management, holds beautician qualification certificate, expert in daily skincare guidance and skin problem analysis, familiar with various skincare products and equipment use, helping clients improve skin condition and prevent skin problems",
            japanese: "肌管理4年の経験、美容師資格保有、日常スキンケア指導と肌問題分析に精通、様々なスキンケア製品と機器の使用に精通、お客様の肌状態を改善し肌問題を予防"
          },
          {
            chinese: "专业皮肤管理师，拥有6年经验，精通医美后皮肤护理和日常保养，擅长根据客户肤质制定个性化护肤方案，熟悉敏感肌、痘痘肌等特殊肤质的护理方法",
            english: "Professional skin management specialist with 6 years of experience, proficient in post-medical aesthetic skin care and daily maintenance, expert in creating personalized skincare plans based on client skin types, familiar with care methods for special skin types like sensitive and acne-prone skin",
            japanese: "プロの肌管理スペシャリスト、6年の経験、医療美容後のスキンケアと日常メンテナンスに精通、お客様の肌質に基づいて個別化されたスキンケアプランを作成、敏感肌、ニキビ肌などの特殊な肌質のケア方法に精通"
          },
          {
            chinese: "资深皮肤管理师，持有高级美容师证书，拥有8年经验，熟悉各类皮肤问题的成因和解决方案，擅长使用专业仪器进行皮肤检测和分析，为客户提供科学的护肤建议",
            english: "Senior skin management specialist with advanced beautician certificate, 8 years of experience, familiar with causes and solutions of various skin problems, expert in using professional equipment for skin testing and analysis, providing scientific skincare advice for clients",
            japanese: "ベテラン肌管理スペシャリスト、上級美容師資格保有、8年の経験、様々な肌問題の原因と解決策に精通、プロ機器を使用した肌検査と分析に特化、お客様に科学的なスキンケアアドバイスを提供"
          }
        ]
      },
      {
        chinese: "医美机构运营",
        english: "Medical Aesthetic Institution Operator",
        japanese: "医療美容機関運営型",
        backgrounds: [
          {
            chinese: "从事医美机构运营工作5年，拥有丰富的客户服务和管理经验，熟悉医美行业规范和运营流程，擅长客户关系维护和满意度提升，确保机构服务质量",
            english: "5 years of experience in medical aesthetic institution operations, rich customer service and management experience, familiar with medical aesthetic industry standards and operational processes, expert in customer relationship maintenance and satisfaction improvement, ensuring institutional service quality",
            japanese: "医療美容機関運営5年の経験、豊富な顧客サービスと管理経験、医療美容業界の規範と運営プロセスに精通、顧客関係の維持と満足度向上に特化、機関のサービス品質を確保"
          },
          {
            chinese: "专业医美机构运营，拥有7年经验，精通医美项目的市场推广和客户引流，熟悉各类营销活动和客户维护策略，注重品牌建设和口碑管理，帮助机构提升竞争力",
            english: "Professional medical aesthetic institution operator with 7 years of experience, proficient in market promotion and customer acquisition for medical aesthetic procedures, familiar with various marketing activities and customer retention strategies, emphasizes brand building and reputation management, helping institutions improve competitiveness",
            japanese: "プロの医療美容機関運営、7年の経験、医療美容プロジェクトの市場プロモーションと顧客獲得に精通、様々なマーケティング活動と顧客維持戦略に精通、ブランド構築と評判管理を重視、機関の競争力向上をサポート"
          },
          {
            chinese: "资深医美机构运营，拥有10年行业经验，熟悉医美机构的合规经营和风险管控，擅长团队管理和服务标准化，注重客户体验和满意度，帮助机构建立良好的市场口碑",
            english: "Senior medical aesthetic institution operator with 10 years of industry experience, familiar with compliant operations and risk control of medical aesthetic institutions, expert in team management and service standardization, emphasizes customer experience and satisfaction, helping institutions build good market reputation",
            japanese: "ベテラン医療美容機関運営、10年の業界経験、医療美容機関のコンプライアンス経営とリスク管理に精通、チーム管理とサービス標準化に特化、顧客体験と満足度を重視、機関が良好な市場評判を構築できるようサポート"
          }
        ]
      }
    ],
    discussionSubject: [
      {
        label: { chinese: "面部年轻化项目", english: "Facial Rejuvenation Procedures", japanese: "顔の若返りプロジェクト" },
        value: `#面部年轻化项目
##项目类型
###热玛吉
通过射频技术刺激胶原蛋白再生，实现面部紧致提升，适合25-55岁有抗衰需求的客户
###超声刀
利用超声波聚焦技术，深层提拉紧致，改善面部轮廓，适合30岁以上皮肤松弛的客户
###线雕提升
通过可吸收线材植入，实现面部提升和轮廓重塑，适合30-50岁有下垂问题的客户
###射频紧肤
通过射频能量促进胶原蛋白收缩和再生，改善皮肤松弛，适合各年龄段有紧致需求的客户
##项目优势
###非手术
大部分项目无需开刀，创伤小，恢复快，安全性高
###效果自然
渐进式改善，效果自然持久，不会出现突兀的变化
###个性化方案
根据客户年龄、肤质和需求，制定个性化的年轻化方案
###专业保障
由专业医生操作，使用正规设备和产品，确保安全有效
##适用人群
###初老症状
25-35岁出现细纹、皮肤松弛等初老症状的客户
###明显衰老
35岁以上面部明显下垂、皱纹加深的客户
###轮廓改善
希望改善面部轮廓，提升整体年轻度的客户
###预防性抗衰
希望提前预防衰老，保持年轻状态的客户`
      },
      {
        label: { chinese: "微整形注射", english: "Micro-plastic Injections", japanese: "マイクロ整形注射" },
        value: `#微整形注射项目
##项目类型
###玻尿酸注射
填充面部凹陷，改善轮廓，增加面部立体感，适合改善法令纹、苹果肌、下巴等部位
###肉毒素注射
放松肌肉，减少动态皱纹，适合改善鱼尾纹、抬头纹、皱眉纹等
###胶原蛋白注射
补充胶原蛋白，改善肤质，适合改善细纹和皮肤质感
###自体脂肪填充
使用自身脂肪进行填充，效果自然持久，适合大范围填充需求
##项目优势
###微创无痛
注射方式，创伤小，疼痛感轻微，恢复快
###效果立竿见影
注射后即可看到效果，无需等待恢复期
###可逆可调
玻尿酸可溶解，肉毒素会代谢，效果可逆可调
###个性化定制
根据客户面部特点和需求，精准设计注射方案
##适用人群
###轮廓改善
希望改善面部轮廓，增加立体感的客户
###皱纹改善
有动态皱纹或静态皱纹困扰的客户
###面部填充
面部凹陷，希望恢复饱满状态的客户
###微调需求
希望进行微调，不想做手术的客户`
      },
      {
        label: { chinese: "激光美肤", english: "Laser Skin Treatment", japanese: "レーザー美肌" },
        value: `#激光美肤项目
##项目类型
###光子嫩肤
改善色斑、红血丝、毛孔粗大等问题，提亮肤色，适合日常保养
###点阵激光
改善痘印、疤痕、细纹等问题，促进皮肤再生，适合问题性肌肤
###皮秒激光
精准祛斑，改善色素沉着，适合有斑点困扰的客户
###激光脱毛
永久性脱毛，适合有脱毛需求的客户
##项目优势
###精准有效
激光技术精准作用于问题部位，效果明显
###安全可控
专业设备，参数可调，确保安全有效
###恢复期短
大部分项目恢复期短，不影响正常生活
###综合改善
可同时改善多种皮肤问题，综合提升肤质
##适用人群
###色斑问题
有雀斑、晒斑、黄褐斑等色斑问题的客户
###痘印疤痕
有痘印、疤痕困扰的客户
###毛孔粗大
希望改善毛孔粗大、粗糙等问题的客户
###日常保养
希望定期保养，维持良好肤质的客户`
      },
      {
        label: { chinese: "皮肤管理", english: "Skin Management", japanese: "肌管理" },
        value: `#皮肤管理服务
##服务内容
###日常护肤指导
根据客户肤质，提供专业的日常护肤方案和产品推荐
###医美后护理
提供医美项目后的专业护理指导，确保效果和恢复
###问题性肌肤管理
针对痘痘、敏感、色斑等问题，制定专业管理方案
###定期皮肤检测
使用专业仪器定期检测皮肤状态，及时发现问题
##服务优势
###专业指导
由专业皮肤管理师提供科学专业的护肤指导
###个性化方案
根据客户肤质和需求，制定个性化管理方案
###持续跟踪
定期回访，跟踪皮肤状态，调整管理方案
###产品推荐
推荐适合的护肤产品，避免盲目选择
##适用人群
###日常保养
希望日常保养，维持良好肤质的客户
###医美后护理
刚做完医美项目，需要专业护理的客户
###问题性肌肤
有痘痘、敏感、色斑等问题的客户
###护肤新手
对护肤不了解，需要专业指导的客户`
      },
      {
        label: { chinese: "医美安全科普", english: "Medical Beauty Safety Education", japanese: "医療美容安全科学普及" },
        value: `#医美安全科普
##选择正规机构
###资质认证
选择有医疗机构执业许可证的正规医美机构
###医生资质
确认医生持有执业医师资格和相关专业认证
###设备产品
使用正规渠道采购的设备和产品，有相关认证
###环境标准
机构环境符合医疗标准，消毒措施完善
##术前准备
###充分沟通
与医生充分沟通，了解项目效果、风险和注意事项
###身体检查
进行必要的身体检查，确认是否适合进行医美项目
###心理准备
做好心理准备，对效果有合理预期
###时间安排
合理安排时间，确保有足够的恢复期
##安全注意事项
###禁忌症了解
了解项目的禁忌症，确认自己是否适合
###术后护理
严格按照医嘱进行术后护理，避免并发症
###定期复查
定期复查，及时发现问题，确保安全
###理性选择
理性选择医美项目，不盲目追求效果
##风险提示
###效果差异
个体差异导致效果可能不同，需有合理预期
###可能风险
了解可能的副作用和风险，做好心理准备
###恢复期
了解恢复期的时间和注意事项
###长期维护
部分项目需要定期维护，了解长期成本`
      },
      {
        label: { chinese: "术后护理指导", english: "Post-operative Care Guidance", japanese: "術後ケア指導" },
        value: `#术后护理指导
##注射类项目护理
###24小时内
避免触碰注射部位，避免剧烈运动，保持清洁
###一周内
避免高温环境，避免按摩注射部位，注意防晒
###一个月内
避免过度表情，注意饮食，避免辛辣刺激食物
###定期复查
按医生要求定期复查，及时发现问题
##激光类项目护理
###术后即刻
冷敷缓解不适，使用医用修复产品
###一周内
严格防晒，避免使用刺激性护肤品，保持皮肤湿润
###恢复期
避免日晒，注意保湿，避免去角质等刺激性护理
###长期护理
注意日常防晒和保湿，维持治疗效果
##手术类项目护理
###术后48小时
保持伤口清洁干燥，按医嘱使用药物
###拆线前
避免剧烈运动，注意休息，避免伤口感染
###恢复期
注意饮食，避免辛辣刺激，避免烟酒
###定期复查
按医生要求定期复查，确保恢复顺利
##通用护理原则
###清洁保湿
保持皮肤清洁，做好保湿工作
###防晒
严格防晒，避免紫外线伤害
###饮食
注意饮食，避免辛辣刺激，多补充营养
###休息
保证充足休息，避免熬夜，促进恢复`
      }
    ],
    style: [
      {
        label: { chinese: "情绪共鸣（主打共情与治愈）", english: "Emotional Resonance (Empathy & Healing)", japanese: "感情共鳴（共感と癒し重視）" },
        value: `做完热玛吉的第30天，我终于理解了什么叫"投资自己"💕

30天前，我躺在治疗床上，心里既期待又忐忑。作为一个35岁的职场妈妈，每天照镜子看到脸上的细纹和松弛，心里总有种说不出的焦虑。

"这个年纪做医美，会不会太晚了？"我无数次问自己。

医生看出了我的不安，温柔地说："变美没有年龄限制，重要的是你愿意为自己投资。"那一刻，我突然释然了。

治疗过程比我想象中轻松，虽然有点热热的感觉，但完全可以接受。医生很专业，每一步都会告诉我现在在做什么，让我很安心。

30天后的今天，我照镜子时发现：
- 法令纹明显淡了很多
- 脸颊的轮廓更紧致了
- 整个人的状态都变好了

最重要的是，我重新找回了自信。不再害怕拍照，不再总是用美颜相机，敢于素颜出门。

如果你也在犹豫要不要做医美，我想告诉你：投资自己，永远不晚。当你开始爱自己，全世界都会来爱你。

#热玛吉 #面部年轻化 #医美分享 #30岁女人`
      },
      {
        label: { chinese: "实用干货（强调理性与获得感）", english: "Practical Tips (Rationality & Gain)", japanese: "実用ハウツー（合理性と獲得感強調）" },
        value: `在朋友劝说下，2年打了11次M22 光子后的我来发个总结。

第1️⃣阶段：

前七次，平均一个多月一次（详细日期见图）

（gap半年，不🥹在上海）

	

第2️⃣阶段：

后四次，二个月一次（详细日期见图）

图②:第一次（⬆️）🆚第十一次（⬇️）；个人感觉是有效，但不多，如果目的是维稳和预防状态下滑，还是不错的。如果指望有啥大效果，要么换预期要么换预算😂吧

图③：我手机能翻到的八次打之前的照片（我尽力了🥲）

	

其他碎碎念：

夏天和爱户外的朋友，光子真的不太友好，打完后几天每天要敷械字头面膜不说，还超级容易反黑。夏天如果爱户外或者没法避掉太阳的朋友们... 咱心疼一下👛别弄了，预算放在防晒上。（不要问我为啥中间几张黑的这么透亮！）

	

大家的钱都不是大风刮来的，希望能帮到大家更加可视的知道长期 打 M22光子能达到的预期效果，让大家的血汗钱花到该花的地方！peace🕊&❤️ #光子嫩肤 #嫩肤 #光子嫩肤效果`
      },
      {
        label: { chinese: "夸张反差（制造冲突与戏剧感）", english: "Exaggerated Contrast (Conflict & Drama)", japanese: "誇張な対比（衝突とドラマ性）" },
        value: `从"黄脸婆"到"少女肌"，我只用了3个月！😱

说出来你可能不信，3个月前，我的脸还是这样的：
- 色斑密密麻麻，像芝麻饼
- 毛孔粗大，能插秧
- 肤色暗沉，像没睡醒
- 细纹横生，显老10岁

3个月后，我的脸变成了这样：
- 色斑几乎看不见了
- 毛孔细腻了很多
- 肤色透亮有光泽
- 细纹明显减少

这3个月发生了什么？我做了3次皮秒激光+6次光子嫩肤！

第一次做完，我就看到色斑淡了很多。第二次做完，朋友都说我气色变好了。第三次做完，连我妈都问我是不是换了护肤品。

最神奇的是，做完激光后，我的皮肤状态一直很稳定。以前动不动就长痘，现在几乎不长了。以前总是暗沉，现在看起来很有光泽。

以前总觉得医美是"智商税"，现在才发现，专业的医美真的能改变一个人。不是说要变得多美，而是找回自信，找回那个爱笑的自己。

如果你也被皮肤问题困扰，真的建议试试激光美肤。3个月改变一张脸，这个投资太值了！

#皮秒激光 #光子嫩肤 #激光美肤 #变美分享`
      },
      {
        label: { chinese: "轻松治愈（营造理想生活氛围）", english: "Relaxed Healing (Ideal Life Atmosphere)", japanese: "リラックス癒し（理想的な生活雰囲気）" },
        value: `周末的下午，阳光透过百叶窗洒进来，我坐在镜子前，看着自己的脸，心情都变好了☀️

以前周末最怕的就是照镜子，看到脸上的斑点和细纹，心情就down到谷底。现在做完激光美肤后，周末终于可以真正放松了。

医生建议我每个月做一次光子嫩肤，作为日常保养。每次做完，皮肤都会变得很透亮，摸起来滑滑的，心情也跟着变好了。

最让我满意的是，做完激光后，我的皮肤状态一直很稳定。以前总是长痘，现在几乎不长了。以前总是暗沉，现在看起来很有光泽。

现在周末的打开方式变成了：
☕ 睡到自然醒
💆 做个光子嫩肤
📖 回家敷个面膜看看书
🌸 享受一个美好的周末

不用再为皮肤问题烦恼，有更多时间做自己喜欢的事。这种生活，才是我理想中的样子。

如果你也想改善皮肤状态，真的可以试试激光美肤。价格不贵，但带来的幸福感是实实在在的～

#光子嫩肤 #激光美肤 #周末日常 #理想生活`
      },
      {
        label: { chinese: "热点借势（关联热点事件+情绪共振）", english: "Trend Riding (Hot Events + Emotional Resonance)", japanese: "トレンド活用（ホットイベント+感情共鳴）" },
        value: `#容貌焦虑 #30岁女人 30岁后，我终于找到了对抗衰老的方法⚖️

30岁生日那天，我照镜子突然发现：
- 法令纹越来越深
- 脸颊开始下垂
- 眼角的细纹遮不住了
- 整个人看起来疲惫不堪

那一刻，我慌了。我开始疯狂搜索抗衰方法，买各种护肤品，但效果微乎其微。

直到朋友推荐我做热玛吉，我才发现，原来医美真的能改变一个人。

第一次做完热玛吉，我就看到效果了。脸颊紧致了很多，法令纹也淡了。最重要的是，我重新找回了自信。

现在我已经做了3次热玛吉，每次间隔3个月。效果一次比一次好，皮肤状态也越来越稳定。

30岁后，我开始明白：
- 抗衰不是一蹴而就的，需要长期坚持
- 医美不是"智商税"，而是科学抗衰
- 投资自己，永远不晚

如果你也在为衰老焦虑，真的建议试试医美。不是说要变得多美，而是找回自信，找回那个爱笑的自己。

#30岁女人 #热玛吉 #抗衰老 #医美分享 #容貌焦虑`
      }
    ]
  }
};
