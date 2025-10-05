"use client";
import { useAppSelector } from "@/app/store/hooks";
import { selectGlobal } from "@/app/store/globalSlice";
import { NAVIGATION } from "@/constant/language";

export default function ServicesPage() {
  const global = useAppSelector(selectGlobal);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-16 pt-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {NAVIGATION.services[global.language]}
          </h1>
          <p className="text-xl text-gray-600">
            {global.language === 'chinese' 
              ? '我们提供专业的家政服务，让您的生活更加便捷' 
              : global.language === 'english'
              ? 'We provide professional home services to make your life more convenient'
              : 'プロフェッショナルな家政サービスを提供し、あなたの生活をより便利にします'
            }
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {global.language === 'chinese' ? '清洁服务' : global.language === 'english' ? 'Cleaning Services' : '清掃サービス'}
            </h3>
            <p className="text-gray-600">
              {global.language === 'chinese' 
                ? '专业的家庭清洁服务，让您的家焕然一新' 
                : global.language === 'english'
                ? 'Professional home cleaning services to refresh your home'
                : 'プロフェッショナルな家庭清掃サービスで、お家をリフレッシュ'
              }
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {global.language === 'chinese' ? '护理服务' : global.language === 'english' ? 'Care Services' : 'ケアサービス'}
            </h3>
            <p className="text-gray-600">
              {global.language === 'chinese' 
                ? '贴心的老人和儿童护理服务' 
                : global.language === 'english'
                ? 'Thoughtful care services for elderly and children'
                : '高齢者とお子様への思いやりあるケアサービス'
              }
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {global.language === 'chinese' ? '维修服务' : global.language === 'english' ? 'Maintenance Services' : 'メンテナンスサービス'}
            </h3>
            <p className="text-gray-600">
              {global.language === 'chinese' 
                ? '专业的家电和家具维修服务' 
                : global.language === 'english'
                ? 'Professional appliance and furniture maintenance'
                : 'プロフェッショナルな家電・家具メンテナンス'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
