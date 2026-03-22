import { useLanguage } from "@/utils/LanguageContext";
import { BedDouble, Filter, Search, SlidersHorizontal, Star, Users, X } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";

const ROOM_TYPES = ["Deluxe", "Superior", "Suite", "Penthouse", "Standard"];
const BRANCHES = ["AuroraHotel Cần Thơ", "AuroraHotel Hồ Chí Minh", "AuroraHotel Đà Lạt"];

const MOCK_ROOMS = [
  {
    id: 1,
    nameVn: "Phòng Standard View Vườn",
    nameEn: "Standard Garden View",
    type: "Standard",
    branch: "AuroraHotel Cần Thơ",
    price: 900000,
    people: 2,
    rating: 4.6,
    status: 0,
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80",
    amenitiesVn: ["WiFi", "Điều hòa", "TV màn hình phẳng"],
    amenitiesEn: ["WiFi", "Air Conditioning", "Flat Screen TV"],
  },
  {
    id: 2,
    nameVn: "Phòng Deluxe View Thành Phố",
    nameEn: "Deluxe City View",
    type: "Deluxe",
    branch: "AuroraHotel Cần Thơ",
    price: 1500000,
    people: 2,
    rating: 4.8,
    status: 0,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80",
    amenitiesVn: ["WiFi", "Mini Bar", "Bồn tắm"],
    amenitiesEn: ["WiFi", "Mini Bar", "Bathtub"],
  },
  {
    id: 3,
    nameVn: "Phòng Superior King Bed",
    nameEn: "Superior King Bed",
    type: "Superior",
    branch: "AuroraHotel Hồ Chí Minh",
    price: 2200000,
    people: 2,
    rating: 4.9,
    status: 0,
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80",
    amenitiesVn: ["WiFi", "Jacuzzi", "View thành phố", "Dịch vụ phòng 24h"],
    amenitiesEn: ["WiFi", "Jacuzzi", "City View", "24h Room Service"],
  },
  {
    id: 4,
    nameVn: "Suite Gia Đình",
    nameEn: "Family Suite",
    type: "Suite",
    branch: "AuroraHotel Hồ Chí Minh",
    price: 3800000,
    people: 4,
    rating: 4.9,
    status: 0,
    image: "https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?w=600&q=80",
    amenitiesVn: ["WiFi", "Phòng khách", "Bếp nhỏ", "2 Phòng ngủ"],
    amenitiesEn: ["WiFi", "Living Room", "Kitchenette", "2 Bedrooms"],
  },
  {
    id: 5,
    nameVn: "Phòng Deluxe Đà Lạt",
    nameEn: "Deluxe Da Lat",
    type: "Deluxe",
    branch: "AuroraHotel Đà Lạt",
    price: 1800000,
    people: 2,
    rating: 4.7,
    status: 0,
    image: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=600&q=80",
    amenitiesVn: ["WiFi", "View núi", "Lò sưởi", "Bồn tắm"],
    amenitiesEn: ["WiFi", "Mountain View", "Fireplace", "Bathtub"],
  },
  {
    id: 6,
    nameVn: "Penthouse Sky View",
    nameEn: "Sky View Penthouse",
    type: "Penthouse",
    branch: "AuroraHotel Hồ Chí Minh",
    price: 7500000,
    people: 6,
    rating: 5.0,
    status: 0,
    image: "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=600&q=80",
    amenitiesVn: ["WiFi", "Hồ bơi riêng", "Bếp đầy đủ", "Sân thượng"],
    amenitiesEn: ["WiFi", "Private Pool", "Full Kitchen", "Rooftop"],
  },
];

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

const RoomsPage = () => {
  const { t, lang } = useLanguage();
  const [search, setSearch] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = MOCK_ROOMS.filter((r) => {
    const name = lang === "vn" ? r.nameVn : r.nameEn;
    const matchSearch = search === "" || name.toLowerCase().includes(search.toLowerCase()) || r.type.toLowerCase().includes(search.toLowerCase());
    const matchBranch = selectedBranch === "" || r.branch === selectedBranch;
    const matchType = selectedType === "" || r.type === selectedType;
    return matchSearch && matchBranch && matchType;
  });

  const resetFilters = () => {
    setSearch("");
    setSelectedBranch("");
    setSelectedType("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-slate-900 py-16">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-3">{t("rooms.title")}</h1>
          <p className="text-slate-400 max-w-xl mx-auto">{t("rooms.subtitle")}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-10">
        {/* Search + Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("rooms.searchPlaceholder")}
                className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-(--main) focus:ring-2 focus:ring-(--main)/20"
              />
            </div>

            {/* Branch Filter */}
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-(--main) bg-white min-w-[180px]"
            >
              <option value="">{t("rooms.allBranches")}</option>
              {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-(--main) bg-white min-w-[160px]"
            >
              <option value="">{t("rooms.allTypes")}</option>
              {ROOM_TYPES.map((tp) => <option key={tp} value={tp}>{tp}</option>)}
            </select>

            {/* Reset */}
            {(search || selectedBranch || selectedType) && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" /> {t("rooms.reset")}
              </button>
            )}
          </div>
        </div>

        {/* Count */}
        <p className="text-sm text-slate-500 mb-6">
          {t("rooms.found")} <span className="font-bold text-slate-800">{filtered.length}</span> {t("rooms.roomsCount")}
        </p>

        {/* Room Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <BedDouble className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{t("rooms.noRooms")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((room) => (
              <div
                key={room.id}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={room.image}
                    alt={lang === "vn" ? room.nameVn : room.nameEn}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-(--main) text-white text-xs font-bold px-3 py-1 rounded-full">
                      {room.type}
                    </span>
                    <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {t("rooms.available")}
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
                    <h3 className="font-bold text-slate-900 text-base">{lang === "vn" ? room.nameVn : room.nameEn}</h3>
                    <p className="text-slate-400 text-xs mt-0.5">{room.branch}</p>
                    <div className="flex items-center gap-1 mt-1 text-slate-400 text-xs">
                      <Users className="w-3 h-3" />
                      <span>{room.people} {t("rooms.people")}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {(lang === "vn" ? room.amenitiesVn : room.amenitiesEn).slice(0, 3).map((a) => (
                      <span key={a} className="text-[11px] bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                        {a}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div>
                      <span className="text-lg font-bold text-(--main)">{formatPrice(room.price)}</span>
                      <span className="text-slate-400 text-xs ml-1">{t("rooms.perNight")}</span>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/rooms/${room.id}`}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-full transition-colors"
                      >
                        {t("Chi tiết")}
                      </Link>
                      <Link
                        to={`/booking?room=${room.id}`}
                        className="bg-(--main) hover:bg-[#52DBA9] text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors"
                      >
                        {t("rooms.bookNow")}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomsPage;
