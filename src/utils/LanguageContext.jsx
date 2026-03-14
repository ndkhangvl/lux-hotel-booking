import React, { createContext, useContext, useState, useCallback } from "react";
import vn from "./languages/vn.json";
import eng from "./languages/eng.json";

const translations = { vn, eng };

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState("vn");

  const t = useCallback(
    (path) => {
      const keys = path.split(".");
      let value = translations[lang];
      for (const key of keys) {
        if (value == null) return path;
        value = value[key];
      }
      return value ?? path;
    },
    [lang]
  );

  const switchLang = (newLang) => {
    if (translations[newLang]) setLang(newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, t, switchLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
};
