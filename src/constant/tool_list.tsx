import { ACTIVITY_VENUE, ARTICLE_STYLE, ARTICLE_TYPE, BIO_STYLE, constTITLE_TARGET_USER_TYPE, COOKING_ABILITY, DIETARY_FREQUENCY, EMAIL_TONE, FESTIVAL_TYPE, GAME_TYPE, GENDER, GRAMMAR_CHECK_TYPE, QA_STYLE, REWRITE_THE_TONE, SEO_DESCRIPTION_GENERATION, SEO_TARGET_USER_TYPE, SOCIAL_MEDIA_STYLE, TRAINING_LEVEL, TRAINING_METHODS, TRAINING_OBJECTIVES, VIDEO_TARGET_USER_TYPE, XIAOHONGSHU_PRESET_CONTENT, YEARS_OF_WORK_EXPERIENCE } from "./language";

export interface Language { chinese: string; english: string; japanese: string }
export interface IFrom { [key: string]: { type: 'Input' | 'Select' | 'Textarea', list?: Language[], isBig?: boolean } }
export interface ITool {
  id: string | number,
  name: Language,
  classify: Language,
  url: string,
  describe: Language,
  resultType: string,
  title: string,
  submitButton: string
  from: IFrom
}
interface IToolList { [key: string]: Array<ITool> }

