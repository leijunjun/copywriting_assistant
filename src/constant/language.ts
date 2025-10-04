interface Language { chinese: string; english: string, japanese: string, value?: string };
export interface ILang { "en-US": string; "zh-CN": string; "ja-JP": string; }
export interface ILangShort { "en": string; "zh": string; "ja": string; }
export const LANG = { "en-US": 'english', "zh-CN": 'chinese', "ja-JP": 'japanese' }
export const LANG_SHORT: ILangShort = { "en": 'english', "zh": 'chinese', "ja": 'japanese' }

export const CARD_RECENTLY_USED: Language = { chinese: '最近使用', english: 'Recently Used', japanese: '最近使用' };
export const HEADER_TITLE: Language = { chinese: 'AI 文案助手', english: 'AI Writing Assistant', japanese: 'AIライティングアシスタント' };
export const INPUT_PLACEHOLDER: Language = { chinese: '查找你想要找的工具', english: 'Find The Tool You Are Looking For', japanese: '探しているツールを見つける' };
export const SEARCH_HINT: Language = { chinese: '没有符合搜索关键词的工具', english: 'There Are No Tools That Match The Search Keywords', japanese: '検索キーワードに一致するツールがありません' };
export const DELETE_RECORD_MESSAGE: Language = { chinese: '该记录将永久删除，是否继续？', english: 'This record will be permanently deleted. Do you want to continue?', japanese: 'この記録は永久に削除されます。続行しますか？' }
export const DELETE_RECORD_CONTINUE: Language = { chinese: '继续', english: 'continue', japanese: '続ける' }
export const DELETE_RECORD_CANCEL: Language = { chinese: '取消', english: 'cancel', japanese: 'キャンセル' }
export const COPY_SUCCESSFUL: Language = { chinese: '复制成功', english: 'Copy successful', japanese: 'コピー成功' }
export const COPY_ERROR: Language = { chinese: '复制失败', english: 'Copy error', japanese: 'コピー失敗' }
export const GENERATION_FAILED: Language = { chinese: '失败', english: 'failed', japanese: '失敗' }
export const SUCCESSFULLY_GENERATED: Language = { chinese: '成功', english: 'success', japanese: '成功' }
export const OUTPUT_LANGUAGE: Language = { chinese: '请选择输出语言', english: 'Please select the output language', japanese: '出力言語を選択してください' }
export const PLEASE_ENTER: Language = { chinese: '请输入', english: 'Please enter ', japanese: '入力してください' };
export const PLEASE_SELECT: Language = { chinese: '请选择', english: 'Please select ', japanese: '選択してください' };
export const GENERATE_BUTTON: Language = { chinese: '生成', english: 'generate', japanese: '生成する' }
export const CLEAR_CONTENT_BUTTON: Language = { chinese: '清除内容', english: 'Clear Content', japanese: '内容をクリア' }

/**
 * 工具语言配置 Tool language configuration
 */
export const LANGUAGE_LIST: Array<Language> = [
  { chinese: '中文', english: 'Chinese', japanese: '中文' },
  { chinese: '英语', english: 'English', japanese: 'English' },
  { chinese: '日语', english: 'Japanese', japanese: '日本語' },
  { chinese: '法语', english: 'French', japanese: 'Deutsch' },
  { chinese: '韩语', english: 'Korean', japanese: 'Français' },
  { chinese: '德语', english: 'German', japanese: '한국어' },
]

// 工具分类词汇 Tool classification vocabulary
export const classify: Array<Language> = [
  { chinese: '内容创作', english: 'Writing', japanese: 'コンテンツ作成' },
  { chinese: '社交媒体', english: 'Social Media', japanese: 'ソーシャルメディア' },
  { chinese: '市场营销', english: 'Marketing', japanese: 'マーケティング' },
  { chinese: '教育', english: 'Education', japanese: '教育' },
  { chinese: '项目管理', english: 'Project Management', japanese: 'プロジェクト管理' },
  { chinese: '生活方式', english: 'Lifestyle', japanese: 'ライフスタイル' },
  { chinese: '工作效率', english: 'Work Efficiency', japanese: '生産性' },
]

// 提交按钮词汇 Submit button vocabulary
export const SUBMIT_BUTTON: { [key: string]: Language } = {
  'Rewrite': { chinese: ' 改写', english: 'Rewrite', japanese: '上書き' },
  'Generate': { chinese: ' 生成', english: 'Generate', japanese: '生成' },
  'Check': { chinese: ' 检查', english: 'Check', japanese: 'チェック' },
  'Explain': { chinese: ' 解释', english: 'Explain', japanese: '説明' },
  'Decompose': { chinese: ' 拆解', english: 'Decompose', japanese: '分解' },
  'Analyze': { chinese: ' 分析', english: 'Analyze', japanese: '解析' },
  'Answer': { chinese: '回答', english: 'Answer', japanese: 'に答える' },
  'Summarize': { chinese: '总结', english: 'Summarize', japanese: 'まとめ' },
  'Modify': { chinese: '修改', english: 'Modify', japanese: '変更' },
  'Convert': { chinese: '转换', english: 'Convert', japanese: 'へんかん' },
  'Continuing': { chinese: '续写', english: 'Continuing', japanese: '更新' },
  'Expand': { chinese: '扩展', english: 'Expand', japanese: '拡張' },
  'Shorten': { chinese: '缩短', english: 'Shorten', japanese: '短縮' },
  'Submit': { chinese: '提交', english: 'Submit', japanese: '送信' },
}

