"use client";
import dayjs from 'dayjs';
import Papa from 'papaparse';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import image from '@/app/public/404.png';
import ReactMarkdown from 'react-markdown';
import { useEffect, useState } from "react";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import ToolFrom from '@/components/ToolFrom';
import PoweredBy from '@/components/PoweredBy';
import { Button } from "@/components/ui/button";
import { useRouter } from '../../../navigation';
import { RiDeleteBinLine } from "react-icons/ri";
import { toast } from "@/components/ui/use-toast";
import { ErrMessage } from '@/components/ErrMessage';
import { ITool, toolList } from "@/constant/tool_list";
import { EditCustomToolForm } from '../EditCustomToolForm';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { selectGlobal, setGlobalState } from '@/app/store/globalSlice';
import { getLanguage, getLocalStorage, setLocalStorage } from '@/lib/utils';
import { addData, deleteData, deleteDatas, getDataById } from '@/app/api/indexedDB';
import { deleteCustomToolData, getAllCustomToolData } from '@/app/api/customTool/indexedDB';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { COPY_ERROR, COPY_SUCCESSFUL, DELETE_RECORD_CANCEL, DELETE_RECORD_CONTINUE, DELETE_RECORD_MESSAGE, HEADER_TITLE, LANGUAGE_LIBRARY, SUBMIT_BUTTON, SUCCESSFULLY_GENERATED, BREADCRUMB } from "@/constant/language";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from '@/lib/auth/auth-context';
import { InsufficientCreditsModal } from '@/components/credits/InsufficientCreditsModal';

interface IGenerateRecords { id: number; toolId: string | number; output: string; createdAt: string; }

