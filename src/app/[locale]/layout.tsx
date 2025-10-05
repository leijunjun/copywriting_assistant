import { Inter } from "next/font/google";
import "../globals.css";
import { Toaster } from "@/components/ui/toaster";
import dynamic from 'next/dynamic';

const inter = Inter({ subsets: ["latin"] });

const ClientProvider = dynamic(() => import('./ClientProvider'), { ssr: false });
const Header = dynamic(() => import('@/components/Header'), { ssr: false });

export default function RootLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  
  return (
    <html lang={locale}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={inter.className}>
        <ClientProvider>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
        </ClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
