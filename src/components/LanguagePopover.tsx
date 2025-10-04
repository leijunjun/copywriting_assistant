import { useRouter } from "next/navigation";
import { IoLanguage } from "react-icons/io5";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { HEADER_TITLE } from "@/constant/language";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { selectGlobal, setGlobalState } from "@/app/store/globalSlice";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";

export function LanguagePopover() {
  const router = useRouter();
  const dispatch = useAppDispatch()
  const global = useAppSelector(selectGlobal)
  return (
    <Popover>
      <PopoverTrigger>
        <IoLanguage className="text-[20px] cursor-pointer" />
      </PopoverTrigger>
      <PopoverContent className="w-full p-1">
        <RadioGroup
          className='gap-0'
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
          <Button size='sm' variant="ghost" className="flex justify-start hover:text-[#8e47f0] w-full" >
            <RadioGroupItem className="min-w-[15px] max-h-[15px]" value="chinese" id="r1" />
            <Label className='leading-[2.7] text-left cursor-pointer ml-3 w-full h-full' htmlFor="r1">中文</Label>
          </Button>
          <Button size='sm' variant="ghost" className="flex justify-start hover:text-[#8e47f0] w-full" >
            <RadioGroupItem className="min-w-[15px] max-h-[15px]" value="english" id="r2" />
            <Label className='leading-[2.7] text-left cursor-pointer ml-3 w-full h-full' htmlFor="r2">English</Label>
          </Button>
          <Button size='sm' variant="ghost" className="flex justify-start hover:text-[#8e47f0] w-full" >
            <RadioGroupItem className="min-w-[15px] max-h-[15px]" value="japanese" id="r3" />
            <Label className='leading-[2.7] text-left cursor-pointer ml-3 w-full h-full' htmlFor="r3">日本語</Label>
          </Button>
        </RadioGroup>
      </PopoverContent>
    </Popover>
  )
}
