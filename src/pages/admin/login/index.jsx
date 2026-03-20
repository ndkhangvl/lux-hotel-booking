import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import authApi from "@/api/AuthApi";
import { ACCESS_TOKEN } from "@/utils/constant";
import { HotelShareIcon } from "@/utils/share_icon";

function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN);
}

function getUserRoleFromToken(token) {
  if (!token) return null;
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;
    const payloadJson = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadJson);
    return (
      payload.role ||
      payload.Role ||
      (Array.isArray(payload.roles) ? payload.roles[0] : null) ||
      null
    );
  } catch {
    return null;
  }
}

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/admin";

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      const role = getUserRoleFromToken(token);
      if (role === "Admin" || role === "Receptionist") {
        navigate(from, { replace: true });
      }
    }
  }, [navigate, from]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!form.email || !form.password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu.");
      setLoading(false);
      return;
    }

    try {
      const data = await authApi.login({
        email: form.email,
        password: form.password,
      });

      const token = data?.access_token || data?.token;
      if (!token) {
        setError("Đăng nhập thất bại: Không nhận được token.");
        setLoading(false);
        return;
      }

      const role = getUserRoleFromToken(token);
      if (role !== "Admin" && role !== "Receptionist") {
        setError("Tài khoản này không có quyền truy cập trang quản trị.");
        setLoading(false);
        return;
      }

      localStorage.setItem(ACCESS_TOKEN, token);
      navigate(from, { replace: true });
    } catch (err) {
      if (err?.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError("Đăng nhập thất bại. Vui lòng kiểm tra thông tin!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <a href="/" className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center">
              <HotelShareIcon width={20} height={20} fill="#fff" />
            </div>
            <span className="text-gray-900 font-bold text-lg tracking-tight">
              Aurora<span className="text-emerald-500">Hotel</span>
            </span>
          </a>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Đăng nhập quản trị</h1>
          <p className="text-gray-400 text-sm mt-1">Dành cho Admin & Lễ tân</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-5">
          {/* Error */}
          {!!error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-500 text-sm font-medium">
              <i className="fa-solid fa-circle-exclamation" />
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="admin@aurora.hotel"
                  required
                  autoComplete="username"
                  className="w-full h-12 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                />
                <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full h-12 pl-11 pr-11 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                />
                <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  <i className={showPassword ? "fa-regular fa-eye" : "fa-regular fa-eye-slash"} />
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full h-12 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-sm rounded-xl transition-all shadow-sm mt-1 ${
                loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Đang xác thực...
                </span>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          Chỉ dành cho nhân viên nội bộ ·{" "}
          <a href="/" className="text-emerald-500 hover:underline">
            Về trang chủ
          </a>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