// 表单label Form label
export const FROM_LABEL: { [key: string]: Language } = {
  'type': { chinese: '类型', english: 'Type', japanese: 'タイプ' },
  'tone': { chinese: '语气', english: 'Tone', japanese: 'ニュアンス' },
  'style': { chinese: '风格', english: 'Style', japanese: 'スタイル' },
  'content': { chinese: '内容', english: 'Content', japanese: '内容' },
  'question': { chinese: '问题', english: 'Question', japanese: '問題' },
  'keywords': { chinese: '关键词', english: 'Keywords', japanese: 'キーワード' },
  'audience': { chinese: '目标用户', english: 'Audience', japanese: 'ターゲット・ユーザー' },
  'gender': { chinese: '性别', english: 'Gender', japanese: '性別' },
  'method': { chinese: '训练方式', english: 'Method', japanese: 'トレーニングモード' },
  'goal': { chinese: '训练目标', english: 'Goal', japanese: '訓練目標' },
  'level': { chinese: '力量水平', english: 'Level', japanese: 'パワーレベル' },
  'jobName': { chinese: '岗位名称', english: 'Job Name', japanese: '部署名' },
  'jobDescription': { chinese: '职位描述', english: 'Job Description', japanese: '職階の説明' },
  'cookingAbility': { chinese: '料理能力', english: 'Cooking Ability', japanese: '料理能力' },
  'ingredientsAndCookwares': { chinese: '拥有的食材和炊具', english: 'Ingredients and Cookwares', japanese: '持っている食材や調理器具' },
  'position': { chinese: '职位', english: 'Position', japanese: 'ポジション' },
  'yearsOfExperience': { chinese: '工作年限', english: 'Years of Experience', japanese: '勤続年数' },
  'interestsAndGoals': { chinese: '兴趣和目标', english: 'Interests and goals', japanese: '興味と目標' },
  'gameType': { chinese: '游戏类型', english: 'Game Type', japanese: 'ゲームの種類' },
  'topic': { chinese: '主题', english: 'Topic', japanese: 'トピック＃トピック＃' },
  'dietaryFrequency': { chinese: '饮食频率', english: 'Dietary Frequency', japanese: '食事の頻度' },
  'calorieGoal': { chinese: '卡路里目标', english: 'Calorie goal', japanese: 'カロリー目標' },
  'dietaryPreferencesAndRestrictions': { chinese: '饮食偏好和限制', english: 'Dietary preferences and restrictions', japanese: '食事の好みと制限' },
  'videoContent': { chinese: '视频内容', english: 'Video content', japanese: 'ビデオコンテンツ' },
  'context': { chinese: '上下文', english: 'Context', japanese: 'コンテキスト' },
  'sentence': { chinese: '句子', english: 'Sentence', japanese: '文' },
  'workLog': { chinese: '工作内容', english: 'Work Log', japanese: '作業内容' },
  'resumeContent': { chinese: '简历内容', english: 'Resume Content', japanese: '履歴書の内容' },
  'emailTopic': { chinese: '邮件主题', english: 'Email Topic', japanese: 'メールの件名' },
  'emailContext': { chinese: '邮件上下文', english: 'Content', japanese: 'メールコンテキスト' },
  'requestForReply': { chinese: '希望回复的内容', english: 'Request for reply', japanese: '返信したい内容' },
  'postContent': { chinese: '帖子内容', english: 'Post Content', japanese: '投稿内容' },
  'yourThoughts': { chinese: '你的想法', english: 'Your thoughts', japanese: 'あなたの考え' },
  'commentWhichYouWillReply': { chinese: '你想回复的评论', english: 'Comment which you will reply', japanese: 'あなたが返信したいコメント' },
}

// 料理能力表词汇 Vocabulary of cooking ability table
export const COOKING_ABILITY: Array<Language> = [
  { chinese: '初学者', english: 'Beginner', japanese: '初心者' },
  { chinese: '中级', english: 'Intermediate', japanese: '中級' },
  { chinese: '高级', english: 'Advanced', japanese: '高級' },
]

