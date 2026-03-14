import { useLanguage } from "@/utils/LanguageContext";
import { HotelShareIcon } from "@/utils/share_icon";
import { ArrowRight, Search } from "lucide-react";
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { key: "home", path: "/" },
  { key: "rooms", path: "/rooms" },
  { key: "services", path: "/services" },
  { key: "blog", path: "/blog" },
  { key: "contact", path: "/contact" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { t, lang, switchLang } = useLanguage();

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const navClass = (path) =>
    isActive(path)
      ? "text-(--main)"
      : "text-gray-600 hover:text-(--main)";

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-(--main) rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
              <HotelShareIcon width={22} height={22} fill="#fff" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-(--main)">Aurora</span>
              <span className="text-[#0F172A]">Hotel</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map(({ key, path }) => (
              <Link
                key={key}
                to={path}
                className={`text-sm font-semibold ${navClass(path)} transition-colors`}
              >
                {t(`nav.${key}`)}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex relative group">
              <input
                type="text"
                placeholder={t("common.search")}
                className="w-52 xl:w-72 pl-12 pr-5 py-2.5 bg-white/80 border border-gray-200 focus:border-[#52DBA9] focus:ring-4 focus:ring-[#52DBA9] dark:bg-gray-100/80 rounded-[2rem] text-sm font-medium text-gray-700 placeholder-gray-400 focus:bg-white transition-all outline-none shadow-sm focus:shadow-lg duration-200"
                style={{
                  boxShadow:
                    "0 2px 8px 0 rgba(29, 78, 216, 0.04), 0 1.5px 6px 0 rgba(16,30,54,.07)",
                  backdropFilter: "blur(3px)",
                }}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <Link
              to="/booking"
              className="hidden sm:flex items-center gap-2 bg-(--main) hover:bg-[#52DBA9] text-white px-6 py-2.5 rounded-full font-semibold text-sm transition-all shadow-lg shadow-blue-200 active:scale-95"
            >
              {t("nav.bookNow")} <ArrowRight className="w-4 h-4" />
            </Link>
            {/* Language Switcher */}
            <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-full p-1">
              <button
                onClick={() => switchLang("vn")}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  lang === "vn"
                    ? "bg-white text-(--main) shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                VN
              </button>
              <button
                onClick={() => switchLang("eng")}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  lang === "eng"
                    ? "bg-white text-(--main) shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                EN
              </button>
            </div>
            <button
              className="lg:hidden text-gray-600"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle mobile menu"
            >
              <i className="fa-solid fa-bars-staggered text-2xl"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`${
          mobileOpen ? "" : "hidden"
        } lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 p-4 space-y-4 shadow-xl animate-in slide-in-from-top duration-300`}
      >
        {NAV_LINKS.map(({ key, path }, i) => (
          <Link
            key={key}
            to={path}
            onClick={() => setMobileOpen(false)}
            className={`block py-2 ${isActive(path) ? "text-(--main)" : "text-gray-600"} font-semibold ${i > 0 ? "border-t border-gray-50 pt-4" : ""}`}
          >
            {t(`nav.${key}`)}
          </Link>
        ))}
        <div className="pt-4 border-t border-gray-50 flex items-center justify-center">
          <Link
            to="/booking"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 bg-(--main) text-white py-3 rounded-xl font-semibold w-full text-center"
          >
            {t("nav.bookNow")}
          </Link>
        </div>
        {/* Mobile Language Switcher */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => { switchLang("vn"); setMobileOpen(false); }}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
              lang === "vn" ? "bg-(--main) text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            Tiếng Việt
          </button>
          <button
            onClick={() => { switchLang("eng"); setMobileOpen(false); }}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
              lang === "eng" ? "bg-(--main) text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            English
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
