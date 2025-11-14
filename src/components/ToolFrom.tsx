import { z } from "zod";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2, Search } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { useForm } from 'react-hook-form';
import { useEffect, useState, useRef } from "react";
import { ITool } from "@/constant/tool_list";
import { zodResolver } from "@hookform/resolvers/zod";
import { getLocalStorage, setLocalStorage } from "@/lib/utils";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { CLEAR_CONTENT_BUTTON, FROM_LABEL, LANGUAGE_LIST, OUTPUT_LANGUAGE, PLEASE_ENTER, PLEASE_SELECT, SUBMIT_BUTTON, ROLE_TEMPLATES, WECHAT_ARTICLE_PURPOSE, WECHAT_ARTICLE_CONVERSION, BIO_STYLE } from "@/constant/language";
import { useCreditDeductionRate } from '@/hooks/useCreditDeductionRate';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { useIndustryPresets } from '@/hooks/useIndustryPresets';
import { useAuth } from '@/lib/auth/auth-context';
import { LoginReminderModal } from '@/components/ui/login-reminder-modal';

interface IProps {
  onOk: (value: any) => void
  dataSource: ITool & { prompt?: string }
  language: 'chinese' | 'english' | 'japanese';
  generateRecords?: Array<{ id: number; toolId: string | number; output: string; createdAt: string; }>;
  onExportToWord?: (records: Array<{ id: number; toolId: string | number; output: string; createdAt: string; }>) => void;
  load?: boolean;
}

