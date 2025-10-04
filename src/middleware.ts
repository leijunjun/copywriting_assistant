import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  // Retrieve the language from the lang parameter or request header
  const langParam = request.nextUrl.searchParams.get("lang");
  const headerLang = request.headers.get("x-locale");
  let locale = langParam ? langParam.split('-')[0] : headerLang;

  // Check if the local is in the list of supported languages, otherwise use the default language
  if (!["zh", "en", "ja"].includes(locale || "")) {
    locale = "en";
  }

  // Check if the current path already contains a language prefix
  const currentLocale = url.pathname.split('/')[1];
  if (["zh", "en", "ja"].includes(currentLocale)) {
    locale = currentLocale;
  } else {
    // If the path does not contain a language prefix, redirect it
    url.pathname = `/${locale}${url.pathname}`;
    url.searchParams.delete("lang");
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();
  response.headers.set("x-locale", locale || "en");

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