// 文章风格类型词汇 Article style, type, vocabulary
export const ARTICLE_STYLE: Array<Language> = [
  { chinese: '正式', english: 'Formal', japanese: '正式' },
  { chinese: '友好', english: 'Friendly', japanese: '友好的' },
  { chinese: '专业', english: 'Professional', japanese: '専門' },
  { chinese: '随意', english: 'Casual', japanese: '随意' },
  { chinese: '乐于助人', english: 'Helpful', japanese: '喜んで人を助ける' },
  { chinese: '幽默', english: 'Humor', japanese: 'ユーモア' },
  { chinese: '移情', english: 'Empathetic', japanese: 'に恋' },
  { chinese: '吸引人', english: 'Engaging', japanese: '人を引き付ける' },
  { chinese: '乐观', english: 'Optimistic', japanese: '楽観的' },
  { chinese: '鼓舞人心', english: 'Inspirational', japanese: '人の心を奮い立たせる' },
  { chinese: '中立', english: 'Neutral', japanese: 'ニュートラル' },
  { chinese: '真诚', english: 'Sincere', japanese: '誠実である' },
  { chinese: '兴奋', english: 'Exciting', japanese: '興奮する' },
  { chinese: '机智', english: 'Witty', japanese: '機知' },
  { chinese: '大胆', english: 'Bold', japanese: '大胆である' },
  { chinese: '讽刺', english: 'Ironic', japanese: '風刺' },
  { chinese: '直接', english: 'Direct', japanese: '直接' },
  { chinese: '有说服力', english: 'Persuasive', japanese: '説得力がある' },
  { chinese: '自信', english: 'Confident', japanese: '自信を持つ' },
  { chinese: '圆滑', english: 'Smooth', japanese: 'まるまるとした' },
  { chinese: '学术', english: 'Academic', japanese: '学術' },
  { chinese: '简化', english: 'Simplified', japanese: 'シンプル化' },
  { chinese: '奢华', english: 'Extravagant', japanese: 'ぜいたく' },
]

// 文章类型词汇 Article type vocabulary
export const ARTICLE_TYPE: Array<Language> = [
  { chinese: '新闻', english: 'News', japanese: 'ニュース' },
  { chinese: '博客', english: 'Blogs', japanese: 'ブログ' },
  { chinese: '传记', english: 'Biography', japanese: '伝記' },
  { chinese: '小说', english: 'Fiction', japanese: '小説' },
  { chinese: '散文', english: 'Essays', japanese: '散文' },
  { chinese: '技术报告', english: 'Technical reports', japanese: 'テクニカルレポート' },
  { chinese: '学术论文', english: 'Academic papers', japanese: '学術論文' },
  { chinese: '书评', english: 'Book reviews', japanese: 'レビュー' },
  { chinese: '访谈', english: 'Interviews', japanese: 'インタビュー' },
  { chinese: '旅行日志', english: 'Travel journals', japanese: '旅行日誌' },
  { chinese: '短篇故事', english: 'Short stories', japanese: '短編物語' },
  { chinese: '自传', english: 'Autobiography', japanese: '自伝' },
]

// 游戏类型词汇 Game type vocabulary
export const GAME_TYPE: Array<Language> = [
  { chinese: '动作游戏', english: 'Action', japanese: 'アクションゲーム' },
  { chinese: '角色扮演游戏', english: 'RPG', japanese: 'ロールプレイングゲーム' },
  { chinese: '策略游戏', english: 'Strategy', japanese: 'ポリシーゲーム' },
  { chinese: '模拟游戏', english: 'Simulation', japanese: 'シミュレーションゲーム' },
  { chinese: '体育游戏', english: 'Sports', japanese: 'スポーツゲーム' },
  { chinese: '冒险游戏', english: 'Adventure', japanese: 'アドベンチャーゲーム' },
  { chinese: '棋牌游戏', english: 'Board', japanese: 'ボードゲーム' },
  { chinese: '射击游戏', english: 'Shooting', japanese: 'シューティングゲーム' },
  { chinese: '音乐/节奏游戏', english: 'Music/ Rhythm', japanese: '音楽/リズムゲーム' },
  { chinese: '益智游戏', english: 'Puzzle', japanese: 'パズル' },
  { chinese: '竞速游戏', english: 'Racing', japanese: 'スピードゲーム' },
  { chinese: '卡牌游戏', english: 'Card', japanese: 'カードゲーム' },
]

// 工作年限词汇 Vocabulary of years of work experience
export const YEARS_OF_WORK_EXPERIENCE: Array<Language> = [
  { chinese: '实习/应届生', english: 'Internship/Freshers', japanese: 'インターンシップ/新卒' },
  { chinese: '1-3年', english: '1-3 years', japanese: '1-3年' },
  { chinese: '3-5年', english: '3-5 years', japanese: '3-5年' },
  { chinese: '5-10年', english: '5-10 years', japanese: '5-10年' },
  { chinese: '10年以上', english: 'More than 10 years', japanese: '10年以上' },
]

// 改写语气词汇  Rewrite tone vocabulary
export const REWRITE_THE_TONE: Array<Language> = [
  { chinese: '更专业', english: 'More professional', japanese: 'より専門的' },
  { chinese: '更礼貌', english: 'More polite', japanese: 'より丁寧に' },
  { chinese: '更少讽刺', english: 'Less snarky', japanese: 'より少ない風刺' },
  { chinese: '更易读', english: 'Easier to read', japanese: '読みやすさの向上' },
  { chinese: '更正式', english: 'More formal', japanese: 'より正式' },
  { chinese: '更非正式', english: 'More informal', japanese: 'より非公式' },
  { chinese: '更善于交际（喋喋不休）', english: 'More sociable(waffle)', japanese: 'より社交的（おしゃべり）' },
  { chinese: '更切中要点（不喋喋不休）', english: 'More to the point(unwaffle)', japanese: 'もっと要領を得て（べらべらしゃべらない）' },
  { chinese: '更少情绪化', english: 'Less emotional', japanese: '感情的にならない' },
  { chinese: '更热情', english: 'More passionate', japanese: 'より情熱的' },
  { chinese: '更讽刺', english: 'More sarcastic', japanese: 'もっと皮肉' },
]

