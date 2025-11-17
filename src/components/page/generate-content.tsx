'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';

type GenerateContentProps = {
  params: { id: string; locale: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

type GenerateRecord = {
  id: number;
  output: string;
  createdAt: string;
  error?: boolean;
  err_code?: number;
  batchIndex?: number;
};

export default function GenerateContent({ params, searchParams }: GenerateContentProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateRecords, setGenerateRecords] = useState<GenerateRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [batchCount, setBatchCount] = useState(1);

  useEffect(() => {
    const generateContent = async () => {
      try {
        // 解析 URL 参数（安全解码，处理可能的编码错误）
        const safeDecode = (value: string | string[] | undefined): string => {
          if (!value || typeof value !== 'string') return '';
          try {
            // 先尝试直接解码
            return decodeURIComponent(value);
          } catch (error) {
            // 如果解码失败，尝试先编码再解码（处理双重编码的情况）
            try {
              return decodeURIComponent(encodeURIComponent(value));
            } catch {
              // 如果还是失败，返回原始值（可能已经是解码后的）
              return value;
            }
          }
        };

        const persona = safeDecode(searchParams.persona);
        const background = safeDecode(searchParams.background);
        const discussionSubject = safeDecode(searchParams.discussionSubject);
        const styleKey = typeof searchParams.styleKey === 'string' ? searchParams.styleKey : '';
        const batchCountValue = typeof searchParams.batchCount === 'string' ? parseInt(searchParams.batchCount) : 1;
        const autoGenerate = typeof searchParams.autoGenerate === 'string' ? searchParams.autoGenerate === 'true' : false;

        setBatchCount(batchCountValue);

        // 验证参数
        if (!persona || !background || !discussionSubject || !styleKey) {
          setError('缺少必要的参数：persona, background, discussionSubject, styleKey');
          return;
        }

        if (!autoGenerate) {
          setError('未启用自动生成');
          return;
        }

        // 从 sessionStorage 读取参考文案（带重试机制和事件监听）
        const storageKey = `chrome-extension-style-${styleKey}`;
        
        // 先尝试立即读取
        let storedData: string | null = sessionStorage.getItem(storageKey);
        
        // 如果没找到，等待事件或重试
        if (!storedData) {
          console.log('Waiting for sessionStorage data, key:', storageKey);
          
          // 创建一个 Promise 来等待数据
          const waitForData = new Promise<string | null>((resolve) => {
            let resolved = false;
            
            // 监听自定义事件
            const eventHandler = (event: Event) => {
              const customEvent = event as CustomEvent;
              if (customEvent.detail?.key === storageKey && !resolved) {
                console.log('Received sessionStorageReady event for:', storageKey);
                // 收到事件后立即检查
                const data = sessionStorage.getItem(storageKey);
                if (data) {
                  resolved = true;
                  window.removeEventListener('sessionStorageReady', eventHandler);
                  resolve(data);
                }
              }
            };
            
            window.addEventListener('sessionStorageReady', eventHandler);
            
            // 同时进行轮询检查（最多等待 10 秒）
            const maxRetries = 100; // 100 次重试，每次 100ms，总共 10 秒
            let retryCount = 0;
            
            const checkInterval = setInterval(() => {
              if (resolved) {
                clearInterval(checkInterval);
                return;
              }
              
              const data = sessionStorage.getItem(storageKey);
              if (data) {
                resolved = true;
                clearInterval(checkInterval);
                window.removeEventListener('sessionStorageReady', eventHandler);
                resolve(data);
                return;
              }
              
              retryCount++;
              if (retryCount >= maxRetries) {
                resolved = true;
                clearInterval(checkInterval);
                window.removeEventListener('sessionStorageReady', eventHandler);
                resolve(null);
              }
            }, 100);
          });
          
          storedData = await waitForData;
          
          if (storedData) {
            console.log('SessionStorage data found!', storageKey);
          } else {
            console.error('SessionStorage data not found after waiting:', storageKey);
            console.log('Available sessionStorage keys:', Object.keys(sessionStorage));
          }
        } else {
          console.log('SessionStorage data found immediately!', storageKey);
        }
        
        if (!storedData) {
          setError('未找到参考文案数据，可能已过期或未正确传递。请确保浏览器扩展已正确安装并启用。');
          console.error('SessionStorage key not found after retries:', storageKey);
          console.log('Available sessionStorage keys:', Object.keys(sessionStorage));
          return;
        }

        let styleData: { style: string; timestamp: number };
        try {
          styleData = JSON.parse(storedData);
        } catch (e) {
          setError('参考文案数据格式错误');
          return;
        }

        // 检查数据是否过期（5 分钟）
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;
        if (now - styleData.timestamp > fiveMinutes) {
          setError('参考文案数据已过期，请重新生成');
          sessionStorage.removeItem(storageKey);
          return;
        }

        // 读取后立即删除 sessionStorage 数据
        sessionStorage.removeItem(storageKey);

        const style = styleData.style;

        // 验证参考文案
        if (!style) {
          setError('参考文案为空');
          return;
        }

        setIsGenerating(true);
        setError(null);

        // 构建请求数据
        const requestData = {
          tool_name: 'xiaohongshu-post-generation-product',
          params: {
            persona,
            background,
            discussionSubject,
            style
          },
          language: params.locale === 'zh' ? 'chinese' : params.locale === 'en' ? 'english' : 'japanese'
        };

        // 重试函数
        const retryRequest = async (data: any, requestId: number, maxRetries = 3) => {
          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
              const res = await fetch('/api/generateWriting', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
              });

              if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                if (res.status >= 400 && res.status < 500) {
                  throw new Error(errorData.error || `HTTP ${res.status}`);
                }
                if (attempt === maxRetries) {
                  throw new Error(errorData.error || `HTTP ${res.status}`);
                }
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
                continue;
              }

              return res;
            } catch (error) {
              if (attempt === maxRetries) {
                throw error;
              }
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
            }
          }
        };

        // 生成单个内容
        const generateSingle = async (data: any, requestId: number, batchIndex?: number) => {
          const newRecord: GenerateRecord = {
            id: requestId,
            output: '',
            createdAt: new Date().toLocaleString('zh-CN'),
            batchIndex
          };

          setGenerateRecords(prev => [{ ...newRecord }, ...prev]);

          try {
            const res = await retryRequest(data, requestId);
            
            if (res?.body) {
              const reader = res.body.getReader();
              const decoder = new TextDecoder('utf-8');
              let partialData = '';
              
              const read = async () => {
                const readerRead = await reader.read();
                const { done, value } = readerRead;
                
                if (done) {
                  return;
                }

                partialData += decoder.decode(value, { stream: true });
                const lines = partialData.split('\n');
                partialData = lines.pop() || '';
                
                lines.forEach(line => {
                  if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    try {
                      const parsedData = JSON.parse(data);
                      
                      if (parsedData?.error) {
                        const errorCode = parsedData.err_code || 0;
                        const errorMessage = parsedData.message || '未知错误';
                        
                        setGenerateRecords(prev => prev.map(item => {
                          if (item.id === requestId) {
                            return {
                              ...item,
                              output: `生成失败: ${errorMessage}`,
                              error: true,
                              err_code: errorCode
                            };
                          }
                          return item;
                        }));
                        return;
                      }
                      
                      if (parsedData?.content) {
                        setGenerateRecords(prev => prev.map(item => {
                          if (item.id === requestId) {
                            return { ...item, output: item.output + parsedData.content };
                          }
                          return item;
                        }));
                      }
                    } catch (e) {
                      console.error('解析流数据失败:', e);
                    }
                  }
                });
                await read();
              };
              await read();
            }
          } catch (error) {
            console.error(`生成请求 ${requestId} 失败:`, error);
            setGenerateRecords(prev => prev.map(item => {
              if (item.id === requestId) {
                return {
                  ...item,
                  output: `生成失败: ${error instanceof Error ? error.message : '未知错误'}`,
                  error: true
                };
              }
              return item;
            }));
          }
        };

        // 批量生成或单个生成
        if (batchCountValue > 1) {
          const promises = Array.from({ length: batchCountValue }, (_, index) => {
            const requestId = Date.now() * 1000 + index; // 确保唯一 ID
            const requestDataWithBatch = {
              ...requestData,
              params: {
                ...requestData.params,
                batchIndex: index + 1,
                batchTotal: batchCountValue
              }
            };
            return generateSingle(requestDataWithBatch, requestId, index + 1);
          });

          await Promise.allSettled(promises);
        } else {
          await generateSingle(requestData, Date.now() * 1000);
        }

        setIsGenerating(false);
      } catch (err) {
        console.error('生成失败:', err);
        setError(err instanceof Error ? err.message : '生成失败，请重试');
        setIsGenerating(false);
      }
    };

    generateContent();
  }, [searchParams, params.locale]);

  // 计算文本字数（去除 HTML 标签和 Markdown 语法）
  const getWordCount = (text: string): number => {
    if (!text) return 0;
    
    let plainText = text;
    
    // 移除 HTML 标签
    plainText = plainText.replace(/<[^>]*>/g, '');
    
    // 移除 Markdown 语法标记
    plainText = plainText
      .replace(/#{1,6}\s+/g, '') // 标题标记
      .replace(/\*\*([^*]+)\*\*/g, '$1') // 粗体
      .replace(/\*([^*]+)\*/g, '$1') // 斜体
      .replace(/`([^`]+)`/g, '$1') // 行内代码
      .replace(/```[\s\S]*?```/g, '') // 代码块
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // 链接
      .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '') // 图片
      .replace(/^\s*[-*+]\s+/gm, '') // 列表标记
      .replace(/^\s*\d+\.\s+/gm, '') // 有序列表
      .replace(/^\s*>\s+/gm, '') // 引用
      .replace(/---+/g, '') // 分隔线
      .replace(/\n+/g, ' ') // 换行符替换为空格
      .trim();
    
    // 计算中文字符和英文单词
    const chineseChars = (plainText.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = plainText.replace(/[\u4e00-\u9fa5]/g, '').trim().split(/\s+/).filter(w => w.length > 0).length;
    
    return chineseChars + englishWords;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // 可以使用 toast 替代 alert
      alert('已复制到剪贴板');
    } catch (err) {
      console.error('复制失败:', err);
      alert('复制失败');
    }
  };

  // 渲染生成结果内容
  const renderResult = (record: GenerateRecord) => {
    if (record.error) {
      return (
        <div className="text-red-400 text-center py-8">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-lg font-medium">生成失败</p>
          <p className="text-sm opacity-80 mt-2">{record.output}</p>
        </div>
      );
    }

    if (!record.output) {
      return (
        <div className="text-center py-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-cyan-400 font-medium">正在生成中...</p>
          <p className="text-gray-500 text-sm mt-2">AI正在为您创作内容</p>
        </div>
      );
    }

    // 使用 ReactMarkdown 渲染内容
    return <ReactMarkdown>{record.output}</ReactMarkdown>;
  };

  return (
    <div className="min-h-screen relative pt-16" style={{ backgroundColor: 'var(--bg-100)' }}>
      <div className="mx-auto px-4 py-6" style={{ maxWidth: '1200px' }}>
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-100">从浏览器插件生成</h1>
          <p className="text-sm text-gray-400 mt-1">
            {isGenerating ? '正在自动生成内容...' : generateRecords.length > 0 ? '生成完成' : '准备生成'}
          </p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200">
            <p className="font-medium">错误</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        )}

        {/* 生成状态 */}
        {isGenerating && generateRecords.length === 0 && (
          <div className="mb-6 p-4 bg-blue-900/50 border border-blue-500/50 rounded-lg">
            <div className="flex items-center gap-2 text-blue-200">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              <p>正在生成内容，请稍候...</p>
            </div>
          </div>
        )}

        {/* 生成结果 */}
        {generateRecords.length > 0 && (
          <div className="space-y-6">
            {generateRecords.map((record) => (
              <div
                key={record.id}
                className="group relative p-6 bg-gradient-to-br from-gray-900/80 via-gray-800/90 to-black/80 backdrop-blur-sm text-gray-100 rounded-2xl shadow-2xl border border-gray-700/50 hover:border-cyan-500/50 hover:shadow-cyan-500/20 transition-all duration-500 hover:scale-[1.02]"
              >
                {/* 批次编号标识 */}
                {record.batchIndex && batchCount > 1 && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    第 {record.batchIndex} 篇
                  </div>
                )}
                
                {/* 科技感装饰边框 */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent pointer-events-none"></div>
                
                {/* 内容区域 */}
                <div className="text-left">
                  {renderResult(record)}
                </div>

                {/* 底部操作栏 */}
                {record.output && !record.error && (
                  <div className="flex items-end justify-between mt-6 pt-4 border-t border-gray-600/50">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                      <span>{dayjs(record.createdAt).format('MM-DD HH:mm')}</span>
                      <span className="text-gray-500 text-xs ml-2">以上内容由AI 生成，仅供学习交流</span>
                    </div>
                    <div className="flex items-center gap-3 relative z-10">
                      {record.output && (
                        <div className="flex items-center gap-1.5 text-gray-400 text-xs px-2 py-1 rounded-md bg-gray-800/50 border border-gray-700/50">
                          <svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-cyan-400">
                            <path d="M3.5 2C3.22386 2 3 2.22386 3 2.5V12.5C3 12.7761 3.22386 13 3.5 13H11.5C11.7761 13 12 12.7761 12 12.5V4.70711L9.29289 2H3.5ZM2 2.5C2 1.67157 2.67157 1 3.5 1H9.5C9.63261 1 9.75979 1.05268 9.85355 1.14645L12.8536 4.14645C12.9473 4.24021 13 4.36739 13 4.5V12.5C13 13.3284 12.3284 14 11.5 14H3.5C2.67157 14 2 13.3284 2 12.5V2.5ZM4.5 4C4.22386 4 4 4.22386 4 4.5C4 4.77614 4.22386 5 4.5 5H10.5C10.7761 5 11 4.77614 11 4.5C11 4.22386 10.7761 4 10.5 4H4.5ZM4.5 7C4.22386 7 4 7.22386 4 7.5C4 7.77614 4.22386 8 4.5 8H10.5C10.7761 8 11 7.77614 11 7.5C11 7.22386 10.7761 7 10.5 7H4.5ZM4.5 10C4.22386 10 4 10.2239 4 10.5C4 10.7761 4.22386 11 4.5 11H7.5C7.77614 11 8 10.7761 8 10.5C8 10.2239 7.77614 10 7.5 10H4.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                          </svg>
                          <span className="text-cyan-300 font-medium">{getWordCount(record.output)}</span>
                          <span className="text-gray-500">字</span>
                        </div>
                      )}
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-600/50 hover:to-blue-600/50 border-cyan-400/70 text-white hover:text-cyan-100 shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 relative z-20" 
                        onClick={() => copyToClipboard(record.output)}
                      >
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 9.50006C1 10.3285 1.67157 11.0001 2.5 11.0001H4L4 10.0001H2.5C2.22386 10.0001 2 9.7762 2 9.50006L2 2.50006C2 2.22392 2.22386 2.00006 2.5 2.00006L9.5 2.00006C9.77614 2.00006 10 2.22392 10 2.50006V4.00002H5.5C4.67158 4.00002 4 4.67159 4 5.50002V12.5C4 13.3284 4.67158 14 5.5 14H12.5C13.3284 14 14 13.3284 14 12.5V5.50002C14 4.67159 13.3284 4.00002 12.5 4.00002H11V2.50006C11 1.67163 10.3284 1.00006 9.5 1.00006H2.5C1.67157 1.00006 1 1.67163 1 2.50006V9.50006ZM5 5.50002C5 5.22388 5.22386 5.00002 5.5 5.00002H12.5C12.7761 5.00002 13 5.22388 13 5.50002V12.5C13 12.7762 12.7761 13 12.5 13H5.5C5.22386 13 5 12.7762 5 12.5V5.50002Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                        </svg>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 完成提示 */}
        {!isGenerating && generateRecords.length > 0 && !error && (
          <div className="mt-6 p-4 bg-green-900/50 border border-green-500/50 rounded-lg text-green-200">
            <p className="font-medium">✓ 生成完成！</p>
            <p className="text-sm mt-1">
              共生成 {generateRecords.filter(r => !r.error && r.output).length} 篇内容
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

