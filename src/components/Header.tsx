"use client";
import { HEADER_TITLE } from "@/constant/language";

export default function Header({ language }: { language: 'chinese' | 'english' | 'japanese' }) {
  const showBrand = process.env.NEXT_PUBLIC_SHOW_BRAND === "true";
  return (
    <div className="relative font-medium lg:text-4xl md:text-3xl text-2xl flex justify-center items-center md:mb-8 mb-3 my-3 gap-1 w-full">
      {
        showBrand && <img src="https://file.302.ai/gpt/imgs/5b36b96aaa052387fb3ccec2a063fe1e.png" className={`mr-3 md:h-14 md:w-14 h-12 w-12 app-icon object-contain ${language === 'chinese' ? "" : "app-icon-en"}`} alt="302" />
      }
      <div className={`app-title ${language === 'chinese' ? "" : "app-title-en"}`}>{HEADER_TITLE[language]}</div>
    </div>
  )
}