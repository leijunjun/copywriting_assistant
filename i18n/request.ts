import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
const locales = ['en', 'zh', 'ja'];

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as any)) {
    // Default to 'zh' if locale is not valid
    locale = 'zh';
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
