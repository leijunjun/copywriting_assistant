"use client";
import { useAppSelector } from "@/app/store/hooks";
import { selectGlobal } from "@/app/store/globalSlice";
import { NAVIGATION } from "@/constant/language";

export default function AboutPage() {
  const global = useAppSelector(selectGlobal);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section with Background Image */}
      <div className="relative py-16 pt-32">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
            opacity: 0.1
          }}
        ></div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            {NAVIGATION.about[global.language]}
          </h1>
          <p className="text-xl text-gray-600">
            {global.language === 'chinese' 
              ? '用AI智能提升行业竞争力' 
              : global.language === 'english'
              ? 'Learn about our mission and vision'
              : '私たちのミッションとビジョンについて'
            }
          </p>
        </div>
      </div>

      {/* Stats Section - Full Width */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Stat 1 */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-4xl font-bold rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                省
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {global.language === 'chinese'
                  ? '50%-80%人力成本节省'
                  : global.language === 'english'
                  ? '50%-80% Labor Cost Savings'
                  : '50%-80%人件費削減'}
              </h3>
              <p className="text-gray-600">
                {global.language === 'chinese' ? '通过AI技术大幅降低人工成本' : global.language === 'english' ? 'Dramatically reduce labor costs through AI technology' : 'AI技術により人件費を大幅に削減'}
              </p>
            </div>

            {/* Stat 2 */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white text-4xl font-bold rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                强
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {global.language === 'chinese' ? '融合10+顶级大模型' : global.language === 'english' ? 'Top Global AI Models' : '国内外トップAIモデル'}
              </h3>
              <p className="text-gray-600">
                {global.language === 'chinese' ? '集成这个世界最领先的AI技术' : global.language === 'english' ? 'Integrated multiple world-leading AI models' : '複数の世界トップAIモデルを統合'}
              </p>
            </div>

            {/* Stat 3 */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white text-4xl font-bold rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                专
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {global.language === 'chinese' ? '行业话术' : global.language === 'english' ? 'Industry Expertise' : '業界専門用語'}
              </h3>
              <p className="text-gray-600">
                {global.language === 'chinese' ? '懂AI更懂行业场景' : global.language === 'english' ? 'Understand more AI business scenarios' : 'より多くのAIビジネスシーンを理解'}
              </p>
            </div>

            {/* Stat 4 */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white text-4xl font-bold rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                快
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {global.language === 'chinese' ? '支持批量' : global.language === 'english' ? 'Unlimited Expansion' : '無制限拡張'}
              </h3>
              <p className="text-gray-600">
                {global.language === 'chinese' ? '批量产出批量导出' : global.language === 'english' ? 'Support custom intelligent agents' : 'カスタムインテリジェントエージェントをサポート'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              {global.language === 'chinese' ? '我们的使命' : global.language === 'english' ? 'Our Mission' : '私たちのミッション'}
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-6">
                {global.language === 'chinese' 
                  ? '我们是一个致力于让文案创作更简单、更高效的团队。深知很多人面对空白文档时会感到无从下手，灵感枯竭、措辞纠结，甚至为一句广告词熬夜到凌晨。我们懂这些痛点，因为我们也曾经历过。' 
                  : global.language === 'english'
                  ? 'We are a team dedicated to making copywriting simpler and more efficient. We understand that many people feel lost when facing a blank document, struggling with inspiration, word choice, and even staying up late for a single advertising slogan. We understand these pain points because we have experienced them ourselves.'
                  : '私たちは、コピーライティングをより簡単で効率的にすることを目指すチームです。多くの人が空白の文書に直面した時に手がつけられない、インスピレーションが枯渇し、言葉選びに悩み、一つの広告コピーのために深夜まで起きていることを理解しています。私たちも同じ経験をしたからこそ、これらの痛みを理解しています。'
                }
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                {global.language === 'chinese' 
                  ? '借助先进的 AI 技术，我们打造了这个平台，希望帮助每一位用户轻松写出打动人心的文案。不管你是为产品写推广语、为品牌讲故事，还是为社交媒体找灵感，我们的工具都能快速生成符合你风格的内容，还能根据反馈不断优化，省时又省心。我们不追求华丽的堆砌，只想让你的表达更清晰、更有力量。' 
                  : global.language === 'english'
                  ? 'With the help of advanced AI technology, we have built this platform to help every user easily write compelling copy. Whether you are writing promotional copy for products, telling brand stories, or finding inspiration for social media, our tools can quickly generate content that matches your style and continuously optimize based on feedback, saving time and effort. We do not pursue flashy accumulation, but only want to make your expression clearer and more powerful.'
                  : '先進的なAI技術を活用して、このプラットフォームを構築し、すべてのユーザーが感動的なコピーを簡単に書けるよう支援したいと考えています。製品のプロモーションコピーを書く、ブランドストーリーを語る、ソーシャルメディアのインスピレーションを見つけるなど、私たちのツールはあなたのスタイルに合ったコンテンツを素早く生成し、フィードバックに基づいて継続的に最適化し、時間と労力を節約します。華麗な積み重ねを追求するのではなく、あなたの表現をより明確で力強いものにしたいだけです。'
                }
              </p>
              <p className="text-gray-700 leading-relaxed">
                {global.language === 'chinese' 
                  ? '我们的使命是让创作变得不再困难，让每个人都能自信地传递自己的想法。无论你是创业者、营销人还是普通用户，我们都希望成为你灵感的伙伴，陪你把每一个好点子变成现实。来试试吧，让我们一起把文字变成连接世界的桥梁！' 
                  : global.language === 'english'
                  ? 'Our mission is to make creation no longer difficult, so that everyone can confidently convey their ideas. Whether you are an entrepreneur, marketer, or ordinary user, we hope to be your inspiration partner, accompanying you to turn every good idea into reality. Come and try it, let us turn words into bridges that connect the world together!'
                  : '私たちの使命は、創作を困難なものにせず、誰もが自信を持って自分のアイデアを伝えられるようにすることです。起業家、マーケター、一般ユーザーを問わず、私たちはあなたのインスピレーションパートナーとなり、すべての良いアイデアを現実に変えるお手伝いをしたいと考えています。ぜひ試してみてください。一緒に言葉を世界をつなぐ架け橋にしましょう！'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {global.language === 'chinese' ? '我们的优势' : global.language === 'english' ? 'Our Advantages' : '私たちの強み'}
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">
                    {global.language === 'chinese' ? '汇聚全球顶级 AI 大模型' : global.language === 'english' ? 'Integrate top global AI models' : '世界トップAIモデルを統合'}
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">
                    {global.language === 'chinese' ? '聚焦行业场景，做更有效的创作' : global.language === 'english' ? 'Focus on industry scenarios for more effective creation' : '業界シーンに焦点を当て、より効果的な創作'}
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">
                    {global.language === 'chinese' ? '支持批量内容产出和导出' : global.language === 'english' ? 'Support batch content production and export' : 'バッチコンテンツ生産とエクスポートをサポート'}
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">
                    {global.language === 'chinese' ? '支持行业需求定制' : global.language === 'english' ? 'Support industry-specific customization' : '業界ニーズに応じたカスタマイズをサポート'}
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
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                {global.language === 'chinese' ? '扫码关注我们' : global.language === 'english' ? 'Scan to Follow Us' : 'スキャンしてフォロー'}
              </h3>
              <div className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                  <img 
                    src="/weixin.png" 
                    alt="WeChat QR Code" 
                    className="w-48 h-48 object-contain"
                  />
                </div>
                <p className="text-sm text-gray-600 text-center">
                  {global.language === 'chinese' 
                    ? '扫描二维码，获取站点邀约账号' 
                    : global.language === 'english'
                    ? 'Scan QR code to get site invitation account'
                    : 'QRコードをスキャンして、サイト招待アカウントを取得'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
