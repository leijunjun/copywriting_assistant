"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useTranslations } from "next-intl";
import { Copy, Share2, AlertCircle } from "lucide-react";

export default function XhsSharePage() {
  const { toast } = useToast();
  const t = useTranslations("xhsShare");
  const [isWeChat, setIsWeChat] = useState(false);
  const [showWeChatMask, setShowWeChatMask] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // 预设的家政服务文案（约 300 字）
  const defaultContent = `🏠 专业家政服务，让生活更美好 ✨

我们是一家专注于高品质家居服务的家政公司，致力于为每一个家庭带来洁净、舒适的生活环境。

🌟 服务特色：
• 专业保洁：深度清洁、日常保洁、开荒保洁
• 家电清洗：油烟机、空调、洗衣机等深度清洗
• 月嫂育儿：经验丰富的月嫂、育婴师团队
• 老人陪护：贴心照顾，让老人安享晚年
• 钟点工服务：灵活预约，按需服务

💪 我们的优势：
✅ 持证上岗，经过专业培训
✅ 背景调查，安全可靠
✅ 保险保障，服务无忧
✅ 价格透明，无隐形消费
✅ 客户好评率98%以上

📞 预约咨询：
免费上门评估，定制专属服务方案
让专业的人做专业的事，给家人更多陪伴时间

#家政服务 #专业保洁 #家居清洁 #生活服务 #品质生活`;

  // 检测是否在微信环境中
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const inWeChat = /micromessenger/i.test(ua);
    setIsWeChat(inWeChat);
  }, []);

  // 复制文案到剪贴板
  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // 降级方案：使用 textarea
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand("copy");
        textArea.remove();
        return successful;
      }
    } catch (err) {
      console.error("Failed to copy:", err);
      return false;
    }
  };

  // 尝试唤起小红书 App
  const openXiaohongshu = () => {
    if (isWeChat) {
      setShowWeChatMask(true);
      return;
    }

    setIsSharing(true);

    // 复制文案到剪贴板
    copyToClipboard(defaultContent).then((success) => {
      if (success) {
        toast({
          title: t("copySuccess"),
          description: t("copySuccessDesc"),
          variant: "success",
        });

        // 尝试唤起小红书 App
        // 注意：在实际环境中，这可能会被浏览器拦截
        const schemes = [
          "xhsdiscover://", // 小红书发现页
          "xiaohongshu://", // 小红书通用 scheme
        ];

        let attempted = false;
        schemes.forEach((scheme, index) => {
          setTimeout(() => {
            try {
              window.location.href = scheme;
              attempted = true;
            } catch (e) {
              console.error(`Failed to open scheme: ${scheme}`, e);
            }
          }, index * 100);
        });

        // 显示操作指引
        setTimeout(() => {
          toast({
            title: t("openAppGuide"),
            description: t("openAppGuideDesc"),
            duration: 8000,
          });
        }, 1000);
      } else {
        toast({
          title: t("copyFailed"),
          description: t("copyFailedDesc"),
          variant: "destructive",
        });
      }
      setIsSharing(false);
    });
  };

  // 仅复制文案
  const handleCopyOnly = async () => {
    const success = await copyToClipboard(defaultContent);
    if (success) {
      toast({
        title: t("copySuccess"),
        description: t("manualShareDesc"),
        variant: "success",
      });
    } else {
      toast({
        title: t("copyFailed"),
        description: t("copyFailedDesc"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("title")}
          </h1>
          <p className="text-gray-600">{t("subtitle")}</p>
        </div>

        {/* 文案展示区域 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {t("contentPreview")}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyOnly}
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              {t("copy")}
            </Button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
              {defaultContent}
            </pre>
          </div>
        </div>

        {/* 分享按钮区域 */}
        <div className="space-y-4">
          <Button
            onClick={openXiaohongshu}
            disabled={isSharing}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Share2 className="w-5 h-5 mr-2" />
            {isSharing ? t("sharing") : t("shareButton")}
          </Button>

          {/* 提示信息 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">{t("tipTitle")}</p>
              <ul className="space-y-1 text-blue-700">
                <li>• {t("tip1")}</li>
                <li>• {t("tip2")}</li>
                <li>• {t("tip3")}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 微信环境遮罩层 */}
      {showWeChatMask && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-start justify-end p-4"
          onClick={() => setShowWeChatMask(false)}
        >
          <div className="text-white text-center mt-4 mr-4 animate-bounce">
            <div className="text-6xl mb-4">↗️</div>
            <div className="text-xl font-bold mb-2">{t("wechatMaskTitle")}</div>
            <div className="text-sm opacity-90">{t("wechatMaskDesc")}</div>
          </div>
        </div>
      )}
    </div>
  );
}

