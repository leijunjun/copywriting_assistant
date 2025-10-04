"use client";
import React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "../ui/use-toast";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import PoweredBy from "@/components/PoweredBy";
import { ToolClassify } from "../ToolClassify";
import { Button } from "@/components/ui/button";
import { useRouter } from "../../../navigation";
import { CustomToolForm } from "../CustomToolForm";
import { deleteDatasTool } from "@/app/api/indexedDB";
import { ITool, toolList } from "@/constant/tool_list";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { LanguagePopover } from "@/components/LanguagePopover";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { selectGlobal, setGlobalState } from "@/app/store/globalSlice";
import { debounce, getLanguage, getLocalStorage, setLocalStorage } from "@/lib/utils";
import { deleteCustomToolDataKey, getAllCustomToolData } from "@/app/api/customTool/indexedDB";
import { deleteClassifyData, getAllClassifyData, IClassify } from "@/app/api/classify/indexedDB";
import { CARD_RECENTLY_USED, classify, INPUT_PLACEHOLDER, LANGUAGE_LIBRARY } from "@/constant/language";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";

export default function Home() {
  const dispatch = useAppDispatch()

  const router = useRouter();
  const global = useAppSelector(selectGlobal)

  const [type, setType] = useState('All');
  const [open, setOpen] = useState(false);
  const [delLoad, setDelLoad] = useState(false);
  const [search, setSearch] = useState({ query: '', querying: false });
  const [recentlyUsedData, setRecentlyUsedData] = useState<Array<ITool>>([]);
  const [toolData, setToolData] = useState({ list: toolList, searchList: {} as any });

  const showBrand = process.env.NEXT_PUBLIC_SHOW_BRAND === "true";

  useEffect(() => {
    const lang = getLanguage()
    dispatch(setGlobalState({ language: lang }))
  }, [])

  useEffect(() => {
    onGetRecentlyUsedData()
  }, [toolData])

  useEffect(() => {
    const tempData = JSON.parse(JSON.stringify(toolList));
    Object.keys(tempData).forEach((key) => {
      tempData[key] = tempData[key].sort((a: any, b: any) => {
        const idA = `${a.id}`.substring(`${a.id}`.lastIndexOf('_') + 1);
        const idB = `${b.id}`.substring(`${b.id}`.lastIndexOf('_') + 1);
        return +idB - +idA;
      });
    });
    if (global.customTool.length) {
      for (let index = 0; index < global.customTool.length; index++) {
        const presetToolKeys = Object.keys(tempData);
        const element = global.customTool[index];
        if (presetToolKeys.indexOf(element.classify_key) > -1) {
          tempData[element.classify_key].unshift(element)
        }
        else {
          tempData[element.classify_key] = [element]
        }
      }
    }
    setToolData((v) => ({ ...v, list: tempData }))
  }, [global.customTool])

  const onGetRecentlyUsedData = () => {
    // Get a list of recently used tools
    const recentlyUsedDataTemp = JSON.parse(getLocalStorage('recentlyUsedData') || '[]');
    if (recentlyUsedDataTemp && recentlyUsedDataTemp.length > 0) {
      const arr: Array<ITool> = [];
      recentlyUsedDataTemp.forEach((item: ITool) => {
        const temp = toolData.list[item?.classify?.english]?.find(f => f.id === item.id);
        if (temp?.id) {
          arr.push(temp);
        }
      });
      setRecentlyUsedData(arr)
    } else {
      setRecentlyUsedData([])
    }
  }

  const onSearch = (query: string) => {
    setSearch({ query, querying: true });
    const toolDataTemp: { [key: string]: Array<ITool> } = {};
    if (query || type) {
      for (const key in toolData.list) {
        toolData.list[key].forEach((item: ITool) => {
          const { name, describe } = item;
          if (type !== 'All') {
            if ((name.chinese.indexOf(query) > -1 ||
              name.english.indexOf(query) > -1 ||
              describe.chinese.indexOf(query) > -1 ||
              describe.japanese.indexOf(query) > -1 ||
              describe.english.indexOf(query) > -1) && type === key) {
              if (!toolDataTemp[key]) toolDataTemp[key] = [];
              toolDataTemp[key].push(item)
            }
          } else {
            if (name.chinese.indexOf(query) > -1 ||
              name.english.indexOf(query) > -1 ||
              describe.chinese.indexOf(query) > -1 ||
              describe.japanese.indexOf(query) > -1 ||
              describe.english.indexOf(query) > -1) {
              if (!toolDataTemp[key]) toolDataTemp[key] = [];
              toolDataTemp[key].push(item)
            }
          }
        })
      }
      if (Object.keys(toolDataTemp).length) {
        setToolData((v) => ({ ...v, searchList: toolDataTemp }))
      }
    } else {
      setToolData((v) => ({ ...v, searchList: {} }))
    }
    setSearch((v) => ({ ...v, querying: false }));
  }

  const onRenderingToolCard = (data: Array<Pick<ITool, 'id' | 'title' | 'url' | 'name' | 'describe'>>) => {
    return (
      <div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 trans" >
          {
            data.map(item => (
              <div
                key={item.id}
                onClick={() => router.push(`/${item.title}`)}
                className="flex items-center bg-white cursor-pointer md:p-3 md:h-28 h-24 p-2 hover:shadow-md transition-all relative"
                style={{ border: '1px solid #e2e8f0', borderRadius: 10 }}
              >
                <div className="md:min-w-20 md:max-w-20 md:h-20 min-w-16 max-w-16 h-16" style={{ padding: 5 }} >
                  <img className="w-full object-cover rounded-md" src={item.url} />
                </div>
                <div className="pl-3">
                  <div className="font-bold md:text-lg text-base pb-2 ">{item.name[global.language]}</div>
                  <div className="ellipsis-multi-line text-xs text-gray-500">{item.describe[global.language]}</div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    )
  }

  const onInputChange = debounce((event: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(event.target.value)
  }, 300);

  const onDelCustomTool = (params: IClassify) => {
    const onDelData = async () => {
      setDelLoad(true);
      // Delete custom category
      await deleteClassifyData(params.id)
      // Delete Template
      const result = await deleteCustomToolDataKey(params.classify_key);
      console.log(result);
      if (result.length) {
        await deleteDatasTool(result.map(m => m.id))
      }
      // Delete Recently Used Data
      const recentlyUsedDataTemp: ITool[] = JSON.parse(getLocalStorage('recentlyUsedData') || '[]');
      const temp: ITool[] = [];
      if (recentlyUsedDataTemp && recentlyUsedDataTemp.length) {
        for (let i = 0; i < recentlyUsedDataTemp.length; i++) {
          const element = recentlyUsedDataTemp[i];
          if (element.classify.english !== params.english) {
            temp.push(element);
          }
        }
        setLocalStorage('recentlyUsedData', JSON.stringify(temp))
      }
      const classifyData = await getAllClassifyData();
      const customToolData = await getAllCustomToolData();
      onGetRecentlyUsedData();
      dispatch(setGlobalState({ classify: classifyData, customTool: customToolData }))
      toast({ duration: 2000, description: LANGUAGE_LIBRARY[global.language]['删除成功'] })
      setDelLoad(false);
      setOpen(false)
    }
    return (
      <Dialog open={open} onOpenChange={(open) => !delLoad && setOpen(open)}>
        <DialogTrigger asChild>
          <IoMdCloseCircleOutline className="text-lg ml-1 hover:text-red-600" onClick={(event) => {
            event.stopPropagation();
            setOpen(true);
          }} />
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>{LANGUAGE_LIBRARY[global.language]['删除分类']} “{params[global.language]}” </DialogTitle>
            <DialogDescription>
              {LANGUAGE_LIBRARY[global.language]['是否确认删除此分类，此分类下的模版都会被删除。']}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose type="button" disabled={delLoad}>{LANGUAGE_LIBRARY[global.language]['取消']}</DialogClose>
            <Button type="submit" className="bg-[#8e47f0] hover:bg-[#7f39ea]" onClick={onDelData}>
              {
                delLoad ? <Loader2 className="animate-spin" style={{ width: 18, height: 18 }} />
                  : LANGUAGE_LIBRARY[global.language]['确认']
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  const onDelClassify = async (params: IClassify) => {
    await deleteClassifyData(params.id)
    const classifyData = await getAllClassifyData();
    dispatch(setGlobalState({ classify: classifyData }))
  }

  return (
    <div className="md:py-10 lg:py-14 py-3 min-h-screen relative" style={{ backgroundColor: '#fafafa' }}>
      <div className='absolute right-5 top-2'><LanguagePopover /></div>
      <div className="main-container h-full flex flex-col mx-auto my-0 mb-9" >
        <Header language={global.language} />
        <div className="md:w-[80%] w-[90%] mx-auto my-0 flex transition-all">
          <Input placeholder={INPUT_PLACEHOLDER[global.language]} onChange={onInputChange} />
        </div>
        <div className="flex flex-wrap gap-3 mt-5 mb-2">
          {/* Default Category  */}
          {
            [{ chinese: '全部', english: 'All', japanese: 'すべて' }, ...classify].map((item) => {
              return (
                <Button
                  size='sm'
                  key={item.english}
                  style={{ border: '1px solid #e2e8f0' }}
                  onClick={() => { setType(item.english) }}
                  className={`bg-white text-black hover:bg-[#7f39ea] hover:text-white ${type === item.english && 'bg-[#7f39ea] text-white'} `}
                >
                  {item[global.language]}
                </Button>
              )
            })
          }
          {/* Custom classification */}
          {
            global.classify.map((item) => {
              return (
                <Button
                  size='sm'
                  key={item.english}
                  style={{ border: '1px solid #e2e8f0' }}
                  onClick={() => { setType(item.english) }}
                  className={`bg-white text-black hover:bg-[#7f39ea] hover:text-white ${type === item.english && 'bg-[#7f39ea] text-white'} `}
                >
                  {item[global.language]}
                  {
                    toolData.list[item.classify_key] ?
                      onDelCustomTool(item) :
                      <IoMdCloseCircleOutline className="text-lg ml-1 hover:text-red-600" onClick={(event) => {
                        event.stopPropagation();
                        onDelClassify(item)
                      }} />
                  }
                </Button>
              )
            })
          }
        </div>
        <div className="flex gap-3 my-2">
          <CustomToolForm />
          <ToolClassify />
        </div>
        {/* Recently used tools */}
        <div>
          {
            recentlyUsedData.length && !search.query && type === 'All' ?
              <>
                <div className="font-bold my-3 text-sm md:text-base">{CARD_RECENTLY_USED[global.language]}</div>
                {onRenderingToolCard(recentlyUsedData)}
                <div className="md:mt-8 mt-5 md:mb-4 mb-2" style={{ borderBottom: '1px solid #dadada' }}></div>
              </> : <></>
          }
        </div>
        {/* Tool List */}
        {
          [...global.classify, ...classify].filter(f => type === 'All' ? f : f.english === type).map(item => (
            <React.Fragment key={item.english}>
              {
                !search.query && toolData.list[item.english]?.length && <>
                  <div className="font-bold my-3 text-sm md:text-base">{item[global.language]}</div>
                  {onRenderingToolCard(toolData.list[item.english])}
                </>
              }
              {
                search.query && toolData.searchList[item.english]?.length && <>
                  <div className="font-bold my-3 text-sm md:text-base">{item[global.language]}</div>
                  {onRenderingToolCard(toolData.searchList[item.english])}
                </>
              }
            </React.Fragment>
          ))
        }
      </div>
      {showBrand && <PoweredBy language={global.language} />}
    </div>
  );
}
