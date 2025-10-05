"use client";
import { HEADER_TITLE, NAVIGATION, USER_NAME } from "@/constant/language";
import { LanguagePopover } from "./LanguagePopover";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/app/store/hooks";
import { selectGlobal } from "@/app/store/globalSlice";
import { User, Coins, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const router = useRouter();
  const global = useAppSelector(selectGlobal);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const showBrand = process.env.NEXT_PUBLIC_SHOW_BRAND === "true";
  
  // 模拟用户积分数据，实际项目中应该从状态管理或API获取
  const userPoints = 1250;
  const userName = USER_NAME[global.language];

  const navigationItems = [
    { key: 'home', href: '/' },
    { key: 'services', href: '/services' },
    { key: 'about', href: '/about' }
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-bg-100/90 backdrop-blur-sm border-b border-bg-300 sticky top-0 z-50 shadow-sm w-full">
      <div className="w-full px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo 和标题 */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            <img 
              src="/logo.png" 
              className="h-16 w-16 sm:h-20 sm:w-20 lg:h-28 lg:w-28 object-contain" 
              alt="AI文助 Logo" 
            />
            <div className="flex items-center">
              <span 
                className="inline-flex items-center px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-semibold bg-gradient-to-r from-primary-300 to-primary-200 text-primary-100 border border-primary-200 cursor-pointer hover:from-primary-200 hover:to-primary-100 transition-all duration-200" 
                onClick={() => handleNavigation('/')}
              >
                AI文助
              </span>
            </div>
          </div>

          {/* 桌面端导航 */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavigation(item.href)}
                className="text-text-200 hover:text-primary-100 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                {NAVIGATION[item.key][global.language]}
              </button>
            ))}
          </nav>

          {/* 右侧功能区 */}
          <div className="flex items-center space-x-4">
            {/* 用户积分 */}
            <div className="hidden sm:flex items-center space-x-2 bg-primary-300/20 px-3 py-2 rounded-full">
              <Coins className="h-4 w-4 text-primary-100" />
              <span className="text-sm font-medium text-primary-100">
                {userPoints.toLocaleString()} {NAVIGATION.points[global.language]}
              </span>
            </div>

            {/* 用户头像/个人中心 */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleNavigation('/profile')}
                className="flex items-center space-x-2 bg-bg-200 hover:bg-bg-300 px-3 py-2 rounded-full transition-colors duration-200"
              >
                <User className="h-5 w-5 text-accent-100" />
                <span className="hidden sm:block text-sm font-medium text-text-100">
                  {userName}
                </span>
              </button>
            </div>

            {/* 语言切换 */}
            <LanguagePopover />

            {/* 移动端菜单按钮 */}
            <button
              className="md:hidden p-2 rounded-md text-text-200 hover:text-primary-100 hover:bg-bg-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* 移动端菜单 */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-bg-300 py-4">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleNavigation(item.href)}
                  className="block w-full text-left px-3 py-2 text-text-200 hover:text-primary-100 hover:bg-bg-200 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  {NAVIGATION[item.key][global.language]}
                </button>
              ))}
              {/* 移动端积分显示 */}
              <div className="flex items-center space-x-2 px-3 py-2 bg-primary-300/20 rounded-md">
                <Coins className="h-4 w-4 text-primary-100" />
                <span className="text-sm font-medium text-primary-100">
                  {userPoints.toLocaleString()} {NAVIGATION.points[global.language]}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}