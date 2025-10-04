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
    commentWhichYouWillReply: string,
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

    'Xiaohongshu post generation': (params: Pick<IToolParameter, 'content' | 'language' | 'tone'>) => {
        return [
            {
                role: 'user',
                content: `Generate a 小红书 platform style post in your own words based on the requirements.
Language: ${params.language}
Format: Plain text without explanations and notes
Tone: ${params.tone}

Input draft:

${params.content}
`
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

    'Social Media Bio Creation': (params: Pick<IToolParameter, 'keywords' | 'style' | 'language'>) => {
        return [
            {
                role: 'user',
                content: `Generate a high quality Social Media Bio for user in your own words based on these requirments.
Never add explanations and notes.
Language: ${params.language}
Format: Plain text
Style: ${params.style}
Keywords: ${params.keywords}`
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
}


