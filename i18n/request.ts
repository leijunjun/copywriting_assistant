import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
const locales = ['en', 'zh', 'ja'];

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    // Default to 'zh' if locale is not valid
    return {
      messages: (await import(`../messages/zh.json`)).default,
    };
  }

  return {
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
