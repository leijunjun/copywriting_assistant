"use client";
import React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "../ui/use-toast";
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
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { selectGlobal, setGlobalState } from "@/app/store/globalSlice";
import { debounce, getLanguage, getLocalStorage, setLocalStorage } from "@/lib/utils";
import { deleteCustomToolDataKey, getAllCustomToolData } from "@/app/api/customTool/indexedDB";
import { deleteClassifyData, getAllClassifyData, IClassify } from "@/app/api/classify/indexedDB";
import { CARD_RECENTLY_USED, classify, INPUT_PLACEHOLDER, LANGUAGE_LIBRARY, HOME_TITLE, HOME_SEARCH_PLACEHOLDER, HOME_CATEGORY_NAVIGATION, HOME_ALL_CATEGORIES, HOME_SIDEBAR_HIDE, HOME_SIDEBAR_SHOW } from "@/constant/language";
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
  const [sidebarVisible, setSidebarVisible] = useState(true);

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
        <div className={`grid gap-3 sm:gap-4 transition-all ${
          sidebarVisible 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        }`}>
          {
            data.map(item => (
              <div
                key={item.id}
                onClick={() => router.push(`/${item.title}`)}
                className="group flex items-center bg-bg-100 cursor-pointer p-3 sm:p-4 h-24 sm:h-28 md:h-32 hover:shadow-xl hover:shadow-primary-300/20 transition-all duration-300 relative rounded-xl border border-bg-300 hover:border-primary-200 hover:-translate-y-1 w-full"
                style={{ 
                  background: 'linear-gradient(135deg, var(--bg-100) 0%, var(--bg-200) 100%)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                }}
              >
                <div className="md:min-w-20 md:max-w-20 md:h-20 min-w-16 max-w-16 h-16 p-2 bg-gradient-to-br from-primary-300/20 to-primary-200/20 rounded-lg group-hover:from-primary-300/40 group-hover:to-primary-200/40 transition-all duration-300">
                  <img className="w-full h-full object-cover rounded-md" src={item.url} />
                </div>
                <div className="pl-4 flex-1 min-w-0">
                  <div className="font-bold md:text-lg text-base pb-2 text-text-100 group-hover:text-primary-100 transition-colors duration-300 truncate">
                    {item.name[global.language]}
                  </div>
                  <div className="text-sm text-text-200 group-hover:text-text-100 transition-colors duration-300 line-clamp-2">
                    {item.describe[global.language]}
                  </div>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-2 h-2 bg-primary-200 rounded-full"></div>
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
    <div className="min-h-screen relative housekeeping-theme pt-16 w-full overflow-x-hidden">
      {/* 装饰性背景元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-300 to-primary-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/3 -left-32 w-64 h-64 bg-gradient-to-br from-primary-200 to-primary-300 rounded-full opacity-15 blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-primary-300 to-primary-200 rounded-full opacity-10 blur-3xl"></div>
        
        {/* 家政服务相关的装饰图标 */}
        <div className="absolute top-20 left-10 text-primary-300 opacity-20">
          <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <div className="absolute top-1/2 right-20 text-primary-300 opacity-15">
          <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <div className="absolute bottom-20 left-1/4 text-primary-300 opacity-20">
          <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
      </div>
      
      {/* 主要内容区域 */}
      <div className="relative z-10 min-h-screen">
        {/* 左侧导航栏 */}
        <div className={`hidden lg:flex w-80 bg-bg-100/80 backdrop-blur-sm border-r border-bg-300 flex-col transition-all duration-300 fixed left-0 top-16 h-[calc(100vh-4rem)] z-20 ${
          sidebarVisible ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {/* 分类导航标题 */}
          <div className="p-6 border-b border-bg-300">
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary-100 to-primary-200 bg-clip-text text-transparent">
              {HOME_CATEGORY_NAVIGATION[global.language]}
            </h2>
          </div>
          
          {/* 预设分类列表 */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="space-y-2">
              {/* 全部分类 */}
              <Button
                variant={type === 'All' ? "default" : "ghost"}
                onClick={() => { setType('All') }}
                className={`w-full justify-start h-12 px-4 text-left transition-all duration-200 ${
                  type === 'All' 
                    ? 'bg-gradient-to-r from-primary-100 to-primary-200 hover:from-primary-200 hover:to-primary-100 text-white shadow-lg' 
                    : 'hover:bg-primary-300/20 hover:text-primary-100 text-text-200'
                }`}
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span className="text-sm font-medium truncate">{HOME_ALL_CATEGORIES[global.language]}</span>
                </div>
              </Button>
              
              {/* 预设分类 */}
              {classify.map((item) => {
                // 为每个分类定义图标
                const getCategoryIcon = (category: string) => {
                  const iconMap: { [key: string]: string } = {
                    'Writing': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
                    'Social Media': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z',
                    'Marketing': 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
                    'Education': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
                    'Project Management': 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
                    'Lifestyle': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z',
                    'Work Efficiency': 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'
                  };
                  return iconMap[category] || 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';
                };

                return (
                  <Button
                    key={item.english}
                    variant={type === item.english ? "default" : "ghost"}
                    onClick={() => { setType(item.english) }}
                    className={`w-full justify-start h-12 px-4 text-left transition-all duration-200 ${
                      type === item.english 
                        ? 'bg-gradient-to-r from-primary-100 to-primary-200 hover:from-primary-200 hover:to-primary-100 text-white shadow-lg' 
                        : 'hover:bg-primary-300/20 hover:text-primary-100 text-text-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d={getCategoryIcon(item.english)}/>
                      </svg>
                      <span className="text-sm font-medium truncate">{item[global.language]}</span>
                    </div>
                  </Button>
                );
              })}
              
              {/* 自定义分类 */}
              {global.classify.map((item) => (
                <Button
                  key={item.english}
                  variant={type === item.english ? "default" : "ghost"}
                  onClick={() => { setType(item.english) }}
                  className={`w-full justify-start h-12 px-4 text-left transition-all duration-200 group ${
                    type === item.english 
                      ? 'bg-gradient-to-r from-primary-100 to-primary-200 hover:from-primary-200 hover:to-primary-100 text-white shadow-lg' 
                      : 'hover:bg-primary-300/20 hover:text-primary-100 text-text-200'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      <span className="text-sm font-medium truncate">{item[global.language]}</span>
                    </div>
                    {toolData.list[item.classify_key] ? (
                      onDelCustomTool(item)
                    ) : (
                      <IoMdCloseCircleOutline 
                        className="text-lg hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100" 
                        onClick={(event) => {
                          event.stopPropagation();
                          onDelClassify(item)
                        }} 
                      />
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </div>
          
          {/* 底部按钮区域 */}
          <div className="p-3 border-t border-bg-300 space-y-2">
            <CustomToolForm />
            <ToolClassify />
          </div>
        </div>
        
        {/* 右侧内容区域 */}
        <div className={`flex flex-col transition-all duration-300 ${
          sidebarVisible ? 'lg:ml-80 ml-0' : 'ml-0'
        } mobile-content`}>
          {/* 顶部搜索区域 */}
          <div className="p-4 sm:p-6 lg:p-8 border-b border-bg-300 bg-bg-100/60 backdrop-blur-sm w-full">
            {/* 侧边栏切换按钮 */}
            <div className={`absolute top-4 lg:block hidden transition-all duration-300 ${
              sidebarVisible ? 'left-4' : 'left-4'
            }`}>
              <button
                onClick={() => setSidebarVisible(!sidebarVisible)}
                className="p-2 rounded-lg bg-bg-100/80 backdrop-blur-sm border border-bg-300 hover:bg-bg-200 transition-all duration-200 shadow-sm hover:shadow-md"
                title={sidebarVisible ? HOME_SIDEBAR_HIDE[global.language] : HOME_SIDEBAR_SHOW[global.language]}
              >
                {sidebarVisible ? (
                  <svg className="w-5 h-5 text-accent-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-accent-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
            <div className={`mx-auto text-center transition-all duration-300 ${
              sidebarVisible ? 'max-w-3xl' : 'max-w-7xl'
            }`}>
              {/* 主标题 */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary-100 to-primary-200 bg-clip-text text-transparent">
                {HOME_TITLE[global.language]}
              </h1>
              
              {/* 搜索框 */}
              <div className="relative">
                <Input 
                  placeholder={HOME_SEARCH_PLACEHOLDER[global.language]} 
                  onChange={onInputChange}
                  className="w-full h-12 sm:h-14 lg:h-16 px-4 sm:px-6 pr-12 sm:pr-16 text-base sm:text-lg lg:text-xl border-2 sm:border-3 border-bg-300 rounded-xl sm:rounded-2xl focus:border-primary-100 focus:ring-4 sm:focus:ring-6 focus:ring-primary-300/20 transition-all duration-300 shadow-lg sm:shadow-xl hover:shadow-xl sm:hover:shadow-2xl bg-bg-100/95 backdrop-blur-sm focus:scale-105"
                />
                <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
                  <svg className="w-6 h-6 text-accent-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* 移动端分类选择器 */}
          <div className="lg:hidden p-3 sm:p-4 border-b border-bg-300 bg-bg-100/60 backdrop-blur-sm w-full">
            <div className="flex flex-wrap gap-2">
              {/* Default Category  */}
              {
                [{ chinese: HOME_ALL_CATEGORIES.chinese, english: HOME_ALL_CATEGORIES.english, japanese: HOME_ALL_CATEGORIES.japanese }, ...classify].map((item) => {
                  return (
                    <Button
                      size='sm'
                      key={item.english}
                      variant={type === item.english ? "default" : "outline"}
                      onClick={() => { setType(item.english) }}
                      className={`transition-all duration-200 ${
                        type === item.english 
                          ? 'bg-gradient-to-r from-primary-100 to-primary-200 hover:from-primary-200 hover:to-primary-100 text-white shadow-lg' 
                          : 'bg-bg-100 hover:bg-primary-300/20 hover:border-primary-200 hover:text-primary-100 border-bg-300'
                      }`}
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
                      variant={type === item.english ? "default" : "outline"}
                      onClick={() => { setType(item.english) }}
                      className={`transition-all duration-200 ${
                        type === item.english 
                          ? 'bg-gradient-to-r from-primary-100 to-primary-200 hover:from-primary-200 hover:to-primary-100 text-white shadow-lg' 
                          : 'bg-bg-100 hover:bg-primary-300/20 hover:border-primary-200 hover:text-primary-100 border-bg-300'
                      }`}
                    >
                      {item[global.language]}
                      {
                        toolData.list[item.classify_key] ?
                          onDelCustomTool(item) :
                          <IoMdCloseCircleOutline className="text-lg ml-1 hover:text-red-600 transition-colors" onClick={(event) => {
                            event.stopPropagation();
                            onDelClassify(item)
                          }} />
                      }
                    </Button>
                  )
                })
              }
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3">
              <CustomToolForm />
              <ToolClassify />
            </div>
          </div>
          
          {/* 内容滚动区域 */}
          <div className={`transition-all duration-300 pb-8 ${
            sidebarVisible ? 'p-4 sm:p-6' : 'px-4 sm:px-6 lg:px-12 py-4 sm:py-6 lg:py-8'
          }`}>
            {/* Recently used tools */}
            <div>
              {
                recentlyUsedData.length && !search.query && type === 'All' ?
                  <>
                    <div className="flex items-center my-6">
                      <div className="h-8 w-1 bg-gradient-to-b from-primary-100 to-primary-200 rounded-full mr-3"></div>
                      <h2 className="font-bold text-lg md:text-xl bg-gradient-to-r from-primary-100 to-primary-200 bg-clip-text text-transparent">
                        {CARD_RECENTLY_USED[global.language]}
                      </h2>
                    </div>
                    {onRenderingToolCard(recentlyUsedData)}
                    <div className="md:mt-8 mt-6 md:mb-6 mb-4 h-px bg-gradient-to-r from-transparent via-bg-300 to-transparent"></div>
                  </> : <></>
              }
            </div>
            
            {/* Tool List */}
            {
              [...global.classify, ...classify].filter(f => type === 'All' ? f : f.english === type).map(item => (
                <React.Fragment key={item.english}>
                  {
                    !search.query && toolData.list[item.english]?.length && <>
                      <div className="flex items-center my-6">
                        <div className="h-8 w-1 bg-gradient-to-b from-primary-100 to-primary-200 rounded-full mr-3"></div>
                        <h2 className="font-bold text-lg md:text-xl bg-gradient-to-r from-primary-100 to-primary-200 bg-clip-text text-transparent">
                          {item[global.language]}
                        </h2>
                      </div>
                      {onRenderingToolCard(toolData.list[item.english])}
                    </>
                  }
                  {
                    search.query && toolData.searchList[item.english]?.length && <>
                      <div className="flex items-center my-6">
                        <div className="h-8 w-1 bg-gradient-to-b from-primary-100 to-primary-200 rounded-full mr-3"></div>
                        <h2 className="font-bold text-lg md:text-xl bg-gradient-to-r from-primary-100 to-primary-200 bg-clip-text text-transparent">
                          {item[global.language]}
                        </h2>
                      </div>
                      {onRenderingToolCard(toolData.searchList[item.english])}
                    </>
                  }
                </React.Fragment>
              ))
            }
          </div>
        </div>
      </div>
      
      {showBrand && <PoweredBy language={global.language} />}
    </div>
  );
}
