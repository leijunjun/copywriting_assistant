import { Toaster } from "@/components/ui/toaster";
import dynamic from 'next/dynamic';
import { getMessages } from 'next-intl/server';

const ClientProvider = dynamic(() => import('./ClientProvider'), { ssr: false });
const Header = dynamic(() => import('@/components/Header'), { ssr: false });
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false });

export default async function LocaleLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const messages = await getMessages();
  
  return (
    <ClientProvider locale={locale} messages={messages}>
      <Header />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
      <Toaster />
    </ClientProvider>
  );
}
