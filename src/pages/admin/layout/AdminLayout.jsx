import React, { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GitBranch,
  CalendarCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Globe,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { HotelShareIcon } from "@/utils/share_icon";
import { useLanguage } from "@/utils/LanguageContext";
import { cn } from "@/lib/utils";

// ─── Sidebar ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { key: "admin.sidebar.dashboard", path: "/admin", icon: LayoutDashboard, end: true },
  { key: "admin.sidebar.accounts", path: "/admin/accounts", icon: Users },
  { key: "admin.sidebar.branches", path: "/admin/branches", icon: GitBranch },
  { key: "admin.sidebar.bookings", path: "/admin/bookings", icon: CalendarCheck },
  { key: "admin.sidebar.settings", path: "/admin/settings", icon: Settings },
];

const Sidebar = ({ collapsed, onToggle, mobileOpen, onMobileClose }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Logout handler: clear session and redirect to home
  const handleLogout = () => {
    // Clear localStorage tokens, session, etc
    localStorage.removeItem("accessToken");
    // Add other session clears here if needed
    navigate("/", { replace: true });
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className={cn(
          "flex items-center h-16 px-4 border-b border-white/10 flex-shrink-0",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        {!collapsed && (
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <HotelShareIcon width={18} height={18} fill="#fff" />
            </div>
            <span className="text-white font-bold text-base leading-tight">
              Aurora<span className="text-emerald-300">Hotel</span>
            </span>
          </a>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <HotelShareIcon width={18} height={18} fill="#fff" />
          </div>
        )}
        {/* Desktop collapse toggle */}
        <button
          onClick={onToggle}
          className="hidden lg:flex w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 items-center justify-center text-white transition-colors"
          title={collapsed ? t("admin.sidebar.expand") : t("admin.sidebar.collapse")}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
        {/* Mobile close */}
        <button
          onClick={onMobileClose}
          className="lg:hidden w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
        >
          <X size={14} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ key, path, icon: Icon, end }) => (
          <NavLink
            key={key}
            to={path}
            end={end}
            onClick={onMobileClose}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  className={cn(
                    "flex-shrink-0 transition-transform group-hover:scale-110",
                    isActive ? "text-emerald-300" : ""
                  )}
                />
                {!collapsed && (
                  <span className="truncate">{t(key)}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer logout */}
      <div className="p-2 border-t border-white/10 flex-shrink-0">
        <button
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-red-500/20 hover:text-red-300 transition-colors",
            collapsed ? "justify-center" : ""
          )}
          onClick={handleLogout}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>{t("admin.header.logout")}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-screen bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700/50 transition-all duration-300 flex-shrink-0",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <aside className="relative z-50 w-64 h-full bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};

// ─── Header ────────────────────────────────────────────────────────────────
const AdminHeader = ({ onMobileMenuOpen }) => {
  const { t, lang, switchLang } = useLanguage();
  const location = useLocation();
  const [langOpen, setLangOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const languages = [
    { code: "vn", label: "Tiếng Việt", flag: "🇻🇳" },
    { code: "eng", label: "English", flag: "🇺🇸" },
  ];

  const currentLang = languages.find((l) => l.code === lang);

  // Determine page title from path
  const getTitle = () => {
    const p = location.pathname;
    if (p === "/admin") return t("admin.sidebar.dashboard");
    if (p.includes("/admin/accounts")) return t("admin.sidebar.accounts");
    if (p.includes("/admin/branches")) return t("admin.sidebar.branches");
    if (p.includes("/admin/bookings")) return t("admin.sidebar.bookings");
    if (p.includes("/admin/settings")) return t("admin.sidebar.settings");
    return t("admin.header.adminPanel");
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 z-30">
      {/* Left: mobile burger + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
          onClick={onMobileMenuOpen}
        >
          <Menu size={18} />
        </button>
        <div>
          <h1 className="text-base font-bold text-gray-900">{getTitle()}</h1>
          <p className="text-xs text-gray-400 hidden sm:block">{t("admin.header.adminPanel")}</p>
        </div>
      </div>

      {/* Right: language + notifications + profile */}
      <div className="flex items-center gap-2">
        {/* Language switcher */}
        <div className="relative">
          <button
            onClick={() => { setLangOpen((o) => !o); setNotifOpen(false); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
          >
            <Globe size={15} className="text-gray-400" />
            <span className="hidden sm:inline">{currentLang?.flag} {currentLang?.label}</span>
            <span className="sm:hidden">{currentLang?.flag}</span>
            <ChevronDown size={13} className={cn("text-gray-400 transition-transform", langOpen && "rotate-180")} />
          </button>
          {langOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl border border-gray-100 shadow-lg z-20 overflow-hidden">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { switchLang(l.code); setLangOpen(false); }}
                    className={cn(
                      "flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors",
                      lang === l.code ? "font-semibold text-emerald-600 bg-emerald-50" : "text-gray-700"
                    )}
                  >
                    <span className="text-base">{l.flag}</span>
                    <span>{l.label}</span>
                    {lang === l.code && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen((o) => !o); setLangOpen(false); }}
            className="relative w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <Bell size={17} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          </button>
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-full mt-1.5 w-72 bg-white rounded-xl border border-gray-100 shadow-lg z-20">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">{t("admin.header.notifications")}</span>
                  <span className="text-xs text-emerald-600 font-medium">3 mới</span>
                </div>
                <div className="py-2">
                  {[
                    { title: "Đặt phòng mới #BK2024", time: "2 phút trước", dot: "bg-emerald-500" },
                    { title: "Khách check-in #BK2018", time: "15 phút trước", dot: "bg-blue-500" },
                    { title: "Yêu cầu hủy phòng", time: "1 giờ trước", dot: "bg-orange-500" },
                  ].map((n, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer">
                      <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${n.dot}`} />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{n.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-gray-100">
                  <button className="text-xs text-emerald-600 font-medium hover:underline">
                    {t("common.viewAll")}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-2 pl-1">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            A
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-gray-800 leading-tight">Admin</p>
            <p className="text-xs text-gray-400">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
};

// ─── Admin Layout ───────────────────────────────────────────────────────────
const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AdminHeader onMobileMenuOpen={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