export const toolList: IToolList = {
  'Writing': [ //内容创作
    {
      id: 'writing_1',
      resultType: 'markdown',
      title: 'grammar-checker',
      name: { chinese: '语法检查', english: 'Grammar Checker', japanese: '構文チェック' },
      classify: { chinese: '内容创作', english: 'Writing', japanese: 'コンテンツ作成' },
      url: '/GrammarChecker.png',
      submitButton: 'Check',
      describe: {
        chinese: '帮你检查语法和提供改进建议。',
        english: 'Help you check grammar and provide suggestions for improvement.',
        japanese: '文法をチェックしたり、改善提案をしたりしてあげましょう。'
      },
      from: {
        content: { type: 'Textarea', isBig: true },
        type: { type: 'Select', list: GRAMMAR_CHECK_TYPE },
      }
    },
    {
      id: 'writing_2',
      resultType: 'text',
      title: 'book-title-generator',
      submitButton: 'Generate',
      name: { chinese: '书名生成', english: 'Book Title Generator', japanese: '書名生成' },
      classify: { chinese: '内容创作', english: 'Writing', japanese: 'コンテンツ作成' },
      url: '/BookTitleGenerator.png',
      describe: {
        chinese: '告别起名烦恼，让AI为你的书取个好名字。',
        english: 'Say goodbye to naming troubles; let AI generate a great title for your book.',
        japanese: '名前付けの悩みに別れを告げて、AIにあなたの本のために良い名前をつけさせます。'
      },
      from: {
        content: { type: 'Textarea', isBig: true },
        tone: { type: 'Select', list: ARTICLE_STYLE },
        audience: { type: 'Select', list: constTITLE_TARGET_USER_TYPE },
      }
    },
    {
      id: 'writing_3',
      resultType: 'text',
      title: 'sentence-rewriting',
      submitButton: 'Rewrite',
      name: { chinese: '句子改写', english: 'Sentence Rewriting', japanese: '文の書き換え' },
      classify: { chinese: '内容创作', english: 'Writing', japanese: 'コンテンツ作成' },
      url: '/SentenceRewriting.png',
      describe: {
        chinese: '使用不同的风格改写句子。',
        english: 'Rewrite sentences in different styles.',
        japanese: '異なるスタイルで文を書き換える。',
      },
      from: {
        content: { type: 'Textarea', isBig: true },
        tone: { type: 'Select', list: REWRITE_THE_TONE },
      }
    },
    {
      id: 'writing_4',
      resultType: 'text',
      submitButton: 'Generate',
      title: 'article-title-generation',
      url: '/ArticleTitleGeneration.png',
      classify: { chinese: '内容创作', english: 'Writing', japanese: 'コンテンツ作成' },
      name: { chinese: '文章标题生成', english: 'Article Title Generator', japanese: '記事タイトル生成' },
      describe: {
        chinese: '根据你的内容生成高质量的标题。',
        english: 'Generate high-quality titles based on your content.',
        japanese: 'あなたのコンテンツに基づいて高品質なタイトルを生成します。'
      },
      from: {
        content: { type: 'Textarea', isBig: true },
        keywords: { type: 'Input' },
        type: { type: 'Select', list: ARTICLE_TYPE },
        style: { type: 'Select', list: ARTICLE_STYLE },
      }
    },
    {
      id: 'writing_5',
      resultType: 'text',
      submitButton: 'Continuing',
      title: 'sentence-continuation',
      url: '/SentenceContinuation.png',
      classify: { chinese: '内容创作', english: 'Writing', japanese: 'コンテンツ作成' },
      name: { chinese: '句子续写', english: 'Sentence continuation', japanese: '文の書き換え' },
      describe: {
        chinese: '让AI帮你完成续写',
        english: 'Allow AI to assist you in completing the extension.',
        japanese: '更新をAIに手伝ってもらう'
      },
      from: {
        sentence: { type: 'Textarea' },
      }
    },
    {
      id: 'writing_6',
      resultType: 'text',
      submitButton: 'Expand',
      title: 'sentence-expansion',
      url: '/SentenceExpansion.png',
      classify: { chinese: '内容创作', english: 'Writing', japanese: 'コンテンツ作成' },
      name: { chinese: '句子扩展', english: 'Sentence expansion', japanese: '文の拡張' },
      describe: {
        chinese: '将短句子扩展为一个段落',
        english: 'Transform a brief sentence into a detailed and comprehensive paragraph.',
        japanese: '短い文を1つの段落に拡張する'
      },
      from: {
        sentence: { type: 'Textarea' },
      }
    },
    {
      id: 'writing_7',
      resultType: 'markdown',
      submitButton: 'Generate',
      title: 'blog-outline',
      url: '/BlogOutline.png',
      classify: { chinese: '内容创作', english: 'Writing', japanese: 'コンテンツ作成' },
      name: { chinese: '博客大纲', english: 'Blog Outline', japanese: 'ブログのアウトライン' },
      describe: {
        chinese: '为你想要写的主题准备一份清晰的大纲',
        english: 'Create a clear outline for the topic you intend to write about.',
        japanese: '書きたいテーマのために明確なアウトラインを用意します'
      },
      from: {
        topic: { type: 'Input' },
      }
    },
    {
      id: 'writing_9',
      resultType: 'text',
      title: 'content-summary',
      submitButton: 'Generate',
      name: { chinese: '内容摘要', english: 'Content Summary', japanese: 'コンテンツの概要' },
      classify: { chinese: '内容创作', english: 'Writing', japanese: 'コンテンツ作成' },
      url: '/ContentSummary.png',
      describe: {
        chinese: '生成一个简短的摘要',
        english: 'Generate a short summary',
        japanese: '簡単なサマリーを生成'
      },
      from: {
        content: { type: 'Textarea', isBig: true },
      }
    }
  ],
  'Public Domain Promotion': [//公域推广
    {
      id: 'social_media_1',
      resultType: 'text',
      title: 'video-title-generator',
      submitButton: 'Generate',
      name: { chinese: '视频标题生成', english: 'Video Title Generator', japanese: 'ビデオタイトル生成' },
      classify: { chinese: '公域推广', english: 'Public Domain Promotion', japanese: 'パブリックドメイン促進' },
      url: '/VideoTitleGenerator.png',
      describe: {
        chinese: '利用 AI 帮你生成一个有创意的视频标题。',
        english: 'Use AI to create a creative video title.',
        japanese: 'AIを利用してクリエイティブなビデオタイトルを生成してくれます。'
      },
      from: {
        content: { type: 'Textarea', isBig: true, },
        keywords: { type: 'Input', },
        tone: { type: 'Select', list: ARTICLE_STYLE },
        audience: { type: 'Select', list: VIDEO_TARGET_USER_TYPE },
      }
    },
    {
      id: 'social_media_2',
      resultType: 'text',
      title: 'video-description',
      submitButton: 'Generate',
      name: { chinese: '视频描述', english: 'Video Description', japanese: '動画リスト' },
      classify: { chinese: '公域推广', english: 'Public Domain Promotion', japanese: 'パブリックドメイン促進' },
      url: '/VideoDescription.png',
      describe: {
        chinese: '为视频内容生成准确、吸引人的描述',
        english: 'Create precise and engaging descriptions for video content.',
        japanese: 'ビデオコンテンツの正確で魅力的な説明を生成する'
      },
      from: {
        videoContent: { type: 'Textarea', isBig: true },
        keywords: { type: 'Input' },
        tone: { type: 'Select', list: ARTICLE_STYLE },
        audience: { type: 'Select', list: VIDEO_TARGET_USER_TYPE },
      }
    },
    {
      id: 'social_media_2_5',
      resultType: 'markdown',
      submitButton: 'Generate',
      title: 'video-script-outline',
      url: '/VideoScriptOutline.png',
      classify: { chinese: '公域推广', english: 'Public Domain Promotion', japanese: 'パブリックドメイン促進' },
      name: { chinese: '视频脚本大纲', english: 'Video Script Outline', japanese: 'ビデオスクリプトアウトライン' },
      describe: {
        chinese: '为你想要拍摄的视频脚本准备一份清晰的大纲',
        english: 'Create a detailed and structured outline for the script of your upcoming video.',
        japanese: '撮影したいビデオスクリプトのアウトラインを明確にする'
      },
      from: {
        topic: { type: 'Input' },
      }
    },
    
    {
      id: 'social_media_5',
      resultType: 'text',
      title: 'weibo-post-generation',
      submitButton: 'Generate',
      name: { chinese: '微博帖子生成', english: 'Weibo post generation', japanese: 'マイクロブログ投稿生成' },
      classify: { chinese: '公域推广', english: 'Public Domain Promotion', japanese: 'パブリックドメイン促進' },
      url: '/WeiboPostGeneration.png',
      describe: {
        chinese: '生成一个微博平台风格的帖子',
        english: 'Generate a Weibo-style post.',
        japanese: 'マイクロブログプラットフォーム風の投稿を生成する'
      },
      from: {
        content: { type: 'Textarea', isBig: true, },
        tone: { type: 'Select', list: SOCIAL_MEDIA_STYLE },
      }
    },

    {
      id: 'social_media_6',
      resultType: 'text',
      title: 'player-name-generator',
      submitButton: 'Generate',
      name: { chinese: '游戏人物起名', english: 'Player Name Generator', japanese: 'キャラクター名' },
      classify: { chinese: '公域推广', english: 'Public Domain Promotion', japanese: 'パブリックドメイン促進' },
      url: '/PlayerNameGenerator.png',
      describe: {
        chinese: '为你的游戏人物取一个有个性的名字',
        english: 'Select a distinctive name for your player character.',
        japanese: 'あなたのゲームキャラクターに個性的な名前をつける'
      },
      from: {
        gameType: { type: 'Select', list: GAME_TYPE },
        keywords: { type: 'Input' }
      }
    },
    {
      id: 'social_media_7',
      resultType: 'text',
      title: 'social-media-bio-creation',
      submitButton: 'Generate',
      name: { chinese: '社交网络Bio生成', english: 'Social Media Bio Creation', japanese: 'ソーシャルネットワークBio生成' },
      classify: { chinese: '公域推广', english: 'Public Domain Promotion', japanese: 'パブリックドメイン促進' },
      url: '/SocialMediaBioCreation.png',
      describe: {
        chinese: '通过一个高质量的Bio(头像下简介）吸引更多的粉丝',
        english: 'Attract more followers with a compelling and high-quality bio.',
        japanese: '質の高いBioを通じてより多くのファンを魅了する'
      },
      from: {
        keywords: { type: 'Textarea', },
        style: { type: 'Select', list: BIO_STYLE },
      }
    },
    {
      id: 'social_media_8',
      resultType: 'text',
      title: 'weixin-generation',
      submitButton: 'Generate',
      name: { chinese: '微信图文', english: 'WeChat Post', japanese: 'WeChat投稿' },
      classify: { chinese: '公域推广', english: 'Public Domain Promotion', japanese: 'パブリックドメイン促進' },
      url: '/wechat.png',
      describe: {
        chinese: '为微信公众号撰写生成吸引人的图文内容',
        english: 'Create engaging WeChat Moments posts with images and text.',
        japanese: 'WeChatモーメンツの魅力的な画像付き投稿を生成する'
      },
      from: {
        content: { type: 'Textarea', isBig: true, },
        tone: { type: 'Select', list: SOCIAL_MEDIA_STYLE },
      }
    },
    {
      id: 'social_media_11',
      resultType: 'text',
      title: 'TikTok-post-generation',
      submitButton: 'Generate',
      name: { chinese: '抖音图文生成', english: 'TikTok post generation', japanese: 'TikTok投稿生成' },
      classify: { chinese: '公域推广', english: 'Public Domain Promotion', japanese: 'パブリックドメイン促進' },
      url: '/douyin.webp',
      describe: {
        chinese: '生成一个抖音平台风格的图文内容',
        english: 'Generate a TikTok-style post.',
        japanese: 'TikTokプラットフォーム風の投稿を生成する'
      },
      from: {
        content: { type: 'Textarea', isBig: true, },
        tone: { type: 'Select', list: SOCIAL_MEDIA_STYLE },
      }
    },
    {
      id: 'social_media_12',
      resultType: 'text',
      title: 'xiaohongshu-post-generation',
      submitButton: 'Generate',
      name: { chinese: '小红书帖子生成', english: 'Xiaohongshu post generation', japanese: '小紅書投稿生成' },
      classify: { chinese: '公域推广', english: 'Public Domain Promotion', japanese: 'パブリックドメイン促進' },
      url: '/XiaohongshuPostGeneration.png',
      describe: {
        chinese: '生成一个小红书平台风格的笔记',
        english: 'Generate a Xiaohongshu-style post.',
        japanese: '小さな赤書プラットフォーム風のノートを生成する'
      },
      from: {
        role: { type: 'Input', isBig: false, },
        background: { type: 'Textarea', isBig: true, },
        purpose: { type: 'Textarea', isBig: true, },
        tone: { type: 'Select', list: SOCIAL_MEDIA_STYLE },
      }
    },

  ],
  'Marketing': [//营销活动
    {
      id: 'marketing_2',
      resultType: 'text',
      title: 'SEO-Title-Generator',
      submitButton: 'Generate',
      name: { chinese: '爆款活动标题生成', english: 'Viral Activity Title Generator', japanese: 'バズる活動タイトル生成' },
      classify: { chinese: '营销活动', english: 'Marketing', japanese: 'マーケティング' },
      url: '/SEOTitleGenerator.png',
      describe: {
        chinese: '快速生成引人注目的标题',
        english: 'Rapidly Create Attention-Grabbing Titles',
        japanese: '注目の見出しをすばやく生成'
      },
      from: {
        content: { type: 'Textarea', isBig: true },
        style: { type: 'Select', list: SEO_DESCRIPTION_GENERATION },
      }
    },
    {
      id: 'marketing_5',
      resultType: 'markdown',
      title: 'festival-activity-planning',
      submitButton: 'Generate',
      name: { chinese: '节日活动创意', english: 'Festival Activity Planning', japanese: '祭りイベント企画' },
      classify: { chinese: '营销活动', english: 'Marketing', japanese: 'マーケティング' },
      url: '/FestivalActivityPlanning.svg',
      describe: {
        chinese: '为不同节日提供活动创意及专业的营销活动策划',
        english: 'Create professional marketing activity plans for different festivals.',
        japanese: '様々な祭りのための専門的なマーケティング活動企画を作成'
      },
      from: {
        activityTheme: { type: 'Input' },
        activityPurpose: { type: 'Textarea', isBig: true },
        activityVenue: { type: 'Select', list: ACTIVITY_VENUE },
        festivalType: { type: 'Select', list: FESTIVAL_TYPE },
      }
    },
  ],
  'WeChat Private Domain': [//微信私域
    {
      id: 'wechat_private_1',
      resultType: 'text',
      title: 'wechat-moments-reply',
      submitButton: 'Generate',
      name: { chinese: '朋友圈回复', english: 'WeChat Moments Reply', japanese: 'WeChatモーメンツ返信' },
      classify: { chinese: '微信私域', english: 'WeChat Private Domain', japanese: 'WeChatプライベートドメイン' },
      url: '/WeChatMomentsReply.png',
      describe: {
        chinese: '为朋友圈内容生成合适的回复，提升互动效果',
        english: 'Generate appropriate replies for WeChat Moments content to enhance interaction.',
        japanese: 'WeChatモーメンツのコンテンツに適切な返信を生成し、相互作用を向上させる'
      },
      from: {
        momentsContent: { type: 'Textarea', isBig: true },
        replyTone: { type: 'Select', list: QA_STYLE },
      }
    },
    {
      id: 'wechat_private_2',
      resultType: 'text',
      title: 'comment-generation',
      submitButton: 'Generate',
      name: { chinese: '高情商对话', english: 'High EQ Dialogue', japanese: '高EQ対話' },
      classify: { chinese: '微信私域', english: 'WeChat Private Domain', japanese: 'WeChatプライベートドメイン' },
      url: '/CommentGeneration.png',
      describe: {
        chinese: '高质量互动，快速提升对话好感度',
        english: 'High-quality interaction, quickly improve conversation favorability.',
        japanese: '高品質なインタラクションで、会話の好感度を素早く向上させます。'
      },
      from: {
        postContent: { type: 'Textarea', isBig: true },
        yourThoughts: { type: 'Textarea' },
        tone: { type: 'Select', list: EMAIL_TONE },
      }
    }
  ],
  'Customer Interaction': [//顾客互动
    {
      id: 'customer_interaction_1',
      resultType: 'text',
      title: 'tone-analysis',
      submitButton: 'Analyze',
      name: { chinese: '语气分析', english: 'Tone Analysis', japanese: 'ニュアンス解析' },
      classify: { chinese: '顾客互动', english: 'Customer Interaction', japanese: '顧客との交流' },
      url: '/ToneAnalysis.png',
      describe: {
        chinese: '输入一句话，帮你分析这句话的语气。',
        english: 'Input a sentence for tone analysis.',
        japanese: '一言入力して、この言葉のニュアンスを分析してあげましょう。'
      },
      from: {
        content: { type: 'Textarea', isBig: true },
      }
    },
    {
      id: 'customer_interaction_2',
      resultType: 'markdown',
      title: 'email-generation',
      submitButton: 'Generate',
      name: { chinese: '邮件生成', english: 'Email generation', japanese: 'メール生成' },
      classify: { chinese: '顾客互动', english: 'Customer Interaction', japanese: '顧客との交流' },
      url: '/EmailGeneration.png',
      describe: {
        chinese: '生成符合语境和需求的邮件内容，提升写作效率和质量',
        english: 'Create email content tailored to context and requirements, improving writing efficiency and quality.',
        japanese: '文脈とニーズに合ったメールコンテンツを生成し、作文の効率と品質を向上させる'
      },
      from: {
        emailTopic: { type: 'Textarea' },
        tone: { type: 'Select', list: EMAIL_TONE },
      }
    },
    {
      id: 'customer_interaction_3',
      resultType: 'markdown',
      title: 'email-reply-generation',
      submitButton: 'Generate',
      name: { chinese: '邮件回复生成', english: 'Email reply generation', japanese: 'メール返信生成' },
      classify: { chinese: '顾客互动', english: 'Customer Interaction', japanese: '顧客との交流' },
      url: '/EmailReplyGeneration.png',
      describe: {
        chinese: '快速生成专业、礼貌的邮件回复，提高工作提效',
        english: 'Swiftly create professional and courteous email responses to boost work efficiency.',
        japanese: '専門的で丁寧なメール返信を迅速に生成し、生産性を向上'
      },
      from: {
        emailContext: { type: 'Textarea', isBig: true },
        requestForReply: { type: 'Textarea' },
        tone: { type: 'Select', list: EMAIL_TONE },
      }
    },
    {
      id: 'customer_interaction_5',
      resultType: 'text',
      title: 'comment-reply-generation',
      submitButton: 'Generate',
      name: { chinese: '评论回复生成', english: 'Comment reply generation', japanese: 'コメント返信生成' },
      classify: { chinese: '顾客互动', english: 'Customer Interaction', japanese: '顧客との交流' },
      url: '/CommentReplyGeneration.png',
      describe: {
        chinese: '生成恰当、有趣、引人入胜的回复，节省时间并提高互动质量',
        english: 'Create suitable, captivating, and engaging responses to save time and enhance the quality of interaction.',
        japanese: '適切で面白く、魅力的な返信を生成し、時間を節約し、相互作用の質を向上させる'
      },
      from: {
        postContent: { type: 'Textarea', isBig: true },
        commentWhichYouWillReply: { type: 'Textarea' },
        yourThoughts: { type: 'Textarea' },
        tone: { type: 'Select', list: EMAIL_TONE },
      }
    },
    {
      id: 'customer_interaction_6',
      resultType: 'markdown',
      title: 'expert-explanation',
      submitButton: 'Explain',
      name: { chinese: '专业解释', english: 'Expert Explanation', japanese: '専門的な説明' },
      classify: { chinese: '顾客互动', english: 'Customer Interaction', japanese: '顧客との交流' },
      url: '/ExpertExplanation.png',
      describe: {
        chinese: '使用逐渐专业的语气解释一个概念。',
        english: 'Explain a concept using an increasingly professional tone.',
        japanese: '徐々に専門的な口調で概念を解釈する。'
      },
      from: {
        content: { type: 'Textarea' },
      }
    }
  ],
  'Work Efficiency': [//工作提效
    {
      id: 'work_efficiency_5',
      resultType: 'table',
      title: 'text-conversion-to-table',
      submitButton: 'Convert',
      name: { chinese: '文字转换为表格', english: 'Text Conversion to Table', japanese: 'テキストを表に変換' },
      classify: { chinese: '工作提效', english: 'Work Efficiency', japanese: '生産性' },
      url: '/TextConversionToTable.png',
      describe: {
        chinese: '快速将冗长无规律的内容整理成一份清晰的表格',
        english: 'Efficiently organize lengthy and irregular content into a clear and concise table.',
        japanese: '冗長で不規則なコンテンツを迅速にクリアなテーブルに整理'
      },
      from: {
        content: { type: 'Textarea', isBig: true },
      }
    },
    {
      id: 'work_efficiency_6',
      resultType: 'markdown',
      title: 'task-decompose',
      submitButton: 'Decompose',
      name: { chinese: '任务拆解', english: 'Task Decompose', japanese: 'タスク分解' },
      classify: { chinese: '工作提效', english: 'Work Efficiency', japanese: '生産性' },
      url: '/TaskDecompose.png',
      describe: {
        chinese: '把你大脑里的所有信息碎片整合成一个任务列表。',
        english: 'Integrate all the information fragments in your mind into a task list.',
        japanese: 'あなたの脳内のすべての情報の断片化をタスクリストに統合します。'
      },
      from: {
        content: { type: 'Textarea', isBig: true },
      }
    },
    {
      id: 'work_efficiency_7',
      resultType: 'markdown',
      title: 'daily-report-generation',
      submitButton: 'Generate',
      name: { chinese: '日报生成', english: 'Daily Report Generation', japanese: '日報生成' },
      classify: { chinese: '工作提效', english: 'Work Efficiency', japanese: '生産性' },
      url: '/DailyReportGeneration.png',
      describe: {
        chinese: '总结你的工作内容，生成一份日报',
        english: 'Summarize your job content and generate a daily report.',
        japanese: 'あなたの仕事の内容をまとめて、日報を生成します'
      },
      from: {
        workLog: { type: 'Textarea', isBig: true },
      }
    },
    {
      id: 'work_efficiency_8',
      resultType: 'markdown',
      title: 'weekly-report-generation',
      submitButton: 'Generate',
      name: { chinese: '周报生成', english: 'Weekly Report Generation', japanese: '週報生成' },
      classify: { chinese: '工作提效', english: 'Work Efficiency', japanese: '生産性' },
      url: '/WeeklyReportGeneration.png',
      describe: {
        chinese: '总结你的工作内容，生成一份周报',
        english: 'Summarize your job content and generate a weekly report.',
        japanese: "あなたの仕事の内容をまとめて、週報を生成します。"
      },
      from: {
        workLog: { type: 'Textarea', isBig: true },
      }
    },
    {
      id: 'work_efficiency_9',
      resultType: 'markdown',
      title: 'monthly-report-generation',
      submitButton: 'Generate',
      name: { chinese: '月报生成', english: 'Monthly Report Generation', japanese: '月報生成' },
      classify: { chinese: '工作提效', english: 'Work Efficiency', japanese: '生産性' },
      url: '/MonthlyReportGeneration.png',
      describe: {
        chinese: '总结你的工作内容，生成一份月报',
        english: 'Summarize your job content and generate a monthly report.',
        japanese: 'あなたの仕事の内容をまとめて、月報を生成します。'
      },
      from: {
        workLog: { type: 'Textarea', isBig: true },
      }
    },
    {
      id: 'work_efficiency_10',
      resultType: 'markdown',
      title: 'meeting-summary',
      submitButton: 'Summarize',
      name: { chinese: '会议总结', english: 'Meeting Summary', japanese: '会議のまとめ' },
      classify: { chinese: '工作提效', english: 'Work Efficiency', japanese: '生産性' },
      url: '/MeetingSummary.png',
      describe: {
        chinese: '提取关键信息，快速整理要点',
        english: 'Extract key information and efficiently organize the main points.',
        japanese: '重要な情報を抽出し、要点を迅速に整理する'
      },
      from: {
        content: { type: 'Textarea', isBig: true },
      }
    }
  ]
}