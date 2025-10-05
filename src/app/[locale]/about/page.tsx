"use client";
import { useAppSelector } from "@/app/store/hooks";
import { selectGlobal } from "@/app/store/globalSlice";
import { NAVIGATION } from "@/constant/language";

export default function AboutPage() {
  const global = useAppSelector(selectGlobal);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-16 pt-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {NAVIGATION.about[global.language]}
          </h1>
          <p className="text-xl text-gray-600">
            {global.language === 'chinese' 
              ? '了解我们的使命和愿景' 
              : global.language === 'english'
              ? 'Learn about our mission and vision'
              : '私たちのミッションとビジョンについて'
            }
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {global.language === 'chinese' ? '我们的使命' : global.language === 'english' ? 'Our Mission' : '私たちのミッション'}
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            {global.language === 'chinese' 
              ? '我们致力于为每个家庭提供最优质的家政服务，通过专业的团队和先进的技术，让您的生活更加便捷、舒适。我们相信，一个干净整洁的家是幸福生活的基础。' 
              : global.language === 'english'
              ? 'We are committed to providing the highest quality home services for every family. Through our professional team and advanced technology, we make your life more convenient and comfortable. We believe that a clean and tidy home is the foundation of a happy life.'
              : '私たちは、すべての家族に最高品質の家政サービスを提供することを使命としています。プロフェッショナルなチームと先進的な技術を通じて、あなたの生活をより便利で快適にします。清潔で整った家が幸せな生活の基盤であると信じています。'
            }
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {global.language === 'chinese' ? '我们的优势' : global.language === 'english' ? 'Our Advantages' : '私たちの強み'}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-gray-700">
                  {global.language === 'chinese' ? '专业培训的服务团队' : global.language === 'english' ? 'Professionally trained service team' : 'プロフェッショナルに訓練されたサービスチーム'}
                </span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-gray-700">
                  {global.language === 'chinese' ? '24小时客户服务' : global.language === 'english' ? '24-hour customer service' : '24時間カスタマーサービス'}
                </span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-gray-700">
                  {global.language === 'chinese' ? '灵活的服务时间' : global.language === 'english' ? 'Flexible service hours' : '柔軟なサービス時間'}
                </span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-gray-700">
                  {global.language === 'chinese' ? '合理的价格体系' : global.language === 'english' ? 'Reasonable pricing system' : '合理的な価格体系'}
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {global.language === 'chinese' ? '联系我们' : global.language === 'english' ? 'Contact Us' : 'お問い合わせ'}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-gray-700">400-123-4567</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-700">service@example.com</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-700">
                  {global.language === 'chinese' ? '北京市朝阳区' : global.language === 'english' ? 'Chaoyang District, Beijing' : '北京市朝陽区'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
