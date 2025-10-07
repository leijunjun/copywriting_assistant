import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { HEADER_TITLE } from "@/constant/language";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { selectGlobal, setGlobalState } from "@/app/store/globalSlice";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
// 移除 ChevronDownIcon 导入，使用简单的文字符号

export function LanguagePopover() {
  const router = useRouter();
  const dispatch = useAppDispatch()
  const global = useAppSelector(selectGlobal)

  // 获取当前语言的显示文本
  const getLanguageDisplayText = (language: string) => {
    switch (language) {
      case 'chinese':
        return '中文';
      case 'english':
        return 'EN';
      case 'japanese':
        return '日本語';
      default:
        return '中文';
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center space-x-1 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-2 py-1 rounded-md transition-colors"
        >
          <span>{getLanguageDisplayText(global.language)}</span>
          <span className="text-xs">▼</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-32 p-2">
        <RadioGroup
          className='space-y-1'
          defaultValue={global.language}
          value={global.language}
          onValueChange={(value: "english" | "chinese" | "japanese") => {
            localStorage.setItem('lang', value)
            dispatch(setGlobalState({ language: value }))
            document.title = HEADER_TITLE[value]
            const url = window.location.pathname;
            const locale = { "english": 'en', "chinese": 'zh', "japanese": 'ja' };
            const supportedLocales = Object.values(locale); // Extract supported language code
            const newLocale = locale[value];
            // Check if the URL starts with a supported language code
            const hasLocale = supportedLocales.some(loc => url.startsWith(`/${loc}`));
            let updatedUrl;
            if (hasLocale) {
              // Dynamically replace existing language code with regular expressions, only replacing the first matching item
              updatedUrl = url.replace(/^\/(en|zh|ja)(\/|$)/, `/${newLocale}$2`);
            } else {
              // If the URL does not have a language code, add a new language code at the beginning
              updatedUrl = `/${newLocale}${url}`;
            }
            router.push(updatedUrl)
          }}>
          <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
            <RadioGroupItem className="h-4 w-4" value="chinese" id="r1" />
            <Label className='text-sm cursor-pointer flex-1' htmlFor="r1">中文</Label>
          </div>
          <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
            <RadioGroupItem className="h-4 w-4" value="english" id="r2" />
            <Label className='text-sm cursor-pointer flex-1' htmlFor="r2">EN</Label>
          </div>
          <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
            <RadioGroupItem className="h-4 w-4" value="japanese" id="r3" />
            <Label className='text-sm cursor-pointer flex-1' htmlFor="r3">日本語</Label>
          </div>
        </RadioGroup>
      </PopoverContent>
    </Popover>
  )
}
