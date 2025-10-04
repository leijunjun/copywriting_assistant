"use client"
import ky from "ky"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { toast } from "./ui/use-toast"
import { Textarea } from "./ui/textarea"
import { ErrMessage } from "./ErrMessage"
import { LuLoader } from "react-icons/lu"
import { useForm } from "react-hook-form"
import { uploadImage } from "@/lib/request"
import { useRouter } from "../../navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useEffect, useRef, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Language, toolList } from "@/constant/tool_list"
import { IoMdAdd, IoMdCloseCircleOutline } from "react-icons/io"
import { classify, LANGUAGE_LIBRARY } from "@/constant/language"
import { useAppDispatch, useAppSelector } from "@/app/store/hooks"
import { selectGlobal, setGlobalState } from "@/app/store/globalSlice"
import { addCustomToolData, getAllCustomToolData } from "@/app/api/customTool/indexedDB"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

interface ISelect {
  custom: Array<Language & { value: string; label: string; }>;
  preset: Array<Language & { value: string; label: string; }>
};

export function CustomToolForm() {
  const router = useRouter();
  const dispatch = useAppDispatch()
  const global = useAppSelector(selectGlobal);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [load, setLoad] = useState(false)
  const [upladLoad, setUpladLoad] = useState(false)
  const [open, setOpen] = useState(false)
  const [selectClassify, setSelectClassify] = useState<ISelect>({ custom: [], preset: [] })

  const FormSchema = z.object({
    name: z.string().min(1, {
      message: LANGUAGE_LIBRARY[global.language]['请输入工具名称'],
    }),
    describe: z.string().min(1, {
      message: LANGUAGE_LIBRARY[global.language]['请输入工具描述'],
    }),
    classify_key: z.string().min(1, {
      message: LANGUAGE_LIBRARY[global.language]['请选择工具分类'],
    }),
    prompt: z.string().min(1, {
      message: LANGUAGE_LIBRARY[global.language]['请输入提示语'],
    }),
    url: z.string().min(1, { message: '' }),
  })

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      describe: '',
      classify_key: '',
      prompt: '',
      url: '/default.png'
    },
  })

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setLoad(true)
    if (onJudgeRepeatTool(data.name)) {
      toast({
        duration: 2000,
        description: LANGUAGE_LIBRARY[global.language]['当前工具已存在']
      })
      setLoad(false)
      return;
    }
    const hostname = process.env.NEXT_PUBLIC_HOSTNAME || window.location.host.split('.')[0]
    const tool_key = hostname.split('-')[0]
    const classifyData = [...selectClassify.custom, ...selectClassify.preset].find(f => f.value === data.classify_key)
    if (classifyData) {
      await addCustomToolData({
        name: { english: data.name, chinese: data.name, japanese: data.name },
        describe: { english: data.describe, chinese: data.describe, japanese: data.describe },
        classify_key: data.classify_key,
        url: data.url,
        prompt: data.prompt,
        tool_key,
        title: data.name.replace(/\s+/g, '-'),
        resultType: 'markdown',
        submitButton: 'Submit',
        classify: classifyData,
        from: {
          content: { type: 'Textarea', isBig: true },
        },
      })
      router.push(`/${data.name.replace(/\s+/g, '-')}`)
    } else {
      toast({
        duration: 2000,
        description: LANGUAGE_LIBRARY[global.language]['当前选择的分类不存在，请刷新页面重新选择分类']
      })
    }
  }

  const onUplaodImage = async (file: FileList | null) => {
    if (!file) return;
    setUpladLoad(true)
    const result = await uploadImage(file[0])
    setUpladLoad(false)
    if (result.status === 200) {
      form.setValue('url', result.data)
    } else {
      toast({
        duration: 2000,
        description: LANGUAGE_LIBRARY[global.language]['图片上传失败']
      })
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const handleChooseImageClick = () => {
    if (upladLoad || load) return;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const onAiGenerateImage = () => {
    if (!form.getValues('name') || upladLoad || load) return;
    setUpladLoad(true)
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    ky('/api/generateImage', {
      method: 'post',
      body: JSON.stringify({ prompt: form.getValues('name') }),
      timeout: false,
      signal: abortController.signal
    }).then(res => res.json())
      .then((res: any) => {
        if (res?.url) {
          form.setValue('url', res.url)
        } else {
          toast({
            duration: 2000,
            description: LANGUAGE_LIBRARY[global.language]['图片生成失败']
          })
        }
        if (res?.error) {
          toast({
            duration: 2000,
            description: (ErrMessage(res?.error?.err_code, global.language))
          })
        }
        console.log(res);
      }).catch(error => {
        console.log(error);
      })
      .finally(() => {
        setUpladLoad(false)
      })
  }

  const onRefreshData = async () => {
    const customToolData = await getAllCustomToolData();
    dispatch(setGlobalState({ customTool: customToolData }))
  }

  const onJudgeRepeatTool = (name: string) => {
    const allTool = Object.keys(toolList).map(key => toolList[key]).flat(2)
    return (allTool.some(s => s.name.chinese === name) || global.customTool.some(s => s.name.chinese === name))
  }

  useEffect(() => {
    if (!open) {
      if (abortControllerRef?.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      const custom = global.classify.map(item => ({ ...item, value: item.classify_key, label: item[global.language] }))
      const preset = classify.map(item => ({ ...item, value: item.english, label: item[global.language] }))
      setSelectClassify({ custom, preset })
      onRefreshData();
    }
    form.reset()
  }, [open, global.classify])

  return (
    <Dialog open={open} onOpenChange={(open) => !load && setOpen(open)}>
      <DialogTrigger asChild>
        <Button size='sm' className={`bg-[#8e47f0] hover:bg-[#7f39ea]`}>
          <IoMdAdd className="mr-2 text-lg text-white" />
          {LANGUAGE_LIBRARY[global.language]['自定义模板']}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[600px] max-h-screen h-auto overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{LANGUAGE_LIBRARY[global.language]['自定义模板']}</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 border-t border-[#000] pt-2 ">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{LANGUAGE_LIBRARY[global.language]['名称']}</FormLabel>
                  <FormControl>
                    <Input className="" placeholder={LANGUAGE_LIBRARY[global.language]['请输入工具名称']} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="describe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{LANGUAGE_LIBRARY[global.language]['描述']}</FormLabel>
                  <FormControl>
                    <Input className="" placeholder={LANGUAGE_LIBRARY[global.language]['请输入工具描述']} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="classify_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{LANGUAGE_LIBRARY[global.language]['分类']}</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder={LANGUAGE_LIBRARY[global.language]['请选择工具分类']} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {selectClassify.custom.map(item => (<SelectItem value={item.value}>{item.label}</SelectItem>))}
                          {selectClassify.preset.map(item => (<SelectItem value={item.value}>{item.label}</SelectItem>))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex justify-between items-center gap-5">
                      <div className="flex flex-col justify-between">
                        <span className="text-sm mb-2">{LANGUAGE_LIBRARY[global.language]['图标']}</span>
                        <p className=" text-[#868e96] text-sm">{LANGUAGE_LIBRARY[global.language]['点击右侧上传图片，或者']}
                          <span className="text-[#7f39ea] mx-2 cursor-pointer" onClick={onAiGenerateImage}>{LANGUAGE_LIBRARY[global.language]['点击这里']}</span>
                          {LANGUAGE_LIBRARY[global.language]['使用AI根据名称生成图标。']}
                        </p>
                      </div>
                      <div className="relative min-w-20 min-h-20 max-w-20 max-h-20 cursor-pointer">
                        {
                          <IoMdCloseCircleOutline
                            className={`absolute -right-1 -top-1 text-xl text-red-600 ${(field.value === '/default.png' || upladLoad || load) ? 'hidden' : 'block'}`}
                            onClick={(e) => { e.stopPropagation; form.setValue('url', '/default.png') }}
                          />
                        }
                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => onUplaodImage(e.target.files)} />
                        <img src={field.value} className="object-cover w-20 h-20 cursor-pointer rounded-md" onClick={handleChooseImageClick} />
                        <div className={`w-full h-full absolute left-0 top-0 justify-center items-center bg-[#ffffff69] ${upladLoad ? 'flex' : 'hidden'}`}>
                          <LuLoader className="animate-spin text-lg" />
                        </div>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{LANGUAGE_LIBRARY[global.language]['提示语']}</FormLabel>
                  <FormDescription className="!mt-0 text-xs">{LANGUAGE_LIBRARY[global.language]['请在下方输入你的提示语，使用时输入的内容将被追加到这个提示语后面']}</FormDescription>
                  <FormControl>
                    <Textarea className='min-h-32' placeholder={LANGUAGE_LIBRARY[global.language]['请输入提示语']} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-4 items-center">
              <Button disabled={load} onClick={() => !load && setOpen(false)}>{LANGUAGE_LIBRARY[global.language]['取消']}</Button>
              <Button type="submit" className="bg-[#8e47f0] hover:bg-[#7f39ea]" disabled={upladLoad || load}>
                {
                  load ? <Loader2 className="animate-spin" style={{ width: 18, height: 18 }} />
                    : LANGUAGE_LIBRARY[global.language]['确认']
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
