import { useLanguage } from "@/utils/LanguageContext";
import { ArrowRight, BedDouble, Star, Users } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const MOCK_ROOMS = [
  {
    id: 1,
    name: "Phòng Deluxe View Vườn",
    nameEn: "Deluxe Garden View",
    type: "Deluxe",
    price: 1500000,
    people: 2,
    rating: 4.8,
    reviews: 124,
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80",
    amenities: ["WiFi", "Mini Bar", "Bồn tắm"],
    amenitiesEn: ["WiFi", "Mini Bar", "Bathtub"],
  },
  {
    id: 2,
    name: "Phòng Superior King",
    nameEn: "Superior King Room",
    type: "Superior",
    price: 2200000,
    people: 2,
    rating: 4.9,
    reviews: 87,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80",
    amenities: ["WiFi", "Bồn tắm Jacuzzi", "View thành phố"],
    amenitiesEn: ["WiFi", "Jacuzzi", "City View"],
  },
  {
    id: 3,
    name: "Suite Gia Đình",
    nameEn: "Family Suite",
    type: "Suite",
    price: 3800000,
    people: 4,
    rating: 4.9,
    reviews: 56,
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80",
    amenities: ["WiFi", "Phòng khách riêng", "Bếp nhỏ"],
    amenitiesEn: ["WiFi", "Living Room", "Kitchenette"],
  },
  {
    id: 4,
    name: "Phòng Penthouse Sky",
    nameEn: "Sky Penthouse",
    type: "Penthouse",
    price: 7500000,
    people: 4,
    rating: 5.0,
    reviews: 23,
    image: "https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?w=600&q=80",
    amenities: ["WiFi", "Hồ bơi riêng", "Bếp đầy đủ"],
    amenitiesEn: ["WiFi", "Private Pool", "Full Kitchen"],
  },
];

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

const FeaturedRooms = () => {
  const { t, lang } = useLanguage();

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
          {MOCK_ROOMS.map((room) => (
            <div
              key={room.id}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={room.image}
                  alt={lang === "vn" ? room.name : room.nameEn}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-(--main) text-white text-xs font-bold px-3 py-1 rounded-full">
                    {room.type}
                  </span>
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-semibold px-2 py-1 rounded-full">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {room.rating}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {lang === "vn" ? room.name : room.nameEn}
                  </h3>
                  <div className="flex items-center gap-1 mt-1 text-slate-400 text-xs">
                    <Users className="w-3 h-3" />
                    <span>{room.people} {t("home.featuredRooms.people")}</span>
                  </div>
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-1.5">
                  {(lang === "vn" ? room.amenities : room.amenitiesEn).map((a) => (
                    <span key={a} className="text-[11px] bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                      {a}
                    </span>
                  ))}
                </div>

                {/* Price + CTA */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div>
                    <span className="text-lg font-bold text-(--main)">{formatPrice(room.price)}</span>
                    <span className="text-slate-400 text-xs ml-1">{t("home.featuredRooms.perNight")}</span>
                  </div>
                  <Link
                    to={`/booking?room=${room.id}`}
                    className="bg-(--main) hover:bg-[#52DBA9] text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors"
                  >
                    {t("home.featuredRooms.bookNow")}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedRooms;
