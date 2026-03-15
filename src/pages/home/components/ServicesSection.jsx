import { useLanguage } from "@/utils/LanguageContext";
import API_BASE from "@/utils/api";
import { ArrowRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const SERVICE_KEYS = ["spa", "restaurant", "pool", "gym", "airport", "concierge"];
const MOCK_SERVICE_ICON_URLS = [
  "https://cdn-icons-png.flaticon.com/512/2966/2966485.png",
  "https://cdn-icons-png.flaticon.com/512/3075/3075977.png",
  "https://cdn-icons-png.flaticon.com/512/2784/2784593.png",
  "https://cdn-icons-png.flaticon.com/512/2936/2936886.png",
  "https://cdn-icons-png.flaticon.com/512/744/744465.png",
  "https://cdn-icons-png.flaticon.com/512/4712/4712100.png",
];

const ServicesSection = () => {
  const { t } = useLanguage();
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const res = await fetch(`${API_BASE}/user/amenities`);
        if (!res.ok) throw new Error("Failed to fetch amenities");
        const data = await res.json();
        setAmenities(Array.isArray(data) ? data.slice(0, 6) : []);
      } catch {
        setAmenities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAmenities();
  }, []);

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
          {loading &&
            [0, 1, 2, 3, 4, 5].map((idx) => (
              <div
                key={idx}
                className="p-7 rounded-2xl border border-gray-100 bg-slate-100 animate-pulse h-44"
              />
            ))}

          {!loading &&
            amenities.map((amenity, idx) => {
              const fallbackKey = SERVICE_KEYS[idx % SERVICE_KEYS.length];
              const mockIconUrl = MOCK_SERVICE_ICON_URLS[idx % MOCK_SERVICE_ICON_URLS.length];
              return (
            <div
              key={amenity.amenity_id}
              className="group p-7 rounded-2xl border border-gray-100 hover:border-(--main)/30 hover:shadow-lg hover:shadow-(--main)/5 transition-all duration-300 bg-white"
            >
              <div className="w-12 h-12 bg-[#ECFDF5] rounded-xl flex items-center justify-center text-(--main) mb-5 group-hover:bg-(--main) group-hover:text-white transition-colors">
                <img
                  src={mockIconUrl}
                  alt={amenity.name}
                  className="w-6 h-6 object-contain"
                />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">
                {amenity.name}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {t(`home.services.items.${fallbackKey}.desc`)}
              </p>
            </div>
            );
          })}

          {!loading && amenities.length === 0 && (
            <div className="sm:col-span-2 lg:col-span-3 bg-slate-50 border border-gray-100 rounded-2xl p-6 text-center text-slate-500">
              {t("common.noData")}
            </div>
          )}
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
