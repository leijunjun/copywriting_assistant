import { IndustryType, getToolPresets } from '@/constant/industry';
import { getProhibitedWordsDetailedPrompt } from '@/config/prohibited-words-config';

interface IToolParameter {
    content: string, tone: string, keywords: string, emailContext: string,
    audience: string, language: string, type: string, requestForReply: string,
    style: string; question: string, gender: string, emailTopic: string,
    method: string, goal: string, level: string, sentence: string, postContent: string,
    jobName: string, jobDescription: string, context: string, yourThoughts: string,
    cookingAbility: string, ingredientsAndCookwares: string, resumeContent: string,
    position: string, yearsOfExperience: string, interestsAndGoals: string,
    gameType: string, topic: string, dietaryFrequency: string, workLog: string,
    calorieGoal: string, dietaryPreferencesAndRestrictions: string, videoContent: string,
    commentWhichYouWillReply: string, momentsContent: string, replyTone: string,
    activityTheme: string, activityPurpose: string, activityVenue: string, festivalType: string,
    role: string, background: string, purpose: string,
    promotionGoal: string, customerGroup: string, productHighlights: string, restrictions: string,
    articlePurpose: string, customerPainPoints: string, conversionAction: string, 
    additionalContent: string, articleStyle: string,
    industryPosition: string, targetAudience: string, namingPreference: string, avoidContent: string,
    persona: string, product: string, discussionSubject: string,
}

