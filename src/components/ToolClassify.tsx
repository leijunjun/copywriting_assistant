import { Loader2 } from "lucide-react"
import { toast } from "./ui/use-toast"
import { IoMdAdd } from "react-icons/io"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { classify, LANGUAGE_LIBRARY } from "@/constant/language"
import { useAppDispatch, useAppSelector } from "@/app/store/hooks"
import { selectGlobal, setGlobalState } from "@/app/store/globalSlice"
import { addClassifyData, getAllClassifyData, IClassify } from '@/app/api/classify/indexedDB'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"

export function ToolClassify() {
  const dispatch = useAppDispatch()
  const global = useAppSelector(selectGlobal);

  const [load, setLoad] = useState(false)
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState('');

  const onSubmit = async () => {
    if (!content) {
      toast({ description: (LANGUAGE_LIBRARY[global.language]['请输入内容']) })
      return;
    }
    if (classify.some(s => s.chinese === content) || global.classify.some(s => s.chinese === content)) {
      toast({
        duration: 2000,
        description: LANGUAGE_LIBRARY[global.language]['当前分类已存在']
      })
      return;
    }
    setLoad(true);
    const hostname = process.env.NEXT_PUBLIC_HOSTNAME || window.location.host.split('.')[0]
    const tool_key = hostname.split('-')[0]
    const bodyData = {
      chinese: content,
      english: content,
      japanese: content,
      classify_key: content,
      tool_key
    }
    onSave(bodyData)
    return;
  }

  const onSave = async (params: Omit<IClassify, 'id'>) => {
    await addClassifyData({ ...params });
    setOpen(false)
    setLoad(false)
    toast({ description: LANGUAGE_LIBRARY[global.language]['分类添加成功'] })
  }

  const onRefreshData = async () => {
    const classifyData = await getAllClassifyData();
    dispatch(setGlobalState({ classify: classifyData }))
  }

  const onKeyDown = (e: { key: string }) => {
    const dom = window.document.getElementById("onSubmit")
    if (e?.key === "Enter" && dom) dom.click()
  }

  useEffect(() => {
    if (!open) {
      onRefreshData();
      setContent('');
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={(open) => !load && setOpen(open)}>
      <DialogTrigger asChild>
        <Button size='sm' className={` group border text-black bg-[#fff] hover:bg-[#f5f5f5]`} >
          <IoMdAdd className="text-lg mr-2" />
          {LANGUAGE_LIBRARY[global.language]['自定义分类']}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{LANGUAGE_LIBRARY[global.language]['新增分类']}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input id="username" onKeyDown={onKeyDown} value={content} onChange={(event) => setContent(event.target.value)} placeholder={LANGUAGE_LIBRARY[global.language]['请输入分类名称']} />
        </div>
        <DialogFooter className="gap-3">
          <DialogClose type="button" disabled={load}>{LANGUAGE_LIBRARY[global.language]['取消']}</DialogClose>
          <Button type="submit" size="sm" id="onSubmit" className='text-white bg-[#8e47f0] hover:bg-[#7f39ea]' disabled={load} onClick={onSubmit}>
            {
              load ? <Loader2 className="animate-spin" style={{ width: 18, height: 18 }} />
                : LANGUAGE_LIBRARY[global.language]['确认']
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