// 语法检查词汇  Grammar check vocabulary
export const GRAMMAR_CHECK_TYPE: Array<Language> = [
  { chinese: '文章', english: 'Article', japanese: '文章' },
  { chinese: '电子邮件', english: 'Email', japanese: 'Eメール' },
  { chinese: '报告', english: 'Report', japanese: 'レポート作成' },
  { chinese: '社交媒体帖子', english: 'Social Media Post', japanese: 'ソーシャルメディア投稿' },
  { chinese: '博客文章', english: 'Blog Post', japanese: 'ブログ記事' },
  { chinese: '论文', english: 'Essay', japanese: '論文' },
  { chinese: '商业信函', english: 'Business Letter', japanese: 'ビジネスレター' },
  { chinese: '研究论文', english: 'Research Paper', japanese: '研究論文' },
  { chinese: '演讲', english: 'Presentation', japanese: 'スピーチ' },
]

// 书名目标用户类型词汇 Title Target User Type Vocabulary
export const constTITLE_TARGET_USER_TYPE: Array<Language> = [
  { chinese: '儿童', english: 'Children', japanese: '子ども' },
  { chinese: '青少年', english: 'Teens', japanese: '青少年' },
  { chinese: '成人', english: 'Adults', japanese: '大人' },
  { chinese: '老年人', english: 'Seniors', japanese: '高齢者' },
  { chinese: '学生', english: 'Students', japanese: '学生' },
  { chinese: '教育工作者', english: 'Educators', japanese: '教育関係者' },
  { chinese: '研究人员', english: 'Researchers', japanese: '研究者' },
  { chinese: '专业人士', english: 'Professionals', japanese: '専門家' },
  { chinese: '业余爱好者', english: 'Hobbyists', japanese: 'アマチュア' },
  { chinese: '爱好者', english: 'Enthusiasts', japanese: 'ファン人' },
  { chinese: '普通大众', english: 'General Public', japanese: '一般大衆' },
  { chinese: '学者', english: 'Academics', japanese: '学者' },
  { chinese: '家长', english: 'Parents', japanese: '親' },
  { chinese: '作家', english: 'Writers', japanese: '作家' },
  { chinese: '历史学家', english: 'Historians', japanese: '歴史学者' },
  { chinese: '科学家', english: 'Scientists', japanese: '科学者' },
]

// 视频目标用户类型词汇 Video target user type vocabulary
export const VIDEO_TARGET_USER_TYPE: Array<Language> = [
  { chinese: '生活博客', english: 'Lifestyle bloggers', japanese: '生活ブログ' },
  { chinese: '游戏玩家', english: 'Gamers', japanese: 'ゲーマー' },
  { chinese: '学生', english: 'Students', japanese: '学生' },
  { chinese: '消费者', english: 'Consumers', japanese: '消費者' },
  { chinese: '科技爱好者', english: 'Tech enthusiasts', japanese: '科学技術愛好家' },
  { chinese: '美妆爱好者', english: 'Beauty enthusiasts', japanese: 'コスメマニア' },
  { chinese: '烹饪爱好者', english: 'Cooking enthusiasts', japanese: '料理愛好家' },
  { chinese: '健身爱好者', english: 'Fitness enthusiasts', japanese: 'フィットネス愛好家' },
  { chinese: '音乐爱好者', english: 'Music lovers', japanese: '音楽愛好家' },
  { chinese: '喜剧爱好者', english: 'Comedy fans', japanese: '喜劇愛好家' },
  { chinese: '旅行者', english: 'Travelers', japanese: '旅行者' },
  { chinese: '动画爱好者', english: 'Animation fans', japanese: 'アニメ好き' },
  { chinese: '科学爱好者', english: 'Science enthusiasts', japanese: '科学愛好家' },
  { chinese: '编程爱好者', english: 'Programming enthusiasts', japanese: 'プログラミング愛好家' },
  { chinese: '书籍和电影爱好者', english: 'Book and movie lovers', japanese: '本や映画好き' },
  { chinese: '手工艺爱好者', english: 'DIY enthusiasts', japanese: '手芸愛好家' },
  { chinese: '家居装修爱好者', english: 'Home improvement enthusiasts', japanese: 'インテリア愛好家' },
  { chinese: '宠物爱好者', english: 'Pet lovers', japanese: 'ペット愛好家' },
  { chinese: '新闻读者', english: 'News readers', japanese: 'ニュース読者' },
]

