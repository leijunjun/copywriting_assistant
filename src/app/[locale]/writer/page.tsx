'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '../../../../navigation';
import { ChevronRight, ChevronLeft, Send, Copy, Check, Maximize, Minimize, Edit3, Eye, User, Bot, Save, Trash2, HelpCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '@/lib/auth/auth-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { addTemplate, getAllTemplatesByUserId, deleteTemplate, IWriterTemplate } from '@/app/api/writerTemplates/indexedDB';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function WriterPage() {
  const t = useTranslations();
  const { authState } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  // 三栏状态管理 - 渐进式展开
  const [referenceCollapsed, setReferenceCollapsed] = useState(false);
  const [structureCollapsed, setStructureCollapsed] = useState(true); // 初始折叠
  const [promptCollapsed, setPromptCollapsed] = useState(true); // 反向提示词初始折叠
  const [chatVisible, setChatVisible] = useState(false);
  
  // 全屏状态
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // 流程提示状态
  const [showProcessHint, setShowProcessHint] = useState(false);
  
  // 参考文档预览模式
  const [referencePreviewMode, setReferencePreviewMode] = useState(false);
  
  // 数据状态
  const [referenceText, setReferenceText] = useState('');
  const [structureContent, setStructureContent] = useState('');
  const [promptContent, setPromptContent] = useState('');
  const [systemPrompt, setSystemPrompt] = useState(''); // 存储系统提示语（反向提示词）
  const [currentStage, setCurrentStage] = useState<'stage1' | 'stage2'>('stage1'); // 当前对话阶段
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  
  // 加载状态
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // 按钮显示控制
  const [showStartChatButton, setShowStartChatButton] = useState(false);
  
  // 复制状态
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedStructure, setCopiedStructure] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  
  // 模板相关状态
  const [saveTemplateDialogOpen, setSaveTemplateDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templates, setTemplates] = useState<IWriterTemplate[]>([]);
  const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  
  // 结构解析滚动检测
  const [structureScrollRef, setStructureScrollRef] = useState<HTMLDivElement | null>(null);
  const [isStructureFullyScrolled, setIsStructureFullyScrolled] = useState(false);
  
  // 说明对话框状态
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  
  // 引用
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const isPasteRef = useRef(false); // 用于跟踪是否是粘贴操作
  
  // 获取用户ID（如果未登录，使用浏览器标识）
  const getUserId = (): string => {
    if (authState.user?.id) {
      return authState.user.id.toString();
    }
    // 如果未登录，使用浏览器标识
    let browserId = localStorage.getItem('browserId');
    if (!browserId) {
      browserId = `browser_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('browserId', browserId);
    }
    return browserId;
  };

  // 加载模板列表
  const loadTemplates = async () => {
    try {
      const userId = getUserId();
      const userTemplates = await getAllTemplatesByUserId(userId);
      setTemplates(userTemplates);
    } catch (error) {
      console.error('加载模板失败:', error);
    }
  };

  // 保存模板
  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      alert('请输入模板名称');
      return;
    }
    if (!structureContent.trim()) {
      alert('结构解析内容为空，无法保存');
      return;
    }

    setIsSavingTemplate(true);
    try {
      const userId = getUserId();
      await addTemplate({
        userId,
        name: templateName.trim(),
        structureContent,
        ...(referenceText ? { referenceText } : {}),
      });
      setSaveTemplateDialogOpen(false);
      setTemplateName('');
      alert('模板保存成功');
      await loadTemplates(); // 重新加载模板列表
    } catch (error) {
      console.error('保存模板失败:', error);
      alert('保存模板失败，请稍后重试');
    } finally {
      setIsSavingTemplate(false);
    }
  };

  // 删除模板
  const handleDeleteTemplate = async (id: number) => {
    if (!confirm('确定要删除这个模板吗？')) {
      return;
    }
    try {
      await deleteTemplate(id);
      await loadTemplates(); // 重新加载模板列表
      alert('模板已删除');
    } catch (error) {
      console.error('删除模板失败:', error);
      alert('删除模板失败，请稍后重试');
    }
  };

  // 选择模板
  const handleSelectTemplate = (template: IWriterTemplate) => {
    setStructureContent(template.structureContent);
    setReferenceCollapsed(true); // 折叠参考文档
    setStructureCollapsed(false); // 展开结构解析
    setTemplateSelectorOpen(false);
    // 清空相关状态，让用户可以从模板继续
    setPromptContent('');
    setMessages([]);
    setSystemPrompt('');
    setCurrentStage('stage1');
    setShowStartChatButton(false);
    setChatVisible(false);
  };

  // 页面加载时加载模板列表
  useEffect(() => {
    loadTemplates();
  }, [authState.user?.id]);

  // 检测结构解析内容是否完全滚动到底部
  useEffect(() => {
    if (!structureScrollRef || !structureContent) {
      setIsStructureFullyScrolled(false);
      return;
    }

    const checkScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = structureScrollRef;
      // 如果内容不需要滚动（内容高度小于等于容器高度），则认为已完全展示
      if (scrollHeight <= clientHeight) {
        setIsStructureFullyScrolled(true);
        return;
      }
      // 允许 5px 的误差
      const isAtBottom = scrollHeight - scrollTop - clientHeight <= 5;
      setIsStructureFullyScrolled(isAtBottom);
    };

    // 延迟检查，确保内容已渲染
    const timeoutId = setTimeout(() => {
      checkScroll();
      structureScrollRef.addEventListener('scroll', checkScroll);
    }, 200);

    return () => {
      clearTimeout(timeoutId);
      if (structureScrollRef) {
        structureScrollRef.removeEventListener('scroll', checkScroll);
      }
    };
  }, [structureScrollRef, structureContent]);

  // 自动滚动到底部
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // 进入全屏模式
  const enterFullscreen = async () => {
    try {
      if (pageContainerRef.current) {
        if (pageContainerRef.current.requestFullscreen) {
          await pageContainerRef.current.requestFullscreen();
        } else if ((pageContainerRef.current as any).webkitRequestFullscreen) {
          await (pageContainerRef.current as any).webkitRequestFullscreen();
        } else if ((pageContainerRef.current as any).mozRequestFullScreen) {
          await (pageContainerRef.current as any).mozRequestFullScreen();
        }
        setIsFullscreen(true);
      }
    } catch (error) {
      console.error('进入全屏失败:', error);
      // 如果浏览器 API 失败，使用 CSS 全屏
      setIsFullscreen(true);
    }
  };

  // 退出全屏模式
  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if ((document as any).webkitFullscreenElement) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozFullScreenElement) {
        await (document as any).mozCancelFullScreen();
      }
      setIsFullscreen(false);
    } catch (error) {
      console.error('退出全屏失败:', error);
      // 如果浏览器 API 失败，使用 CSS 退出全屏
      setIsFullscreen(false);
    }
  };

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // 复制内容到剪贴板
  const copyToClipboard = async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('复制失败:', error);
      alert('复制失败，请手动复制');
    }
  };

  // 复制结构解析内容
  const copyStructureContent = async () => {
    if (!structureContent.trim()) return;
    try {
      await navigator.clipboard.writeText(structureContent);
      setCopiedStructure(true);
      setTimeout(() => setCopiedStructure(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
      alert('复制失败，请手动复制');
    }
  };

  // 复制反向提示词内容
  const copyPromptContent = async () => {
    if (!promptContent.trim()) return;
    try {
      await navigator.clipboard.writeText(promptContent);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
      alert('复制失败，请手动复制');
    }
  };

  // 计算字数（中文字符和标点符号）
  const calculateWordCount = (text: string): number => {
    if (!text) return 0;
    // 移除所有空白字符（空格、换行、制表符等）
    return text.replace(/\s/g, '').length;
  };

  // 自动分段函数：在句号、问号、感叹号后自动换行
  const handleAutoSegment = (text: string, previousText: string, isPaste: boolean = false): string => {
    // 如果是粘贴操作，不自动分段，避免干扰用户粘贴的内容
    if (isPaste) {
      return text;
    }

    // 如果文本没有变化或长度减少（删除操作），不进行自动分段
    if (text.length <= previousText.length) {
      return text;
    }

    // 获取新输入的最后一个字符
    const lastChar = text[text.length - 1];
    // 判断是否是分段标点符号（句号、问号、感叹号、中文句号等）
    const segmentPunctuation = /[。！？.!?]$/;
    
    // 如果最后一个字符是分段标点符号
    if (segmentPunctuation.test(lastChar)) {
      // 检查标点符号后面是否已经有换行符
      if (!text.endsWith('\n') && !text.endsWith('\n\n')) {
        // 在标点符号后添加双换行符实现段落分隔
        return text + '\n\n';
      }
    }
    
    return text;
  };

  // 生成反向提示词
  const generateReversePrompt = async (structureText?: string) => {
    // 使用传入的参数或 state 中的值
    const contentToUse = structureText || structureContent;
    
    console.log('generateReversePrompt 被调用');
    console.log('传入的 structureText:', structureText ? `长度 ${structureText.length}` : '未传入');
    console.log('state 中的 structureContent:', structureContent ? `长度 ${structureContent.length}` : '空');
    console.log('实际使用的内容长度:', contentToUse.length);
    
    if (!contentToUse.trim()) {
      console.error('结构解析内容为空，无法生成反向提示词');
      alert('结构解析内容为空，无法生成反向提示词');
      return;
    }

    console.log('开始生成反向提示词...');
    setIsGeneratingPrompt(true);
    setPromptContent('');
    setStructureCollapsed(true); // 立即折叠结构解析区域
    setPromptCollapsed(false); // 展开反向提示词区域
    let accumulatedText = '';

    try {
      const prompt = `根据${contentToUse}的写作风格和结构特征，我想创建一个提示词，帮助我构思社交帖子。

重要提示：参考文档的话题仅作为风格参考，用户实际要写的话题可能完全不同。

将这个提示分为两个阶段来表述：
阶段 1：背景信息收集 - 首先询问用户想要创作的话题（可以与参考文档话题不同），然后收集相关背景信息
阶段 2：后续写作 - 根据用户提供的话题和背景信息，运用参考文档的写作风格和结构，撰写3个不同版本

以下是指南：
`;

      console.log('发送请求到 /api/writer/chat');
      const response = await fetch('/api/writer/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt
        })
      });

      console.log('响应状态:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API 错误:', errorText);
        throw new Error(`302 API 调用失败: ${response.status}`);
      }

      // 处理 SSE 流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('无法读取响应流');
      }

      console.log('开始读取流式响应...');

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('流式响应读取完成');
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '') continue;

            try {
              const parsed = JSON.parse(data);
              console.log('解析的数据:', parsed);

              if (parsed.type === 'text_chunk') {
                accumulatedText += parsed.text || '';
                setPromptContent(accumulatedText);
                console.log('累积文本长度:', accumulatedText.length);
              } else if (parsed.type === 'workflow_finished') {
                // 工作流完成
                console.log('工作流完成');
                if (accumulatedText) {
                  setPromptContent(accumulatedText);
                }
              }
            } catch (e) {
              console.error('解析 SSE 数据失败:', e, '数据:', data);
            }
          }
        }
      }

      console.log('最终反向提示词长度:', accumulatedText.length);
      setIsGeneratingPrompt(false);
      // 显示"开始 AI 引导创作"按钮
      console.log('设置 showStartChatButton = true');
      setShowStartChatButton(true);
      // 确保反向提示词区域保持展开状态
      setPromptCollapsed(false);
    } catch (error) {
      console.error('生成反向提示词失败:', error);
      alert(`生成反向提示词失败：${error instanceof Error ? error.message : '未知错误'}`);
      setIsGeneratingPrompt(false);
      // 即使出错也显示按钮，允许用户重试或继续
      setShowStartChatButton(true);
      // 如果出错，用户可以通过侧边栏重新展开结构解析区域
    }
  };

  // 启动结构分析
  const handleStartAnalysis = async () => {
    if (!referenceText.trim()) {
      alert('请输入参考文档内容');
      return;
    }

    // 检查登录状态
    if (authState.isLoading) {
      // 如果正在加载认证状态，等待一下
      return;
    }
    
    if (!authState.isAuthenticated) {
      // 保存当前路径，以便登录后返回
      if (pathname) {
        localStorage.setItem('loginRedirectUrl', pathname);
      }
      alert('请先登录后再使用此功能');
      router.push('/auth/login');
      return;
    }

    // 进入全屏模式
    await enterFullscreen();

    // 显示流程提示，5秒后自动隐藏
    setShowProcessHint(true);
    setTimeout(() => {
      setShowProcessHint(false);
    }, 5000);

    setIsAnalyzing(true);
    setStructureContent('');
    setPromptContent('');
    setShowStartChatButton(false);
    setStructureCollapsed(false);
    let accumulatedText = '';

    try {
      const prompt = `将${referenceText}这篇帖子进行拆解分析，重点关注：
1. 文章结构和段落组织方式
2. 表达技巧和写作风格
3. 涉及的心理模式和说服策略
4. 语言风格和语气特点

注意：请将分析重点放在"如何写"而非"写什么"，因为用户可能会用这种风格去创作完全不同话题的内容。如果用户要撰写同样风格的文章，需要提供什么样的背景信息，以及还有其他什么是用户需要了解的。`;

      const response = await fetch('/api/writer/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt
        })
      });

      if (!response.ok) {
        throw new Error('302 API 调用失败');
      }

      // 折叠参考文档栏，展开结构解析栏
      setReferenceCollapsed(true);
      setStructureCollapsed(false);

      // 处理 SSE 流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('无法读取响应流');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '') continue;

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === 'text_chunk') {
                accumulatedText += parsed.text || '';
                setStructureContent(accumulatedText);
              } else if (parsed.type === 'workflow_finished') {
                // 工作流完成，保持使用累积的文本内容（保持 Markdown 格式）
                if (accumulatedText) {
                  setStructureContent(accumulatedText);
                }
              }
            } catch (e) {
              console.error('解析 SSE 数据失败:', e);
            }
          }
        }
      }

      setIsAnalyzing(false);
      
      console.log('结构解析完成，保持展开状态以便用户保存...');
      console.log('accumulatedText 长度:', accumulatedText.length);
      
      // 结构解析完成后保持展开状态，让用户有机会保存模板或生成反向提示词
      // 不自动生成反向提示词，用户需要手动点击"生成反向提示词"按钮

    } catch (error) {
      console.error('分析失败:', error);
      alert('分析失败，请稍后重试');
      setIsAnalyzing(false);
    }
  };

  // 开始 AI 对话
  const handleStartChat = async () => {
    if (!promptContent.trim()) {
      alert('请先完成反向提示词生成');
      return;
    }

    console.log('开始 AI 引导创作...');
    console.log('反向提示词内容长度:', promptContent.length);
    
    setIsGenerating(true);
    setChatVisible(true);
    setPromptCollapsed(true); // 收缩反向提示词，让 AI 对话区域获得更大空间
    setCurrentStage('stage1'); // 初始化阶段为阶段1

    // 将反向提示词作为系统内置提示语（不显示给用户）
    // 构建系统提示：让 AI 知道它要按照反向提示词的指示工作
    const systemPromptText = `${promptContent}

现在请你作为一个专业的内容创作指导顾问，严格按照上述提示词的要求工作。

重要说明：参考文档仅作为写作风格和结构参考，用户要创作的内容话题可能完全不同。

请立即开始阶段1的背景信息收集：
1. 首先询问用户：您想创作什么话题的内容？（这个话题可以与参考文档的话题完全不同）
2. 然后根据用户的话题，收集必要的背景信息`;
    
    // 保存系统提示语，用于后续对话的上下文
    setSystemPrompt(systemPromptText);
    
    console.log('系统提示语已设置，开始调用 AI...');
    
    // 直接调用 generateResponse，让 AI 主动开始对话
    await generateResponse(systemPromptText, []);
    
    setIsGenerating(false);
    console.log('AI 对话初始化完成');
  };

  // 发送用户消息
  const handleSendMessage = async () => {
    if (!userInput.trim() || isSending) return;

    const newMessage: Message = {
      role: 'user',
      content: userInput
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setUserInput('');
    setIsSending(true);

    await generateResponse(userInput, updatedMessages);
    
    setIsSending(false);
  };

  // 调用 302 生文接口
  const generateResponse = async (prompt: string, currentMessages: Message[]) => {
    try {
      // 检测是否进入阶段2（后续写作阶段）
      const stage2Keywords = ['阶段2', '阶段 2', '后续写作', '开始写作', '开始撰写', '撰写文章', '进入阶段2', '进入阶段 2'];
      const userMessage = prompt.toLowerCase();
      
      // 检查当前用户消息中是否包含阶段2关键词
      const isStage2TriggeredInUserMessage = stage2Keywords.some(keyword => userMessage.includes(keyword.toLowerCase()));
      
      // 检查对话历史中是否已经提到阶段2（包括AI的回复）
      const conversationText = currentMessages
        .map(m => m.content.toLowerCase())
        .join(' ');
      const isStage2InHistory = stage2Keywords.some(keyword => conversationText.includes(keyword.toLowerCase()));
      
      // 确定当前实际使用的阶段（考虑本次触发或历史记录）
      let actualStage: 'stage1' | 'stage2' = currentStage;
      if ((isStage2TriggeredInUserMessage || isStage2InHistory) && currentStage === 'stage1') {
        actualStage = 'stage2';
        setCurrentStage('stage2'); // 更新状态供下次使用
        console.log('检测到阶段2，切换到阶段2', {
          userMessageTriggered: isStage2TriggeredInUserMessage,
          historyTriggered: isStage2InHistory
        });
      } else if (currentStage === 'stage2') {
        // 如果已经是阶段2，保持阶段2
        actualStage = 'stage2';
      }
      
      // 构建完整的对话历史作为 prompt
      let fullPrompt: string;
      
      if (currentMessages.length === 0) {
        // 这是 AI 主动发起的第一条消息（使用系统提示语）
        fullPrompt = prompt;
        console.log('AI 主动发起对话，系统提示语长度:', prompt.length);
      } else {
        // 正常的对话流程：系统提示语 + 对话历史 + 新消息
        const conversationHistory = currentMessages
          .map(m => `${m.role === 'user' ? '用户' : 'AI'}: ${m.content}`)
          .join('\n\n');
        
        // 构建系统提示语
        let enhancedSystemPrompt = systemPrompt || '';
        
        // 如果进入阶段2，添加结构解析内容
        if (actualStage === 'stage2' && structureContent) {
          enhancedSystemPrompt = `${systemPrompt}\n\n[结构解析参考]\n以下是参考文档的结构分析，请在你撰写文章时参考这些结构特点和写作技巧：\n\n${structureContent}\n\n重要提示：请结合用户提供的背景信息和上述结构解析，在撰写文章时：\n1. 参考结构解析中的文章结构和组织方式\n2. 运用结构解析中提到的心理模式和写作技巧\n3. 确保文章风格与参考文档保持一致\n4. 根据用户提供的背景信息创作内容`;
          console.log('阶段2：已添加结构解析内容到系统提示，结构解析长度:', structureContent.length);
        }
        
        // 如果有系统提示语，将其作为上下文包含进来
        if (enhancedSystemPrompt) {
          fullPrompt = `[系统指令]\n${enhancedSystemPrompt}\n\n[对话历史]\n${conversationHistory}\n\n用户: ${prompt}`;
          console.log('包含系统提示语的对话，系统提示语长度:', enhancedSystemPrompt.length, '当前阶段:', actualStage);
        } else {
          fullPrompt = conversationHistory + `\n\n用户: ${prompt}`;
        }
      }

      console.log('调用 generateWriting API，fullPrompt 长度:', fullPrompt.length);

      const response = await fetch('/api/generateWriting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          tool_name: 'CustomTool',
          language: 'chinese'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '生成失败');
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      if (!reader) {
        throw new Error('无法读取响应流');
      }

      // 添加一个空的助手消息
      const assistantMessageObj: Message = {
        role: 'assistant',
        content: ''
      };
      setMessages([...currentMessages, assistantMessageObj]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '') continue;

            try {
              const parsed = JSON.parse(data);
              
              if (parsed.content) {
                assistantMessage += parsed.content;
                // 更新最后一条消息
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = {
                    role: 'assistant',
                    content: assistantMessage
                  };
                  return newMessages;
                });
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error) {
      console.error('生成失败:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: `抱歉，生成失败：${error instanceof Error ? error.message : '未知错误'}`
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Markdown 渲染组件配置
  const MarkdownContent = ({ content }: { content: string }) => (
    <div className="markdown-content text-gray-800">
      <ReactMarkdown
        components={{
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-4 mt-6 text-gray-900 border-b pb-2" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-bold mb-3 mt-5 text-gray-900" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mb-2 mt-4 text-gray-900" {...props} />,
          h4: ({ node, ...props }) => <h4 className="text-base font-semibold mb-2 mt-3 text-gray-800" {...props} />,
          h5: ({ node, ...props }) => <h5 className="text-sm font-semibold mb-2 mt-2 text-gray-800" {...props} />,
          h6: ({ node, ...props }) => <h6 className="text-xs font-semibold mb-1 mt-2 text-gray-700" {...props} />,
          p: ({ node, ...props }) => <p className="mb-4 leading-relaxed text-base" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc list-outside mb-4 space-y-2 pl-6" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-outside mb-4 space-y-2 pl-6" {...props} />,
          li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 italic text-gray-700 bg-blue-50 rounded-r" {...props} />
          ),
          code: ({ node, inline, ...props }: any) => 
            inline ? (
              <code className="bg-gray-200 px-2 py-0.5 rounded text-sm font-mono text-red-600" {...props} />
            ) : (
              <code className="block bg-gray-800 text-gray-100 p-4 rounded-lg my-4 text-sm font-mono overflow-x-auto" {...props} />
            ),
          pre: ({ node, ...props }) => <pre className="bg-gray-800 rounded-lg my-4 overflow-x-auto" {...props} />,
          a: ({ node, ...props }) => <a className="text-blue-600 hover:text-blue-800 underline font-medium" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-bold text-gray-900" {...props} />,
          em: ({ node, ...props }) => <em className="italic text-gray-700" {...props} />,
          hr: ({ node, ...props }) => <hr className="my-6 border-t-2 border-gray-300" {...props} />,
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-gray-300" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => <thead className="bg-gray-100" {...props} />,
          tbody: ({ node, ...props }) => <tbody {...props} />,
          tr: ({ node, ...props }) => <tr className="border-b border-gray-300" {...props} />,
          th: ({ node, ...props }) => <th className="border border-gray-300 px-4 py-2 text-left font-semibold" {...props} />,
          td: ({ node, ...props }) => <td className="border border-gray-300 px-4 py-2" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );

  return (
    <div 
      ref={pageContainerRef}
      className={`flex h-screen bg-gray-50 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
    >
      {/* 全屏控制按钮 */}
      <button
        onClick={isFullscreen ? exitFullscreen : enterFullscreen}
        className="fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
        title={isFullscreen ? '退出全屏' : '进入全屏'}
      >
        {isFullscreen ? (
          <Minimize className="w-5 h-5 text-gray-700" />
        ) : (
          <Maximize className="w-5 h-5 text-gray-700" />
        )}
      </button>

      {/* 流程提示悬浮框 */}
      {showProcessHint && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-40 animate-fade-in">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full shadow-2xl">
            <div className="flex items-center gap-3 text-base font-medium">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                结构解析
              </span>
              <ChevronRight className="w-5 h-5" />
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></span>
                反向提示词
              </span>
              <ChevronRight className="w-5 h-5" />
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></span>
                AI 对话
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 参考文档栏 */}
      <div 
        className={`transition-all duration-300 bg-white border-r border-gray-200 flex flex-col ${
          referenceCollapsed ? 'w-12' : 'flex-1'
        }`}
      >
        {referenceCollapsed ? (
          <button
            onClick={() => setReferenceCollapsed(false)}
            className="flex items-center justify-center h-full hover:bg-gray-100 transition-colors group relative"
            title="展开参考文档"
          >
            <div className="flex flex-col items-center h-full justify-center py-8">
              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-800 mb-4" />
              <div 
                className="text-sm font-medium text-gray-600 group-hover:text-gray-800"
                style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}
              >
                参考文档
              </div>
            </div>
          </button>
        ) : (
          <div className="flex flex-col h-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-gray-800">参考文档</h2>
                {referenceText && (
                  <span className="text-sm text-gray-500">
                    ({calculateWordCount(referenceText)} 字)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {referenceText && (
                  <button
                    onClick={() => setReferencePreviewMode(!referencePreviewMode)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors flex items-center gap-1 text-sm text-gray-600"
                    title={referencePreviewMode ? "编辑模式" : "预览模式"}
                  >
                    {referencePreviewMode ? (
                      <>
                        <Edit3 className="w-4 h-4" />
                        <span>编辑</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        <span>预览</span>
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={() => setReferenceCollapsed(true)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="折叠"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            
            {referencePreviewMode && referenceText ? (
              <div className="flex-1 p-4 border border-gray-300 rounded-lg overflow-auto bg-white">
                <MarkdownContent content={referenceText} />
              </div>
            ) : (
              <textarea
                value={referenceText}
                onPaste={() => {
                  // 标记为粘贴操作，避免自动分段干扰
                  isPasteRef.current = true;
                  setTimeout(() => {
                    isPasteRef.current = false;
                  }, 100);
                }}
                onChange={(e) => {
                  const newValue = e.target.value;
                  const previousValue = referenceText;
                  const isPaste = isPasteRef.current;
                  
                  // 自动分段处理
                  const segmentedValue = handleAutoSegment(newValue, previousValue, isPaste);
                  
                  // 检测是否为新的参考文档（与之前的内容完全不同）
                  // 如果新内容与之前的内容差异很大（超过50%），认为是新文档
                  const isNewDocument = previousValue && (
                    segmentedValue.length < previousValue.length * 0.5 || 
                    segmentedValue.length > previousValue.length * 1.5 ||
                    !segmentedValue.includes(previousValue.substring(0, Math.min(10, previousValue.length)))
                  );
                  
                  // 如果是新文档，清空相关状态
                  if (isNewDocument && previousValue) {
                    setStructureContent('');
                    setPromptContent('');
                    setMessages([]);
                    setSystemPrompt('');
                    setCurrentStage('stage1');
                    setShowStartChatButton(false);
                    setChatVisible(false);
                    console.log('检测到新参考文档，已清空相关状态');
                  }
                  
                  setReferenceText(segmentedValue);
                }}
                placeholder="请输入参考文档内容，可以是你想模仿的爆款文案，支持 Markdown 格式"
                className="flex-1 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm whitespace-pre-wrap break-words"
                disabled={isAnalyzing}
              />
            )}
            
            <button
              onClick={handleStartAnalysis}
              disabled={isAnalyzing || !referenceText.trim()}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <img 
                    src="/Animation.gif" 
                    alt="分析中" 
                    className="w-5 h-5"
                  />
                  <span>分析中...</span>
                </>
              ) : (
                <span>拆解分析</span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* 结构解析 + 反向提示词栏 - 只在参考文档折叠后显示 */}
      {referenceCollapsed && (
        <div className={`${
          structureCollapsed && promptCollapsed ? 'w-24' : 'flex-1'
        } bg-white border-r border-gray-200 flex flex-row transition-all duration-300`}>
          {/* 结构解析部分 */}
          {structureCollapsed ? (
            <button
              onClick={() => setStructureCollapsed(false)}
              className="flex items-center justify-center h-full hover:bg-gray-100 transition-colors group w-12"
              title="展开结构解析"
            >
              <div className="flex flex-col items-center h-full justify-center py-8">
                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-800 mb-4" />
                <div 
                  className="text-sm font-medium text-gray-600 group-hover:text-gray-800"
                  style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}
                >
                  结构解析
                </div>
              </div>
            </button>
          ) : (
            <div className="flex-1 flex flex-col p-6 border-r border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">结构解析</h2>
                <div className="flex items-center gap-2">
                  {structureContent && (
                    <>
                      <button
                        onClick={copyStructureContent}
                        className="p-1 hover:bg-gray-200 rounded transition-colors flex items-center gap-1 text-sm text-gray-600"
                        title="复制结构解析内容"
                      >
                        {copiedStructure ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>已复制</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>复制</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setSaveTemplateDialogOpen(true)}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1 text-sm font-medium"
                        title="保存模板"
                      >
                        <Save className="w-4 h-4" />
                        <span>保存模板</span>
                      </button>
                    </>
                  )}
                  {templates.length > 0 && (
                    <button
                      onClick={() => setTemplateSelectorOpen(true)}
                      className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-1 text-sm font-medium"
                      title="使用其他文风结构"
                    >
                      <span>使用其他文风结构</span>
                    </button>
                  )}
                  <button
                    onClick={() => setReferenceCollapsed(false)}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    title="展开参考文档"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>参考</span>
                  </button>
                  <button
                    onClick={() => setStructureCollapsed(true)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="折叠"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
              
              {isAnalyzing && !structureContent ? (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <img 
                      src="/Animation.gif" 
                      alt="AI 思考中" 
                      className="w-32 h-32 mx-auto mb-4"
                    />
                    <p className="text-lg">AI 分析中...</p>
                  </div>
                </div>
              ) : structureContent ? (
                <div className="flex-1 flex flex-col min-h-0">
                  <div 
                    ref={setStructureScrollRef}
                    className="flex-1 p-4 border border-gray-300 rounded-lg overflow-auto bg-white min-h-0"
                  >
                    <MarkdownContent content={structureContent} />
                  </div>
                  {!promptContent && (
                    <button
                      onClick={() => generateReversePrompt()}
                      disabled={isGeneratingPrompt || !isStructureFullyScrolled}
                      className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      title={!isStructureFullyScrolled ? "请先滚动到底部查看完整内容" : ""}
                    >
                      {isGeneratingPrompt ? (
                        <>
                          <img 
                            src="/Animation.gif" 
                            alt="生成中" 
                            className="w-5 h-5"
                          />
                          <span>生成反向提示词中...</span>
                        </>
                      ) : (
                        <span>生成反向提示词</span>
                      )}
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  <p>等待分析结果...</p>
                </div>
              )}
            </div>
          )}

          {/* 反向提示词部分 - 只在结构解析折叠后显示 */}
          {structureCollapsed && (
            promptCollapsed ? (
              <button
                onClick={() => setPromptCollapsed(false)}
                className="flex items-center justify-center h-full hover:bg-gray-100 transition-colors group w-12"
                title="展开反向提示词"
              >
                <div className="flex flex-col items-center h-full justify-center py-8">
                  <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-800 mb-4" />
                  <div 
                    className="text-sm font-medium text-gray-600 group-hover:text-gray-800"
                    style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}
                  >
                    反向提示词
                  </div>
                </div>
              </button>
            ) : (
              <div className="flex-1 flex flex-col p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">反向提示词</h2>
                  <div className="flex items-center gap-2">
                    {promptContent && (
                      <button
                        onClick={copyPromptContent}
                        className="p-1 hover:bg-gray-200 rounded transition-colors flex items-center gap-1 text-sm text-gray-600"
                        title="复制反向提示词内容"
                      >
                        {copiedPrompt ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>已复制</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>复制</span>
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => setPromptCollapsed(true)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                      title="折叠"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
          
          {isGeneratingPrompt && !promptContent ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <img 
                  src="/Animation.gif" 
                  alt="AI 思考中" 
                  className="w-32 h-32 mx-auto mb-4"
                />
                <p className="text-lg">生成反向提示词中...</p>
              </div>
            </div>
          ) : promptContent ? (
            <>
              <div className="flex-1 p-4 border border-gray-300 rounded-lg overflow-auto bg-white">
                <MarkdownContent content={promptContent} />
              </div>
              
              {showStartChatButton && !chatVisible ? (
                <button
                  onClick={handleStartChat}
                  disabled={isGenerating}
                  className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <img 
                        src="/Animation.gif" 
                        alt="启动中" 
                        className="w-5 h-5"
                      />
                      <span>启动中...</span>
                    </>
                  ) : (
                    <span>开始 AI 引导创作</span>
                  )}
                </button>
              ) : null}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <p>等待反向提示词生成...</p>
            </div>
          )}
              </div>
            )
          )}
        </div>
      )}

      {/* 对话框栏 */}
      <div className="flex-1 bg-gray-900 flex flex-col">
        {!chatVisible ? (
          /* 初始欢迎界面 */
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative">
            <div className="text-center space-y-8 px-8">
              {/* 主标题 - 带特效 */}
              <div className="relative inline-block">
                <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-gradient-x mb-4">
                  AI 引导式创作
                </h1>
                <button
                  onClick={() => setHelpDialogOpen(true)}
                  className="absolute -top-1 -right-10 w-7 h-7 text-gray-400 hover:text-gray-300 transition-colors flex items-center justify-center rounded-full hover:bg-gray-800/50"
                  title="使用说明"
                >
                  <HelpCircle className="w-6 h-6" />
                </button>
              </div>
              
              {/* 副标题 */}
              <p className="text-xl text-gray-400 animate-fade-in-delay">
                智能分析 · 创意启发 · 高效创作
              </p>
              
              {/* 装饰性元素 */}
              <div className="flex justify-center gap-8 mt-8 animate-fade-in-delay-2">
                <div className="w-16 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full animate-pulse"></div>
                <div className="w-16 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                <div className="w-16 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
              </div>
              
              {/* 提示文字 */}
              <div className="mt-12 space-y-4 text-gray-500 animate-fade-in-delay-3">
                <p className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  请在左侧输入参考文档
                </p>
                <p className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                  点击&quot;拆解分析&quot;开始创作之旅
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* AI 对话界面 */
          <>
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-100">AI 对话</h2>
                <div className="flex items-center gap-2">
                  {structureCollapsed && (
                    <button
                      onClick={() => setStructureCollapsed(false)}
                      className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      title="展开结构解析"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>结构解析</span>
                    </button>
                  )}
                  {referenceCollapsed && (
                    <button
                      onClick={() => setReferenceCollapsed(false)}
                      className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      title="展开参考文档"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>参考文档</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* 对话显示区 */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-auto p-6 space-y-4 bg-gray-800"
            >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* 头像 */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-blue-600' 
                    : 'bg-gradient-to-br from-purple-500 to-pink-500'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-6 h-6 text-white" />
                  ) : (
                    <Bot className="w-6 h-6 text-white" />
                  )}
                </div>
                
                {/* 消息内容 */}
                <div className="flex flex-col flex-1 min-w-0">
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white ml-auto'
                        : 'bg-gray-700 text-gray-100'
                    }`}
                  >
                  {message.role === 'user' ? (
                    <pre className="whitespace-pre-wrap text-sm font-sans">
                      {message.content}
                    </pre>
                  ) : (
                    <div className="text-sm">
                      <ReactMarkdown
                        components={{
                          h1: ({ node, ...props }) => <h1 className="text-xl font-bold mb-3 mt-4 text-gray-100 border-b border-gray-600 pb-2" {...props} />,
                          h2: ({ node, ...props }) => <h2 className="text-lg font-bold mb-2 mt-3 text-gray-100" {...props} />,
                          h3: ({ node, ...props }) => <h3 className="text-base font-semibold mb-2 mt-3 text-gray-100" {...props} />,
                          p: ({ node, ...props }) => <p className="mb-3 leading-relaxed text-gray-100" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc list-outside mb-3 space-y-1 pl-5" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal list-outside mb-3 space-y-1 pl-5" {...props} />,
                          li: ({ node, ...props }) => <li className="leading-relaxed text-gray-100" {...props} />,
                          blockquote: ({ node, ...props }) => (
                            <blockquote className="border-l-4 border-blue-400 pl-4 py-2 my-3 italic text-gray-200 bg-gray-600 rounded-r" {...props} />
                          ),
                          code: ({ node, inline, ...props }: any) => 
                            inline ? (
                              <code className="bg-gray-600 px-2 py-0.5 rounded text-sm font-mono text-blue-300" {...props} />
                            ) : (
                              <code className="block bg-gray-900 text-gray-100 p-3 rounded-lg my-3 text-sm font-mono overflow-x-auto" {...props} />
                            ),
                          strong: ({ node, ...props }) => <strong className="font-bold text-gray-100" {...props} />,
                          em: ({ node, ...props }) => <em className="italic text-gray-200" {...props} />,
                          a: ({ node, ...props }) => <a className="text-blue-400 hover:text-blue-300 underline" {...props} />,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
                  
                  {/* 复制按钮 */}
                  <button
                    onClick={() => copyToClipboard(message.content, index)}
                    className={`mt-1 px-2 py-1 text-xs rounded flex items-center gap-1 transition-colors ${
                      message.role === 'user'
                        ? 'text-blue-400 hover:bg-gray-800 ml-auto'
                        : 'text-gray-400 hover:bg-gray-700'
                    }`}
                    title="复制内容"
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>已复制</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>复制</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex gap-3">
                {/* AI 头像 */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                
                {/* 加载动画 */}
                <div className="bg-gray-700 text-gray-100 px-4 py-3 rounded-lg">
                  <img 
                    src="/Animation.gif" 
                    alt="AI 回复中" 
                    className="w-12 h-12"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 输入区 */}
          <div className="p-6 border-t border-gray-700 bg-gray-900">
            <div className="flex gap-2 items-end">
              <textarea
                ref={textareaRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入消息... (Shift+Enter 换行)"
                className="flex-1 px-4 py-3 border border-gray-600 bg-gray-800 text-gray-100 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 min-h-[80px] max-h-[300px]"
                rows={3}
                disabled={isSending}
              />
              <button
                onClick={handleSendMessage}
                disabled={isSending || !userInput.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
          </>
        )}
      </div>

      {/* 保存模板对话框 */}
      <Dialog open={saveTemplateDialogOpen} onOpenChange={setSaveTemplateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>保存模板</DialogTitle>
            <DialogDescription>
              为当前结构解析内容设置一个名称，以便后续使用
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="template-name" className="text-sm font-medium">
                模板名称 <span className="text-red-500">*</span>
              </label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="请输入模板名称"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isSavingTemplate) {
                    handleSaveTemplate();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSaveTemplateDialogOpen(false);
                setTemplateName('');
              }}
              disabled={isSavingTemplate}
            >
              取消
            </Button>
            <Button
              onClick={handleSaveTemplate}
              disabled={isSavingTemplate || !templateName.trim()}
            >
              {isSavingTemplate ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 模板选择对话框 */}
      <Dialog open={templateSelectorOpen} onOpenChange={setTemplateSelectorOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[600px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>使用其他文风结构</DialogTitle>
            <DialogDescription>
              选择一个已保存的文风结构模板，直接跳转到结构解析步骤
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {templates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>暂无保存的模板</p>
              </div>
            ) : (
              templates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <div className="font-medium text-gray-900">{template.name}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      创建时间: {new Date(template.createdAt).toLocaleString('zh-CN')}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (template.id) {
                        handleDeleteTemplate(template.id);
                      }
                    }}
                    className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="删除模板"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTemplateSelectorOpen(false)}
            >
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 使用说明对话框 */}
      <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>使用说明</DialogTitle>
            <DialogDescription>
              本工具启发于 Dan Koe 的&quot;AI 内容永动机方法论&quot;，特此感谢！旨在通过 AI 的启发和辅导完成有参考、有个性、有温度的文章创作。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* 使用流程 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">使用流程</h3>
              <ol className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">1</span>
                  <span>输入参考文档</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-medium">2</span>
                  <span>AI 提炼文风结构</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-sm font-medium">3</span>
                  <span>生成 AI 反向提示词</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-medium">4</span>
                  <span>接受 AI 采访，完成创作</span>
                </li>
              </ol>
            </div>

            {/* 积分扣除说明 */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">积分扣除说明</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  由于 AI 启发创意过程中涉及解析和采访，需多次沟通，积分按照对话次数扣除（一般 5-10 积分），如敏感，请慎用！
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setHelpDialogOpen(false)}
            >
              我知道了
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

