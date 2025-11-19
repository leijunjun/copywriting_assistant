/**
 * Yituihuo Industry Presets
 * 
 * This file contains presets specifically for Yituihuo industry users.
 * Includes role templates, background scenarios, and purpose goals for various tools.
 * Focus on Yituihuo Liebianbao (裂变宝) product, customer acquisition teams, and store managers.
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

export const yituihuoPresets: IndustryPresets = {
  // 小红书热帖生成工具
  'xiaohongshu-post-generation-product': {
    persona: [
      {
        chinese: "一推火产品经理",
        english: "Yituihuo Product Manager",
        japanese: "一推火プロダクトマネージャー型",
        backgrounds: [
          {
            chinese: "重视客户使用反馈，对一推火裂变宝小程序使用过程遇到的问题特别敏感，坚信「良好的操作体验是软件的差异化竞争」",
            english: "Values customer feedback highly, particularly sensitive to issues encountered during the use of Yituihuo Liebianbao mini-program, firmly believes that 'excellent user experience is the software's competitive differentiation'",
            japanese: "顧客のフィードバックを重視し、一推火裂变宝小程序の使用過程で発生する問題に特に敏感で、「優れた操作体験がソフトウェアの差別化競争力」と確信"
          },
          {
            chinese: "技术创新型负责人，对 AI 技术的发展和结合有偏执的冲动，认为技术创新能带来裂变效率「质」的提升",
            english: "Technology innovation-oriented leader with an obsessive drive for AI technology development and integration, believes technological innovation can bring 'qualitative' improvement in viral efficiency",
            japanese: "技術革新型リーダー、AI技術の発展と統合に偏執的な衝動を持ち、技術革新がウイルス効率の「質的」向上をもたらすと考える"
          },
          {
            chinese: "市场型产品负责人，紧密关注同行的竞争态势，也是「合作 0 成本」政策的主要倡导者，「帮客户赚钱」是口头禅",
            english: "Market-oriented product leader, closely monitors competitor dynamics, also the main advocate of the 'zero-cost cooperation' policy, 'helping customers make money' is a catchphrase",
            japanese: "市場型プロダクトリーダー、競合他社の競争状況を密接に監視し、「協力0コスト」政策の主要提唱者でもあり、「お客様の収益化を支援」が口癖"
          }
        ]
      },
      {
        chinese: "拓客团队负责人",
        english: "Customer Acquisition Team Leader",
        japanese: "顧客獲得チームリーダー型",
        backgrounds: [
          {
            chinese: "有一个 5 人以内的小团队，主要服务教培行业的店铺，特别是篮球培训、羽毛球培训，也一直在关注和学习美业的打法",
            english: "Leads a small team of 5 people or less, primarily serves education and training industry stores, especially basketball and badminton training, also continuously follows and learns beauty industry strategies",
            japanese: "5人以内の小規模チームを率い、主に教育・研修業界の店舗にサービス提供、特にバスケットボール・バドミントン研修に特化、美容業界の戦略も継続的に学習"
          },
          {
            chinese: "从连锁经营转型到拓客服务，目前在美业流量增长领域属于头部服务商，去年做了超 5000w 的业绩，特别重视现金流业务",
            english: "Transitioned from chain operations to customer acquisition services, currently a top-tier service provider in beauty industry traffic growth, achieved over 50 million in performance last year, particularly values cash flow business",
            japanese: "チェーン経営から顧客獲得サービスに転換、現在美容業界のトラフィック成長分野でトップサービスプロバイダー、昨年5000万以上の業績を達成、キャッシュフロー事業を特に重視"
          },
          {
            chinese: "服务行业很多，多数是单店，通过区域合作的方式进行执案团队的扩展，和很多中小拓客团队有深度联盟合作",
            english: "Serves many industries, mostly single stores, expands execution teams through regional cooperation, has deep alliance partnerships with many small and medium-sized customer acquisition teams",
            japanese: "多くの業界にサービス提供、主に単店舗、地域協力による実行チームの拡大、多くの中小顧客獲得チームと深い連盟協力関係"
          }
        ]
      },
      {
        chinese: "店长（活动负责人）",
        english: "Store Manager (Activity Coordinator)",
        japanese: "店長（活動責任者）型",
        backgrounds: [
          {
            chinese: "自己创业做的儿推产康一体店，主要服务周边社区的宝妈及孩子，邻里关系很好，喜欢策划新颖的节日活动",
            english: "Self-employed owner of an integrated children's massage and postpartum rehabilitation store, primarily serves mothers and children in the surrounding community, has excellent neighborhood relationships, enjoys planning innovative holiday activities",
            japanese: "自営業で小児マッサージ・産後ケア統合店を経営、主に周辺コミュニティのママと子供にサービス提供、近隣関係が良好、革新的な祝日イベントの企画を好む"
          },
          {
            chinese: "在养发连锁店里做职业经理人，主要负责市场营销活动策划，对新技术和新工具有强烈的尝新意识",
            english: "Works as a professional manager in a hair care chain store, primarily responsible for marketing activity planning, has a strong sense of trying new technologies and tools",
            japanese: "ヘアケアチェーン店でプロマネージャーとして勤務、主にマーケティング活動企画を担当、新技術と新ツールへの強い試行意識"
          },
          {
            chinese: "在美业门店担任店长，擅长利用一推火裂变宝策划营销活动，通过小程序裂变系统实现客户增长，熟悉红包裂变、短视频裂变等多种玩法",
            english: "Serves as store manager in a beauty industry store, skilled at using Yituihuo Liebianbao to plan marketing activities, achieves customer growth through mini-program viral systems, familiar with various playstyles like red envelope viral, short video viral",
            japanese: "美容業界店舗で店長を務め、一推火裂变宝を活用したマーケティング活動の企画に長け、小程序ウイルスシステムによる顧客成長を実現、赤包ウイルス、ショートビデオウイルスなど様々なプレイスタイルに精通"
          }
        ]
      }
    ],
    discussionSubject: [
      {
        label: { chinese: "一推火裂变宝", english: "Yituihuo Liebianbao", japanese: "一推火裂变宝" },
        value: `#一推火裂变宝
##产品定位
基于AI技术和"老带新"裂变的拓客工具系统，即开即用，为品牌方和拓客团队定制

##核心功能
###三大裂变玩法
- **红包裂变**：灵活设置、实时到账、动作奖励
- **短视频裂变**：私域视频、自定义上传、短视频红包
- **直播裂变**：私密直播、直播裂变、直播红包

###六种营销打法
- **推二返一**：推N返一灵活设置，二次裂变
- **消费全免**：客户0元购，店面客户双赢
- **短视频带货**：看视频得红包，视频带货新玩法
- **私域直播带货**：直播带货、直播红包、直播带货
- **二级分销**：分销红包、分销奖励、分销管理
- **阶梯拼团**：不同组团数量阶梯奖励、红包礼品相组合

##核心数据
- **单次活动拓客均值**：176（获客效果稳定）
- **活动老新比均值**：1:2.06（极致裂变营销）
- **单次活动收入均值**：21468（品销一体化）
- **二次升单复购率均值**：67%（前端后端营收兼顾）

##24+核心功能
数据中台、分享动作奖励、员工码、执案老师码、作战大屏、分享全景图、实时红包下发、免单奖励、潜客名单、多终端核销、个性数据采集、活动快速复制、智能话术客服、短视频带货、多渠道分享、动画特效、多户头分账、裂变雷达、访客统计、新老客标签、实时榜单、提现裂变、极速结算等

##成功案例
已为600+品牌连锁成功开展裂变式营销，包括：
- **圣嘉（美容医院）**：单次成交290单，超173710元，72.7%裂变率
- **丝域（养发）**：多店互动，店均217单，老客成交率超75.6%，新客留存超52.3%
- **昂立教育（教培）**：通过裂变营销实现学员数量3倍增长
- **茉奈卡卡（轻医美连锁）**：私域流量运营，实现销售额翻倍
- **榕树下（健康管理）**：会员裂变增长，构建健康生态圈

##商业模式
- **合作0成本**：无需前期投入
- **按效果分成**：与客户共同成长

##适用行业
医美护肤、美甲养发、教育培训、大健康管理、运动休闲等

##用户体验
为每个角色量身定制的操作界面：
- **客户端**：简洁易用的用户界面，极致下单体验，开局红包抢占注意力，下单后自动化分享引导，动画特效仪式感满满，现金奖励即时到账
- **员工端**：员工码管理，分享动作奖励
- **执案老师端**：执案老师码，作战大屏
- **后台管理端**：数据中台，活动管理，效果分析`
      },
      {
        label: { chinese: "小程序裂变系统", english: "Mini-Program Viral System", japanese: "小程序ウイルスシステム" },
        value: `#小程序裂变系统
##系统原理
基于微信生态的社交裂变营销系统，通过"老带新"机制实现客户指数级增长

##核心机制
###裂变传播路径
- 老客户分享活动链接/二维码
- 新客户通过分享进入小程序
- 完成指定动作（下单、分享、邀请等）
- 获得奖励（红包、优惠、礼品等）
- 形成二次、三次裂变传播

###数据追踪
- 实时追踪裂变路径和效果
- 识别新老客户标签
- 统计分享数据和转化数据
- 生成裂变全景图

##应用场景
###门店拓客
- 新店开业活动
- 节日促销活动
- 会员增长活动
- 新品推广活动

###品牌营销
- 品牌曝光活动
- 私域流量运营
- 用户增长活动
- 复购提升活动

##实施方法
###活动设置
1. 选择裂变玩法（红包/短视频/直播）
2. 设置奖励机制（金额/比例/条件）
3. 配置分享话术和素材
4. 设置活动时间和规则

###执行流程
1. 活动上线，老客户收到活动通知
2. 老客户参与并分享给新客户
3. 新客户进入小程序完成动作
4. 系统自动发放奖励
5. 实时监控数据，优化策略

##效果保障
###技术保障
- 稳定的系统架构
- 实时红包下发
- 多终端核销支持
- 数据安全保护

###运营保障
- 专业执案团队
- 活动策划支持
- 数据分析指导
- 持续优化建议`
      },
      {
        label: { chinese: "AI 应用", english: "AI Applications", japanese: "AI応用" },
        value: `#AI在裂变营销中的应用
##AI技术优势
###智能推荐
- 基于用户行为数据，智能推荐合适的裂变玩法
- 个性化活动配置，提高转化率
- 智能话术生成，提升分享效果

###数据分析
- AI分析裂变数据，识别关键节点
- 预测活动效果，提前优化策略
- 智能标签系统，精准用户画像

###自动化运营
- 智能客服系统，24小时在线服务
- 自动话术回复，提升用户体验
- 智能活动复制，快速批量执行

##应用场景
###活动策划
- AI分析历史数据，推荐最佳活动方案
- 智能生成活动话术和素材
- 预测活动效果和ROI

###用户运营
- 智能识别高价值用户
- 个性化推荐裂变活动
- 自动化用户触达和转化

###效果优化
- 实时分析活动数据
- 智能调整活动策略
- 自动优化奖励机制

##技术特点
###AI Agent技术
- 智能裂变方案生成
- 微信销冠智能体
- 自动化营销执行

###机器学习
- 用户行为预测
- 活动效果预测
- 智能推荐算法

###自然语言处理
- 智能话术生成
- 客服自动回复
- 内容智能优化

##未来展望
- 更智能的活动推荐
- 更精准的用户画像
- 更自动化的运营流程
- 更高效的裂变效果`
      }
    ],
    style: [
      {
        label: { chinese: "产品体验分享", english: "Product Experience Sharing", japanese: "製品体験共有" },
        value: `用了3个月一推火裂变宝，来聊聊真实感受📊

作为一家美业门店的店长，我们店一直在为拓客发愁。传统的营销方式效果越来越差，获客成本越来越高。

3个月前，朋友推荐了一推火裂变宝，抱着试试看的心态，我们做了一次红包裂变活动。

**第一次活动效果：**
- 活动3天，新增客户156人
- 老客户分享率72%
- 活动收入18万+
- 获客成本降低了60%+

最让我惊喜的是，系统操作真的很简单。以前做活动要准备很多物料，现在只需要在后台设置一下，活动就上线了。

老客户分享的积极性也特别高，因为红包是实时到账的，他们分享的动力很足。新客户下单也很顺畅，整个流程很流畅。

现在我们已经做了5次活动了，每次效果都很稳定。系统里的数据中台功能也很实用，可以清楚地看到每次活动的数据，方便我们优化策略。

如果你也在为拓客发愁，真的建议试试一推火裂变宝。操作简单，效果明显，而且合作0成本，按效果分成，对我们这种小店很友好。

#一推火裂变宝 #小程序裂变 #门店拓客 #营销工具`
      },
      {
        label: { chinese: "技术解析", english: "Technical Analysis", japanese: "技術解析" },
        value: `一推火裂变宝的技术架构解析：为什么能做到实时红包下发？💡

作为技术出身的我，对一推火裂变宝的技术实现很感兴趣。今天来聊聊它的技术架构。

**核心架构：**
- 基于微信小程序生态
- 分布式系统架构
- 实时数据处理能力

**实时红包下发的技术实现：**
1. **消息队列系统**：用户完成动作后，系统立即生成红包任务
2. **支付接口对接**：与微信支付深度集成，支持实时到账
3. **风控系统**：防止刷单和异常行为
4. **数据同步**：多终端数据实时同步

**裂变追踪技术：**
- 通过分享链接参数追踪裂变路径
- 建立用户关系图谱
- 实时统计裂变数据
- 生成裂变全景图

**数据中台能力：**
- 实时数据采集
- 多维度数据分析
- 智能数据标签
- 可视化数据展示

**AI技术应用：**
- 智能话术生成
- 用户行为预测
- 活动效果预测
- 智能推荐算法

最让我佩服的是，系统在保证实时性的同时，还能处理高并发。我们做活动的时候，同时在线几千人，系统依然很稳定。

而且他们的AI功能也很实用，可以自动生成活动话术，大大节省了我们的时间。

如果你对技术感兴趣，或者想了解系统是如何实现的，可以看看他们的技术文档，或者直接咨询他们的技术团队。

#小程序开发 #裂变系统 #技术架构 #AI应用`
      },
      {
        label: { chinese: "案例分享", english: "Case Study", japanese: "ケーススタディ" },
        value: `丝域养发用一推火裂变宝，店均217单，老客成交率75.6%！📈

今天分享一个真实案例：丝域养发连锁使用一推火裂变宝的效果。

**背景：**
丝域是一家全国连锁的养发品牌，有200+门店。他们希望通过裂变活动实现多店批量拓客。

**活动方案：**
- 使用推二返一裂变模式
- 老客户推荐2个新客户，即可获得返现
- 新客户首次消费享受优惠
- 活动持续7天

**活动效果：**
- **店均217单**：平均每个门店成交217单
- **老客成交率75.6%**：老客户参与度非常高
- **新客留存52.3%**：新客户留存率超过一半
- **活动收入**：单店平均收入超过2万

**关键成功因素：**
1. **活动设计合理**：推二返一模式让老客户有动力分享
2. **奖励机制吸引人**：返现金额设置合理，老客户愿意参与
3. **系统操作简单**：门店员工容易上手，执行顺畅
4. **数据实时可见**：通过作战大屏，可以实时看到活动数据

**客户反馈：**
"一推火裂变宝给丝域带来了新的可能，多店批量拓客更高效提升业绩。"

这个案例说明，只要活动设计合理，系统工具给力，裂变营销的效果是可以预期的。

如果你也是连锁品牌，想批量拓客，真的可以借鉴一下这个案例。

#裂变营销 #连锁经营 #客户增长 #营销案例`
      },
      {
        label: { chinese: "问题解答", english: "Q&A", japanese: "質問と回答" },
        value: `一推火裂变宝常见问题解答，新手必看！❓

最近很多朋友问我关于一推火裂变宝的问题，今天整理一下常见问题，希望能帮到大家。

**Q1：合作真的0成本吗？**
A：是的，合作0成本，按效果分成。不需要前期投入，只有活动产生效果后才分成。

**Q2：系统操作复杂吗？**
A：不复杂，系统界面很简洁，一般培训1-2小时就能上手。而且有专业的执案老师指导。

**Q3：红包真的能实时到账吗？**
A：是的，用户完成动作后，红包会立即下发到微信零钱，实时到账。

**Q4：适合哪些行业？**
A：主要适合服务行业，比如医美、美甲、养发、教培、健康管理等。只要是有"老带新"需求的行业都可以用。

**Q5：活动效果如何保障？**
A：系统有24+核心功能，包括数据中台、裂变雷达、作战大屏等，可以实时监控活动效果。而且有专业的执案团队支持。

**Q6：可以定制化吗？**
A：可以，系统支持租用和独立品牌部署两种方式，可以根据需求定制。

**Q7：数据安全吗？**
A：系统有完善的数据安全保护机制，符合相关法规要求。

**Q8：如何开始使用？**
A：可以联系他们的客服，他们会安排专业的咨询和演示。

如果还有其他问题，可以直接咨询他们的客服，服务很专业。

#一推火裂变宝 #小程序裂变 #营销工具 #问题解答`
      },
      {
        label: { chinese: "行业洞察", english: "Industry Insights", japanese: "業界洞察" },
        value: `2025年裂变营销趋势：AI+社交裂变将成为主流🚀

作为在拓客行业摸爬滚打多年的从业者，今天聊聊2025年裂变营销的趋势。

**趋势1：AI技术深度应用**
AI不再是概念，而是真正落地到营销工具中。一推火裂变宝的AI功能就是很好的例子：
- 智能话术生成
- 用户行为预测
- 活动效果预测
- 智能推荐算法

**趋势2：社交裂变成为标配**
"老带新"的裂变模式已经成为服务行业拓客的标配。不再是可选项，而是必选项。

**趋势3：数据驱动精细化运营**
通过数据中台，可以实时看到活动数据，基于数据优化策略，而不是凭感觉。

**趋势4：多玩法组合**
单一玩法效果有限，多种玩法组合才能实现更好的效果。比如红包裂变+短视频裂变+直播裂变。

**趋势5：私域流量运营**
公域流量成本越来越高，私域流量运营成为重点。通过裂变活动，将公域流量转化为私域流量。

**趋势6：合作模式创新**
"合作0成本，按效果分成"这种模式越来越受欢迎，降低了品牌方的试错成本。

**我的建议：**
1. 尽早布局AI+裂变营销
2. 重视数据分析和优化
3. 多玩法组合，不要单一依赖
4. 选择靠谱的工具和团队

2025年，裂变营销将更加智能化、数据化、精细化。谁能抓住趋势，谁就能在竞争中脱颖而出。

#裂变营销 #AI应用 #营销趋势 #行业洞察`
      }
    ]
  }
};

