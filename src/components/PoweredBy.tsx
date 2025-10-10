"use client";
import { LANGUAGE_LIBRARY } from "@/constant/language";

export default function PoweredBy({ language }: { language: 'chinese' | 'english' | 'japanese' }) {
    const href = process.env.NEXT_PUBLIC_REGION ?
    process.env.NEXT_PUBLIC_OFFICIAL_WEBSITE_URL_GLOBAL :
    process.env.NEXT_PUBLIC_OFFICIAL_WEBSITE_URL_CHINA;

    return <div
        className="flex justify-center items-center flex-col my-3 absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{ color: "rgb(102, 102, 102)", fontSize: "12px" }}
    >
        <div>
            {LANGUAGE_LIBRARY[language]['内容由AI生成，仅供参考']}
        </div>
        <div className="flex justify-center items-center gap-1">
            Powered By 一推火
        </div>
    </div >
}