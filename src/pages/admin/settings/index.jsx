import React, { useState } from "react";
import {
  Hotel,
  Bell,
  Shield,
  Palette,
  Save,
  Check,
  Globe,
} from "lucide-react";
import { useLanguage } from "@/utils/LanguageContext";
import { cn } from "@/lib/utils";

const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
      active
        ? "bg-emerald-500 text-white shadow-sm"
        : "text-gray-600 hover:bg-gray-100"
    )}
  >
    <Icon size={16} />
    <span className="hidden sm:inline">{label}</span>
  </button>
);

const Toggle = ({ checked, onChange }) => (
  <button
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={cn(
      "relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200",
      checked ? "bg-emerald-500" : "bg-gray-200"
    )}
  >
    <span className={cn("pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform duration-200", checked ? "translate-x-5" : "translate-x-0")} />
  </button>
);

const AdminSettings = () => {
  const { t, lang, switchLang } = useLanguage();
  const [tab, setTab] = useState("general");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [general, setGeneral] = useState({
    hotelName: "Aurora Hotel",
    hotelEmail: "contact@aurora.vn",
    hotelPhone: "0292 3812 000",
    hotelAddress: "Aurora Hotel Group, Việt Nam",
    hotelWebsite: "https://aurora.vn",
    currency: "VND",
    timezone: "Asia/Ho_Chi_Minh",
    language: lang,
  });

  const [notifs, setNotifs] = useState({ email: true, sms: false, booking: true, system: true });
  const [security, setSecurity] = useState({ twoFactor: false, sessionTimeout: "30" });
  const [theme, setTheme] = useState("light");

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000); }, 800);
    if (general.language !== lang) switchLang(general.language);
  };

  const tabs = [
    { key: "general", label: t("admin.settings.general"), icon: Hotel },
    { key: "notifications", label: t("admin.settings.notifications"), icon: Bell },
    { key: "security", label: t("admin.settings.security"), icon: Shield },
    { key: "appearance", label: t("admin.settings.appearance"), icon: Palette },
  ];

  const Field = ({ label, children }) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 py-4 border-b border-gray-100 last:border-0">
      <label className="sm:w-56 text-sm font-medium text-gray-700 flex-shrink-0">{label}</label>
      <div className="flex-1">{children}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t("admin.settings.title")}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{t("admin.settings.subtitle")}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tab nav */}
        <div className="lg:w-48 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 flex-shrink-0">
          {tabs.map((tb) => (
            <TabButton key={tb.key} active={tab === tb.key} onClick={() => setTab(tb.key)} icon={tb.icon} label={tb.label} />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {tab === "general" && (
            <div>
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900">{t("admin.settings.general")}</h3>
              </div>
              <div className="px-6">
                <Field label={t("admin.settings.hotelName")}>
                  <input type="text" value={general.hotelName} onChange={(e) => setGeneral((g) => ({ ...g, hotelName: e.target.value }))} className="w-full max-w-sm px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300" />
                </Field>
                <Field label={t("admin.settings.hotelEmail")}>
                  <input type="email" value={general.hotelEmail} onChange={(e) => setGeneral((g) => ({ ...g, hotelEmail: e.target.value }))} className="w-full max-w-sm px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300" />
                </Field>
                <Field label={t("admin.settings.hotelPhone")}>
                  <input type="tel" value={general.hotelPhone} onChange={(e) => setGeneral((g) => ({ ...g, hotelPhone: e.target.value }))} className="w-full max-w-sm px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300" />
                </Field>
                <Field label={t("admin.settings.hotelAddress")}>
                  <input type="text" value={general.hotelAddress} onChange={(e) => setGeneral((g) => ({ ...g, hotelAddress: e.target.value }))} className="w-full max-w-sm px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300" />
                </Field>
                <Field label={t("admin.settings.hotelWebsite")}>
                  <input type="url" value={general.hotelWebsite} onChange={(e) => setGeneral((g) => ({ ...g, hotelWebsite: e.target.value }))} className="w-full max-w-sm px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300" />
                </Field>
                <Field label={t("admin.settings.currency")}>
                  <select value={general.currency} onChange={(e) => setGeneral((g) => ({ ...g, currency: e.target.value }))} className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300">
                    <option value="VND">VND — Việt Nam Đồng</option>
                    <option value="USD">USD — US Dollar</option>
                  </select>
                </Field>
                <Field label={t("admin.settings.timezone")}>
                  <select value={general.timezone} onChange={(e) => setGeneral((g) => ({ ...g, timezone: e.target.value }))} className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300">
                    <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (UTC+7)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </Field>
                <Field label={t("admin.settings.language")}>
                  <div className="flex gap-2">
                    {[{ code: "vn", flag: "🇻🇳", label: "Tiếng Việt" }, { code: "eng", flag: "🇺🇸", label: "English" }].map((l) => (
                      <button
                        key={l.code}
                        onClick={() => setGeneral((g) => ({ ...g, language: l.code }))}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors",
                          general.language === l.code ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        )}
                      >
                        <Globe size={14} /> {l.flag} {l.label}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
            </div>
          )}

          {tab === "notifications" && (
            <div>
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900">{t("admin.settings.notifications")}</h3>
              </div>
              <div className="px-6">
                {[
                  { key: "email", label: t("admin.settings.emailNotifications"), desc: "Nhận thông báo qua địa chỉ email" },
                  { key: "sms", label: t("admin.settings.smsNotifications"), desc: "Nhận thông báo qua tin nhắn SMS" },
                  { key: "booking", label: t("admin.settings.bookingNotifications"), desc: "Thông báo khi có đặt phòng mới hoặc thay đổi" },
                  { key: "system", label: t("admin.settings.systemNotifications"), desc: "Thông báo hệ thống và bảo trì" },
                ].map((n) => (
                  <div key={n.key} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{n.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{n.desc}</p>
                    </div>
                    <Toggle checked={notifs[n.key]} onChange={(v) => setNotifs((ns) => ({ ...ns, [n.key]: v }))} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "security" && (
            <div>
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900">{t("admin.settings.security")}</h3>
              </div>
              <div className="px-6">
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{t("admin.settings.twoFactor")}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Xác thực thêm một lớp bảo mật khi đăng nhập</p>
                  </div>
                  <Toggle checked={security.twoFactor} onChange={(v) => setSecurity((s) => ({ ...s, twoFactor: v }))} />
                </div>
                <div className="py-4 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-800 mb-2">{t("admin.settings.sessionTimeout")}</p>
                  <select value={security.sessionTimeout} onChange={(e) => setSecurity((s) => ({ ...s, sessionTimeout: e.target.value }))} className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300">
                    <option value="15">15 phút</option>
                    <option value="30">30 phút</option>
                    <option value="60">1 giờ</option>
                    <option value="120">2 giờ</option>
                  </select>
                </div>
                <div className="py-4">
                  <p className="text-sm font-medium text-gray-800 mb-2">{t("admin.settings.changePassword")}</p>
                  <div className="space-y-3 max-w-sm">
                    {["Mật khẩu hiện tại", "Mật khẩu mới", "Xác nhận mật khẩu mới"].map((pl, i) => (
                      <input key={i} type="password" placeholder={pl} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "appearance" && (
            <div>
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900">{t("admin.settings.appearance")}</h3>
              </div>
              <div className="px-6 py-4">
                <p className="text-sm font-medium text-gray-800 mb-3">{t("admin.settings.theme")}</p>
                <div className="flex gap-3">
                  {[
                    { key: "light", label: t("admin.settings.lightMode"), preview: "bg-white border-2" },
                    { key: "dark", label: t("admin.settings.darkMode"), preview: "bg-gray-900 border-2" },
                  ].map((th) => (
                    <button
                      key={th.key}
                      onClick={() => setTheme(th.key)}
                      className={cn("flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-colors", theme === th.key ? "border-emerald-400" : "border-gray-200 hover:border-gray-300")}
                    >
                      <div className={cn("w-20 h-12 rounded-xl", th.preview, theme === th.key ? "border-emerald-400" : "border-gray-200")}>
                        <div className={cn("w-full h-3 rounded-t-xl", th.key === "light" ? "bg-gray-100" : "bg-gray-700")} />
                        <div className="flex gap-1 p-1 mt-1">
                          <div className={cn("w-5 h-6 rounded", th.key === "light" ? "bg-gray-200" : "bg-gray-600")} />
                          <div className={cn("flex-1 h-6 rounded", th.key === "light" ? "bg-gray-100" : "bg-gray-800")} />
                        </div>
                      </div>
                      <span className={cn("text-xs font-medium", theme === th.key ? "text-emerald-600" : "text-gray-500")}>{th.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Save button */}
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all",
                saved ? "bg-emerald-600" : "bg-emerald-500 hover:bg-emerald-600",
                saving && "opacity-70 cursor-not-allowed"
              )}
            >
              {saved ? <Check size={16} /> : <Save size={16} />}
              {saving ? t("admin.settings.saving") : saved ? t("admin.settings.saved") : t("admin.settings.saveChanges")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
