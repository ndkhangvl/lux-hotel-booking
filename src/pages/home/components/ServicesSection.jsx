import { useLanguage } from "@/utils/LanguageContext";
import { ArrowRight, Car, Dumbbell, Sparkles, UtensilsCrossed, Waves, HeadphonesIcon } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const SERVICE_ICONS = {
  spa: <Sparkles className="w-6 h-6" />,
  restaurant: <UtensilsCrossed className="w-6 h-6" />,
  pool: <Waves className="w-6 h-6" />,
  gym: <Dumbbell className="w-6 h-6" />,
  airport: <Car className="w-6 h-6" />,
  concierge: <HeadphonesIcon className="w-6 h-6" />,
};

const SERVICE_KEYS = ["spa", "restaurant", "pool", "gym", "airport", "concierge"];

const ServicesSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-bold text-(--main) uppercase tracking-widest mb-2">
            5★
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            {t("home.services.title")}
          </h2>
          <p className="mt-3 text-slate-500">
            {t("home.services.subtitle")}
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {SERVICE_KEYS.map((key) => (
            <div
              key={key}
              className="group p-7 rounded-2xl border border-gray-100 hover:border-(--main)/30 hover:shadow-lg hover:shadow-(--main)/5 transition-all duration-300 bg-white"
            >
              <div className="w-12 h-12 bg-[#ECFDF5] rounded-xl flex items-center justify-center text-(--main) mb-5 group-hover:bg-(--main) group-hover:text-white transition-colors">
                {SERVICE_ICONS[key]}
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">
                {t(`home.services.items.${key}.name`)}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {t(`home.services.items.${key}.desc`)}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 bg-(--main) hover:bg-[#52DBA9] text-white px-8 py-3.5 rounded-full font-semibold transition-all shadow-lg shadow-(--main)/20 active:scale-95"
          >
            {t("home.services.viewAll")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
