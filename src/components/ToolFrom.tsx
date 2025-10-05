import { z } from "zod";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2, Search } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { useForm } from 'react-hook-form';
import { useEffect, useState } from "react";
import { ITool } from "@/constant/tool_list";
import { zodResolver } from "@hookform/resolvers/zod";
import { getLocalStorage, setLocalStorage } from "@/lib/utils";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CLEAR_CONTENT_BUTTON, FROM_LABEL, LANGUAGE_LIST, OUTPUT_LANGUAGE, PLEASE_ENTER, PLEASE_SELECT, SUBMIT_BUTTON, XIAOHONGSHU_PRESET_CONTENT } from "@/constant/language";

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
  const [presetOpen, setPresetOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
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

  const onReminderInformation = (type: string, key: string) => {
    switch (type) {
      case 'Select':
        return `${PLEASE_SELECT[language]}${FROM_LABEL[key][language]}`
      default:
        return `${PLEASE_ENTER[language]}${FROM_LABEL[key][language]}`
    }
  }

  const onFormSchema = (defaultValues?: boolean) => {
    let obj: { [key: string]: any } = {};
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
    setLoad(true);
    await onOk({ ...data, language: outputLanguage })
    setLoad(false);
  }

  const onChangeOutputLanguage = (value: string) => {
    if (value) {
      setOutputLanguage(value);
      setLocalStorage('language', value)
    }
  }

  const onPresetSelect = (value: string) => {
    if (value) {
      form.setValue('content', value);
      setPresetOpen(false);
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

  const onRenderingSearchableSelect = (data: Array<{ chinese: string; english: string, japanese: string, value?: string }>, placeholder: string, onSelect: (value: string) => void) => {
    // 过滤数据 based on search query
    const filteredData = data.filter(item => 
      item[language].toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <Popover open={presetOpen} onOpenChange={(open) => {
        setPresetOpen(open);
        if (!open) {
          setSearchQuery(''); // 关闭时清空搜索
        }
      }}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={presetOpen}
            className="w-full justify-between"
          >
            <span className="text-gray-500">{placeholder}</span>
            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <div className="max-h-60 overflow-auto">
            <div className="p-2">
              <input
                type="text"
                placeholder={`搜索${placeholder}...`}
                className="w-full p-2 border rounded-md mb-2"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
              />
            </div>
            <div className="space-y-1">
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <div
                    key={item.chinese}
                    className="p-2 hover:bg-gray-100 cursor-pointer rounded-md"
                    onClick={() => {
                      onSelect(item[language]);
                      setPresetOpen(false);
                      setSearchQuery('');
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
        </PopoverContent>
      </Popover>
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} >
        {isXiaohongshuTool ? (
          // 小红书帖子生成工具的特殊布局
          <>
            {/* 内容输入区域 - 包含预设选择器 */}
            <FormField
              disabled={isLoading}
              control={form.control}
              name="content"
              render={({ field }: any) => (
                <FormItem className="px-3 pb-3">
                  <FormLabel className="font-bold text-black">{FROM_LABEL.content[language]}</FormLabel>
                  <FormControl>
                    <div className="space-y-2 relative">
                      {/* 预设内容选择器 */}
                      <div className="flex gap-2">
                        {onRenderingSearchableSelect(XIAOHONGSHU_PRESET_CONTENT, FROM_LABEL.preset[language], onPresetSelect)}
                      </div>
                      {/* 内容输入框 */}
                      <Textarea 
                        className="min-h-20" 
                        placeholder={onReminderInformation('Textarea', 'content')} 
                        {...field} 
                      />
                      {/* 清空内容按钮 - 悬浮在右下角 */}
                      <Button 
                        disabled={isLoading} 
                        type="button" 
                        variant="ghost" 
                        onClick={() => form.reset()}
                        className="absolute bottom-2 right-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-2 py-1 text-xs"
                      >
                        {CLEAR_CONTENT_BUTTON[language]}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 语气选择 */}
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
            <Button type="submit" disabled={isLoading} className="bg-[#8e47f0] hover:bg-[#7f39ea] w-64" >
              {
                isLoading ? <Loader2 className="animate-spin" style={{ width: 18, height: 18 }} />
                  : SUBMIT_BUTTON[dataSource.submitButton][language]
              }
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}