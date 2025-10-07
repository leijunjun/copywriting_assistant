"use client";

import { Provider } from "react-redux";
import { NextIntlClientProvider } from 'next-intl';
import store from "../store";
import { useEffect } from "react";
import { AuthProvider } from '@/lib/auth/auth-context';

const ClientProvider = ({ 
  children, 
  locale, 
  messages 
}: { 
  children: React.ReactNode;
  locale: string;
  messages: any;
}) => {

  useEffect(() => {
    const showBrand = process.env.NEXT_PUBLIC_SHOW_BRAND === "true";
    const width = document.body.clientWidth;
    if (width > 768 && showBrand) {
      const script = document.createElement("script");
      script.src = "https://assets.salesmartly.com/js/project_177_61_1649762323.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Provider store={store}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </Provider>
    </NextIntlClientProvider>
  );
};

export default ClientProvider;