// SEO目标用户类型词汇  SEO target user type vocabulary
export const SEO_TARGET_USER_TYPE: Array<Language> = [
  { chinese: '普通用户', english: 'Ordinary users', japanese: '一般ユーザー' },
  { chinese: '内容创作者', english: 'Content creators', japanese: 'コンテンツ作成者' },
  { chinese: '年轻女性', english: 'Young women', japanese: '若い女性' },
  { chinese: '学生', english: 'Students', japanese: '学生' },
  { chinese: '男性', english: 'Men', japanese: '男性' },
  { chinese: '营销人员', english: 'Marketers', japanese: 'マーケティング担当者' },
  { chinese: '开发者', english: 'Developers', japanese: '開発者' },
  { chinese: '中老年人', english: 'Middle-aged and elderly people', japanese: '中高年' },
  { chinese: '青少年', english: 'Teenagers', japanese: '青少年' },
]

// SEO标题风格词汇 SEO Title Style Vocabulary
export const SEO_DESCRIPTION_GENERATION: Array<Language> = [
  { chinese: '问题式', english: 'Question', japanese: 'もんだいしき' },
  { chinese: '数字列表式', english: 'Numeric List', japanese: '数値リスト' },
  { chinese: '指南/教程式', english: 'Guidelines/Tutorials', japanese: 'ガイド/チュートリアル' },
  { chinese: '对比式标题', english: 'Contrasting Headings', japanese: 'コントラストタイトル' },
  { chinese: '紧急/时效性', english: 'Urgent/Timely', japanese: '緊急/時効性' },
  { chinese: '利益驱动式', english: 'Profit-driven', japanese: '利益駆動式' },
  { chinese: '好奇心驱动式', english: 'Curiosity-driven', japanese: '好奇心駆動式' },
  { chinese: '专家/权威式', english: 'Expert/Authority', japanese: '専門家/権威' },
  { chinese: '解决方案式', english: 'Solution-driven', japanese: 'ソリューション' },
  { chinese: '个性化', english: 'Personalized', japanese: 'パーソナライズ' },
  { chinese: '故事式', english: 'Storytelling', japanese: 'ストーリー' },
]

// 社交媒体风格词汇  Social media style vocabulary
export const SOCIAL_MEDIA_STYLE: Array<Language> = [
  { chinese: '鼓励性', english: 'Encouraging', japanese: 'はげしい' },
  { chinese: '幽默风趣', english: 'Humorous', japanese: 'ユーモラス' },
  { chinese: '教育性', english: 'Educational', japanese: '教育的' },
  { chinese: '启发式', english: 'Inspirational', japanese: 'ヒューリスティック' },
  { chinese: '激励性', english: 'Motivational', japanese: 'れいしんせい' },
  { chinese: '亲切友好', english: 'Friendly', japanese: '親切で友好的' },
  { chinese: '专业严谨', english: 'Professional and rigorous', japanese: 'プロ意識が高い' },
  { chinese: '疑问探讨', english: 'Questioning', japanese: '疑問の検討' },
  { chinese: '热情洋溢', english: 'Enthusiastic', japanese: '熱情があふれる' },
  { chinese: '挑战性', english: 'Challenging', japanese: '課題' },
  { chinese: '感性诉求', english: 'Emotional', japanese: '感性的な訴え' },
  { chinese: '讽刺挖苦', english: 'Sarcastic', japanese: '皮肉皮肉皮肉' },
  { chinese: '轻松随意', english: 'Casual', japanese: '気軽に' },
  { chinese: '悲伤感伤', english: 'Sad and sentimental', japanese: '悲しくて悲しくて' },
  { chinese: '神秘兮兮', english: 'Mysterious', japanese: '神秘的だ' },
]

// QA风格词汇 QA style vocabulary
export const QA_STYLE: Array<Language> = [
  { chinese: '正式', english: 'formal', japanese: '正式' },
  { chinese: '专业', english: 'Professional', japanese: '専門' },
  { chinese: '鼓舞人心', english: 'Inspirational', japanese: '人の心を奮い立たせる' },
  { chinese: '中立', english: 'Neutral', japanese: 'ニュートラル' },
  { chinese: '真诚', english: 'Sincere', japanese: '誠実である' },
  { chinese: '自信', english: 'Confident', japanese: '自信を持つ' },
  { chinese: '简洁', english: 'Simplicity', japanese: '簡潔' },
]

// Bio风格词汇 Bio style vocabulary
export const BIO_STYLE: Array<Language> = [
  { chinese: '正式专业', english: 'Formal and professional', japanese: '正式な専攻' },
  { chinese: '幽默风趣', english: 'Humor', japanese: 'ユーモラス' },
  { chinese: '简洁', english: 'Simple', japanese: '簡潔' },
  { chinese: '文艺', english: 'Literary', japanese: '文芸' },
  { chinese: '自信张扬', english: 'Confident', japanese: '自信を持つ' },
  { chinese: '亲切友好', english: 'Friendly', japanese: '親切で友好的' },
  { chinese: '神秘', english: 'Mysterious', japanese: '神秘的' },
  { chinese: '励志', english: 'Inspirational', japanese: '励ましの志' },
  { chinese: '实用信息', english: 'Practical Information', japanese: 'ユーティリティ情報' },
  { chinese: '个性化标签', english: 'Personalized Tags', japanese: 'ラベルのパーソナライズ' },
  { chinese: '叛逆', english: 'Rebel', japanese: '反逆' },
  { chinese: '多重身份', english: 'Multiple Identities ', japanese: '複数のアイデンティティ' },
  { chinese: '自然随性', english: 'Naturally spontaneous', japanese: '自然随意性' },
]

