"use client";
import React, { memo, useMemo, useCallback, lazy, Suspense } from "react";
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
import { useAuth } from "@/lib/auth/auth-context";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { HomePageSkeleton, LoadingIndicator, ToolCardSkeleton } from "../ui/loading-skeleton";

// 懒加载旋转文字组件
const GradientRotatingText = lazy(() => import("../ui/rotating-text").then(module => ({ default: module.GradientRotatingText })));

// 优化的工具卡片组件
const ToolCard = memo(({ item, global, router, isTikTok }: { 
  item: Pick<ITool, 'id' | 'title' | 'url' | 'name' | 'describe'>, 
  global: any, 
  router: any,
  isTikTok: boolean 
}) => {
  const handleClick = useCallback(() => {
    router.push(`/${item.title}`);
  }, [router, item.title]);

  return (
    <div
      key={item.id}
      onClick={handleClick}
      className={`group flex items-center cursor-pointer p-3 sm:p-4 h-24 sm:h-28 md:h-32 hover:shadow-xl transition-all duration-300 relative rounded-xl border hover:-translate-y-1 w-full ${
        isTikTok 
          ? 'bg-bg-100 border-pink-300/30 hover:border-pink-400/50 hover:shadow-pink-300/20' 
          : 'bg-bg-100 border-bg-300 hover:border-primary-200 hover:shadow-primary-300/20'
      }`}
      style={{ 
        background: 'linear-gradient(135deg, var(--bg-100) 0%, var(--bg-200) 100%)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
      }}
    >
      <div className={`md:min-w-20 md:max-w-20 md:h-20 min-w-16 max-w-16 h-16 p-2 rounded-lg transition-all duration-300 ${
        isTikTok 
          ? 'bg-gradient-to-br from-pink-500/20 to-cyan-500/20 group-hover:from-pink-500/40 group-hover:to-cyan-500/40' 
          : 'bg-gradient-to-br from-primary-300/20 to-primary-200/20 group-hover:from-primary-300/40 group-hover:to-primary-200/40'
      }`}>
        <img 
          className="w-full h-full object-cover rounded-md" 
          src={item.url} 
          alt={item.name[global.language as keyof typeof item.name]}
          loading="lazy"
        />
      </div>
      <div className="pl-4 flex-1 min-w-0">
        <div className="font-bold md:text-lg text-base pb-2 text-text-100 group-hover:text-primary-100 transition-colors duration-300 truncate">
          {item.name[global.language as keyof typeof item.name]}
        </div>
        <div className="text-sm text-text-200 group-hover:text-text-100 transition-colors duration-300 line-clamp-2">
          {item.describe[global.language as keyof typeof item.describe]}
        </div>
      </div>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className={`w-2 h-2 rounded-full ${
          isTikTok ? 'bg-pink-400' : 'bg-primary-200'
        }`}></div>
      </div>
    </div>
  );
});

ToolCard.displayName = 'ToolCard';

