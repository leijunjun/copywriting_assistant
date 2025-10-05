"use client";
import { useAppSelector } from "@/app/store/hooks";
import { selectGlobal } from "@/app/store/globalSlice";
import { NAVIGATION } from "@/constant/language";
import { User, Coins, Settings, History, HelpCircle } from "lucide-react";

export default function ProfilePage() {
  const global = useAppSelector(selectGlobal);
  
  // 模拟用户数据
  const userData = {
    name: "用户",
    email: "user@example.com",
    points: 1250,
    joinDate: "2024-01-01",
    totalServices: 15
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-16 pt-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {NAVIGATION.profile[global.language]}
          </h1>
          <p className="text-xl text-gray-600">
            {global.language === 'chinese' 
              ? '管理您的账户和个人信息' 
              : global.language === 'english'
              ? 'Manage your account and personal information'
              : 'アカウントと個人情報を管理'
            }
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 用户信息卡片 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{userData.name}</h2>
                <p className="text-gray-600 mb-4">{userData.email}</p>
                
                {/* 积分显示 */}
                <div className="bg-purple-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center space-x-2">
                    <Coins className="w-5 h-5 text-purple-600" />
                    <span className="text-2xl font-bold text-purple-700">
                      {userData.points.toLocaleString()}
                    </span>
                    <span className="text-purple-600 font-medium">
                      {NAVIGATION.points[global.language]}
                    </span>
                  </div>
                </div>

                {/* 统计信息 */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {global.language === 'chinese' ? '加入日期' : global.language === 'english' ? 'Join Date' : '参加日'}
                    </span>
                    <span className="font-medium">{userData.joinDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {global.language === 'chinese' ? '总服务次数' : global.language === 'english' ? 'Total Services' : '総サービス回数'}
                    </span>
                    <span className="font-medium">{userData.totalServices}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 功能菜单 */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* 账户设置 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {global.language === 'chinese' ? '账户设置' : global.language === 'english' ? 'Account Settings' : 'アカウント設定'}
                </h3>
                <div className="space-y-4">
                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <Settings className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-900">
                        {global.language === 'chinese' ? '个人信息' : global.language === 'english' ? 'Personal Information' : '個人情報'}
                      </span>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <Coins className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-900">
                        {global.language === 'chinese' ? '积分管理' : global.language === 'english' ? 'Points Management' : 'ポイント管理'}
                      </span>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <History className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-900">
                        {global.language === 'chinese' ? '服务历史' : global.language === 'english' ? 'Service History' : 'サービス履歴'}
                      </span>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <HelpCircle className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-900">
                        {global.language === 'chinese' ? '帮助与支持' : global.language === 'english' ? 'Help & Support' : 'ヘルプとサポート'}
                      </span>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 最近活动 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {global.language === 'chinese' ? '最近活动' : global.language === 'english' ? 'Recent Activity' : '最近の活動'}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">
                      {global.language === 'chinese' ? '完成了一次清洁服务' : global.language === 'english' ? 'Completed a cleaning service' : '清掃サービスを完了'}
                    </span>
                    <span className="text-xs text-gray-500 ml-auto">2小时前</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">
                      {global.language === 'chinese' ? '预约了维修服务' : global.language === 'english' ? 'Scheduled maintenance service' : 'メンテナンスサービスを予約'}
                    </span>
                    <span className="text-xs text-gray-500 ml-auto">1天前</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">
                      {global.language === 'chinese' ? '获得了50积分' : global.language === 'english' ? 'Earned 50 points' : '50ポイントを獲得'}
                    </span>
                    <span className="text-xs text-gray-500 ml-auto">3天前</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