export const toolParameter: { [key: string]: (params: IToolParameter) => Array<{ role: string, content: string }> } = {
    'Grammar Checker': (params: Pick<IToolParameter, 'content' | 'type' | 'language'>) => {
        return [
            {
                role: 'user',
                content: `Perform a grammar check to the user input text, identifying errors and providing suggestions for improvement.
The type of the text is ${params.type}.
The language of input text is ${params.language}, return the result language must match the origin language.

Input:

${params.content}`
            }
        ]
    },

    'Book Title Generator': (params: Pick<IToolParameter, 'tone' | 'audience' | 'language' | 'content'>) => {
        return [
            {
                role: 'user',
                content: `Generate 5 book titles related to the summary from user messages.
Reply directly without any explanations.

Requirements:
Tone: ${params.tone}
Audience: ${params.audience}
Language: ${params.language}
Format: plain text line by line without any formatting

------

Input:

${params.content}
`
            }
        ]
    },

    'Video Title Generator': (params: Pick<IToolParameter, 'keywords' | 'audience' | 'language' | 'videoContent' | 'tone'>) => {
        return [
            {
                role: 'user',
                content: `You act as a top Youtube creator to help people generate a title of their new video that can catch eyes easily.

REQUIREMENTS:
* You MUST according to the video content and keywords to generate a title in 70 chars.
* The tone of the generated content MUST be ${params.tone}.
* The audience of this video is ${params.audience}.
* Always return result in ${params.language} with plain text, DO NOT add any formatting.

EXAMPLE:
Input:
Content: i try to using ai generate a music
Keywords and Clips: AI, music, compare, tools, apps, platforms

Output:
What's the best AI generated music platform, I tried these...

------

Input:

Content: ${params.videoContent}
Keywords and Clips: ${params.keywords}
`
            }
        ]
    },

    'Long-tail Keywords Generator': (params: Pick<IToolParameter, 'audience' | 'language' | 'content'>) => {
        return [
            {
                role: 'user',
                content: `You are an Internet marketing expert who is good at getting more traffic for customers through SEO.
Assist user to generate high quality SEO long tail keywords description.

REQUIREMENTS:
* Adding auxiliary long-tail keywords to the keywords inputed by the user,
    MUST conform to the characteristics of the original content.
* The tone of the generated content MUST be targeted at ${params.audience}.
* Always translate the result into ${params.language}.
* Return 5 results in plain text line by line,
    DON'T add any formatting and any list number.

EXAMPLE:
Input:
AI generated music

Output:
How to use AI generated music
AI generated music apps
What is AI generated music
How much cost AI generated music
AI generated music platforms

------

Input:

${params.content}
`
            }
        ]
    },

    'Expert Explanation': (params: Pick<IToolParameter, 'content' | 'language'>) => {
        return [
            {
                role: 'user',
                content: `Explain it with gradually increasing complexity in 4 levels, return in ${params.language}:

${params.content}
`
            }
        ]
    },

    'Task Decompose': (params: Pick<IToolParameter, 'content' | 'language'>) => {
        return [
            {
                role: 'user',
                content: `Read the text carefully, synthesize the information fragments into a task list with better expression,
return a markdown result in ${params.language}.
Never add explanations and greetings.
Example:
- Task 1
- Task 2
- Task n
...

------

Input:

${params.content}
`
            }
        ]
    },

    'Sentence Rewriting': (params: Pick<IToolParameter, 'content' | 'tone' | 'language'>) => {
        return [
            {
                role: 'user',
                content: `Please take the following sentences and rewrite their tone to ${params.tone} in your own words.
Always return as plain text directly in ${params.language} without any explanations.
Input:

${params.content}
`
            }
        ]
    },

    'Tone Analysis': (params: Pick<IToolParameter, 'content' | 'language'>) => {
        return [
            {
                role: 'user',
                content: `Generate a analysis report of the tone based on the input text.
You must make the report concise and easy understand.
The report language must be ${params.language} and the format must be plain text.

Input:

${params.content}
`
            }
        ]
    },

    'Article Title Generator': (params: Pick<IToolParameter, 'content' | 'language' | 'type' | 'keywords' | 'style'>) => {
        return [
            {
                role: 'user',
                content: `Generate 5 high quality titles based on these requirements as an expert writer:
Format: plain text line by line, never add explanations and greetings
Type: ${params.type}
Style: ${params.style}
Language: **${params.language}**
Keywords: ${params.keywords}
Content:

${params.content}`
            }
        ]
    },

    'SEO Title Generator': (params: Pick<IToolParameter, 'content' | 'language' | 'style'>) => {
        return [
            {
                role: 'user',
                content: `Generate 5 SEO titles based on these requirements:
Format: plain text line by line, without explanations and greetings
Style: ${params.style}
Language: ${params.language}

Input:

${params.content}`
            }
        ]
    },

    'SEO Description Generator': (params: Pick<IToolParameter, 'content' | 'language'>) => {
        return [
            {
                role: 'user',
                content: `Generate 5 high quality descriptions for SEO limited in 160 words based on these requirements:
Format: plain text line by line, without explanations and greetings
Language: ${params.language}

Input:

${params.content}`
            }
        ]
    },

    'Content Summary': (params: Pick<IToolParameter, 'content' | 'language'>) => {
        return [
            {
                role: 'user',
                content: `Generate a concise summary for the input text in ${params.language}, return in plain text:

${params.content}
`
            }
        ]
    },

    'Twitter post generation': (params: Pick<IToolParameter, 'content' | 'language' | 'tone'>) => {
        return [
            {
                role: 'user',
                content: `Generate a Twitter platform style post in your own words based on the requirements.
Language: ${params.language}
Format: Plain text without explanations and notes
Tone: ${params.tone}

Input draft:

${params.content}
`
            }
        ]
    },

    'Facebook post generation': (params: Pick<IToolParameter, 'content' | 'language' | 'tone'>) => {
        return [
            {
                role: 'user',
                content: `Generate a Facebook platform style post in your own words based on the requirements.
Language: ${params.language}
Format: Plain text without explanations and notes
Tone: ${params.tone}

Input draft:

${params.content}
`
            }
        ]
    },

    'Instagram post generation': (params: Pick<IToolParameter, 'content' | 'language' | 'tone'>) => {
        return [
            {
                role: 'user',
                content: `Generate a Instagram platform style post in your own words based on the requirements.
Language: ${params.language}
Format: Plain text without explanations and notes
Tone: ${params.tone}

Input draft:

${params.content}
`
            }
        ]
    },

    'Xiaohongshu post generation': (params: Pick<IToolParameter, 'role' | 'background' | 'purpose' | 'language' | 'tone'> & { mimicSample?: string, batchIndex?: number, batchTotal?: number }) => {
        // Tone映射表 - 将英文tone值转换为中文显示
        const toneMapping: { [key: string]: string } = {
            'Emotional Resonance (focus on empathy and healing)': '情绪共鸣型（主打共情与治愈）',
            'Practical Value (emphasizing altruism and a sense of gain)': '实用干货型（强调利他与获得感）',
            'Exaggerated Contrast (creates conflict and drama)': '夸张反差型（制造冲突与戏剧感）',
            'Relaxing & Healing (creates an ideal life atmosphere)': '轻松治愈型（营造理想生活氛围）',
            'Trending Topic Ride (traffic leverage & emotional resonance)': '热点借势型（关联热点事件+情绪共振）'
        };
        
        const displayTone = toneMapping[params.tone] || params.tone;
        
        const mimicAppend = (params as any).tone === 'mimic_by_sample' && (params as any).mimicSample
            ? `\n请参考以下样本进行文风仿写（仅模仿风格，不抄袭内容）：\n样本：${(params as any).mimicSample}\n`
            : '';

        // 批量生成提示
        const batchHint = params.batchIndex && params.batchTotal && params.batchTotal > 1
            ? `\n【批量生成说明】这是批量生成的第${params.batchIndex}/${params.batchTotal}篇笔记。请保持与其他篇目完全相同的质量标准：
1. 标签数量必须保持4-6个，不能减少
2. emoji使用必须丰富，与单篇生成保持相同密度
3. 细节描述必须充分，有情绪、有实用价值
4. 字数控制在300-600字，短段落划分
5. 在具体案例、表达方式上有所差异，避免内容雷同
6. 每篇都应该是高质量、有价值的独立内容，不能因为批量生成而降低标准\n`
            : '';

        return [
            {
                role: 'user',
                content: `你是一个写作经验15年的编辑，现在在运营小红书自媒体账号，你的文字有温度有灵魂，根据以下信息生成一个小红书平台风格的帖子。

角色：${params.role}
背景：${params.background}
目的：${params.purpose}
语气：${displayTone}
语言：${params.language}
要求：
-标题吸睛，带关键词（如"学生党闭眼入"）
-字数控制在300–600字，短段落划分，穿插丰富的emoji和感叹号增加氛围感（emoji使用要充足，不能吝啬）
-内容符合角色设定和背景情况，真实感强，有细节、有情绪、有实用价值（细节描述要充分）
-结尾可引导互动（如"你们有类似经历吗""求推荐更多好物"）
-匹配4-6个相关标签（必须达到这个数量范围）
-规避广告法中禁止的词语和表达方式
-无需解释和注释
${mimicAppend}${batchHint}请直接生成帖子内容：`
            }
        ]
    },

    'Weibo post generation': (params: Pick<IToolParameter, 'content' | 'language' | 'tone'>) => {
        return [
            {
                role: 'user',
                content: `Generate a 微博 platform style post in your own words based on the requirements.
Language: ${params.language}
Format: Plain text without explanations and notes
Tone: ${params.tone}

Input draft:

${params.content}
`
            }
        ]
    },

    'TikTok post generation': (params: Pick<IToolParameter, 'content' | 'language' | 'tone'>) => {
        return [
            {
                role: 'user',
                content: `Generate a 抖音短视频脚本 platform style video script in your own words based on the requirements.
Language: ${params.language}
Format: Plain text without explanations and notes
Tone: ${params.tone}

Input draft:

${params.content}
`
            }
        ]
    },

    'TikTok-post-generation': (params: Pick<IToolParameter, 'promotionGoal' | 'customerGroup' | 'productHighlights' | 'restrictions' | 'language' | 'tone'>) => {
        return [
            {
                role: 'user',
                content: `你是一个创作经验15年的编剧，在4A广告公司工作过8年，现在在运营抖音自媒体账号，根据以下信息生成一个抖音爆款短视频脚本，要求按照指定结构输出。

宣传目标：${params.promotionGoal}
客群：${params.customerGroup}
所在行业：根据用户行业信息自动识别
产品/服务亮点：${params.productHighlights}
限制及禁忌：${params.restrictions}
语气：${params.tone}
语言：${params.language}

要求：
- 使用抖音平台的语言风格和表达方式（网感、口语化、有节奏感）
- 内容要符合角色设定和背景情况，要有细节体现
- 严格按照以下结构输出：
  * 黄金3秒：强钩子开场（决定是否被划走）
  * 核心支撑：围绕核心卖点展开，抛出3-4个爆点信息点设计，节凑紧凑；爆点信息点多用展示产品/服务效果（前后对比、顾客反应）、强调稀缺性或紧迫感（“仅限前50名”“今天最后一天”）、植入信任背书（“开了8年”“服务10000+顾客”）、场景化演绎（如“打工人午休1小时，来这放松一下”），一句一行
  * 白金结尾：强引导转化，明确告诉用户下一步做什么
- 格式：纯文本，精炼短句型，疑问+感叹，超强吸睛，无需解释和注释

请直接生成抖音短视频脚本：`
            }
        ]
    },

    'Threads post generation': (params: Pick<IToolParameter, 'content' | 'language' | 'tone'>) => {
        return [
            {
                role: 'user',
                content: `Generate a Threads platform style post in your own words based on the requirements.
Language: ${params.language}
Format: Plain text without explanations and notes
Tone: ${params.tone}

Input draft:

${params.content}`
            }
        ]
    },

    'Q&A Generation': (params: Pick<IToolParameter, 'context' | 'language' | 'style' | 'question'>) => {
        return [
            {
                role: 'user',
                content: `Generate a Q&A pair based on these requirements.
Language: ${params.language}
Format: Plain text without explanations, greetings and notes
Style: ${params.style}
Context:

${params.context}

Input question:

${params.question}
`
            }
        ]
    },

    'Sentence continuation': (params: Pick<IToolParameter, 'sentence' | 'language'>) => {
        return [
            {
                role: 'user',
                content: `Imitate the tone and continue the input sentence in ${params.language} without explantions, limited in 200 words.
Input:
${params.sentence}`
            }
        ]
    },

    'Sentence expansion': (params: Pick<IToolParameter, 'sentence' | 'language'>) => {
        return [
            {
                role: 'user',
                content: `Imitate the tone and expand the short sentence into long in ${params.language} without explantions, limited in 200 words.
Input:
${params.sentence}`
            }
        ]
    },

    'Weekly Fitness Plan Generator': (params: Pick<IToolParameter, 'language' | 'gender' | 'method' | 'goal' | 'level'>) => {
        return [
            {
                role: 'user',
                content: `Based on the following information to generate a one-week workout plan for user, return directly without explanations.
Gender: ${params.gender}
Training method: ${params.method}
Training Goals: ${params.goal}
Strength level: ${params.level}
Language: ${params.language}`
            }
        ]
    },

    'Social Media Naming Suite': (params: Pick<IToolParameter, 'industryPosition' | 'targetAudience' | 'style' | 'namingPreference' | 'avoidContent' | 'language'>) => {
        return [
            {
                role: 'user',
                content: `你是一个策划经验15年的广告人，在4A广告公司工作过8年，现在在运营自媒体矩阵，按照以下要求为新起的自媒体矩阵账号设计名称和配套简介。

行业定位：${params.industryPosition}
目标受众：${params.targetAudience}
名称要求：
- 3-8个字,名称风格${params.namingPreference}
简介要求：
- 每条简介控制在50字内,${params.style}风格,精致短语,数据化体现服务能力、准确表达出解决的痛点和提供价值,${params.avoidContent}
输出要求：
- 名称+简介组合，提供 2 组不同风格，分别用"A方案"和"B方案"表示，并总结出每组方案的亮点和特点

Language: ${params.language}
Format: Markdown`
            }
        ]
    },

    'Daily Report Generation': (params: Pick<IToolParameter, 'content' | 'language'>) => {
        return [
            {
                role: 'user',
                content: `Write a professional daily work report in your own words based on these requirements.
Expand the work clips to a detailed report.
Language: ${params.language}
Format: Markdown without explanations and notes

Input:

${params.content}`
            }
        ]
    },

    'Weekly Report Generation': (params: Pick<IToolParameter, 'content' | 'language'>) => {
        return [
            {
                role: 'user',
                content: `Write a professional weekly work report in your own words based on these requirements.
Expand the work clips to a detailed report.
Language: ${params.language}
Format: Markdown without explanations and notes

Input:

${params.content}`
            }
        ]
    },

    'Monthly Report Generation': (params: Pick<IToolParameter, 'content' | 'language'>) => {
        return [
            {
                role: 'user',
                content: `Write a professional monthly work report in your own words based on these requirements.
Expand the work clips to a detailed report.
Language: ${params.language}
Format: Markdown without explanations and notes

Input:

${params.content}
`
            }
        ]
    },

    'Quick response': (params: Pick<IToolParameter, 'question' | 'audience' | 'language'>) => {
        return [
            {
                role: 'user',
                content: `Answer the question based on the requirements.
Language: ${params.language}
Audience: ${params.audience}
Format: Plain text without explanations and notes
Question: ${params.question}`
            }
        ]
    },

    'About us Generation': (params: Pick<IToolParameter, 'content' | 'language'>) => {
        return [
            {
                role: 'user',
                content: `Generate a high quality About page content in your own words based on the requirements.
Language: ${params.language}
Format: Markdown without explanations and notes

Content draft:

${params.content}`
            }
        ]
    },

    'Meeting Summary': (params: Pick<IToolParameter, 'content' | 'language'>) => {
        return [
            {
                role: 'user',
                content: `Summarizing the main points of the meeting based on the requirements.
Language: ${params.language}
Format: Markdown without explanations and notes

Input:

${params.content}`
            }
        ]
    },

    'Text abbreviation': (params: Pick<IToolParameter, 'content' | 'language'>) => {
        return [
            {
                role: 'user',
                content: `Reduce the input text to a short sentence based on the requirements.
Language: ${params.language}
Format: Plain text without explanations and notes
Input:

${params.content}
`
            }
        ]
    },

    'Personal Introduction Generation': (params: Pick<IToolParameter, 'resumeContent' | 'language'>) => {
        return [
            {
                role: 'user',
                content: `Generate a concise, professional, self-introduction opening for an interview based on these requiments.
Language: ${params.language}
Format: Plain text without explanations and notes

Resume Input:

${params.resumeContent}
`
            }
        ]
    },

    'Interview Q&A Generation': (params: Pick<IToolParameter, 'jobName' | 'jobDescription' | 'language'>) => {
        return [
            {
                role: 'user',
                content: `Generate 5 interview questions and their answers based on the following information.
Language: ${params.language}
Job name: ${params.jobName}
Format: Plain text without explanations and notes

Job description:

${params.jobDescription}
`
            }
        ]
    },

    'Supper Plan Generator': (params: Pick<IToolParameter, 'cookingAbility' | 'ingredientsAndCookwares' | 'language'>) => {
        return [
            {
                role: 'user',
                content: `Design a dinner arrangement for me tonight based on the information below.
Language: ${params.language}
Cooking ability: ${params.cookingAbility}

Ingredients and cookware owned:
${params.ingredientsAndCookwares}`
            }
        ]
    },

    'Career Development Planning': (params: Pick<IToolParameter, 'position' | 'yearsOfExperience' | 'interestsAndGoals' | 'language'>) => {
        return [
            {
                role: 'user',
                content: `Generate a Simple Career Development Plan in your own words based on these requirements.
Language: ${params.language}
Format: Markdown without explanations and notes
Position: ${params.position}
Years of experience: ${params.yearsOfExperience}
Interests and goals: ${params.interestsAndGoals}`
            }
        ]
    },

    'Player Name Generator': (params: Pick<IToolParameter, 'keywords' | 'gameType' | 'language'>) => {
        return [
            {
                role: 'user',
                content: `Generate 10 nicknames for my game characters based on these requirements.
Language: ${params.language}
Format: Plain text line by line without explanations and notes
Game Style: ${params.gameType}
Keywords: ${params.keywords}`
            }
        ]
    },

    'Blog Outline': (params: Pick<IToolParameter, 'topic' | 'language'>) => {
        return [
            {
                role: 'user',
                content: `Generate a blog outline for the topic.
Language: ${params.language}
Format: Markdown without explanations and notes
Topic: ${params.topic}`
            }
        ]
    },

    'Weekly Meal Plan Generator': (params: Pick<IToolParameter, 'dietaryFrequency' | 'calorieGoal' | 'dietaryPreferencesAndRestrictions' | 'language'>) => {
        return [
            {
                role: 'user',
                content: `Generate a weekly meal plan based on the requirements.
Language: ${params.language}
Format: Markdown without explanations and notes
Dietary Frequency: ${params.dietaryFrequency}
Calorie goal: ${params.calorieGoal}
Dietary preferences and restrictions: ${params.dietaryPreferencesAndRestrictions}`
            }
        ]
    },

    'Text Conversion to Table': (params: Pick<IToolParameter, 'content' | 'language'>) => {
        return [
            {
                role: 'user',
                content: `Summarize key points from the input into a single table based on these requirements.
Language: ${params.language}
Format: Table, CSV format, without explanations and notes

Input:

${params.content}
`
            }
        ]
    },

    'Video Script Outline': (params: Pick<IToolParameter, 'topic' | 'language'>) => {
        return [
            {
                role: 'user',
                content: `Generate a video script outline for the topic.
Language: ${params.language}
Format: Markdown without explanations and notes
Topic: ${params.topic}`
            }
        ]
    },

    'Video Description': (params: Pick<IToolParameter, 'keywords' | 'audience' | 'language' | 'videoContent' | 'tone'>) => {
        return [
            {
                role: 'user',
                content: `Generate a short video description in your own words based on the requirements.
Language: ${params.language}
Format: Plain text without explanations and notes
Tone: ${params.tone}
Audience: ${params.audience}
Keywords: ${params.keywords}

Video content:

${params.videoContent}
`
            }
        ]
    },

    'Email generation': (params: Pick<IToolParameter, 'emailTopic' | 'tone' | 'language'>) => {
        return [
            {
                role: 'user',
                content: `You are a helpful mail assistant which can help users write a high quality Email.
Write an Email in about 200 words based on user input with plain text format.
Always use ${params.language} as native speaker and write in ${params.tone} tone.

User input:

${params.emailTopic}
`
            }
        ]
    },

    'Email reply generation': (params: Pick<IToolParameter, 'emailContext' | 'requestForReply' | 'tone' | 'language'>) => {
        return [
            {
                role: 'user',
                content: `You are a helpful mail assistant which can help users write a short and concise Email reply.
Write an short Email reply based on user input with plain text format.
Always use ${params.language} as native speaker and write in ${params.tone} tone.

Email Context:

${params.emailContext}

Content should include in reply:

${params.requestForReply}
`
            }
        ]
    },

    'Comment generation': (params: Pick<IToolParameter, 'postContent' | 'yourThoughts' | 'tone' | 'language'>) => {
        return [
            {
                role: 'user',
                content: `You are a helpful comment assistant which can help users write a high quality comment for social media or other platforms.
Write an comment based on user input with plain text format.
Always use ${params.language} as native speaker and write in ${params.tone} tone.

Origin post content:

${params.postContent}

User's thoughts:

${params.yourThoughts}
`
            }
        ]
    },

    'Comment reply generation': (params: Pick<IToolParameter, 'commentWhichYouWillReply' | 'postContent' | 'yourThoughts' | 'tone' | 'language'>) => {
        return [
            {
                role: 'user',
                content: `You are a helpful comment assistant which can help users write a high quality comment reply for social media or other platforms.
Write an comment reply based on user input with plain text format.
Always use ${params.language} as native speaker and write in ${params.tone} tone.

Origin post content:

${params.postContent}

Comment which you will reply:

${params.commentWhichYouWillReply}

User's thoughts:

${params.yourThoughts}
`
            }
        ]
    },

    'WeChat Moments Reply': (params: Pick<IToolParameter, 'momentsContent' | 'replyTone' | 'language'>) => {
        return [
            {
                role: 'user',
                content: `You are a helpful WeChat Moments assistant which can help users write appropriate replies for WeChat Moments content.
Write a reply based on the Moments content with plain text format.
Always use ${params.language} as native speaker and write in ${params.replyTone} tone.

WeChat Moments content:

${params.momentsContent}
`
            }
        ]
    },

    'Festival Activity Planning': (params: Pick<IToolParameter, 'activityTheme' | 'activityPurpose' | 'activityVenue' | 'festivalType' | 'language'>) => {
        return [
            {
                role: 'user',
                content: `You are an event creative planner with many years of sales experience, specializing in holiday event planning. Your event plans take into account the human and financial limitations of small and medium-sized enterprises, and provide specific event details and plans based on needs.
Always use ${params.language} as native speaker and return in markdown format.

Festival Type: ${params.festivalType}
Activity Theme: ${params.activityTheme}
Activity Venue: ${params.activityVenue}

Activity Purpose:
${params.activityPurpose}

请提供详细的营销活动创意，包括：
1. 活动创意主题（针对${params.activityVenue}活动，吸引人眼球并结合当下社会热点）
2. 活动目标客群及利益点抓手（基于客户参与的动机）
3. 活动情绪铺垫及高潮点（基于成交导向）
4. 活动核心玩法（考虑场地类型：${params.activityVenue}）
5. 活动推广步骤及时间线（以私域为主，公域为辅）
6. 活动核心指标及成功标准
7. 风险评估及应对方法
`
            }
        ]
    },

    'weixin-generation': (params: Pick<IToolParameter, 'articlePurpose' | 'productHighlights' | 'customerPainPoints' | 'conversionAction' | 'additionalContent' | 'articleStyle' | 'language'>) => {
        // 风格映射 - 将英文值转为中文
        const styleMapping: { [key: string]: string } = {
            'Story-based': '故事型',
            'Practical Tips': '干货型',
            'Store Visit Experience': '探店体验型',
            'Trending Topic': '节日/热点借势型',
            'Founder/Employee Story': '创始人/员工故事型',
            'Comparison Review': '对比测评型'
        };
        
        const displayStyle = styleMapping[params.articleStyle] || params.articleStyle;
        
        // 风格对应的结构指引
        const styleGuidelines: { [key: string]: string } = {
            '故事型': '真实顾客故事 → 痛点放大 → 解决方案 → 自然带出门店',
            '干货型': '提出问题 → 专业解析 → 解决方案 → 门店服务作为"最优解"',
            '探店体验型': '编辑/博主亲身体验 → 全流程记录 → 优缺点客观评价 → 推荐理由',
            '节日/热点借势型': '结合主要节日、换季、开学等节点 → 关联用户需求 → 推出限定服务',
            '创始人/员工故事型': '讲述老板/员工的初心、坚持、专业背景 → 寻求共鸣',
            '对比测评型': '数据+配图+同行多维度对比+表格'
        };
        
        const structureGuide = styleGuidelines[displayStyle] || '';
        
        return [
            {
                role: 'user',
                content: `根据以下信息生成一篇微信公众号软文，要求内容专业、有吸引力，适合微信平台传播。

软文目的：${params.articlePurpose}
核心产品/服务亮点：${params.productHighlights}
客户痛点和需求：${params.customerPainPoints}
期待转化动作：${params.conversionAction}
${params.additionalContent ? `补充内容：${params.additionalContent}` : ''}
风格：${displayStyle}
语言：${params.language}

要求：
- 使用微信公众号的关键写作原则：开头黄金100字：必须抓住注意力（用问题、冲突、金句）；避免硬广感：广告信息占比不超过全文30%，重在"提供价值"；适配阅读场景：用户多在通勤、睡前碎片化阅读，段落短、配图精、重点加粗；
- 根据选择的风格"${displayStyle}"，参考以下结构进行创作：${structureGuide}
- 内容要紧扣软文目的，突出产品/服务亮点
- 深入挖掘客户痛点，提供有价值的解决方案
- 在文章结尾自然引导用户进行转化动作："${params.conversionAction}"
- 内容结构清晰，有逻辑性，具有分享价值
- 格式：纯文本，有爆款标题，段落分明，字数控制在3000字以内，无需解释和注释

请直接生成微信图文内容：`
            }
        ]
    },

    // 小红书热帖生成
    'xiaohongshu-post-generation-product': (params: Pick<IToolParameter, 'persona' | 'background' | 'discussionSubject' | 'style' | 'language'> & { industry?: IndustryType, batchIndex?: number, batchTotal?: number }) => {
        const industry = params.industry || 'general' as IndustryType;
        
        // 处理风格选择：如果为随机选择或为空，则从行业预设中随机选择一个
        let selectedStyle = params.style;
        if (!selectedStyle || selectedStyle === '__random__') {
            const toolPresets = getToolPresets(industry, 'xiaohongshu-post-generation-product');
            if (toolPresets && toolPresets['style']) {
                const stylePresets = toolPresets['style'] as any[];
                if (stylePresets && stylePresets.length > 0) {
                    // 随机选择一个风格
                    const randomIndex = Math.floor(Math.random() * stylePresets.length);
                    const randomStyle = stylePresets[randomIndex];
                    // 如果风格数据有 value 字段，使用 value；否则使用多语言内容
                    selectedStyle = randomStyle.value || randomStyle.chinese || '';
                } else {
                    // 如果没有预设风格，使用默认值
                    selectedStyle = '';
                }
            } else {
                selectedStyle = '';
            }
        }
        
        // 批量生成提示
        const batchHint = params.batchIndex && params.batchTotal && params.batchTotal > 1
            ? `\n【批量生成说明】这是批量生成的第${params.batchIndex}/${params.batchTotal}篇笔记。请保持与其他篇目完全相同的质量标准：
1. 在具体案例、数据、表达方式上有所差异，避免内容雷同
2. 每篇都应该是高质量、有价值的独立内容，不能因为批量生成而降低标准\n`
            : '';
        
        // 获取违禁词规范提示
        const prohibitedWordsHint = getProhibitedWordsDetailedPrompt();
        
        return [
            {
                role: 'user',
                content: `
你是一个小红书爆款文案编辑，擅长撰写不同风格的爆款帖子，现在按以下要求撰写：
- 解析帖子 ${selectedStyle}的情绪和结构
- 采用相似的情绪和结构，不同的表达方式，以${params.persona},${params.background ? `人设背景：${params.background}\n` : ''}的角度来模仿
- 提炼${params.discussionSubject}属性和特征，灵活的结合到帖子中，维持原意但不能生搬原文
- 帖子内容emoji使用必须丰富
- 【字数限制】对标帖子 ${selectedStyle}的字数，绝对不能超过400字，这是硬性要求，必须严格遵守。
- 最终输出要提炼 5-10个标签,不能少于5个,不能多于10个
- 直接输出，无需解释，无需展示中间过程

${prohibitedWordsHint}

语言：${params.language}${batchHint}`
            }
        ];
    },

    'weibo-post-generation': (params: Pick<IToolParameter, 'content' | 'language' | 'tone'>) => {
        return [
            {
                role: 'user',
                content: `Generate a 微博 platform style post in your own words based on the requirements.
Language: ${params.language}
Format: Plain text without explanations and notes
Tone: ${params.tone}

Input draft:

${params.content}
`
            }
        ]
    },

    'article-title-generation': (params: Pick<IToolParameter, 'content' | 'language' | 'tone'>) => {
        return [
            {
                role: 'user',
                content: `Generate an article title based on the requirements.
Language: ${params.language}
Format: Plain text without explanations and notes
Tone: ${params.tone}

Input draft:

${params.content}
`
            }
        ]
    },

    'comment-generation': (params: Pick<IToolParameter, 'postContent' | 'yourThoughts' | 'tone' | 'language'>) => {
        return [
            {
                role: 'user',
                content: `Generate a comment based on the requirements.
Language: ${params.language}
Format: Plain text without explanations and notes
Tone: ${params.tone}

Post content: ${params.postContent}
Your thoughts: ${params.yourThoughts}
`
            }
        ]
    },

    'email-generation': (params: Pick<IToolParameter, 'emailTopic' | 'tone' | 'language'>) => {
        return [
            {
                role: 'user',
                content: `Generate an email based on the requirements.
Language: ${params.language}
Format: Plain text without explanations and notes
Tone: ${params.tone}

Email topic: ${params.emailTopic}
`
            }
        ]
    },

    'email-reply-generation': (params: Pick<IToolParameter, 'emailContext' | 'requestForReply' | 'tone' | 'language'>) => {
        return [
            {
                role: 'user',
                content: `Generate an email reply based on the requirements.
Language: ${params.language}
Format: Plain text without explanations and notes
Tone: ${params.tone}

Email context: ${params.emailContext}
Request for reply: ${params.requestForReply}
`
            }
        ]
    },

    'comment-reply-generation': (params: Pick<IToolParameter, 'commentWhichYouWillReply' | 'postContent' | 'yourThoughts' | 'tone' | 'language'>) => {
        return [
            {
                role: 'user',
                content: `Generate a comment reply based on the requirements.
Language: ${params.language}
Format: Plain text without explanations and notes
Tone: ${params.tone}

Comment to reply: ${params.commentWhichYouWillReply}
Post content: ${params.postContent}
Your thoughts: ${params.yourThoughts}
`
            }
        ]
    },

    'daily-report-generation': (params: Pick<IToolParameter, 'content' | 'language' | 'tone'>) => {
        return [
            {
                role: 'user',
                content: `Generate a daily report based on the requirements.
Language: ${params.language}
Format: Plain text without explanations and notes
Tone: ${params.tone}

Input draft:

${params.content}
`
            }
        ]
    },

    'weekly-report-generation': (params: Pick<IToolParameter, 'content' | 'language' | 'tone'>) => {
        return [
            {
                role: 'user',
                content: `Generate a weekly report based on the requirements.
Language: ${params.language}
Format: Plain text without explanations and notes
Tone: ${params.tone}

Input draft:

${params.content}
`
            }
        ]
    },

    'monthly-report-generation': (params: Pick<IToolParameter, 'content' | 'language' | 'tone'>) => {
        return [
            {
                role: 'user',
                content: `Generate a monthly report based on the requirements.
Language: ${params.language}
Format: Plain text without explanations and notes
Tone: ${params.tone}

Input draft:

${params.content}
`
            }
        ]
    },
}


