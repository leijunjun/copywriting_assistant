import { twMerge } from "tailwind-merge";
import { type ClassValue, clsx } from "clsx";
import { Language } from "@/constant/tool_list";
import { HEADER_TITLE, ILang, ILangShort, LANG, LANG_SHORT } from "@/constant/language";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getLocalStorage(Item: string) {
  const data = localStorage.getItem(Item);
  return data;
}

export function setLocalStorage(key: string, value: string) {
  localStorage.setItem(key, value);
}

export function setAuthLocalStorage(window: Window, objects: any) {
  if (window) {
    let existedData = JSON.parse(
      window.localStorage.getItem("DATA") || '{}'
    )
    existedData = {
      ...existedData,
      ...objects
    }
    window.localStorage.setItem("DATA", JSON.stringify(existedData))
  }
}

export function getAuthLocalStorage(window: Window, key: string) {
  if (window) {
    const data = JSON.parse(window.localStorage.getItem("DATA") || '{}')
    return data[key]
  }
  return null
}

export const locales = ["zh"] as const;
export const detectLocale = (locale: string): (typeof locales)[number] => {
  const detectedLocale = locale.split("-")[0];
  if (["en", "zh", "ja"].includes(detectedLocale as (typeof locales)[number])) {
    return detectedLocale as (typeof locales)[number];
  }
  return locales[0];
};

type CallbackFunction = (...args: any[]) => void;

export function debounce<T extends CallbackFunction>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null;

  return function (...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

export function getLanguage() {
  const windowLanguage = window.navigator.language;
  let lang: keyof Language = 'english';
  if (["en-US", "zh-CN", "ja-JP"].includes(windowLanguage)) {
    lang = LANG[windowLanguage as keyof ILang] as keyof Language
  }
  if (["en", "zh", "ja"].includes(windowLanguage)) {
    lang = LANG_SHORT[windowLanguage as keyof ILangShort] as keyof Language
  }
  const localStorageLanguage = localStorage.getItem('lang')
  if (localStorageLanguage) lang = localStorageLanguage as 'chinese' | 'english' | 'japanese';
  const locale = window.location.pathname.split('/')[1] as keyof ILangShort
  if (locale) {
    if (["en", "zh", "ja"].includes(locale)) lang = LANG_SHORT[locale] as keyof Language
    else lang = 'english'
  }
  const searchLang = new URLSearchParams(window.location.search).get('lang') as keyof ILang
  if (searchLang) {
    if (["en-US", "zh-CN", "ja-JP"].includes(searchLang)) lang = LANG[searchLang] as keyof Language;
    else lang = 'english'
  }
  document.title = HEADER_TITLE[lang]
  localStorage.setItem('lang', lang)
  return lang;
}
