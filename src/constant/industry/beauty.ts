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
      { chinese: "医美医生（执业医师）", english: "Medical Aesthetic Doctor (Licensed Physician)", japanese: "医療美容医師（認定医師）" },
      { chinese: "医疗美容顾问", english: "Medical Beauty Consultant", japanese: "医療美容コンサルタント" },
      { chinese: "护理师", english: "Nurse", japanese: "看護師" },
      { chinese: "店长", english: "Store Manager", japanese: "店長" },
      { chinese: "运营专员", english: "Operations Specialist", japanese: "運営専門員" },
      { chinese: "前台", english: "Receptionist", japanese: "受付" },
    ],
    background: [
      { 
        chinese: "资深医美医生，拥有10年临床经验，专精面部年轻化、皮肤修复和微整形技术，累计完成5000+成功案例", 
        english: "Senior medical aesthetic doctor with 10 years of clinical experience, specializing in facial rejuvenation, skin repair and micro-plastic surgery, with 5000+ successful cases", 
        japanese: "ベテラン医療美容医師、10年の臨床経験、顔の若返り、肌修復、マイクロ整形技術に特化、5000件以上の成功事例" 
      },
      { 
        chinese: "专业医疗美容顾问，熟悉各类医美项目，擅长为不同年龄层客户制定个性化变美方案，帮助客户科学理性选择医美项目", 
        english: "Professional medical beauty consultant, familiar with various medical aesthetic procedures, expert in creating personalized beauty plans for different age groups, helping clients make scientific and rational choices", 
        japanese: "プロ医療美容コンサルタント、様々な医療美容プロジェクトに精通、異なる年齢層の顧客に個別化された美しさプランを提供、科学的で合理的な選択をサポート" 
      },
      { 
        chinese: "资深护理师，拥有8年医美护理经验，精通术后护理、皮肤管理、客户服务，确保每位客户获得安全专业的护理体验", 
        english: "Senior nurse with 8 years of medical beauty nursing experience, proficient in post-operative care, skin management, and customer service, ensuring safe and professional care for every client", 
        japanese: "ベテラン看護師、8年の医療美容看護経験、術後ケア、肌管理、顧客サービスに精通、すべての顧客に安全でプロフェッショナルなケア体験を提供" 
      },
      { 
        chinese: "医美机构店长，管理经验丰富，深谙医美行业发展趋势，擅长团队管理和客户关系维护，致力于为客户提供高品质医美服务", 
        english: "Medical beauty clinic manager with rich management experience, deeply understanding industry development trends, expert in team management and customer relationship maintenance, committed to providing high-quality medical beauty services", 
        japanese: "医療美容クリニック店長、豊富な管理経験、業界発展トレンドを深く理解、チーム管理と顧客関係維持に精通、高品質な医療美容サービス提供に専念" 
      },
      { 
        chinese: "注射美容专家，精通玻尿酸、肉毒素等注射技术，拥有国际认证资质，擅长面部轮廓塑形和抗衰老治疗，累计注射案例3000+", 
        english: "Injectable beauty expert, proficient in hyaluronic acid, botulinum toxin and other injection techniques, with international certification, expert in facial contouring and anti-aging treatments, with 3000+ injection cases", 
        japanese: "注射美容専門家、ヒアルロン酸、ボツリヌストキシンなどの注射技術に精通、国際認証資格保有、顔の輪郭形成とアンチエイジング治療に特化、3000件以上の注射事例" 
      },
      { 
        chinese: "激光美肤专家，掌握各种激光设备操作，专精色斑、痘印、毛孔粗大等肌肤问题治疗，帮助客户重获光滑细腻肌肤", 
        english: "Laser skin treatment expert, mastering various laser device operations, specializing in treating skin problems like pigmentation, acne scars, and enlarged pores, helping clients regain smooth and delicate skin", 
        japanese: "レーザー美肌専門家、様々なレーザー機器操作をマスター、シミ、ニキビ跡、毛穴の開きなどの肌問題治療に特化、お客様に滑らかで繊細な肌を取り戻していただく" 
      },
      { 
        chinese: "热玛吉治疗师，拥有5年紧肤技术经验，熟练掌握热玛吉、超声刀等无创紧肤设备，帮助客户实现面部年轻化", 
        english: "Thermage therapist with 5 years of skin tightening experience, proficient in non-invasive skin tightening devices like Thermage and ultrasound therapy, helping clients achieve facial rejuvenation", 
        japanese: "サーモージセラピスト、5年の肌引き締め技術経験、サーモージ、超音波治療などの非侵襲的肌引き締め機器に精通、お客様に顔の若返りを実現" 
      },
      { 
        chinese: "医美运营专员，深谙医美市场趋势，擅长内容营销和客户教育，通过专业科普帮助客户建立正确的医美认知", 
        english: "Medical beauty operations specialist, deeply understanding market trends, expert in content marketing and customer education, helping clients establish correct medical beauty awareness through professional science popularization", 
        japanese: "医療美容運営専門員、市場トレンドを深く理解、コンテンツマーケティングと顧客教育に精通、プロの科学普及でお客様に正しい医療美容認知を構築" 
      },
      { 
        chinese: "医美前台接待，拥有3年客户服务经验，熟悉各类医美项目流程，擅长客户咨询和预约管理，为客户提供贴心专业的服务体验", 
        english: "Medical beauty receptionist with 3 years of customer service experience, familiar with various medical beauty project processes, expert in customer consultation and appointment management, providing caring and professional service experience for clients", 
        japanese: "医療美容受付、3年の顧客サービス経験、様々な医療美容プロジェクトプロセスに精通、顧客相談と予約管理に特化、お客様に心のこもったプロサービス体験を提供" 
      },
    ],
    purpose: [
      { 
        chinese: "分享医美科普知识，帮助客户了解安全变美的正确方式，建立专业权威形象", 
        english: "Share medical beauty science knowledge, help clients understand the correct way to safely enhance beauty, build professional authority image", 
        japanese: "医療美容科学知識を共有、お客様に安全な美しさの正しい方法を理解してもらい、プロフェッショナルな権威イメージを構築" 
      },
      { 
        chinese: "展示真实案例效果，通过前后对比和客户反馈，证明医美项目的安全性和有效性", 
        english: "Showcase real case effects, demonstrate the safety and effectiveness of medical aesthetic procedures through before/after comparisons and customer feedback", 
        japanese: "実際の事例効果を紹介、ビフォーアフター比較と顧客フィードバックを通じて医療美容プロジェクトの安全性と有効性を証明" 
      },
      { 
        chinese: "科普医美项目适应症和禁忌症，帮助客户理性选择，避免盲目跟风", 
        english: "Educate about medical aesthetic procedure indications and contraindications, help clients make rational choices and avoid blind following trends", 
        japanese: "医療美容プロジェクトの適応症と禁忌症を科学普及、お客様の合理的な選択をサポート、盲目的な流行追従を回避" 
      },
      { 
        chinese: "分享术后护理知识和注意事项，确保客户获得最佳恢复效果", 
        english: "Share post-operative care knowledge and precautions, ensure clients achieve optimal recovery results", 
        japanese: "術後ケア知識と注意事項を共有、お客様に最適な回復効果を確保" 
      },
      { 
        chinese: "推广注射美容项目，介绍玻尿酸、肉毒素等产品的安全性和效果，吸引潜在客户咨询", 
        english: "Promote injectable beauty procedures, introduce the safety and effectiveness of products like hyaluronic acid and botulinum toxin, attract potential clients for consultation", 
        japanese: "注射美容プロジェクトを推進、ヒアルロン酸、ボツリヌストキシンなどの製品の安全性と効果を紹介、潜在顧客の相談を誘引" 
      },
      { 
        chinese: "宣传激光美肤技术，展示专业设备和治疗效果，建立技术优势形象", 
        english: "Promote laser skin treatment technology, showcase professional equipment and treatment effects, build technical advantage image", 
        japanese: "レーザー美肌技術を宣伝、プロ機器と治療効果を展示、技術優位性イメージを構築" 
      },
      { 
        chinese: "介绍热玛吉、超声刀等紧肤技术，强调无创无痛的优势，吸引追求安全变美的客户", 
        english: "Introduce skin tightening technologies like Thermage and ultrasound therapy, emphasize non-invasive and painless advantages, attract clients pursuing safe beauty enhancement", 
        japanese: "サーモージ、超音波治療などの肌引き締め技術を紹介、非侵襲で無痛の利点を強調、安全な美しさを求める顧客を誘引" 
      },
      { 
        chinese: "分享医美行业趋势和新技术，展示机构的专业性和前瞻性，提升品牌影响力", 
        english: "Share medical beauty industry trends and new technologies, showcase institutional professionalism and foresight, enhance brand influence", 
        japanese: "医療美容業界トレンドと新技術を共有、機関のプロフェッショナリズムと先見性を展示、ブランド影響力を向上" 
      },
      { 
        chinese: "解答客户常见疑问，消除医美恐惧心理，建立信任关系，促进转化", 
        english: "Answer common customer questions, eliminate medical beauty fears, build trust relationships, promote conversion", 
        japanese: "お客様のよくある疑問に回答、医療美容への恐怖心理を解消、信頼関係を構築、転換を促進" 
      },
      { 
        chinese: "展示医美机构的专业资质和认证，强调安全性和合规性，增强客户信心", 
        english: "Showcase medical beauty institution's professional qualifications and certifications, emphasize safety and compliance, enhance customer confidence", 
        japanese: "医療美容機関のプロ資格と認証を展示、安全性とコンプライアンスを強調、顧客信頼を強化" 
      },
      { 
        chinese: "分享客户成功变美的故事，通过真实案例建立情感连接，激发潜在客户的变美欲望", 
        english: "Share customer success stories of beauty transformation, build emotional connections through real cases, inspire potential clients' desire for beauty enhancement", 
        japanese: "お客様の成功した美しさ変身ストーリーを共有、実際の事例で感情的なつながりを構築、潜在顧客の美しさへの欲望を刺激" 
      },
      { 
        chinese: "推广限时优惠活动，通过价格优势吸引客户到店咨询，提高转化率", 
        english: "Promote limited-time promotional activities, attract customers to visit for consultation through price advantages, improve conversion rates", 
        japanese: "期間限定キャンペーンを推進、価格優位性でお客様の来店相談を誘引、転換率を向上" 
      },
    ]
  },
  
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
  }
};
