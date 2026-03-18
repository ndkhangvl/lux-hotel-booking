import React, { useState } from "react";
import authApi from "@/api/AuthApi";
import { ACCESS_TOKEN } from "@/utils/constant";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
      email: form.email, // hoặc username, tùy API backend
      password: form.password,
    });

    console.log("login response:", data);

    if (data?.token) {
      localStorage.setItem(ACCESS_TOKEN, data.token);
      window.location.href = "/";
    } else {
      setError("Đăng nhập thất bại: Không nhận được token");
    }
  } catch (err) {
    console.error("login error:", err);

    if (err?.response?.data?.message) {
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
    <main className="flex-1 flex items-center justify-center py-12 px-4 bg-gray-50 min-h-screen">
      <div className="w-full max-w-md bg-white p-10 md:p-12 rounded-[48px] border border-gray-100 shadow-2xl shadow-blue-900/5 space-y-10">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Chào mừng trở lại!
          </h1>
          <p className="text-gray-500 font-medium tracking-tight">
            Đăng nhập để tiếp tục khám phá
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
          {!!error && (
            <div className="text-red-500 text-sm font-bold text-center">{error}</div>
          )}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
              Tên đăng nhập / Email
            </label>
            <div className="relative">
              <input
                type="text"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Nhập email của bạn"
                className="w-full h-14 pl-12 pr-6 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                autoComplete="username"
                required
              />
              <i className="fa-solid fa-envelope absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Mật khẩu
              </label>
              <a href="#" className="text-xs font-bold text-blue-600 hover:underline">
                Quên mật khẩu?
              </a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full h-14 pl-12 pr-12 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                autoComplete="current-password"
                required
              />
              <i className="fa-solid fa-lock absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                <i className={showPassword ? "fa-regular fa-eye" : "fa-regular fa-eye-slash"} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 ml-1">
            <input
              type="checkbox"
              id="remember"
              name="remember"
              checked={form.remember}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
            />
            <label
              htmlFor="remember"
              className="text-xs font-bold text-gray-600 cursor-pointer"
            >
              Ghi nhớ đăng nhập
            </label>
          </div>
          <button
            type="submit"
            className={`w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all active:scale-95 shadow-xl shadow-blue-600/20 ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
          </button>
        </form>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Hoặc đăng nhập bằng
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button className="h-14 bg-white border border-gray-100 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all font-bold text-sm text-gray-900 shadow-sm" type="button">
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              className="w-5 h-5"
              alt=""
            />
            Google
          </button>
          <button className="h-14 bg-white border border-gray-100 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all font-bold text-sm text-gray-900 shadow-sm" type="button">
            <img
              src="https://www.svgrepo.com/show/475647/facebook-color.svg"
              className="w-5 h-5"
              alt=""
            />
            Facebook
          </button>
        </div>
        <p className="text-center text-sm font-bold text-gray-500">
          Chưa có tài khoản?{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Đăng ký ngay
          </a>
        </p>
      </div>
    </main>
  );
};

export default Login;