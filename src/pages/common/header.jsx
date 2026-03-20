import { useLanguage } from "@/utils/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HotelShareIcon } from "@/utils/share_icon";
import { ACCESS_TOKEN } from "@/utils/constant";
import { ArrowRight, Eye, EyeOff, Facebook, LogOut, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API_BASE from "@/utils/api";
import axios from "axios";

const NAV_LINKS = [
  { key: "home", path: "/" },
  { key: "rooms", path: "/rooms" },
  { key: "services", path: "/services" },
  { key: "blog", path: "/blog" },
  { key: "contact", path: "/contact" },
];

const getAccessToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN);
};

const parseTokenPayload = (token) => {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
};

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");
  const [authState, setAuthState] = useState(() => {
    const token = getAccessToken();
    const payload = parseTokenPayload(token);
    return {
      isLoggedIn: Boolean(token),
      role: payload?.role ?? null,
    };
  });
  const location = useLocation();
  const { t, lang, switchLang } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const syncAuthState = () => {
      const token = getAccessToken();
      const payload = parseTokenPayload(token);
      setAuthState({
        isLoggedIn: Boolean(token),
        role: payload?.role ?? null,
      });
    };

    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    return () => window.removeEventListener("storage", syncAuthState);
  }, [location.pathname]);

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const navClass = (path) =>
    isActive(path)
      ? "text-(--main)"
      : "text-gray-600 hover:text-(--main)";

  // Login form handlers
  const handleLoginChange = (e) => {
    setLoginForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setLoginError("");
  };

  // Register form handlers
  const handleRegisterChange = (e) => {
    setRegisterForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setRegisterError("");
    setRegisterSuccess("");
  };

  // Login API handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/users/login`, {
        email: loginForm.username,
        password: loginForm.password,
      });
      if (res.data?.access_token) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access_token);

        // Decode JWT user role
        const accessToken = res.data.access_token;
        let role = null;
        if (accessToken) {
          const payload = accessToken.split('.')[1];
          try {
            const decodedPayload = JSON.parse(atob(payload));
            role = decodedPayload?.role || null;
          } catch (e) {
            // failed to decode
          }
        }

        setAuthState({ isLoggedIn: true, role });

        setAuthOpen(false);
        setLoginForm({
          username: "",
          password: "",
        });
        setShowLoginPassword(false);
        setLoginError("");

        // Điều hướng theo role
        if (role === "Admin" || role === "Receptionist") {
          navigate("/admin", { replace: true });
        } else if (role === "Customer") {
          navigate("/", { replace: true });
        }
      } else {
        setLoginError(t("auth.loginFail") || "Đăng nhập thất bại");
      }
    } catch (err) {
      setLoginError(
        err?.response?.data?.message ||
          t("auth.loginFail") ||
          "Đăng nhập thất bại"
      );
    }
    setLoginLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN);
    setAuthState({ isLoggedIn: false, role: null });
    setAuthOpen(false);
    setRegisterOpen(false);
    navigate("/", { replace: true });
  };

  // Register API handler (dựa trên FastAPI /register)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterSuccess("");
    setRegisterLoading(true);

    // Validate fields
    if (!registerForm.fullName || !registerForm.email || !registerForm.password || !registerForm.confirmPassword) {
      setRegisterError(t('auth.pleaseFillAllFields') || 'Vui lòng nhập đầy đủ thông tin');
      setRegisterLoading(false);
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setRegisterError(t("auth.passwordNotMatch") || "Mật khẩu xác nhận không đúng");
      setRegisterLoading(false);
      return;
    }

    // Sử dụng API register bên FastAPI
    try {
      const payload = {
        name: registerForm.fullName,
        email: registerForm.email,
        phone: registerForm.phone || null,
        password: registerForm.password,
        role: "Customer",
      };
      // Gọi endpoint /users/register
      const res = await axios.post(`${API_BASE}/users/register`, payload);

      setRegisterSuccess(t("auth.registerSuccess") || "Đăng ký thành công. Vui lòng đăng nhập!");
      setRegisterForm({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });
      setShowRegisterPassword(false);
      setShowRegisterConfirmPassword(false);

      setTimeout(() => {
        setRegisterOpen(false);
        setAuthOpen(true);
        setRegisterSuccess("");
      }, 1300);
    } catch (error) {
      setRegisterError(
        error?.response?.data?.detail ||
        t("auth.registerFail") ||
        "Đăng ký thất bại"
      );
    }
    setRegisterLoading(false);
  };

  return (
    <>
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
              {authState.isLoggedIn ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="hidden sm:flex items-center gap-2 border border-gray-200 hover:border-red-300 text-slate-700 hover:text-red-500 px-5 py-2.5 rounded-full font-semibold text-sm transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  {t("admin.header.logout")}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthOpen(true)}
                  className="hidden sm:flex items-center gap-2 border border-gray-200 hover:border-(--main) text-slate-700 hover:text-(--main) px-5 py-2.5 rounded-full font-semibold text-sm transition-all"
                >
                  {t("auth.loginRegister")}
                </button>
              )}
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
          <div className="flex items-center justify-center pt-2">
            {authState.isLoggedIn ? (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="w-full border border-gray-200 hover:border-red-300 text-slate-700 hover:text-red-500 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                {t("admin.header.logout")}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setAuthOpen(true);
                }}
                className="w-full border border-gray-200 hover:border-(--main) text-slate-700 hover:text-(--main) py-3 rounded-xl font-semibold transition-all"
              >
                {t("auth.loginRegister")}
              </button>
            )}
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

        <Dialog open={authOpen} onOpenChange={setAuthOpen}>
          <DialogContent className="sm:max-w-md rounded-2xl border border-gray-200">
            <DialogHeader>
              <DialogTitle>{t("auth.loginTitle")}</DialogTitle>
              <DialogDescription>{t("auth.loginSubtitle")}</DialogDescription>
            </DialogHeader>

            <form className="space-y-4" onSubmit={handleLoginSubmit}>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {t("auth.username")}
                </label>
                <input
                  type="text"
                  name="username"
                  autoComplete="username"
                  value={loginForm.username}
                  onChange={handleLoginChange}
                  disabled={loginLoading}
                  placeholder={t("auth.usernamePlaceholder")}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-(--main) focus:ring-2 focus:ring-(--main)/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {t("auth.password")}
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    disabled={loginLoading}
                    placeholder={t("auth.passwordPlaceholder")}
                    className="w-full px-4 pr-11 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-(--main) focus:ring-2 focus:ring-(--main)/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((prev) => !prev)}
                    disabled={loginLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                    aria-label={showLoginPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <p className="text-red-500 text-sm mt-1">{loginError}</p>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className={`w-full bg-(--main) hover:bg-[#52DBA9] text-white py-3 rounded-xl font-semibold transition-all ${
                  loginLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loginLoading ? t("auth.loggingIn") || "Logging in..." : t("auth.loginButton")}
              </button>
            </form>

            <div className="flex items-center gap-3 text-xs text-gray-400">
              <div className="h-px flex-1 bg-gray-200" />
              <span>OR</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 border border-[#EA4335]/30 hover:border-[#EA4335] bg-[#EA4335] py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
              >
                <span className="w-5 h-5 rounded-full bg-white text-[#EA4335] flex items-center justify-center text-xs font-bold">
                  G
                </span>
                {t("auth.loginWithGoogle")}
              </button>
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 border border-[#1877F2]/30 hover:border-[#1877F2] bg-[#1877F2] py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
              >
                <Facebook className="w-4 h-4" />
                {t("auth.loginWithFacebook")}
              </button>
            </div>

            <p className="text-center text-sm text-slate-500">
              {t("auth.noAccount")}{" "}
              <button
                type="button"
                onClick={() => {
                  setAuthOpen(false);
                  setRegisterOpen(true);
                  setLoginForm({ username: "", password: "" });
                  setShowLoginPassword(false);
                  setLoginError("");
                }}
                className="text-(--main) font-semibold hover:underline"
              >
                {t("auth.registerHere")}
              </button>
            </p>
          </DialogContent>
        </Dialog>

        <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
          <DialogContent className="sm:max-w-md rounded-2xl border border-gray-200">
            <DialogHeader>
              <DialogTitle>{t("auth.registerTitle")}</DialogTitle>
              <DialogDescription>{t("auth.registerSubtitle")}</DialogDescription>
            </DialogHeader>

            <form className="space-y-4" onSubmit={handleRegisterSubmit}>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {t("auth.fullName")}
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={registerForm.fullName}
                  onChange={handleRegisterChange}
                  placeholder={t("auth.fullNamePlaceholder")}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-(--main) focus:ring-2 focus:ring-(--main)/20"
                  disabled={registerLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {t("auth.email")}
                </label>
                <input
                  type="email"
                  name="email"
                  value={registerForm.email}
                  onChange={handleRegisterChange}
                  placeholder={t("auth.emailPlaceholder")}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-(--main) focus:ring-2 focus:ring-(--main)/20"
                  disabled={registerLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {t("auth.phone")}
                </label>
                <input
                  type="text"
                  name="phone"
                  value={registerForm.phone}
                  onChange={handleRegisterChange}
                  placeholder={t("auth.phonePlaceholder")}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-(--main) focus:ring-2 focus:ring-(--main)/20"
                  disabled={registerLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {t("auth.password")}
                </label>
                <div className="relative">
                  <input
                    type={showRegisterPassword ? "text" : "password"}
                    name="password"
                    value={registerForm.password}
                    onChange={handleRegisterChange}
                    placeholder={t("auth.passwordPlaceholder")}
                    className="w-full px-4 pr-11 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-(--main) focus:ring-2 focus:ring-(--main)/20"
                    disabled={registerLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword((prev) => !prev)}
                    disabled={registerLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                    aria-label={showRegisterPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {t("auth.confirmPassword")}
                </label>
                <div className="relative">
                  <input
                    type={showRegisterConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={registerForm.confirmPassword}
                    onChange={handleRegisterChange}
                    placeholder={t("auth.confirmPasswordPlaceholder")}
                    className="w-full px-4 pr-11 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-(--main) focus:ring-2 focus:ring-(--main)/20"
                    disabled={registerLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterConfirmPassword((prev) => !prev)}
                    disabled={registerLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                    aria-label={showRegisterConfirmPassword ? "Ẩn mật khẩu xác nhận" : "Hiện mật khẩu xác nhận"}
                  >
                    {showRegisterConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {registerError && (
                <p className="text-red-500 text-sm mt-1">{registerError}</p>
              )}

              {registerSuccess && (
                <p className="text-green-600 text-sm mt-1">{registerSuccess}</p>
              )}

              <button
                type="submit"
                disabled={registerLoading}
                className={`w-full bg-(--main) hover:bg-[#52DBA9] text-white py-3 rounded-xl font-semibold transition-all ${
                  registerLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {registerLoading
                  ? t("auth.registering") || "Đang đăng ký..."
                  : t("auth.registerButton")}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500">
              {t("auth.hasAccount")}{" "}
              <button
                type="button"
                onClick={() => {
                  setRegisterOpen(false);
                  setAuthOpen(true);
                  setLoginForm({ username: "", password: "" });
                  setShowLoginPassword(false);
                  setLoginError("");
                  setRegisterForm({
                    fullName: "",
                    email: "",
                    phone: "",
                    password: "",
                    confirmPassword: "",
                  });
                  setShowRegisterPassword(false);
                  setShowRegisterConfirmPassword(false);
                  setRegisterError("");
                  setRegisterSuccess("");
                }}
                className="text-(--main) font-semibold hover:underline"
              >
                {t("auth.loginHere")}
              </button>
            </p>
          </DialogContent>
        </Dialog>
      </header>
    </>
  );
};

export default Header;
