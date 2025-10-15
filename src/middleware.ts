import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin-auth';

const intlMiddleware = createIntlMiddleware({
  locales: ['en', 'zh', 'ja'],
  defaultLocale: 'zh',
  localePrefix: 'always'
});

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 跳过 API 路由 - 不应用国际化中间件
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // 处理管理员路由认证 - 完全独立于前台认证
  if (pathname.startsWith('/admin')) {
    // 排除登录页面
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // 验证管理员session
    const session = await verifyAdminSession(request);
    if (!session) {
      // 重定向到管理员登录页面
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // 已认证，继续处理（不应用国际化中间件到管理后台）
    return NextResponse.next();
  }

  // 处理前台路由 - 应用国际化中间件
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    // - … API routes
    '/((?!_next|_vercel|api|.*\\..*).*)'
  ]
};