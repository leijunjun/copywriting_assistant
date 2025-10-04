"use client";

import { Provider } from "react-redux";
import store from "../store";
import { useEffect } from "react";

const ClientProvider = ({ children }: { children: React.ReactNode }) => {

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

  return <Provider store={store}>{children}</Provider>;
};

export default ClientProvider;
