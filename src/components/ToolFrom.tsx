import { z } from "zod";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { useForm } from 'react-hook-form';
import { useEffect, useState } from "react";
import { ITool } from "@/constant/tool_list";
import { zodResolver } from "@hookform/resolvers/zod";
import { getLocalStorage, setLocalStorage } from "@/lib/utils";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { CLEAR_CONTENT_BUTTON, FROM_LABEL, LANGUAGE_LIST, OUTPUT_LANGUAGE, PLEASE_ENTER, PLEASE_SELECT, SUBMIT_BUTTON } from "@/constant/language";

interface IProps {
  onOk: (value: any) => void
  dataSource: ITool & { prompt?: string }
  language: 'chinese' | 'english' | 'japanese';
}

export default function ToolFrom(props: IProps) {
  const [load, setLoad] = useState(false);
  const { language, dataSource, onOk } = props;
  const [outputLanguage, setOutputLanguage] = useState('Chinese')

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
    if (load) return;
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
          <Select onValueChange={field.onChange} value={field.value} disabled={load}>
            {onRenderingSelect(dataSource.from[key]?.list || [], placeholder)}
          </Select>
        )
      default:
        break;
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} >
        {
          Object.keys(dataSource.from).map((key: string) => (
            <FormField
              key={key}
              disabled={load}
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
        }
        <div className="flex justify-between p-3" style={{ borderTop: '1px solid #e2e8f0' }}>
          <Button disabled={load} type="button" variant="ghost" onClick={() => form.reset()}>{CLEAR_CONTENT_BUTTON[language]}</Button>
          <div className="flex">
            <div className={`md:w-32 w-24 mr-3 ${dataSource?.prompt ? 'hidden' : 'block'}`}>
              <Select onValueChange={onChangeOutputLanguage} value={outputLanguage} disabled={load}>
                {onRenderingSelect(LANGUAGE_LIST, OUTPUT_LANGUAGE[language])}
              </Select>
            </div>
            <Button type="submit" disabled={load} className="bg-[#8e47f0] hover:bg-[#7f39ea]" >
              {
                load ? <Loader2 className="animate-spin" style={{ width: 18, height: 18 }} />
                  : SUBMIT_BUTTON[dataSource.submitButton][language]
              }
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}