export default function DialogDemo({ params }: { params: { id: string } }) {
  const router = useRouter();
  const dispatch = useAppDispatch()
  const global = useAppSelector(selectGlobal)
  const { refreshAuthState, authState } = useAuth();
  const { user } = authState;

  const [load, setLoad] = useState(false);
  const [open, setOpen] = useState(false);
  const [delLoad, setDelLoad] = useState(false);
  const [readDataLoad, setrReadDataLoad] = useState(true);
  const [dataSource, setDataSource] = useState<ITool & { prompt?: string }>();
  const [generateRecords, setGenerateRecords] = useState<IGenerateRecords[]>([]);
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);

  const showBrand = process.env.NEXT_PUBLIC_SHOW_BRAND === "true";

  useEffect(() => {
    const lang = getLanguage()
    dispatch(setGlobalState({ language: lang }))
  }, [])

  useEffect(() => {
    onRefreshData();
  }, [])

  useEffect(() => {
    if (dataSource?.id) {
      onGetGenerateRecords()
      const recentlyUsedDataTemp = JSON.parse(getLocalStorage('recentlyUsedData') || '[]');
      if (recentlyUsedDataTemp && recentlyUsedDataTemp.length > 0) {
        const index = recentlyUsedDataTemp?.findIndex((f: ITool) => f.id === dataSource?.id)
        if (index > -1) {
          recentlyUsedDataTemp.splice(index, 1);
        }
        if (recentlyUsedDataTemp.length === 6) {
          recentlyUsedDataTemp.splice(recentlyUsedDataTemp.length - 1, 1);
        }
        recentlyUsedDataTemp.unshift({ id: dataSource.id, classify: dataSource.classify });
        setLocalStorage('recentlyUsedData', JSON.stringify(recentlyUsedDataTemp))
      } else {
        setLocalStorage('recentlyUsedData', JSON.stringify([{ id: dataSource.id, classify: dataSource.classify }]))
      }
      
      // 检查积分余额
      checkCreditBalance();
    }
  }, [dataSource])

  // 检查积分余额
  const checkCreditBalance = () => {
    if (authState.credits && authState.credits.balance < 5) {
      setShowInsufficientCreditsModal(true);
    }
  };

  useEffect(() => {
    if (params.id) {
      const decodedId = decodeURIComponent(params.id);
      if (global.customTool.length) {
        const data = global.customTool.find(f => f.title === decodedId);
        if (data?.id) {
          setDataSource({ ...data })
          setrReadDataLoad(false)
          return;
        }
      }
      for (const key in toolList) {
        const data = toolList[key]?.find(f => f.title === decodedId);
        if (data?.id) {
          document.title = `${HEADER_TITLE[global.language]}-${data.name[global.language]}`;
          setDataSource(data)
          return;
        }
      }
      setrReadDataLoad(false)
    }
  }, [global.customTool, params.id])

  const onRenderingForm = () => {
    const onOk = async (params: any) => {
      setLoad(true);
      const data = {
        params,
        prompt: dataSource?.prompt ? `${dataSource?.prompt}\n${params.content}` : '',
        tool_name: dataSource?.title,
      }

      const id = dayjs().unix();
      const newParams = {
        id,
        toolId: dataSource?.id || '',
        output: '',
        createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      }
      try {
        const res = await fetch('/api/generateWriting', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, language: global.language }),
        })
        if (res?.body && res.ok) {
          const reader = res.body.getReader();
          const decoder = new TextDecoder('utf-8');
          let partialData = '';
          setGenerateRecords((v) => ([{ ...newParams }, ...v]));
          const read = async () => {
            const readerRead = await reader.read();
            const { done, value } = readerRead;
            if (done) {
              console.log('Stream complete');
              await addData(newParams);
              onToast(`${SUBMIT_BUTTON[dataSource?.submitButton || ''][global.language]}${SUCCESSFULLY_GENERATED[global.language]}`, 'success')
              
              // 异步更新积分余额
              try {
                await refreshAuthState();
                console.log('积分余额已更新');
              } catch (error) {
                console.error('更新积分余额失败:', error);
              }
              
              setLoad(false);
              return;
            }

            // Decoding and processing data blocks
            partialData += decoder.decode(value, { stream: true });
            const lines = partialData.split('\n');
            // @ts-ignore
            partialData = lines.pop();
            lines.forEach(line => {
              if (line.startsWith('data: ')) {
                const data = line.slice(6); // Remove the 'data:' section
                try {
                  const parsedData = JSON.parse(data);
                  if (parsedData?.content) {
                    newParams.output += parsedData.content
                    setGenerateRecords((v) => {
                      return v.map((item) => {
                        if (item.id === id) {
                          return { ...item, output: item.output + parsedData.content }
                        }
                        return item;
                      })
                    })
                  }
                } catch (e) {
                  toast({
                    duration: 2000,
                    description: (ErrMessage(0, global.language))
                  })
                  setLoad(false);
                }
              }
            });
            await read();
          }
          await read();
        } else {
          try {
            const resJson = await res.json();
            if (resJson?.error?.err_code) {
              setLoad(false);
              toast({
                duration: 2000,
                description: (ErrMessage(resJson?.error.err_code, global.language))
              })
              return;
            }
          } catch (error) {
            toast({
              duration: 2000,
              description: (ErrMessage(0, global.language))
            })
            setLoad(false);
          }
        }
      } catch (error) {
        toast({
          duration: 2000,
          description: (ErrMessage(0, global.language))
        })
        setLoad(false);
      }
    }
    if (dataSource) {
      return (
        <ToolFrom 
          language={global.language} 
          dataSource={dataSource} 
          onOk={onOk}
          generateRecords={generateRecords}
          onExportToWord={onExportToWord}
          load={load}
        />
      )
    } else {
      <></>
    }
  }

  const onDelCustomTool = () => {
    const onDelData = async () => {
      setDelLoad(true);
      if (dataSource?.id) {
        await deleteCustomToolData(+dataSource?.id)
        if (generateRecords.length) {
          await deleteDatas(generateRecords.map(item => item.id));
        }
        const recentlyUsedDataTemp = JSON.parse(getLocalStorage('recentlyUsedData') || '[]');
        if (recentlyUsedDataTemp && recentlyUsedDataTemp.length) {
          const index = recentlyUsedDataTemp?.findIndex((f: ITool) => f.id === dataSource?.id)
          if (index > -1) {
            recentlyUsedDataTemp.splice(index, 1);
            setLocalStorage('recentlyUsedData', JSON.stringify(recentlyUsedDataTemp))
          }
        }
        onToast(LANGUAGE_LIBRARY[global.language]['删除成功'])
        setDelLoad(false);
        setOpen(false)
        onRefreshData();
        router.push('/')
      }
    }
    return (
      <Dialog open={open} onOpenChange={(open) => !delLoad && setOpen(open)}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" className=" w-8 h-8" disabled={load}>
            <RiDeleteBinLine />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{LANGUAGE_LIBRARY[global.language]['删除模板']}</DialogTitle>
            <DialogDescription>
              {LANGUAGE_LIBRARY[global.language]['是否确认删除此模版，所有使用此模版的结果记录都会被删除。']}
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

  const onRefreshData = async () => {
    const customToolData = await getAllCustomToolData();
    dispatch(setGlobalState({ customTool: customToolData }))
  }

  const onGetGenerateRecords = async () => {
    if (dataSource?.id) {
      try {
        const result = await getDataById(dataSource.id);
        setGenerateRecords(result);
      } catch (error) {
        console.log('读取历史记录失败');
      }
    }
  }

  const onToast = (description: string, variant: 'default' | 'destructive' | 'success' = 'default') => {
    toast({ duration: 2000, description, variant })
  }

  const onHandleCopyResult = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        onToast(COPY_SUCCESSFUL[global.language])
      })
      .catch(err => {
        onToast(COPY_ERROR[global.language])
      });
  }

  const ondeleteGenerateRecords = async (id: number) => {
    try {
      await deleteData(id);
      setGenerateRecords(v => v.filter(f => f.id !== id))
      onToast(LANGUAGE_LIBRARY[global.language]['删除成功'])
    } catch (error) {
      console.log('Failed to delete history records', error);
    }
  }

  const onClearAllRecords = async () => {
    try {
      if (generateRecords.length > 0) {
        await deleteDatas(generateRecords.map(item => item.id));
        setGenerateRecords([]);
        onToast(LANGUAGE_LIBRARY[global.language]['删除成功'])
      }
    } catch (error) {
      console.log('Failed to clear all records', error);
      onToast('清空记录失败，请重试');
    }
  }

  const onExportToWord = async (records: IGenerateRecords[]) => {
    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: "AI 文案助手 - 生成记录",
              heading: HeadingLevel.TITLE,
            }),
            new Paragraph({
              text: `导出时间: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`,
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              text: `共 ${records.length} 条记录`,
              heading: HeadingLevel.HEADING_3,
            }),
            new Paragraph({ text: "" }), // 空行
            
            ...records.map((record, index) => [
              new Paragraph({
                text: `记录 ${index + 1}`,
                heading: HeadingLevel.HEADING_3,
              }),
              new Paragraph({
                text: `生成时间: ${dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss')}`,
              }),
              new Paragraph({
                text: "内容:",
                heading: HeadingLevel.HEADING_4,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: record.output,
                    size: 24, // 12pt
                  }),
                ],
              }),
              new Paragraph({ text: "" }), // 空行
              new Paragraph({
                text: "────────────────────────────────────",
              }),
              new Paragraph({ text: "" }), // 空行
            ]).flat(),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      const fileName = `AI文案助手生成记录_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.docx`;
      saveAs(blob, fileName);
      
      onToast(`成功导出 ${records.length} 条记录到 ${fileName}`);
    } catch (error) {
      console.error('导出失败:', error);
      onToast('导出失败，请重试');
    }
  }

  // 获取行业专用标签
  const getIndustryTag = () => {
    if (!user?.industry || user.industry === 'general') {
      return null;
    }
    
    const industryNames = {
      housekeeping: { chinese: '家政专用', english: 'Housekeeping', japanese: '家事代行専用' },
      beauty: { chinese: '医疗美容专用', english: 'Medical Beauty', japanese: '医療美容専用' },
      'lifestyle-beauty': { chinese: '生活美容专用', english: 'Lifestyle Beauty', japanese: '生活美容専用' }
    };
    
    return industryNames[user.industry as keyof typeof industryNames];
  };

  const onRenderingResult = (item: any, key: number) => {
    const onRenderingTable = (csvData: string) => {
      const rows: any = Papa.parse(csvData, {
        comments: '```',
        skipEmptyLines: true,
      });
      if (rows.data.length) {
        const longestSublistIndex = rows.data.reduce((maxIndex: number, sublist: any, index: number, array: any[]) => {
          return sublist.length > array[maxIndex].length ? index : maxIndex;
        }, 0);
        const transposedData = rows.data[longestSublistIndex].map((_: any, colIndex: number) => rows.data.map((row: any) => row[colIndex]));
        const nonEmptyColumnIndices = transposedData.map((col: any, index: number) => col.some((cell: any) => cell) ? index : -1)
          .filter((index: number) => index !== -1);

        const arr = rows.data.map((row: any) => nonEmptyColumnIndices.map((index: number) => row[index]))
          .filter((sublist: any) => !sublist.every((cell: any) => cell && cell?.trim()?.indexOf('---') > -1));
        return arr;
      }
      return [];
    }

    switch (dataSource?.resultType) {
      case 'text':
        return (<div style={{ whiteSpace: 'pre-line' }} dangerouslySetInnerHTML={{ __html: item.output }}></div>)
      case 'markdown':
        return (<ReactMarkdown>{item?.output}</ReactMarkdown>)
      case 'table':
        const tableData: any = onRenderingTable(item.output)
        return (
          <table>
            <tbody>
              {
                tableData.map((_: string, index: number) => {
                  return (
                    <tr key={`${key}-${index}-${item}`}>
                      {
                        tableData[index].map((item: string, index2: number) => {
                          if (index2 === 0) {
                            return (<th key={`${item}-${index2}`}>{item}</th>)
                          } else {
                            return (<td key={`${item}-${index2}`}>{item}</td>)
                          }
                        })
                      }
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        )
      default:
        return null;
    }
  }

  return (
    <div className='md:py-5 py-3 min-h-screen relative pt-16' style={{ backgroundColor: 'var(--bg-100)' }}>
      <>
        {
          dataSource?.id ?
            <div className="main-container flex flex-col xl:flex-row gap-6 mx-auto mb-9" >
              {/* 左侧：生成内容列表区域 */}
              <div className="xl:w-1/2 xl:order-1 order-2">
                {/* 生成记录标题 */}
                <div className="mb-6 p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-xl border border-gray-700 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                      <h3 className="text-xl font-bold text-cyan-400 mb-0">生成记录</h3>
                      <div className="h-px w-16 bg-gradient-to-r from-cyan-400/50 to-transparent"></div>
                    </div>
                    {generateRecords?.length ? (
                      <div className="flex items-center gap-3">
                        <Button 
                          disabled={load} 
                          type="button" 
                          variant="outline" 
                          onClick={() => onExportToWord(generateRecords)}
                          className="bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-600/40 hover:to-blue-600/40 border-cyan-400/70 text-white hover:text-cyan-100 font-medium shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 text-sm px-4 py-2"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          导出 {generateRecords.length} 条
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="bg-gradient-to-r from-red-600/30 to-pink-600/30 hover:from-red-600/40 hover:to-pink-600/40 border-red-400/70 text-white hover:text-red-100 font-medium shadow-lg hover:shadow-red-500/30 transition-all duration-300"
                              disabled={load}
                            >
                              清空
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>确认清空</AlertDialogTitle>
                              <AlertDialogDescription>
                                确定要清空所有生成记录吗？此操作不可撤销。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={onClearAllRecords}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                确认清空
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ) : null}
                  </div>
                  {!generateRecords?.length && (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-6 opacity-60">⚡</div>
                      <p className="text-gray-300 text-lg font-medium mb-2">暂无生成记录</p>
                      <p className="text-gray-500 text-sm">使用右侧表单开始生成内容</p>
                      <div className="mt-4 w-16 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full"></div>
                    </div>
                  )}
                </div>
                
                {/* 生成内容卡片列表 */}
                {generateRecords?.length > 0 && (
                  <div className="space-y-6">
                    {generateRecords.map((item) => (
                      <div key={item?.id} className="group relative p-6 bg-gradient-to-br from-gray-900/80 via-gray-800/90 to-black/80 backdrop-blur-sm text-gray-100 rounded-2xl shadow-2xl border border-gray-700/50 hover:border-cyan-500/50 hover:shadow-cyan-500/20 transition-all duration-500 hover:scale-[1.02]">
                        {/* 科技感装饰边框 */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent pointer-events-none"></div>
                        <div className="text-left">
                          {onRenderingResult(item, item?.id)}
                        </div>
                        <div className="flex items-end justify-between mt-6 pt-4 border-t border-gray-600/50">
                          <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                            <span>{dayjs(item.createdAt).format('MM-DD HH:mm')}</span>
                          </div>
                          <div className="flex gap-3 relative z-10">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-600/50 hover:to-blue-600/50 border-cyan-400/70 text-white hover:text-cyan-100 shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 relative z-20" 
                              disabled={load} 
                              onClick={() => onHandleCopyResult(item?.output)}
                            >
                              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 9.50006C1 10.3285 1.67157 11.0001 2.5 11.0001H4L4 10.0001H2.5C2.22386 10.0001 2 9.7762 2 9.50006L2 2.50006C2 2.22392 2.22386 2.00006 2.5 2.00006L9.5 2.00006C9.77614 2.00006 10 2.22392 10 2.50006V4.00002H5.5C4.67158 4.00002 4 4.67159 4 5.50002V12.5C4 13.3284 4.67158 14 5.5 14H12.5C13.3284 14 14 13.3284 14 12.5V5.50002C14 4.67159 13.3284 4.00002 12.5 4.00002H11V2.50006C11 1.67163 10.3284 1.00006 9.5 1.00006H2.5C1.67157 1.00006 1 1.67163 1 2.50006V9.50006ZM5 5.50002C5 5.22388 5.22386 5.00002 5.5 5.00002H12.5C12.7761 5.00002 13 5.22388 13 5.50002V12.5C13 12.7762 12.7761 13 12.5 13H5.5C5.22386 13 5 12.7762 5 12.5V5.50002Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                              </svg>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="bg-gradient-to-r from-red-600/30 to-pink-600/30 hover:from-red-600/50 hover:to-pink-600/50 border-red-400/70 text-white hover:text-red-100 shadow-lg hover:shadow-red-500/30 transition-all duration-300 relative z-20" 
                                    disabled={load}
                                  >
                                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H5H10H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H11V12C11 12.5523 10.5523 13 10 13H5C4.44772 13 4 12.5523 4 12V4L3.5 4C3.22386 4 3 3.77614 3 3.5ZM5 4H10V12H5V4Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                                  </svg>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{DELETE_RECORD_MESSAGE[global.language]}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{DELETE_RECORD_CANCEL[global.language]}</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => { ondeleteGenerateRecords(item.id) }}>{DELETE_RECORD_CONTINUE[global.language]}</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 右侧：工具介绍和表单区域 */}
              <div className="xl:w-1/2 xl:order-2 order-1">
                <div className="xl:sticky xl:top-6">
                  <div className='bg-gradient-to-br from-white via-gray-50 to-gray-100 relative shadow-2xl border border-gray-200/50 rounded-2xl backdrop-blur-sm' style={{ borderRadius: 16, }}>
                  <div className="flex items-center justify-between p-6 mb-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <div className="flex items-center">
                      <div className="relative" style={{ minWidth: 60, maxWidth: 60, height: 60, padding: 8 }} >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl"></div>
                        <img className="relative w-full h-full object-cover rounded-xl shadow-lg" src={dataSource?.url} />
                      </div>
                      <div className="pl-4 text-left flex-1">
                        <div className="flex items-center gap-3 pb-2">
                          <div className="font-bold text-gray-800 text-lg">{dataSource?.name[global.language]}</div>
                          {/* 行业标签紧邻工具名称 */}
                          {(() => {
                            const industryTag = getIndustryTag();
                            if (!industryTag) return null;
                            
                            const getIndustryTagStyle = () => {
                              if (user?.industry === 'housekeeping') {
                                return 'bg-gradient-to-r from-green-500 to-emerald-600';
                              } else if (user?.industry === 'beauty') {
                                return 'bg-gradient-to-r from-pink-500 to-rose-600';
                              } else if (user?.industry === 'lifestyle-beauty') {
                                return 'bg-gradient-to-r from-purple-500 to-violet-600';
                              }
                              return 'bg-gradient-to-r from-blue-500 to-purple-600';
                            };
                            
                            return (
                              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${getIndustryTagStyle()} text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-white/20`}>
                                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                                <span className="font-semibold">{industryTag[global.language]}</span>
                              </span>
                            );
                          })()}
                        </div>
                        <div className="text-sm text-gray-600 leading-relaxed">{dataSource?.describe[global.language]}</div>
                      </div>
                    </div>
                    
                    {/* 右侧区域：动图 */}
                    <div className="w-16 h-16 flex-shrink-0">
                      <img 
                        src="/Animation.gif" 
                        alt="Animation" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                  {/* Form Tools */}
                  <div className="text-left">
                    {dataSource?.id && onRenderingForm()}
                  </div>
                  <div className='absolute top-4 right-4 flex items-center gap-2'>
                    {dataSource?.prompt && onDelCustomTool()}
                    {dataSource?.prompt && <EditCustomToolForm dataSource={dataSource} disabled={load} />}
                    <Button variant="outline" size="icon" className="w-9 h-9 bg-white/80 hover:bg-white border-gray-200/60 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300" disabled={load} onClick={() => router.push('/')}>
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                      </svg>
                    </Button>
                  </div>
                </div>
                </div>
              </div>
            </div>
            : <></>
        }
        {showBrand && <PoweredBy language={global.language} />}
      </>
      {
        !dataSource?.id && !readDataLoad ?
          <div className="w-screen h-screen">
            <Image
              src={image}
              alt="Description of image"
              className="object-scale-down w-full h-full"
            />
          </div> : <></>
      }
      
      {/* 积分不足弹框 */}
      <InsufficientCreditsModal
        isOpen={showInsufficientCreditsModal}
        onClose={() => setShowInsufficientCreditsModal(false)}
        currentBalance={authState.credits?.balance || 0}
        requiredCredits={5}
      />
    </div>
  )
}

