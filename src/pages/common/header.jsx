import { HotelShareIcon } from "@/utils/share_icon";
import { ArrowRight, Search } from "lucide-react";
import React, { useState } from "react";

const Header = ({
  isHome = false,          // Placeholder: Set true if home page
  currentPath = window.location.pathname.toLowerCase(), // Fallback
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Helpers to check active state
  const navActive = (cond) =>
    cond ? "text-(--main)" : "text-gray-600 hover:text-(--main)";

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a
            href={`/`}
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 bg-(--main) rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
              <HotelShareIcon width={22} height={22} fill="#fff" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
                <span className="text-(--main)">Aurora</span>
                <span className="text-[#0F172A]">Hotel</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            <a
              href={`/`}
              className={`text-sm font-semibold ${navActive(isHome)} transition-colors`}
            >
              Trang Chủ
            </a>
            <a
              href={`/`}
              className={`text-sm font-semibold ${navActive(
                currentPath.includes("listitem")
              )} transition-colors`}
            >
              Phòng
            </a>
            <a
              href="#"
              className="text-sm font-semibold text-gray-600 hover:text-(--main) transition-colors"
            >
              Dịch Vụ
            </a>
            <a
              href={`/`}
              className={`text-sm font-semibold ${navActive(
                currentPath.includes("blog-content") ||
                  currentPath.includes("detail-blog")
              )} transition-colors`}
            >
              Blog
            </a>
            <a
              href={`/`}
              className={`text-sm font-semibold ${navActive(
                currentPath.includes("contact")
              )} transition-colors`}
            >
              Liên Hệ
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex relative group">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-52 xl:w-72 pl-12 pr-5 py-2.5 bg-white/80 border border-gray-200 focus:border-[#52DBA9] focus:ring-4 focus:ring-[#52DBA9] dark:bg-gray-100/80 rounded-[2rem] text-sm font-medium text-gray-700 placeholder-gray-400 focus:bg-white transition-all outline-none shadow-sm focus:shadow-lg duration-200"
                style={{
                  boxShadow:
                    "0 2px 8px 0 rgba(29, 78, 216, 0.04), 0 1.5px 6px 0 rgba(16,30,54,.07)",
                  backdropFilter: "blur(3px)",
                }}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <a
              href={`/`}
              className="hidden sm:flex items-center gap-2 bg-(--main) hover:bg-[#52DBA9] text-white px-6 py-2.5 rounded-full font-semibold text-sm transition-all shadow-lg shadow-blue-200 active:scale-95"
            >
              Đặt Phòng Ngay <ArrowRight className="w-4 h-4" />
            </a>
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
        id="mobile-menu"
        className={`${
          mobileOpen ? "" : "hidden"
        } lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 p-4 space-y-4 shadow-xl animate-in slide-in-from-top duration-300`}
      >
        <a
          href={`/`}
          className={`block py-2 ${
            isHome ? "text-(--main)" : "text-gray-600"
          } font-semibold`}
        >
          Trang Chủ
        </a>
        <a
          href={`/`}
          className={`block py-2 ${
            currentPath.includes("listitem")
              ? "text-(--main)"
              : "text-gray-600"
          } font-semibold border-t border-gray-50 pt-4`}
        >
          Phòng
        </a>
        <a
          href="#"
          className="block py-2 text-gray-600 font-semibold border-t border-gray-50 pt-4"
        >
          Dịch Vụ
        </a>
        <a
          href={`/`}
          className={`block py-2 ${
            currentPath.includes("blog-content") ||
            currentPath.includes("detail-blog")
              ? "text-(--main)"
              : "text-gray-600"
          } font-semibold border-t border-gray-50 pt-4`}
        >
          Blog
        </a>
        <a
          href={`/`}
          className={`block py-2 ${
            currentPath.includes("contact")
              ? "text-(--main)"
              : "text-gray-600"
          } font-semibold border-t border-gray-50 pt-4`}
        >
          Liên Hệ
        </a>
        <div className="pt-4 border-t border-gray-50 flex items-center justify-center">
          <a
            href={`/`}
            className="flex items-center justify-center gap-2 bg-(--main) text-white py-3 rounded-xl font-semibold w-full text-center"
          >
            Đặt Phòng Ngay
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;