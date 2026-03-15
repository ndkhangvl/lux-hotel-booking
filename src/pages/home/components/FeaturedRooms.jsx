import { useLanguage } from "@/utils/LanguageContext";
import API_BASE from "@/utils/api";
import { ArrowRight, Star, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const MOCK_ROOM_IMAGES = [
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80",
  "https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?w=600&q=80",
];

const MOCK_ROOM_META = [
  { people: 2, rating: 4.8, amenities: ["WiFi", "Mini Bar", "Bathtub"] },
  { people: 2, rating: 4.9, amenities: ["WiFi", "Jacuzzi", "City View"] },
  { people: 4, rating: 4.9, amenities: ["WiFi", "Living Room", "Kitchenette"] },
  { people: 4, rating: 5.0, amenities: ["WiFi", "Private Pool", "Full Kitchen"] },
];

const FeaturedRooms = () => {
  const { t } = useLanguage();
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const res = await fetch(`${API_BASE}/user/room-types?limit=4`);
        if (!res.ok) throw new Error("Failed to fetch room types");
        const data = await res.json();
        setRoomTypes(Array.isArray(data) ? data.slice(0, 4) : []);
      } catch {
        setRoomTypes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomTypes();
  }, []);

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-sm font-bold text-(--main) uppercase tracking-widest mb-2">
              AuroraHotel
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              {t("home.featuredRooms.title")}
            </h2>
            <p className="mt-3 text-slate-500 max-w-xl">
              {t("home.featuredRooms.subtitle")}
            </p>
          </div>
          <Link
            to="/rooms"
            className="flex items-center gap-2 text-(--main) font-semibold text-sm hover:gap-3 transition-all shrink-0"
          >
            {t("home.featuredRooms.viewAll")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading &&
            [0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="bg-slate-100 rounded-2xl h-80 animate-pulse"
              />
            ))}

          {!loading &&
            roomTypes.map((roomType, idx) => {
            const meta = MOCK_ROOM_META[idx % MOCK_ROOM_META.length];
            return (
            <div
              key={roomType.room_type_id}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={MOCK_ROOM_IMAGES[idx % MOCK_ROOM_IMAGES.length]}
                  alt={roomType.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-(--main) text-white text-xs font-bold px-3 py-1 rounded-full">
                    {roomType.name}
                  </span>
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-semibold px-2 py-1 rounded-full">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {meta.rating.toFixed(1)}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {roomType.name}
                  </h3>
                  <p className="text-slate-500 text-xs mt-1 line-clamp-2">
                    {roomType.description || "Room type at AuroraHotel"}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-slate-400 text-xs">
                    <Users className="w-3 h-3" />
                    <span>{meta.people} {t("home.featuredRooms.people")}</span>
                  </div>
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-1.5">
                  {meta.amenities.map((a) => (
                    <span key={a} className="text-[11px] bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                      {a}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-sm font-medium text-slate-500">{t("home.featuredRooms.available")}</span>
                  <Link
                    to="/rooms"
                    className="bg-(--main) hover:bg-[#52DBA9] text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors"
                  >
                    {t("home.featuredRooms.bookNow")}
                  </Link>
                </div>
              </div>
            </div>
          );
          })}

          {!loading && roomTypes.length === 0 && (
            <div className="sm:col-span-2 lg:col-span-4 bg-slate-50 border border-gray-100 rounded-2xl p-6 text-center text-slate-500">
              {t("common.noData")}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedRooms;
