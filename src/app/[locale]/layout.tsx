import { Inter } from "next/font/google";
import "../globals.css";
import { Toaster } from "@/components/ui/toaster";
import dynamic from 'next/dynamic';

const inter = Inter({ subsets: ["latin"] });

const ClientProvider = dynamic(() => import('./ClientProvider'), { ssr: false });

export default function RootLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  
  return (
    <html lang={locale}>
      <body className={inter.className}>
        <ClientProvider>
          {children}
        </ClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