export default function ToolFrom(props: IProps) {
  const [load, setLoad] = useState(false);
  const { language, dataSource, onOk, generateRecords = [], onExportToWord, load: externalLoad } = props;
  const [outputLanguage, setOutputLanguage] = useState('Chinese')
  const [presetOpen, setPresetOpen] = useState<{[key: string]: boolean}>({})
  const [searchQuery, setSearchQuery] = useState<{[key: string]: string}>({})
  const presetRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  const [styleReferenceOpen, setStyleReferenceOpen] = useState(false);
  const [styleReferenceContent, setStyleReferenceContent] = useState('');
  
  // Get credit deduction rate
  const { deductionRate, loading: rateLoading } = useCreditDeductionRate();
  
  // Auth check hook
  const { withAuthCheck, showLoginModal, setShowLoginModal } = useAuthCheck();
  
  // Industry presets hook
  const { getFieldPresets, userIndustry, hasFieldPresets } = useIndustryPresets();
  
  // Get user from auth context
  const { authState } = useAuth();
  const { user } = authState;
  
  // 使用外部传入的 load 状态，如果没有则使用内部状态
  const isLoading = externalLoad !== undefined ? externalLoad : load;

  // Read configuration output language
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const outputLanguageTemp = getLocalStorage('language');
      if (outputLanguageTemp) {
        setOutputLanguage(outputLanguageTemp)
      } else {
        setLocalStorage('language', language.replace(/^[a-z]/, (match) => match.toUpperCase()))
      }
    }
  }, [])

  // Close preset dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      let shouldClose = true;
      
      // Check if click is inside any preset dropdown
      Object.values(presetRefs.current || {}).forEach(ref => {
        if (ref && ref.contains && ref.contains(target)) {
          shouldClose = false;
        }
      });
      
      if (shouldClose) {
        setPresetOpen({});
        setSearchQuery({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const onReminderInformation = (type: string, key: string) => {
    switch (type) {
      case 'Select':
        return `${PLEASE_SELECT[language]}${FROM_LABEL[key][language]}`
      default:
        return `${PLEASE_ENTER[language]}${FROM_LABEL[key][language]}`
    }
  }

  const onFormSchema = (defaultValues?: boolean) => {
    const obj: { [key: string]: any } = {};
    for (const key in dataSource.from) {
      if (defaultValues) {
        obj[key] = '';
      } else {
        const message = onReminderInformation(dataSource.from[key].type, key)
        obj[key] = z.string().min(1, { message })
      }
    }
    return obj;
  }
  // 基础表单校验（来自配置）
  let baseSchema: any = z.object(onFormSchema());

  // 如果是小红书工具，追加"样本仿写"相关的可选字段与条件校验
  const isXhs = props.dataSource?.title === 'xiaohongshu-post-generation';
  const isXiaohongshuProduct = props.dataSource?.title === 'xiaohongshu-post-generation-product';
  const isSocialMediaBioTool = props.dataSource?.title === 'social-media-bio-creation';
  
  if (isXhs) {
    baseSchema = baseSchema.extend({
      mimicSample: z.string().optional(),
      tone: z.string(),
      batchCount: z.number().min(1).max(10).optional().default(1)
    }).superRefine((data: any, ctx: any) => {
      if (data.tone === 'mimic_by_sample') {
        const value = (data as any).mimicSample || '';
        if (!value || value.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['mimicSample'],
            message: '请输入样本'
          });
        } else if (value.length > 2000) {
          ctx.addIssue({
            code: z.ZodIssueCode.too_big,
            path: ['mimicSample'],
            type: 'string',
            maximum: 2000,
            inclusive: true,
            message: '样本最多可输入2000字'
          });
        }
      }
    });
  }
  
  // 如果是小红书商品推广帖，添加 batchCount 字段
  if (isXiaohongshuProduct) {
    baseSchema = baseSchema.extend({
      batchCount: z.number().min(1).max(10).optional().default(1)
    });
  }

  const formSchema = baseSchema as any;

  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      ...onFormSchema(true), 
      ...(isXhs ? { mimicSample: '', batchCount: 1 } : {}),
      ...(isXiaohongshuProduct ? { batchCount: 1, style: '__random__' } : {}),
      ...(isSocialMediaBioTool && user?.industry === 'housekeeping' ? { industryPosition: '家政服务' } : {})
    },
  })

  const onSubmit = async (data: any) => {
    if (isLoading) return;
    
    // Check authentication before proceeding
    withAuthCheck(async () => {
      setLoad(true);
      await onOk({ ...data, language: outputLanguage })
      setLoad(false);
    }, typeof window !== 'undefined' ? window.location.pathname + window.location.search : '');
  }

  const onChangeOutputLanguage = (value: string) => {
    if (value) {
      setOutputLanguage(value);
      setLocalStorage('language', value)
    }
  }

  // 获取行业特定的预设数据
  const getIndustryPresetData = (fieldName: string) => {
    const toolId = dataSource.title;
    
    // 如果用户未登录或行业为 'general'，不显示预设内容
    if (!user || userIndustry === 'general') {
      return [];
    }
    
    const industryPresets = getFieldPresets(toolId, fieldName);
    
    if (industryPresets && industryPresets.length > 0) {
      return industryPresets;
    }
    
    return [];
  };

  const onPresetSelect = (value: string) => {
    if (value) {
      // 使用 setTimeout 避免在渲染过程中调用 setState
      setTimeout(() => {
        form.setValue('content', value);
        setPresetOpen({});
      }, 0);
    }
  }

  const onRoleTemplateSelect = (value: string) => {
    if (value) {
      // 使用 setTimeout 避免在渲染过程中调用 setState
      setTimeout(() => {
        form.setValue('role', value);
      }, 0);
    }
  }

  const onRenderingSelect = (data: Array<{ chinese: string; english: string, japanese: string, value?: string }>, placeholder: string) => {
    return (
      <>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {
              data.map(item => (
                <SelectItem key={item.chinese} value={item.english || ''}>{item[language]}</SelectItem>
              ))
            }
          </SelectGroup>
        </SelectContent>
      </>
    )
  }

  const onRenderingSearchableSelect = (data: Array<{ chinese: string; english: string, japanese: string, value?: string }>, placeholder: string, onSelect: (value: string) => void, fieldKey: string) => {
    // 过滤数据 based on search query
    const currentSearchQuery = searchQuery[fieldKey] || '';
    const filteredData = data.filter(item => 
      item[language].toLowerCase().includes(currentSearchQuery.toLowerCase())
    );

    // 根据字段类型和内容长度设置不同的宽度和对齐策略
    const getDropdownStyle = () => {
      // 计算最长文本的长度，如果数组为空则使用默认值
      const maxTextLength = filteredData.length > 0 
        ? Math.max(...filteredData.map(item => item[language].length))
        : 0;
      
      switch (fieldKey) {
        case 'role':
          // 角色字段：较短文本，右对齐
          return {
            className: `min-w-full w-max ${maxTextLength > 8 ? 'max-w-64' : 'max-w-48'}`,
            alignment: 'right-0'
          };
        case 'background':
          // 背景字段：较长文本，右对齐但限制最大宽度，响应式处理
          return {
            className: `min-w-full w-max ${maxTextLength > 30 ? 'max-w-[28rem] sm:max-w-[32rem]' : 'max-w-[24rem] sm:max-w-[28rem]'}`,
            alignment: 'right-0'
          };
        case 'purpose':
          // 目的字段：最长文本，右对齐但限制最大宽度，响应式处理
          return {
            className: `min-w-full w-max ${maxTextLength > 40 ? 'max-w-[30rem] sm:max-w-[36rem]' : 'max-w-[26rem] sm:max-w-[32rem]'}`,
            alignment: 'right-0'
          };
        default:
          return {
            className: 'min-w-full w-max max-w-96',
            alignment: 'right-0'
          };
      }
    };

    return (
      <div 
        className="relative" 
        ref={(el) => { presetRefs.current[fieldKey] = el; }} 
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={presetOpen[fieldKey] || false}
          className="w-full justify-between"
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setPresetOpen((prev: {[key: string]: boolean}) => ({
              ...prev,
              [fieldKey]: !prev[fieldKey]
            }));
          }}
        >
          <span className="text-gray-500">{placeholder}</span>
          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
        
        {(presetOpen[fieldKey] || false) && (() => {
          const style = getDropdownStyle();
          return (
            <div className={`absolute top-full ${style.alignment} z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto ${style.className}`}>
            <div className="p-2">
              <input
                type="text"
                placeholder={`搜索${placeholder}...`}
                className="w-full p-2 border rounded-md mb-2"
                value={currentSearchQuery}
                onClick={(e) => e.stopPropagation()}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSearchQuery((prev: {[key: string]: string}) => ({
                    ...prev,
                    [fieldKey]: e.target.value
                  }));
                }}
              />
            </div>
            <div className="space-y-1">
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <div
                    key={item.chinese}
                    className="p-2 hover:bg-gray-100 cursor-pointer rounded-md border border-gray-200 break-words whitespace-normal"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onSelect(item[language]);
                      setPresetOpen((prev: {[key: string]: boolean}) => ({
                        ...prev,
                        [fieldKey]: false
                      }));
                      setSearchQuery((prev: {[key: string]: string}) => ({
                        ...prev,
                        [fieldKey]: ''
                      }));
                    }}
                  >
                    {item[language]}
                  </div>
                ))
              ) : (
                <div className="p-2 text-gray-500 text-center">
                  未找到相关内容
                </div>
              )}
            </div>
          </div>
          );
        })()}
      </div>
    )
  }

  const onRenderingOperationForm = (field: any, key: string) => {
    const placeholder = onReminderInformation(dataSource.from[key].type, key)
    const minHeight = dataSource.from[key]?.isBig ? 'min-h-40' : 'min-h-20';
    switch (dataSource.from[key].type) {
      case 'Input':
        return (<Input placeholder={placeholder} {...field} />)
      case 'Textarea':
        return (<Textarea className={minHeight} placeholder={placeholder} {...field} />)
      case 'Select':
        return (
          <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
            {onRenderingSelect(dataSource.from[key]?.list || [], placeholder)}
          </Select>
        )
      default:
        break;
    }
  }

  // 检查是否为小红书帖子生成工具
  const isXiaohongshuTool = dataSource.title === 'xiaohongshu-post-generation';
  
  // 检查是否为小红书帖子生成工具（商品类）
  const isXiaohongshuProductTool = dataSource.title === 'xiaohongshu-post-generation-product';
  
  // 检查是否为抖音短视频脚本工具
  const isTikTokTool = dataSource.title === 'TikTok-post-generation';
  
  // 检查是否为微信图文工具
  const isWeChatTool = dataSource.title === 'weixin-generation';

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} >
        {isXiaohongshuTool ? (
          // 小红书帖子生成工具的特殊布局
          <>
            {/* 1. 角色输入 */}
            <FormField
              disabled={isLoading}
              control={form.control}
              name="role"
              render={({ field }: any) => (
                <FormItem className="px-3 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel className="font-bold text-black">{FROM_LABEL.role[language]}</FormLabel>
                    {/* 角色模板选择器 - 右对齐，宽度缩小 */}
                    <div className="w-48">
                      {onRenderingSearchableSelect(getIndustryPresetData('role'), FROM_LABEL.preset[language], (value) => {
                        form.setValue('role', value);
                        form.trigger('role');
                      }, 'role')}
                    </div>
                  </div>
                  <FormControl>
                    <Input 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 2. 背景输入 */}
            <FormField
              disabled={isLoading}
              control={form.control}
              name="background"
              render={({ field }: any) => (
                <FormItem className="px-3 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel className="font-bold text-black">{FROM_LABEL.background[language]}</FormLabel>
                    {/* 背景预设选择器 */}
                    <div className="w-48">
                      {onRenderingSearchableSelect(getIndustryPresetData('background'), FROM_LABEL.preset[language], (value) => {
                        form.setValue('background', value);
                        form.trigger('background');
                      }, 'background')}
                    </div>
                  </div>
                  <FormControl>
                    <Textarea 
                      className="min-h-20" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 3. 目的需求输入 */}
            <FormField
              disabled={isLoading}
              control={form.control}
              name="purpose"
              render={({ field }: any) => (
                <FormItem className="px-3 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel className="font-bold text-black">{FROM_LABEL.purpose[language]}</FormLabel>
                    {/* 目的预设选择器 */}
                    <div className="w-48">
                      {onRenderingSearchableSelect(getIndustryPresetData('purpose'), FROM_LABEL.preset[language], (value) => {
                        form.setValue('purpose', value);
                        form.trigger('purpose');
                      }, 'purpose')}
                    </div>
                  </div>
                  <FormControl>
                    <Textarea 
                      className="min-h-20" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 4. 语气选择与“样本仿写”扩展 */}
            <FormField
              disabled={isLoading}
              control={form.control}
              name="tone"
              render={({ field }: any) => {
                const toneList = dataSource.from.tone?.list || [];
                const isMimicSelected = field.value === 'mimic_by_sample';
                return (
                  <FormItem className="px-3 pb-3">
                    <FormLabel className="font-bold text-black">{FROM_LABEL.tone[language]}</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                        {/* 自定义下拉，基于既有列表 + 追加仿写选项 */}
                        <>
                          <SelectTrigger>
                            <SelectValue placeholder={onReminderInformation('Select', 'tone')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {toneList.map((item: any) => (
                                <SelectItem key={item.chinese} value={item.english || ''}>{item[language]}</SelectItem>
                              ))}
                              {/* 新增：按照提供的样本进行仿写（仅中文文案） */}
                              <SelectItem value="mimic_by_sample">按照提供的样本进行仿写</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </>
                      </Select>
                    </FormControl>
                    <FormMessage />

                    {/* 条件显示：样本 Textarea */}
                    {isMimicSelected && (
                      <FormField
                        disabled={isLoading}
                        control={form.control}
                        name="mimicSample"
                        render={({ field: sampleField }: any) => (
                          <FormItem className="pt-3">
                            <FormLabel className="font-bold text-black">样本</FormLabel>
                            <FormControl>
                              <Textarea className="min-h-40" maxLength={2000} placeholder="请输入用于仿写的样本文字（最多2000字）" {...sampleField} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </FormItem>
                );
              }}
            />
          </>
        ) : isXiaohongshuProductTool ? (
          // 小红书帖子生成工具（商品类）的特殊布局
          <>
            {/* 1. 商品输入 */}
            <FormField
              disabled={isLoading}
              control={form.control}
              name="product"
              render={({ field }: any) => {
                // 获取商品预设数据 - 这里预设数据结构是 {label: MultilingualContent, value: string}
                const productPresets = getIndustryPresetData('product');
                return (
                  <FormItem className="px-3 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <FormLabel className="font-bold text-black">{FROM_LABEL.product[language]}</FormLabel>
                      {/* 商品预设选择器 - 显示简称，值为完整文本 */}
                      <div className="w-48">
                        {productPresets.length > 0 && (
                          <div 
                            className="relative" 
                            ref={(el) => { presetRefs.current['product'] = el; }} 
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              type="button"
                              variant="outline"
                              role="combobox"
                              aria-expanded={presetOpen['product'] || false}
                              className="w-full justify-between"
                              onClick={(e: React.MouseEvent) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setPresetOpen((prev: {[key: string]: boolean}) => ({
                                  ...prev,
                                  ['product']: !prev['product']
                                }));
                              }}
                            >
                              <span className="text-gray-500">{FROM_LABEL.preset[language]}</span>
                              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                            
                            {(presetOpen['product'] || false) && (
                              <div className="absolute right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto min-w-full w-max max-w-96">
                                <div className="space-y-1 p-2">
                                  {productPresets.map((item: any) => (
                                    <div
                                      key={item.label?.chinese || item.chinese}
                                      className="p-2 hover:bg-gray-100 cursor-pointer rounded-md border border-gray-200"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        // 如果有 label 和 value 结构，使用 value；否则使用原始值
                                        const selectedValue = item.value || item[language];
                                        form.setValue('product', selectedValue);
                                        form.trigger('product');
                                        setPresetOpen((prev: {[key: string]: boolean}) => ({
                                          ...prev,
                                          ['product']: false
                                        }));
                                      }}
                                    >
                                      {item.label ? item.label[language] : item[language]}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <FormControl>
                      <Input 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            
            {/* 2. 人设输入 */}
            <FormField
              disabled={isLoading}
              control={form.control}
              name="persona"
              render={({ field }: any) => (
                <FormItem className="px-3 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel className="font-bold text-black">{FROM_LABEL.persona[language]}</FormLabel>
                    {/* 人设预设选择器 */}
                    <div className="w-48">
                      {onRenderingSearchableSelect(getIndustryPresetData('persona'), FROM_LABEL.preset[language], (value) => {
                        form.setValue('persona', value);
                        form.trigger('persona');
                      }, 'persona')}
                    </div>
                  </div>
                  <FormControl>
                    <Input 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 3. 风格选择 */}
            <FormField
              disabled={isLoading}
              control={form.control}
              name="style"
              render={({ field }: any) => {
                // 获取风格预设数据 - 结构是 {label: MultilingualContent, value: string}
                const stylePresets = getIndustryPresetData('style');
                // 随机选择风格的选项文本
                const randomStyleLabel = {
                  chinese: '随机选择风格',
                  english: 'Random Style',
                  japanese: 'ランダムスタイル'
                };
                
                // 检查当前选中的风格是否为随机或空
                const currentStyle = field.value || '__random__';
                const isRandomStyle = currentStyle === '__random__' || !currentStyle;
                
                // 查找当前选中风格的内容
                const selectedStylePreset = stylePresets.find((item: any) => {
                  const itemValue = item.value || item.english || '';
                  return itemValue === currentStyle;
                });
                
                // 处理风格选择变化
                const handleStyleChange = (value: string) => {
                  field.onChange(value);
                };
                
                // 处理参考原文点击
                const handleReferenceClick = () => {
                  if (selectedStylePreset) {
                    // 风格预设可能是 PresetOption 类型（有 value）或 MultilingualContent 类型
                    const content = (selectedStylePreset as any).value || '';
                    setStyleReferenceContent(content);
                    setStyleReferenceOpen(true);
                  }
                };
                
                return (
                  <FormItem className="px-3 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <FormLabel className="font-bold text-black">{FROM_LABEL.style[language]}</FormLabel>
                      {!isRandomStyle && selectedStylePreset && (
                        <button
                          type="button"
                          onClick={handleReferenceClick}
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {language === 'chinese' ? '参考原文' : language === 'english' ? 'Reference' : '参考原文'}
                        </button>
                      )}
                    </div>
                    <FormControl>
                      <Select onValueChange={handleStyleChange} value={currentStyle} disabled={isLoading}>
                        <SelectTrigger>
                          <SelectValue placeholder={randomStyleLabel[language]} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="__random__">
                              {randomStyleLabel[language]}
                            </SelectItem>
                            {stylePresets.map((item: any) => (
                              <SelectItem 
                                key={item.label?.chinese || item.chinese} 
                                value={item.value || item.english || ''}
                              >
                                {item.label ? item.label[language] : item[language]}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </>
        ) : isTikTokTool ? (
          // 抖音短视频脚本工具的特殊布局
          <>
            {/* 1. 宣传目标输入 */}
            <FormField
              disabled={isLoading}
              control={form.control}
              name="promotionGoal"
              render={({ field }: any) => (
                <FormItem className="px-3 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel className="font-bold text-black">{FROM_LABEL.promotionGoal[language]}</FormLabel>
                    {/* 宣传目标预设选择器 */}
                    <div className="w-48">
                      {onRenderingSearchableSelect(getIndustryPresetData('promotionGoal'), FROM_LABEL.preset[language], (value) => {
                        form.setValue('promotionGoal', value);
                        form.trigger('promotionGoal');
                      }, 'promotionGoal')}
                    </div>
                  </div>
                  <FormControl>
                    <Input 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 2. 客群输入 */}
            <FormField
              disabled={isLoading}
              control={form.control}
              name="customerGroup"
              render={({ field }: any) => (
                <FormItem className="px-3 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel className="font-bold text-black">{FROM_LABEL.customerGroup[language]}</FormLabel>
                    {/* 客群预设选择器 */}
                    <div className="w-48">
                      {onRenderingSearchableSelect(getIndustryPresetData('customerGroup'), FROM_LABEL.preset[language], (value) => {
                        form.setValue('customerGroup', value);
                        form.trigger('customerGroup');
                      }, 'customerGroup')}
                    </div>
                  </div>
                  <FormControl>
                    <Input 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 3. 产品/服务亮点输入 */}
            <FormField
              disabled={isLoading}
              control={form.control}
              name="productHighlights"
              render={({ field }: any) => (
                <FormItem className="px-3 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel className="font-bold text-black">{FROM_LABEL.productHighlights[language]}</FormLabel>
                    {/* 产品/服务亮点预设选择器 */}
                    <div className="w-48">
                      {onRenderingSearchableSelect(getIndustryPresetData('productHighlights'), FROM_LABEL.preset[language], (value) => {
                        form.setValue('productHighlights', value);
                        form.trigger('productHighlights');
                      }, 'productHighlights')}
                    </div>
                  </div>
                  <FormControl>
                    <Input 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 4. 限制及禁忌输入 */}
            <FormField
              disabled={isLoading}
              control={form.control}
              name="restrictions"
              render={({ field }: any) => (
                <FormItem className="px-3 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel className="font-bold text-black">{FROM_LABEL.restrictions[language]}</FormLabel>
                    {/* 限制及禁忌预设选择器 */}
                    <div className="w-48">
                      {onRenderingSearchableSelect(getIndustryPresetData('restrictions'), FROM_LABEL.preset[language], (value) => {
                        form.setValue('restrictions', value);
                        form.trigger('restrictions');
                      }, 'restrictions')}
                    </div>
                  </div>
                  <FormControl>
                    <Input 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 5. 语气选择 */}
            <FormField
              disabled={isLoading}
              control={form.control}
              name="tone"
              render={({ field }: any) => (
                <FormItem className="px-3 pb-3">
                  <FormLabel className="font-bold text-black">{FROM_LABEL.tone[language]}</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                      {onRenderingSelect(dataSource.from.tone?.list || [], onReminderInformation('Select', 'tone'))}
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        ) : isWeChatTool ? (
          // 微信图文工具的特殊布局
          <>
            {/* 1. 软文目的输入 */}
            <FormField
              disabled={isLoading}
              control={form.control}
              name="articlePurpose"
              render={({ field }: any) => (
                <FormItem className="px-3 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel className="font-bold text-black">{FROM_LABEL.articlePurpose[language]}</FormLabel>
                    {/* 软文目的预设选择器 */}
                    <div className="w-48">
                      {onRenderingSearchableSelect(WECHAT_ARTICLE_PURPOSE, FROM_LABEL.preset[language], (value) => {
                        form.setValue('articlePurpose', value);
                        form.trigger('articlePurpose');
                      }, 'articlePurpose')}
                    </div>
                  </div>
                  <FormControl>
                    <Input 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 2. 核心产品/服务亮点输入 */}
            <FormField
              disabled={isLoading}
              control={form.control}
              name="productHighlights"
              render={({ field }: any) => (
                <FormItem className="px-3 pb-3">
                  <FormLabel className="font-bold text-black">{FROM_LABEL.productHighlights[language]}</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 3. 客户痛点和需求输入 */}
            <FormField
              disabled={isLoading}
              control={form.control}
              name="customerPainPoints"
              render={({ field }: any) => (
                <FormItem className="px-3 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel className="font-bold text-black">{FROM_LABEL.customerPainPoints[language]}</FormLabel>
                    {/* 客户痛点预设选择器 */}
                    <div className="w-48">
                      {onRenderingSearchableSelect(getIndustryPresetData('customerPainPoints'), FROM_LABEL.preset[language], (value) => {
                        form.setValue('customerPainPoints', value);
                        form.trigger('customerPainPoints');
                      }, 'customerPainPoints')}
                    </div>
                  </div>
                  <FormControl>
                    <Input 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 4. 期待转化动作输入 */}
            <FormField
              disabled={isLoading}
              control={form.control}
              name="conversionAction"
              render={({ field }: any) => (
                <FormItem className="px-3 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel className="font-bold text-black">{FROM_LABEL.conversionAction[language]}</FormLabel>
                    {/* 转化动作预设选择器 */}
                    <div className="w-48">
                      {onRenderingSearchableSelect(WECHAT_ARTICLE_CONVERSION, FROM_LABEL.preset[language], (value) => {
                        form.setValue('conversionAction', value);
                        form.trigger('conversionAction');
                      }, 'conversionAction')}
                    </div>
                  </div>
                  <FormControl>
                    <Input 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 5. 补充内容输入 */}
            <FormField
              disabled={isLoading}
              control={form.control}
              name="additionalContent"
              render={({ field }: any) => (
                <FormItem className="px-3 pb-3">
                  <FormLabel className="font-bold text-black">{FROM_LABEL.additionalContent[language]}</FormLabel>
                  <FormControl>
                    <Textarea 
                      className="min-h-20" 
                      placeholder="输入特殊要求或字数限制（比如：500字左右）"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 6. 风格选择 */}
            <FormField
              disabled={isLoading}
              control={form.control}
              name="articleStyle"
              render={({ field }: any) => (
                <FormItem className="px-3 pb-3">
                  <FormLabel className="font-bold text-black">{FROM_LABEL.articleStyle[language]}</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                      {onRenderingSelect(dataSource.from.articleStyle?.list || [], onReminderInformation('Select', 'articleStyle'))}
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        ) : isSocialMediaBioTool ? (
          // 自媒体起名（三件套）工具的特殊布局
          <>
            {/* 1. 行业定位输入 */}
            <FormField
              disabled={isLoading}
              control={form.control}
              name="industryPosition"
              render={({ field }: any) => (
                <FormItem className="px-3 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel className="font-bold text-black">{FROM_LABEL.industryPosition[language]}</FormLabel>
                    {/* 行业定位预设选择器 */}
                    <div className="w-48">
                      {onRenderingSearchableSelect(getIndustryPresetData('industryPosition'), FROM_LABEL.preset[language], (value) => {
                        form.setValue('industryPosition', value);
                        form.trigger('industryPosition');
                      }, 'industryPosition')}
                    </div>
                  </div>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder={user?.industry === 'housekeeping' ? '家政服务' : '请输入行业定位'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 2. 目标人群输入 */}
            <FormField
              disabled={isLoading}
              control={form.control}
              name="targetAudience"
              render={({ field }: any) => (
                <FormItem className="px-3 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel className="font-bold text-black">{FROM_LABEL.targetAudience[language]}</FormLabel>
                    {/* 目标人群预设选择器 */}
                    <div className="w-48">
                      {onRenderingSearchableSelect(getIndustryPresetData('targetAudience'), FROM_LABEL.preset[language], (value) => {
                        form.setValue('targetAudience', value);
                        form.trigger('targetAudience');
                      }, 'targetAudience')}
                    </div>
                  </div>
                  <FormControl>
                    <Input 
                      placeholder="描述目标用户群体的特征和需求"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 4. 命名偏好输入 */}
            <FormField
              disabled={isLoading}
              control={form.control}
              name="namingPreference"
              render={({ field }: any) => (
                <FormItem className="px-3 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel className="font-bold text-black">{FROM_LABEL.namingPreference[language]}</FormLabel>
                    {/* 命名偏好预设选择器 */}
                    <div className="w-48">
                      {onRenderingSearchableSelect(getIndustryPresetData('namingPreference'), FROM_LABEL.preset[language], (value) => {
                        form.setValue('namingPreference', value);
                        form.trigger('namingPreference');
                      }, 'namingPreference')}
                    </div>
                  </div>
                  <FormControl>
                    <Input 
                      placeholder="描述对名称的偏好和要求"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 5. 避免内容输入 */}
            <FormField
              disabled={isLoading}
              control={form.control}
              name="avoidContent"
              render={({ field }: any) => (
                <FormItem className="px-3 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel className="font-bold text-black">{FROM_LABEL.avoidContent[language]}</FormLabel>
                    {/* 避免内容预设选择器 */}
                    <div className="w-48">
                      {onRenderingSearchableSelect(getIndustryPresetData('avoidContent'), FROM_LABEL.preset[language], (value) => {
                        form.setValue('avoidContent', value);
                        form.trigger('avoidContent');
                      }, 'avoidContent')}
                    </div>
                  </div>
                  <FormControl>
                    <Input 
                      placeholder="描述需要避免的内容和词汇"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 6. 风格选择 */}
            <FormField
              disabled={isLoading}
              control={form.control}
              name="style"
              render={({ field }: any) => (
                <FormItem className="px-3 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel className="font-bold text-black">{FROM_LABEL.style[language]}</FormLabel>
                  </div>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择风格调性" />
                      </SelectTrigger>
                      <SelectContent>
                        {BIO_STYLE.map((style, index) => (
                          <SelectItem key={index} value={style[language]}>
                            {style[language]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        ) : (
          // 其他工具的默认布局
          Object.keys(dataSource.from).map((key: string) => (
            <FormField
              key={key}
              disabled={isLoading}
              control={form.control}
              name={key}
              render={({ field }: any) => (
                <FormItem className="px-3 pb-3" >
                  <FormLabel className="font-bold text-black">{FROM_LABEL[key][language]}</FormLabel>
                  <FormControl>
                    {onRenderingOperationForm(field, key)}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))
        )}
        <div className="flex justify-end p-3" style={{ borderTop: '1px solid #e2e8f0' }}>
          <div className="flex items-center gap-3">
            <div className={`md:w-32 w-24 ${dataSource?.prompt ? 'hidden' : 'block'}`}>
              <Select onValueChange={onChangeOutputLanguage} value={outputLanguage} disabled={isLoading}>
                {onRenderingSelect(LANGUAGE_LIST, OUTPUT_LANGUAGE[language])}
              </Select>
            </div>
            
            {/* 批量生成数量选择器（小红书工具：服务推广帖和商品推广帖） */}
            {(isXiaohongshuTool || isXiaohongshuProductTool) && (
              <div className="flex items-center gap-2">
                <Select 
                  onValueChange={(value) => form.setValue('batchCount', parseInt(value))} 
                  value={form.watch('batchCount')?.toString() || '1'} 
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} 篇
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <Button type="submit" disabled={isLoading || rateLoading} className="bg-[#8e47f0] hover:bg-[#7f39ea] w-64 relative" >
              {
                isLoading ? (
                  <Loader2 className="animate-spin" style={{ width: 18, height: 18 }} />
                ) : (
                  <span>
                    {SUBMIT_BUTTON[dataSource.submitButton][language]}
                    <span className="ml-2 text-xs opacity-80">
                      {(() => {
                        const batchCount = form.watch('batchCount') || 1;
                        const totalCost = deductionRate * batchCount;
                        if ((isXiaohongshuTool || isXiaohongshuProductTool) && batchCount > 1) {
                          return language === 'chinese' 
                            ? `生成 ${batchCount} 篇（${totalCost} 积分）`
                            : language === 'english'
                            ? `Generate ${batchCount} posts (${totalCost} credits)`
                            : `${batchCount} 記事を生成（${totalCost} クレジット）`;
                        }
                        return language === 'chinese' ? `${deductionRate}积分/篇` : 
                               language === 'english' ? `${deductionRate}credits/use` : 
                               `${deductionRate}クレジット/回`;
                      })()}
                    </span>
                  </span>
                )
              }
            </Button>
          </div>
        </div>
      </form>
    </Form>
    <LoginReminderModal
      open={showLoginModal}
      onOpenChange={setShowLoginModal}
    />
    {/* 参考原文对话框 */}
    <Dialog open={styleReferenceOpen} onOpenChange={setStyleReferenceOpen}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {language === 'chinese' ? '参考原文' : language === 'english' ? 'Reference Content' : '参考原文'}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <div className="whitespace-pre-wrap text-sm leading-relaxed p-4 bg-gray-50 rounded-lg border">
            {styleReferenceContent}
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}