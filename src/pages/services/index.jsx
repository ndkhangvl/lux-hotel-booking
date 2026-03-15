import { useLanguage } from "@/utils/LanguageContext";
import { Car, Check, Dumbbell, HeadphonesIcon, Sparkles, UtensilsCrossed, Waves, CalendarRange } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";

const SERVICE_KEYS = ["spa", "restaurant", "pool", "gym", "airport", "events"];

const SERVICE_ICONS = {
  spa: <Sparkles className="w-8 h-8" />,
  restaurant: <UtensilsCrossed className="w-8 h-8" />,
  pool: <Waves className="w-8 h-8" />,
  gym: <Dumbbell className="w-8 h-8" />,
  airport: <Car className="w-8 h-8" />,
  events: <CalendarRange className="w-8 h-8" />,
};

const SERVICE_IMAGES = {
  spa: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80",
  restaurant: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
  pool: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80",
  gym: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
  airport: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  events: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80",
};

const ServicesPage = () => {
  const { t } = useLanguage();
  const [activeKey, setActiveKey] = useState("spa");

  const activeService = {
    key: activeKey,
    highlights: t(`services.items.${activeKey}.highlights`),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-slate-900 py-16">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-3">{t("services.title")}</h1>
          <p className="text-slate-400 max-w-xl mx-auto">{t("services.subtitle")}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-14">
        {/* Service Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {SERVICE_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => setActiveKey(key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                activeKey === key
                  ? "bg-(--main) text-white shadow-lg shadow-(--main)/30"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-(--main) hover:text-(--main)"
              }`}
            >
              <span className="w-4 h-4">{React.cloneElement(SERVICE_ICONS[key], { className: "w-4 h-4" })}</span>
              {t(`services.items.${key}.name`)}
            </button>
          ))}
        </div>

        {/* Active Service Detail */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-md border border-gray-100 mb-14">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image */}
            <div className="h-80 lg:h-auto relative overflow-hidden">
              <img
                src={SERVICE_IMAGES[activeKey]}
                alt={t(`services.items.${activeKey}.name`)}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent lg:bg-none" />
            </div>

            {/* Content */}
            <div className="p-10 flex flex-col justify-center">
              <div className="w-14 h-14 bg-[#ECFDF5] rounded-2xl flex items-center justify-center text-(--main) mb-6">
                {SERVICE_ICONS[activeKey]}
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                {t(`services.items.${activeKey}.name`)}
              </h2>
              <p className="text-slate-500 leading-relaxed mb-8">
                {t(`services.items.${activeKey}.desc`)}
              </p>

              {/* Highlights */}
              <div className="mb-8">
                <p className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-4">
                  {t("services.highlight")}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Array.isArray(activeService.highlights) && activeService.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#ECFDF5] flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-(--main)" />
                      </div>
                      <span className="text-sm text-slate-700">{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                to="/booking"
                className="inline-flex items-center gap-2 bg-(--main) hover:bg-[#52DBA9] text-white px-7 py-3 rounded-full font-semibold transition-all w-fit shadow-lg shadow-(--main)/20"
              >
                {t("nav.bookNow")}
              </Link>
            </div>
          </div>
        </div>

        {/* All Services Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {SERVICE_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => setActiveKey(key)}
              className={`group p-5 rounded-2xl border text-center transition-all ${
                activeKey === key
                  ? "border-(--main) bg-(--main)/5"
                  : "border-gray-100 bg-white hover:border-(--main)/50 hover:shadow-md"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors ${
                activeKey === key ? "bg-(--main) text-white" : "bg-slate-50 text-slate-400 group-hover:bg-[#ECFDF5] group-hover:text-(--main)"
              }`}>
                {React.cloneElement(SERVICE_ICONS[key], { className: "w-5 h-5" })}
              </div>
              <p className={`text-xs font-semibold ${activeKey === key ? "text-(--main)" : "text-slate-600"}`}>
                {t(`services.items.${key}.name`)}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
