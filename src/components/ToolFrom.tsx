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
import { CLEAR_CONTENT_BUTTON, FROM_LABEL, LANGUAGE_LIST, OUTPUT_LANGUAGE, PLEASE_ENTER, PLEASE_SELECT, SUBMIT_BUTTON, ROLE_TEMPLATES } from "@/constant/language";
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
    const outputLanguageTemp = getLocalStorage('language');
    if (outputLanguageTemp) {
      setOutputLanguage(outputLanguageTemp)
    } else {
      setLocalStorage('language', language.replace(/^[a-z]/, (match) => match.toUpperCase()))
    }
  }, [])

  // Close preset dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      let shouldClose = true;
      
      // Check if click is inside any preset dropdown
      Object.values(presetRefs.current).forEach(ref => {
        if (ref && ref.contains(target)) {
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
  const formSchema = z.object(onFormSchema())

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: onFormSchema(true),
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (isLoading) return;
    
    // Check authentication before proceeding
    withAuthCheck(async () => {
      setLoad(true);
      await onOk({ ...data, language: outputLanguage })
      setLoad(false);
    }, window.location.pathname + window.location.search);
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
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setPresetOpen(prev => ({
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
                onChange={(e) => {
                  setSearchQuery(prev => ({
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
                      setPresetOpen(prev => ({
                        ...prev,
                        [fieldKey]: false
                      }));
                      setSearchQuery(prev => ({
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
  
  // 检查是否为抖音短视频脚本工具
  const isTikTokTool = dataSource.title === 'TikTok-post-generation';

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
            
            {/* 4. 语气选择 */}
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
            <Button type="submit" disabled={isLoading || rateLoading} className="bg-[#8e47f0] hover:bg-[#7f39ea] w-64 relative" >
              {
                isLoading ? (
                  <Loader2 className="animate-spin" style={{ width: 18, height: 18 }} />
                ) : (
                  <span>
                    {SUBMIT_BUTTON[dataSource.submitButton][language]}
                    <span className="ml-2 text-xs opacity-80">
                      {language === 'chinese' ? `${deductionRate}积分/次` : 
                       language === 'english' ? `${deductionRate}credits/use` : 
                       `${deductionRate}クレジット/回`}
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
    </>
  )
}