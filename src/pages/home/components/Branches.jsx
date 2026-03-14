import { useLanguage } from "@/utils/LanguageContext";
import { ArrowRight, BedDouble, MapPin } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const MOCK_BRANCHES = [
  {
    id: 1,
    name: "AuroraHotel Cần Thơ",
    city: "Cần Thơ",
    address: "69 Đường 3/2, Ninh Kiều, Cần Thơ",
    rooms: 48,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    tag: "Flagship",
  },
  {
    id: 2,
    name: "AuroraHotel Hồ Chí Minh",
    city: "Hồ Chí Minh",
    address: "15 Nguyễn Huệ, Quận 1, TP.HCM",
    rooms: 72,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80",
    tag: "New",
  },
  {
    id: 3,
    name: "AuroraHotel Đà Lạt",
    city: "Đà Lạt",
    address: "28 Trần Phú, Phường 4, Đà Lạt",
    rooms: 36,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80",
    tag: "Popular",
  },
];

const Branches = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-sm font-bold text-(--main) uppercase tracking-widest mb-2">
              Vietnam
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              {t("home.branches.title")}
            </h2>
            <p className="mt-3 text-slate-500 max-w-xl">
              {t("home.branches.subtitle")}
            </p>
          </div>
          <Link
            to="/contact"
            className="flex items-center gap-2 text-(--main) font-semibold text-sm hover:gap-3 transition-all shrink-0"
          >
            {t("home.branches.viewAll")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_BRANCHES.map((branch) => (
            <div
              key={branch.id}
              className="group relative rounded-2xl overflow-hidden h-80 cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <img
                src={branch.image}
                alt={branch.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Tag */}
              <div className="absolute top-4 left-4">
                <span className="bg-(--main) text-white text-xs font-bold px-3 py-1 rounded-full">
                  {branch.tag}
                </span>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="font-bold text-lg mb-1">{branch.name}</h3>
                <div className="flex items-center gap-1.5 text-white/70 text-sm mb-3">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{branch.address}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <BedDouble className="w-4 h-4 text-(--main)" />
                    <span className="text-white/80">{branch.rooms} {t("home.branches.rooms")}</span>
                  </div>
                  <Link
                    to="/rooms"
                    className="flex items-center gap-1 text-(--main) text-sm font-semibold hover:text-white transition-colors"
                  >
                    {t("home.branches.viewDetail")} <ArrowRight className="w-3.5 h-3.5" />
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

export default Branches;
