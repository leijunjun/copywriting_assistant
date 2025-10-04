"use client";
import dayjs from 'dayjs';
import Papa from 'papaparse';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import image from '@/app/public/404.png';
import Header from "@/components/Header";
import ReactMarkdown from 'react-markdown';
import { useEffect, useState } from "react";
import ToolFrom from '@/components/ToolFrom';
import PoweredBy from '@/components/PoweredBy';
import { Button } from "@/components/ui/button";
import { useRouter } from '../../../navigation';
import { RiDeleteBinLine } from "react-icons/ri";
import { toast } from "@/components/ui/use-toast";
import { ErrMessage } from '@/components/ErrMessage';
import { ITool, toolList } from "@/constant/tool_list";
import { EditCustomToolForm } from '../EditCustomToolForm';
import { LanguagePopover } from '@/components/LanguagePopover';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { selectGlobal, setGlobalState } from '@/app/store/globalSlice';
import { getLanguage, getLocalStorage, setLocalStorage } from '@/lib/utils';
import { addData, deleteData, deleteDatas, getDataById } from '@/app/api/indexedDB';
import { deleteCustomToolData, getAllCustomToolData } from '@/app/api/customTool/indexedDB';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { COPY_ERROR, COPY_SUCCESSFUL, DELETE_RECORD_CANCEL, DELETE_RECORD_CONTINUE, DELETE_RECORD_MESSAGE, HEADER_TITLE, LANGUAGE_LIBRARY, SUBMIT_BUTTON, SUCCESSFULLY_GENERATED } from "@/constant/language";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface IGenerateRecords { id: number; toolId: string | number; output: string; createdAt: string; }

export default function DialogDemo({ params }: { params: { id: string } }) {
  const router = useRouter();
  const dispatch = useAppDispatch()
  const global = useAppSelector(selectGlobal)

  const [load, setLoad] = useState(false);
  const [open, setOpen] = useState(false);
  const [delLoad, setDelLoad] = useState(false);
  const [readDataLoad, setrReadDataLoad] = useState(true);
  const [dataSource, setDataSource] = useState<ITool & { prompt?: string }>();
  const [generateRecords, setGenerateRecords] = useState<IGenerateRecords[]>([]);

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
    }
  }, [dataSource])

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
        tool_name: dataSource?.name.english,
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
          body: JSON.stringify({ ...data }),
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
              onToast(`${SUBMIT_BUTTON[dataSource?.submitButton || ''][global.language]}${SUCCESSFULLY_GENERATED[global.language]}`)
              setLoad(false);
              return;
            }

            // Decoding and processing data blocks
            partialData += decoder.decode(value, { stream: true });
            let lines = partialData.split('\n');
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
      return (<ToolFrom language={global.language} dataSource={dataSource} onOk={onOk} />)
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

  const onToast = (description: string) => {
    toast({ duration: 2000, description })
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

  const onRenderingResult = (item: any, key: number) => {
    const onRenderingTable = (csvData: string) => {
      const rows: any = Papa.parse(csvData, {
        comments: '```',
        skipEmptyLines: true,
      })
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
        break;
    }
  }

  return (
    <div className='md:py-5 py-3 min-h-screen relative' style={{ backgroundColor: '#fafafa' }}>
      <div className='absolute right-5 top-2'><LanguagePopover /></div>
      <>
        {
          dataSource?.id ?
            <div className="main-container flex-col mx-auto mb-9" >
              <Header language={global.language} />
              <div className='bg-white relative' style={{ border: '1px solid #e2e8f0', borderRadius: 10, }}>
                <div className="flex p-3 mb-3" style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ minWidth: 55, maxWidth: 55, height: 55, padding: 5 }} >
                    <img className="w-full object-cover rounded-md" src={dataSource?.url} />
                  </div>
                  <div className="pl-3 text-left">
                    <div className="font-bold pb-2 text-black">{dataSource?.name[global.language]}</div>
                    <div className="text-xs text-gray-500">{dataSource?.describe[global.language]}</div>
                  </div>
                </div>
                {/* Form Tools */}
                <div className="text-left">
                  {dataSource?.id && onRenderingForm()}
                </div>
                <div className='absolute top-2 right-2 flex items-center gap-3'>
                  {dataSource?.prompt && onDelCustomTool()}
                  {dataSource?.prompt && <EditCustomToolForm dataSource={dataSource} disabled={load} />}
                  <Button variant="outline" size="icon" className=" w-8 h-8" disabled={load} onClick={() => router.push('/')}>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                    </svg>
                  </Button>
                </div>
              </div>
              {/* Historical records */}
              <div className="mt-3">
                {
                  generateRecords?.length ? generateRecords.map((item) => (
                    <div key={item?.id} className="p-3 mb-3 bg-white" style={{ border: '1px solid #e2e8f0', borderRadius: 10, color: '#000' }}>
                      <div className="text-left">
                        {onRenderingResult(item, item?.id)}
                      </div>
                      <div className="flex items-end justify-between mt-2">
                        <div style={{ color: '#696969' }}>{dayjs(item.createdAt).format('MM-DD HH:mm')}</div>
                        <div>
                          <Button variant="outline" size="icon" className="mr-3" disabled={load} onClick={() => onHandleCopyResult(item?.output)}>
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1 9.50006C1 10.3285 1.67157 11.0001 2.5 11.0001H4L4 10.0001H2.5C2.22386 10.0001 2 9.7762 2 9.50006L2 2.50006C2 2.22392 2.22386 2.00006 2.5 2.00006L9.5 2.00006C9.77614 2.00006 10 2.22392 10 2.50006V4.00002H5.5C4.67158 4.00002 4 4.67159 4 5.50002V12.5C4 13.3284 4.67158 14 5.5 14H12.5C13.3284 14 14 13.3284 14 12.5V5.50002C14 4.67159 13.3284 4.00002 12.5 4.00002H11V2.50006C11 1.67163 10.3284 1.00006 9.5 1.00006H2.5C1.67157 1.00006 1 1.67163 1 2.50006V9.50006ZM5 5.50002C5 5.22388 5.22386 5.00002 5.5 5.00002H12.5C12.7761 5.00002 13 5.22388 13 5.50002V12.5C13 12.7762 12.7761 13 12.5 13H5.5C5.22386 13 5 12.7762 5 12.5V5.50002Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                            </svg>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="icon" disabled={load}>
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
                  )) : <></>
                }
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
    </div>
  )
}

