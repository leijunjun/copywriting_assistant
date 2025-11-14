/**
 * Makeup Industry Presets
 * 
 * This file contains presets specifically for makeup industry users.
 * Includes persona templates, product descriptions, and style templates for various tools.
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

// 工具预设内容接口
export interface ToolPresets {
  [fieldName: string]: MultilingualContent[] | PresetOption[];
}

// 行业预设配置接口
export interface IndustryPresets {
  [toolId: string]: ToolPresets;
}

export const makeupPresets: IndustryPresets = {
  // 小红书帖子生成工具（服务类）
  'xiaohongshu-post-generation': {
    role: [
      { chinese: "美妆博主", english: "Beauty Blogger", japanese: "美容ブロガー" },
      { chinese: "护肤达人", english: "Skincare Expert", japanese: "スキンケアの達人" },
      { chinese: "彩妆师", english: "Makeup Artist", japanese: "メイクアップアーティスト" },
      { chinese: "美妆店主", english: "Beauty Shop Owner", japanese: "美容店オーナー" },
      { chinese: "产品体验官", english: "Product Reviewer", japanese: "製品レビュアー" },
    ],
    background: [
      { 
        chinese: "从事美妆行业5年，擅长护肤品成分分析和产品测评，服务过3000+粉丝", 
        english: "5 years in beauty industry, specializing in skincare ingredient analysis and product reviews, served 3000+ followers", 
        japanese: "美容業界5年、スキンケア成分分析と製品レビューに特化、3000人以上のフォロワーにサービス提供" 
      },
      { 
        chinese: "专业彩妆师，擅长妆容设计和化妆技巧教学，帮助1000+姐妹提升妆容技能", 
        english: "Professional makeup artist, specializing in makeup design and technique teaching, helped 1000+ sisters improve makeup skills", 
        japanese: "プロのメイクアップアーティスト、メイクデザインとテクニック指導に特化、1000人以上の方のメイクスキル向上をサポート" 
      },
      { 
        chinese: "美妆店主，经营护肤美妆产品3年，熟悉各类产品特性和适用人群", 
        english: "Beauty shop owner, running skincare and makeup products for 3 years, familiar with various product characteristics and target audiences", 
        japanese: "美容店オーナー、スキンケア・メイクアップ製品を3年間運営、様々な製品特性とターゲット層に精通" 
      },
    ],
    purpose: [
      { 
        chinese: "分享好用的护肤品，帮助姐妹们避免踩雷", 
        english: "Share great skincare products to help sisters avoid bad purchases", 
        japanese: "良いスキンケア製品を共有し、失敗購入を避けるサポート" 
      },
      { 
        chinese: "推广平价好物，让每个人都能享受高质量护肤", 
        english: "Promote affordable products, making quality skincare accessible to everyone", 
        japanese: "手頃な製品を推進し、誰もが高品質スキンケアを楽しめるように" 
      },
      { 
        chinese: "教学化妆技巧，提升姐妹们的妆容水平", 
        english: "Teach makeup techniques to improve sisters' makeup skills", 
        japanese: "メイクテクニックを教え、メイクスキルを向上させる" 
      },
    ]
  },
  
  // 小红书帖子生成工具（商品类）
  'xiaohongshu-post-generation-product': {
    persona: [
      { chinese: "专业权威型：德系润护研究所", english: "Professional Authority: German Skincare Research Institute", japanese: "専門権威型：ドイツスキンケア研究所" },
      { chinese: "亲切种草分享型：爱护肤的小格子", english: "Friendly Sharing Type: Skincare Lover Xiaogezi", japanese: "親しみやすいシェア型：スキンケア好きの小格子" },
      { chinese: "目标人群痛点解决型：干皮少女的急救站", english: "Target Audience + Pain Point Solution: Dry Skin Girl's First Aid Station", japanese: "ターゲット層+課題解決型：乾燥肌少女の救急ステーション" },
    ],
    product: [
      {
        label: { chinese: "格兰素护手霜", english: "Glysomed Hand Cream", japanese: "グリソメッドハンドクリーム" },
        value: `#格兰素护手霜
##品牌历史	
###创立时间与起源
	1952 年创立于德国，以 “解决战后肌肤干燥问题” 为初始使命，早期靠高浓度甘油配方打开市场
###核心发展节点
	1. 1970 年代建立独立实验室，研发 “高浓度甘油 + 尿囊素” 专利配方；2. 2020 年后加速布局中国电商，靠 “成分党” 口碑破圈；3. 获德国有机认证
###品牌理念
	功效优先，秉持 “无香精、无酒精、无色素” 的德系科学护肤哲学
##市场定位	
###核心价值主张
	长效锁水、修复皮肤屏障、敏感肌适配，解决极端干燥与受损肌肤问题
###目标用户群体
	1. 沙漠干皮、频繁洗手人群、湿疹患者、孕妇等成分敏感群体；2. 注重长效修复的秋冬刚需用户
###价格带（常规促销价）
	125ml / 约 24 元，每 ml 单价0.19 元
###渠道策略
	以电商平台为主战场，依赖 KOL 测评与用户口碑传播，定位 “小众专业”
###品牌联想
	“敏感肌救星”“干裂克星”，认知度偏低但专业属性强
##产品核心信息	
###核心成分
	50% 植物甘油、尿囊素、维生素 E、羊毛脂；无香精、无酒精、无色素
###质地与肤感
	慕斯质地，轻薄稠润，3 秒快速吸收，无黏腻感，洗手后仍保湿润泽
###保湿与修复能力
	1. 单次涂抹保湿时长超 8 小时；2. 连续使用 4 周，手部细纹减少 27%，干裂愈合率 91%；3. 尿囊素促进角质更新，修复受损屏障
###适用场景
	1. 极端环境（-20℃严寒、沙漠气候、空调房）；2. 手部龟裂、全身（手肘 / 脚跟）干燥护理；3. 敏感肌日常长期使用
###包装设计
	125ml 铁盒，密封性强，避免膏体氧化，可重复使用
###敏感肌适配性
	经皮肤病理学测试，0 刺激，孕妇、湿疹患者可使用
##技术与认证	
###核心技术
	高浓度成分精准配比工艺，确保甘油与尿囊素协同作用
###权威认证 / 测试
	德国有机认证，皮肤病理学 0 刺激测试`
      },
    ],
    style: [
      {
        label: { chinese: "好物测评型-场景种草A", english: "Product Review - Scene Planting", japanese: "商品レビュー型-シーン植え付け" },
        value: `被德国留子安利！大红饼护手霜救了我干手 谁懂啊！❄️北方冬天的干手真的会谢… 洗手后紧绷到开裂，涂了好几款护手霜都没用😭刷到德国留子推荐的这款 "大红饼"，抱着试试的心态入了，结果直接封神！质地是绵密的乳霜感，推开不黏腻，吸收超快，涂完手软软嫩嫩的～关键是滋润度在线！白天涂一次能顶大半天，做家务、打字都不粘键盘，晚上厚敷当手膜，第二天起来干纹都淡了✨味道是淡淡的清香，不刺鼻，小小一罐方便揣兜里，通勤、出差都能补涂～干手星人直接锁死！有没有姐妹也用过这款？求推荐更多好用护手霜呀～🙌`
      },
      {
        label: { chinese: "好物测评型-场景种草B", english: "Product Review - Scene Planting B", japanese: "商品レビュー型-シーン植え付けB" },
        value: `德国 Glysolid 小红管护手霜，我的肌肤救星！✨🌿 最近挖到了一款超级好用的护手霜 —— 德国 Glysolid 小红管！这个有着 70 多年历史的德国老牌子，真的是口碑爆棚，畅销全球 80 多个国家呢！💦 它的质地偏粘稠，但涂开后却异常好吸收，完全不会有油腻感。抹一次，就能让肌肤长时间保持软嫩嫩的状态，粗糙、关节黑这些问题都能得到大大改善！💧 更神奇的是，涂上后它会形成一层锁水膜，牢牢锁住水分，冲水都不会掉，再也不用反反复复补涂啦！🌸 主要成分是植物甘油和尿囊素，温和又有效，还能促进细胞再生，舒缓肌肤。管状设计，小巧便携，随时随地都能给肌肤来一场滋润 SPA！💕 如果你也是干皮星人，一定要试试这款 Glysolid 小红管，绝对让你爱不释手！`
      },
      {
        label: { chinese: "好物测评型-场景种草C", english: "Product Review - Scene Planting C", japanese: "商品レビュー型-シーン植え付けC" },
        value: `这小红管… 手涂完嫩到没边了😱之前洗完手总是不记得涂护手霜，结果手又干又糙还冒倒刺，看着都闹心！又赶紧把之前买的这支护手霜翻出来每天擦～它是有点稠的慕斯质地，看着厚重但涂开超顺滑，一点不黏腻～含有 50% 植物甘油和尿囊素，涂完像给手裹了层锁水膜似的，滑滑嫩嫩的，竟然洗了手之后还是很嫩滑，惊呆了！有时候我还会涂在脚踝、手肘这些干硬的地方，涂完没一会儿就会感觉软乎乎的～而且 100ml 一大支才 30 几块，性价比绝了！现在我办公室抽屉和家里各放一支，每天记得擦，再也没熬过手干的苦～🙅‍♀️`
      },
      {
        label: { chinese: "生活日常型-场景种草", english: "Daily Life - Scene Planting", japanese: "日常生活型-シーン植え付け" },
        value: `教师 plog|睡前厚涂一层，早上起来手软软的Hi. 宝子们，我是张张啊～ 😊白天：站讲台写板书、带学生做实践，手总免不了干干的晚上：拍 plog 整理素材，空调房里身上也容易发紧 —— 全靠我的大红饼撑住！德国 70 多年的老牌子，125ml 铁盒装拿在手里很实在，价格也就两三杯奶茶钱，不管当护手霜还是身体乳用都不心疼～成分里有高浓度植物甘油、尿囊素和维生素 E，补水锁水能力超强，涂着还特别温和，敏感肌也能放心用✨质地是绵密的慕斯感，看着有点稠但好推开，一抹就化成水状，吸收快还不粘腻，这个季节用刚刚好！涂完手上像有层薄薄的锁水膜，洗手后也能保持水润，不用反复补涂；有时候脚后跟干，擦一点第二天摸起来就软和不少～现在不管是上课揣在包里，还是拍 plog 时随手放桌面当道具，都超合适！干皮姐妹要是常觉得手脚干痒、身上起小白屑，真的可以试试～🙋`
      },
      {
        label: { chinese: "生活日常型-场景种草2", english: "Daily Life - Scene Planting 2", japanese: "日常生活型-シーン植え付け2" },
        value: `🍦：（（细碎的生活是值得被看见的🐰"又是一年冬" - 秋冬快到啦 当然少不了护手霜了～我是属于那种一天要擦好几次护手霜的人，不然手就会干的不行！最近新入的德国大红饼 glysolid 甘油乳霜，真的戳中我！慕斯的质地，很好推开，涂完不黏腻，吸收也快～含高浓度植物甘油➕尿囊素，能深层🔒水，保持手部水润一整天，有时候还会用它厚敷做手膜，用完手嫩到掐出水！性价比也很高，这么大一罐能用好久～椰果碎碎念：桂林已经一夜入冬了，昨天还在开空调，今天就裹上厚外套了，是一个没有秋天的城市呀～🍂`
      },
      
    ]
  },
};