// 饮食频率 Dietary frequency
export const DIETARY_FREQUENCY: Array<Language> = [
  { chinese: '一日两餐', english: 'Two meals a day', japanese: '1日2食' },
  { chinese: '一日三餐', english: 'Three meals a day', japanese: '1日3食' },
  { chinese: '每天 5 小餐', english: '5 small meals per day', japanese: '毎日5時間の食事' },
  { chinese: '间歇性禁食', english: 'Intermittent Fasting', japanese: '間欠的断食' },
]

// 性别 Gender
export const GENDER: Array<Language> = [
  { chinese: '男', english: 'Male', japanese: '男' },
  { chinese: '女', english: 'Female', japanese: '女' },
]

// 训练方式 Training methods
export const TRAINING_METHODS: Array<Language> = [
  { chinese: '无氧', english: 'Anaerobic', japanese: '無酸素' },
  { chinese: '无氧+有氧', english: 'Anaerobic + Cardio', japanese: '無酸素+有酸素' },
  { chinese: '仅餐饮计划', english: 'Meal plan only', japanese: '食事プランのみ' },
  { chinese: '无器械', english: 'No equipment', japanese: 'デバイスなし' },
]

// 训练目标 Training objectives
export const TRAINING_OBJECTIVES: Array<Language> = [
  { chinese: '增重', english: 'Weight gain', japanese: 'ぞうか' },
  { chinese: '减肥', english: 'Lose weight', japanese: 'ダイエット' },
  { chinese: '塑形', english: 'shaping', japanese: 'かながた' },
]

// 训练水平 Training level
export const TRAINING_LEVEL: Array<Language> = [
  { chinese: '初学者', english: 'Beginner', japanese: '初心者' },
  { chinese: '中级', english: 'Intermediate', japanese: '中級' },
  { chinese: '高级', english: 'Advanced', japanese: '高級' },
]

// 邮件语气 Email tone
export const EMAIL_TONE: Array<Language> = [
  { chinese: '正式', english: 'Formal', japanese: '正式' },
  { chinese: '非正式', english: 'Informal', japanese: '非公式' },
  { chinese: '友好', english: 'Friendly', japanese: '友好的' },
  { chinese: '专业', english: 'Professional', japanese: '専門' },
  { chinese: '命令', english: 'Order', japanese: 'コマンド' },
  { chinese: '请求', english: 'Request', japanese: 'リクエスト' },
  { chinese: '感激', english: 'Grateful', japanese: 'に感謝' },
  { chinese: '道歉', english: 'Apologize', japanese: 'あやまる' },
  { chinese: '紧急', english: 'Urgent', japanese: '緊急' },
  { chinese: '轻松', english: 'Easy', japanese: 'ゆとりがある' },
]