// 优化的工具列表组件
const ToolList = memo(({ data, global, router, sidebarVisible, loading }: {
  data: Array<Pick<ITool, 'id' | 'title' | 'url' | 'name' | 'describe'>>,
  global: any,
  router: any,
  sidebarVisible: boolean,
  loading?: boolean
}) => {
  if (loading) {
    return (
      <div className={`grid gap-3 sm:gap-4 transition-all ${
        sidebarVisible 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      }`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <ToolCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={`grid gap-3 sm:gap-4 transition-all ${
      sidebarVisible 
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    }`}>
      {data.map(item => {
        const isTikTok = item.title === 'tiktok-post-generation';
        return (
          <ToolCard
            key={item.id}
            item={item}
            global={global}
            router={router}
            isTikTok={isTikTok}
          />
        );
      })}
    </div>
  );
});

ToolList.displayName = 'ToolList';

export default function Home() {
  const dispatch = useAppDispatch()
  const router = useRouter();
  const global = useAppSelector(selectGlobal)
  const { authState } = useAuth();
  const { user } = authState;

  const [type, setType] = useState('All');
  const [open, setOpen] = useState(false);
  const [delLoad, setDelLoad] = useState(false);
  const [search, setSearch] = useState({ query: '', querying: false });
  const [recentlyUsedData, setRecentlyUsedData] = useState<Array<ITool>>([]);
  const [toolData, setToolData] = useState({ list: toolList, searchList: {} as any });
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const showBrand = process.env.NEXT_PUBLIC_SHOW_BRAND === "true";

  // 根据用户行业生成动态搜索框占位符
  const getDynamicSearchPlaceholder = () => {
    if (!user?.industry || user.industry === 'general') {
      return HOME_SEARCH_PLACEHOLDER[global.language];
    }
    
    const industryNames = {
      housekeeping: { chinese: '家政', english: 'Housekeeping', japanese: '家事代行' },
      beauty: { chinese: '医疗美容', english: 'Medical Beauty', japanese: '医療美容' },
      'lifestyle-beauty': { chinese: '生活美容', english: 'Lifestyle Beauty', japanese: '生活美容' },
      general: { chinese: '通用', english: 'General', japanese: '一般' }
    };
    
    const industryName = industryNames[user.industry as keyof typeof industryNames];
    const basePlaceholder = HOME_SEARCH_PLACEHOLDER[global.language];
    
    if (global.language === 'chinese') {
      return `查找你需要的 ${industryName.chinese} AI 智能体`;
    } else if (global.language === 'english') {
      return `Find the ${industryName.english} AI Agent You Need`;
    } else if (global.language === 'japanese') {
      return `必要な${industryName.japanese}AIエージェントを見つける`;
    }
    
    return basePlaceholder;
  };

  // 初始化加载状态
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const lang = getLanguage();
        dispatch(setGlobalState({ language: lang }));
        
        // 模拟初始化时间，确保加载状态可见
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setIsInitialLoading(false);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setIsInitialLoading(false);
      }
    };

    initializeApp();
  }, [dispatch]);

  // 优化搜索逻辑
  const searchResults = useMemo(() => {
    if (!search.query && type === 'All') {
      return {};
    }

    const toolDataTemp: { [key: string]: Array<ITool> } = {};
    const query = search.query.toLowerCase();
    
    for (const key in toolData.list) {
      toolData.list[key].forEach((item: ITool) => {
        const { name, describe } = item;
        const matchesQuery = !query || (
          name.chinese.toLowerCase().includes(query) ||
          name.english.toLowerCase().includes(query) ||
          describe.chinese.toLowerCase().includes(query) ||
          describe.japanese.toLowerCase().includes(query) ||
          describe.english.toLowerCase().includes(query)
        );
        
        const matchesType = type === 'All' || type === key;
        
        if (matchesQuery && matchesType) {
          if (!toolDataTemp[key]) toolDataTemp[key] = [];
          toolDataTemp[key].push(item);
        }
      });
    }
    
    return toolDataTemp;
  }, [search.query, type, toolData.list]);

  useEffect(() => {
    onGetRecentlyUsedData();
  }, [toolData]);

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
          tempData[element.classify_key].unshift(element);
        } else {
          tempData[element.classify_key] = [element];
        }
      }
    }
    setToolData((v) => ({ ...v, list: tempData }));
  }, [global.customTool]);

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

  const onSearch = useCallback((query: string) => {
    setSearch({ query, querying: true });
    // 搜索结果现在由useMemo处理，这里只需要更新状态
    setTimeout(() => {
      setSearch((v) => ({ ...v, querying: false }));
    }, 100);
  }, []);

  const onRenderingToolCard = (data: Array<Pick<ITool, 'id' | 'title' | 'url' | 'name' | 'describe'>>) => {
    return (
      <div>
        <div className={`grid gap-3 sm:gap-4 transition-all ${
          sidebarVisible 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        }`}>
          {
            data.map(item => {
              // 为抖音工具添加特殊样式
              const isTikTok = item.title === 'tiktok-post-generation';
              
              return (
                <div
                  key={item.id}
                  onClick={() => router.push(`/${item.title}`)}
                  className={`group flex items-center cursor-pointer p-3 sm:p-4 h-24 sm:h-28 md:h-32 hover:shadow-xl transition-all duration-300 relative rounded-xl border hover:-translate-y-1 w-full ${
                    isTikTok 
                      ? 'bg-bg-100 border-pink-300/30 hover:border-pink-400/50 hover:shadow-pink-300/20' 
                      : 'bg-bg-100 border-bg-300 hover:border-primary-200 hover:shadow-primary-300/20'
                  }`}
                  style={{ 
                    background: 'linear-gradient(135deg, var(--bg-100) 0%, var(--bg-200) 100%)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                  }}
                >
                  <div className={`md:min-w-20 md:max-w-20 md:h-20 min-w-16 max-w-16 h-16 p-2 rounded-lg transition-all duration-300 ${
                    isTikTok 
                      ? 'bg-gradient-to-br from-pink-500/20 to-cyan-500/20 group-hover:from-pink-500/40 group-hover:to-cyan-500/40' 
                      : 'bg-gradient-to-br from-primary-300/20 to-primary-200/20 group-hover:from-primary-300/40 group-hover:to-primary-200/40'
                  }`}>
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
                    <div className={`w-2 h-2 rounded-full ${
                      isTikTok ? 'bg-pink-400' : 'bg-primary-200'
                    }`}></div>
                  </div>
                </div>
              );
            })
          }
        </div>
      </div>
    )
  }

  const onInputChange = useCallback(debounce((event: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(event.target.value);
  }, 300), [onSearch]);

  // 显示初始加载状态
  if (isInitialLoading) {
    return <HomePageSkeleton />;
  }

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
    <div className="min-h-screen relative housekeeping-theme pt-16 w-full overflow-x-hidden pb-20">
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
        }`} style={{ 
          maxHeight: 'calc(100vh - 4rem)',
          overflowY: 'auto'
        }}>
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
                    // 公域推广 - 推广图标
                    'Public Domain Promotion': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z',
                    
                    // 内容创作 - 编辑图标
                    'Writing': 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
                    
                    // 营销活动 - 趋势图标
                    'Marketing': 'M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z',
                    
                    // 微信私域 - 微信图标
                    'WeChat Private Domain': 'M8.5 2C6.57 2 5 3.57 5 5.5S6.57 9 8.5 9S12 7.43 12 5.5S10.43 2 8.5 2ZM8.5 7C7.67 7 7 6.33 7 5.5S7.67 4 8.5 4S10 4.67 10 5.5S9.33 7 8.5 7ZM15.5 2C13.57 2 12 3.57 12 5.5S13.57 9 15.5 9S19 7.43 19 5.5S17.43 2 15.5 2ZM15.5 7C14.67 7 14 6.33 14 5.5S14.67 4 15.5 4S17 4.67 17 5.5S16.33 7 15.5 7ZM8.5 10C6.57 10 5 11.57 5 13.5S6.57 17 8.5 17S12 15.43 12 13.5S10.43 10 8.5 10ZM8.5 15C7.67 15 7 14.33 7 13.5S7.67 12 8.5 12S10 12.67 10 13.5S9.33 15 8.5 15ZM15.5 10C13.57 10 12 11.57 12 13.5S13.57 17 15.5 17S19 15.43 19 13.5S17.43 10 15.5 10ZM15.5 15C14.67 15 14 14.33 14 13.5S14.67 12 15.5 12S17 12.67 17 13.5S16.33 15 15.5 15Z',
                    
                    // 教育培训 - 书本图标
                    'Education': 'M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM17 12H7V10H17V12ZM15 16H7V14H15V16ZM17 8H7V6H17V8Z',
                    
                    // 顾客互动 - 聊天图标
                    'Customer Interaction': 'M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z',
                    
                    // 工作提效 - 齿轮图标
                    'Work Efficiency': 'M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z'
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
            {/* AI出图按钮 */}
            <Button
              onClick={() => router.push('/ai-image-generation')}
              className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
                <span>AI 出图</span>
              </div>
            </Button>
          </div>
        </div>
        
        {/* 右侧内容区域 */}
        <div className={`flex flex-col transition-all duration-300 min-h-screen ${
          sidebarVisible ? 'lg:ml-80 ml-0' : 'ml-0'
        } mobile-content`}>
          {/* 顶部搜索区域 */}
          <div className="relative p-4 sm:p-6 lg:p-8 border-b border-bg-300 bg-bg-100/60 backdrop-blur-sm w-full overflow-hidden">
            {/* 创作者主题背景装饰 */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* 创意画笔装饰 */}
              <div className="absolute top-4 right-8 text-primary-300/20 creator-float">
                <svg className="w-16 h-16 sm:w-20 sm:h-20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
              </div>
              
              {/* 创意灯泡装饰 */}
              <div className="absolute top-8 left-8 text-primary-200/15 creator-pulse">
                <svg className="w-12 h-12 sm:w-16 sm:h-16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/>
                </svg>
              </div>
              
              {/* 创意星星装饰 */}
              <div className="absolute bottom-4 right-16 text-primary-300/10 creator-sparkle">
                <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              
              {/* 创意音符装饰 */}
              <div className="absolute bottom-8 left-16 text-primary-200/20 creator-float">
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </div>
              
              {/* 渐变背景层 */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-300/5 via-transparent to-primary-200/10"></div>
            </div>
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
              {/* 主标题 - 旋转文字动画 */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                <Suspense fallback={
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-100 to-primary-200 bg-clip-text text-transparent">
                    {HOME_TITLE[global.language]}
                  </div>
                }>
                  <GradientRotatingText
                    words={global.language === 'chinese' ? [
                      HOME_TITLE[global.language],
                      "智能文案生成",
                      "AI 精准配图", 
                      "AI文秘，最佳创作伴侣"
                    ] : global.language === 'english' ? [
                      HOME_TITLE[global.language],
                      "Smart Content Generation",
                      "AI Precision Image Generation",
                      "AI Secretary, Your Best Creative Partner"
                    ] : [
                      HOME_TITLE[global.language],
                      "スマートコンテンツ生成",
                      "AI精密画像生成",
                      "AI秘書、最高の創作パートナー"
                    ]}
                    className="text-2xl sm:text-3xl md:text-4xl font-bold"
                    duration={2500}
                    delay={200}
                    gradientFrom="from-primary-100"
                    gradientTo="to-primary-200"
                  />
                </Suspense>
              </h1>
              
              {/* 搜索框 */}
              <div className="relative">
                {/* 搜索框装饰背景 */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-300/10 via-primary-200/5 to-primary-300/10 rounded-xl sm:rounded-2xl blur-sm"></div>
                
                <Input 
                  placeholder={getDynamicSearchPlaceholder()} 
                  onChange={onInputChange}
                  className="relative w-full h-12 sm:h-14 lg:h-16 px-4 sm:px-6 pr-12 sm:pr-16 text-base sm:text-lg lg:text-xl border-2 sm:border-3 border-bg-300 rounded-xl sm:rounded-2xl focus:border-primary-100 focus:ring-4 sm:focus:ring-6 focus:ring-primary-300/20 transition-all duration-300 shadow-lg sm:shadow-xl hover:shadow-xl sm:hover:shadow-2xl bg-bg-100/95 backdrop-blur-sm focus:scale-105"
                />
                
                {/* 搜索图标 */}
                <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
                  <svg className="w-6 h-6 text-accent-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                {/* 创作者主题装饰元素 */}
                <div className="absolute -top-2 -left-2 text-primary-300/30 creator-sparkle">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                
                <div className="absolute -bottom-1 -right-1 text-primary-200/40 creator-pulse">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
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
              {/* AI出图按钮 */}
              <Button
                onClick={() => router.push('/ai-image-generation')}
                className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                  </svg>
                  <span>AI 出图</span>
                </div>
              </Button>
            </div>
          </div>
          
          {/* 内容滚动区域 */}
          <div className={`transition-all duration-300 pb-16 sm:pb-20 ${
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
                    <ToolList 
                      data={recentlyUsedData} 
                      global={global} 
                      router={router} 
                      sidebarVisible={sidebarVisible}
                      loading={search.querying}
                    />
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
                      <ToolList 
                        data={toolData.list[item.english]} 
                        global={global} 
                        router={router} 
                        sidebarVisible={sidebarVisible}
                        loading={search.querying}
                      />
                    </>
                  }
                  {
                    search.query && searchResults[item.english]?.length && <>
                      <div className="flex items-center my-6">
                        <div className="h-8 w-1 bg-gradient-to-b from-primary-100 to-primary-200 rounded-full mr-3"></div>
                        <h2 className="font-bold text-lg md:text-xl bg-gradient-to-r from-primary-100 to-primary-200 bg-clip-text text-transparent">
                          {item[global.language]}
                        </h2>
                      </div>
                      <ToolList 
                        data={searchResults[item.english]} 
                        global={global} 
                        router={router} 
                        sidebarVisible={sidebarVisible}
                        loading={search.querying}
                      />
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