export const LANGUAGE_LIBRARY = {
  "chinese": {
    '确认': '确认',
    '更多请访问': '更多请访问',
    '搜索工具已删除': '搜索工具已删除',
    '搜索工具已禁用': '搜索工具已禁用',
    '分享码错误': '分享码错误',
    '未知错误': '未知错误',
    '网络错误': '网络错误',
    '请联系': '请联系',
    '生成': '生成',
    '取消': '取消',
    '更新': '更新',
    '重新生成': '重新生成',
    '重置': '重置',
    '选择': '选择',
    '账户凭证丢失，请': '账户凭证丢失，请',
    '该工具已禁用/删除': '该工具已禁用/删除',
    '网络错误，请稍后重试': '网络错误，请稍后重试',
    '账户余额不足，创建属于自己的工具': '账户余额不足，创建属于自己的工具',
    '账户总额度已达上限': '账户总额度已达上限',
    '账户日额度已达上限': '账户日额度已达上限',
    '当前无可用通道': '当前无可用通道',
    '不支持当前API功能': '不支持当前API功能',
    '设置': '设置',
    '保存': '保存',
    '打开': '打开',
    '该免费工具在本小时的额度已达上限,请访问': '该免费工具在本小时的额度已达上限,请访问',
    '生成属于自己的工具': '生成属于自己的工具',
    '内容由AI生成，仅供参考': '内容由AI生成，仅供参考',
    '关于 AI 文案助手': '关于 AI 文案助手',
    '新增分类': '新增分类',
    '使用你习惯的语言描述分类，AI会自动为你翻译。': '使用你习惯的语言描述分类，AI会自动为你翻译。',
    '请输入内容': '请输入内容',
    '分类添加成功': '分类添加成功',
    '请输入分类名称': '请输入分类名称',
    '自定义': '自定义',
    '自定义模板': '自定义模板',
    '请输入工具名称': '请输入工具名称',
    '请输入工具描述': '请输入工具描述',
    '请选择工具分类': '请选择工具分类',
    '请输入提示语': '请输入提示语',
    '名称': '名称',
    '描述': '描述',
    '分类': '分类',
    '图标': '图标',
    '提示语': '提示语',
    '预设': '预设',
    '点击右侧上传图片，或者': '点击右侧上传图片，或者',
    '点击这里': '点击这里',
    '使用AI根据名称生成图标。': '使用AI根据名称生成图标。',
    '请在下方输入你的提示语，使用时输入的内容将被追加到这个提示语后面': '请在下方输入你的提示语，使用时输入的内容将被追加到这个提示语后面',
    '自定义分类': '自定义分类',
    '新增分类失败': '新增分类失败',
    '新增模板失败': '新增模板失败',
    '图片上传失败': '图片上传失败',
    '图片生成失败': '图片生成失败',
    '当前工具已存在': '当前工具已存在',
    '工具名称翻译丢失，请重新提交表单': '工具名称翻译丢失，请重新提交表单',
    '工具描述翻译丢失，请重新提交表单': '工具描述翻译丢失，请重新提交表单',
    '删除模板': '删除模板',
    '是否确认删除此模版，所有使用此模版的结果记录都会被删除。': '是否确认删除此模版，所有使用此模版的结果记录都会被删除。',
    '确定': '确定',
    '删除成功': '删除成功',
    '删除分类': '删除分类',
    '是否确认删除此分类，此分类下的模版都会被删除。': '是否确认删除此分类，此分类下的模版都会被删除。',
    '当前分类已存在': '当前分类已存在',
    '当前选择的分类不存在，请刷新页面重新选择分类': '当前选择的分类不存在，请刷新页面重新选择分类'
  },
  "english": {
    '确认': 'Confirm',
    '更多请访问': 'For more information, please visit',
    '搜索工具已删除': 'Search tool has been deleted',
    '搜索工具已禁用': 'Search tool has been disabled',
    '分享码错误': 'Invalid sharing code',
    '未知错误': 'unknown error',
    '网络错误': 'network error',
    '请联系': 'Please contact',
    '生成': 'Generate',
    '更新': 'Update',
    '重置': 'Reset',
    '取消': 'Cancel',
    '选择': 'Select',
    '账户凭证丢失，请': 'Account voucher lost, please',
    '该工具已禁用/删除': 'This tool has been disabled/removed',
    '网络错误，请稍后重试': 'Network error, please try again later',
    '账户余额不足，创建属于自己的工具': 'Insufficient account balance, create your own tool',
    '账户总额度已达上限': 'The total account limit has reached the upper limit',
    '账户日额度已达上限': 'The daily limit of the account has been reached',
    '当前无可用通道': 'There are currently no available channels',
    '不支持当前API功能': 'Not supporting the current API functionality',
    '保存': 'Save',
    '已复制至剪切板': 'Copied to clipboard',
    '该免费工具在本小时的额度已达上限,请访问': "This free tool's hour quota reached maximum limit. Please view",
    '生成属于自己的工具': 'to create your own tool',
    '内容由AI生成，仅供参考': 'Content generated by AI, for reference only',
    '关于 AI 文案助手': 'About AI Copywriting Assistant',
    '新增分类': 'Add Category',
    '使用你习惯的语言描述分类，AI会自动为你翻译。': "Describe the category in the language you're most comfortable with, and AI will automatically translate them.",
    '请输入内容': 'Please enter the content',
    '分类添加成功': 'Category added successfully',
    '请输入分类名称': 'Please enter the category name',
    '自定义': 'Custom',
    '自定义模板': 'Custom Template',
    '请输入工具名称': 'Please enter the tool name',
    '请输入工具描述': 'Please enter tool description',
    '请选择工具分类': 'Please select tool category',
    '请输入提示语': 'Please enter a prompt',
    '名称': 'Name',
    '描述': 'Description',
    '分类': 'Category',
    '图标': 'Icon',
    '提示语': 'Prompt',
    '预设': 'Preset',
    '点击右侧上传图片，或者': 'Click on the right to upload an image, or',
    '点击这里': 'Click here',
    '使用AI根据名称生成图标。': 'Use AI to generate an icon based on the name.',
    '请在下方输入你的提示语，使用时输入的内容将被追加到这个提示语后面': 'Please enter your prompt below. The input content will be appended to this prompt when used',
    '自定义分类': 'Custom category',
    '新增分类失败': 'Failed to add category',
    '新增模板失败': 'Failed to add template',
    '图片上传失败': 'Image upload failed',
    '图片生成失败': 'Image generation failed',
    '当前工具已存在': 'Current tool already exists',
    '工具名称翻译丢失，请重新提交表单': 'The translation of the tool name is missing. Please resubmit the form',
    '工具描述翻译丢失，请重新提交表单': 'The translation of the tool description is missing. Please resubmit the form',
    '删除模板': 'Delete Template',
    '是否确认删除此模版，所有使用此模版的结果记录都会被删除。': 'Are you sure to delete this template? All result records using this template will be deleted.',
    '确定': 'Confirm',
    '删除成功': 'Delete successfully',
    '删除分类': 'Delete Category',
    '是否确认删除此分类，此分类下的模版都会被删除。': 'Are you sure to delete this category? All templates under this category will be deleted.',
    '当前分类已存在': 'Current category already exists',
    '当前选择的分类不存在，请刷新页面重新选择分类': 'The currently selected category does not exist. Please refresh the page and select a new categorys'
  },
  "japanese": {
    '确认': '確認',
    '更多请访问': '詳細は',
    '搜索工具已删除': '検索ツールが削除されました',
    '搜索工具已禁用': '検索ツールが無効化されました',
    '分享码错误': 'シェアコードが間違っています',
    '未知错误': '不明なエラー',
    '网络错误': 'ネットワークエラー',
    '请联系': 'サポートまでご連絡ください',
    '取消': 'キャンセル',
    '更新': '更新',
    '重新生成': '再生成',
    '重置': 'リセット',
    '选择': '選択',
    '账户凭证丢失，请': 'アカウント証明書を紛失しました',
    '该工具已禁用/删除': 'このツールは無効/削除されました',
    '网络错误，请稍后重试': 'ネットワークエラー、後で再試行してください',
    '账户余额不足，创建属于自己的工具': 'アカウント残高が不足しているため、独自のツールを作成する',
    '账户总额度已达上限': '口座総額度が上限に達しました',
    '账户日额度已达上限': '口座日限度額が上限に達しました',
    '当前无可用通道': '現在使用可能なチャネルはありません',
    '不支持当前API功能': '現在のAPI機能はサポートされていません',
    '保存': '保存',
    '已复制至剪切板': 'クリップボードにコピーされました',
    '复制代码': 'コードのコピー',
    '打开': '開く',
    '该免费工具在本小时的额度已达上限,请访问': 'この無料ツールは、この時間の限度に達しています。',
    '生成属于自己的工具': '独自のツールを生成する',
    '内容由AI生成，仅供参考': 'コンテンツは参照用にAIによって生成される',
    '关于 AI 文案助手': 'AIファイルアシスタントについて',
    '新增分类': '新しいカテゴリを追加',
    '使用你习惯的语言描述分类，AI会自动为你翻译。': 'いつもの言語でカテゴリを記述してください。AIが自動的に翻訳します。',
    '请输入内容': '内容を入力してください',
    '分类添加成功': 'カテゴリが正常に追加されました',
    '请输入分类名称': 'カテゴリ名を入力してください',
    '自定义': 'カスタマイズ',
    '自定义模板': 'カスタムテンプレート',
    '请输入工具名称': 'ツール名を入力してください',
    '请输入工具描述': 'ツールの説明を入力してください',
    '请选择工具分类': 'ツールのカテゴリを選択してください',
    '请输入提示语': 'プロンプトを入力してください',
    '名称': '名前',
    '描述': '説明',
    '分类': 'カテゴリ',
    '图标': 'アイコン',
    '提示语': 'プロンプト',
    '预设': 'プリセット',
    '点击右侧上传图片，或者': '右側をクリックして画像をアップロードするか、',
    '点击这里': 'ここをクリックしてAIにより名前からアイコンを生成してください。',
    '使用AI根据名称生成图标。': 'AIを使って名前からアイコンを生成してください。',
    '请在下方输入你的提示语，使用时输入的内容将被追加到这个提示语后面': '以下にプロンプトを入力してください。使用時に入力内容がこのプロンプトに追加されます。',
    '自定义分类': 'カスタムカテゴリ',
    '新增分类失败': 'カテゴリの追加に失敗しました',
    '新增模板失败': 'テンプレートの追加に失敗しました',
    '图片上传失败': '画像のアップロードに失敗しました',
    '图片生成失败': '画像の生成に失敗しました',
    '当前工具已存在': '既にこのツールが存在しています',
    '工具名称翻译丢失，请重新提交表单': 'ツール名の翻訳が失われました。再度フォームを送信してください',
    '工具描述翻译丢失，请重新提交表单': 'ツール説明の翻訳が失われました。再度フォームを送信してください',
    '删除模板': 'テンプレートを削除',
    '是否确认删除此模版，所有使用此模版的结果记录都会被删除。': 'このテンプレートを削除すると、このテンプレートを使用した全ての結果記録も削除されますが、よろしいですか？',
    '确定': '確認',
    '删除成功': '削除成功',
    '删除分类': 'カテゴリを削除',
    '是否确认删除此分类，此分类下的模版都会被删除。': 'このカテゴリを削除すると、このカテゴリ内のテンプレートも削除されますが、よろしいですか？',
    '当前分类已存在': '現在のカテゴリが既に存在しています',
    '当前选择的分类不存在，请刷新页面重新选择分类': '現在選択されている分類は存在しません。ページを更新して分類を再選択してください'
  }
}