import { useLanguage } from "@/utils/LanguageContext";
import API_BASE from "@/utils/api";
import { BedDouble, ChevronLeft, MapPin, Phone, Tag, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const MOCK_ROOM_IMAGES = [
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900&q=80",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&q=80",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900&q=80",
  "https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?w=900&q=80",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&q=80",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&q=80",
];

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price || 0);

const BranchDetailPage = () => {
  const { t } = useLanguage();
  const { branchId } = useParams();
  const [branch, setBranch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/user/branches/${branchId}`);
        if (!res.ok) throw new Error("Failed to fetch branch detail");
        const data = await res.json();
        setBranch(data);
      } catch {
        setBranch(null);
      } finally {
        setLoading(false);
      }
    };

    if (branchId) fetchDetail();
  }, [branchId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-slate-900 py-16" />
        <div className="container mx-auto px-4 lg:px-8 py-10">
          <div className="h-10 w-64 bg-slate-200 rounded animate-pulse mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-80 bg-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-slate-500 max-w-lg w-full">
          {t("common.noData")}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-slate-900 py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <Link to="/branches" className="inline-flex items-center gap-1 text-slate-300 hover:text-white mb-6 text-sm font-semibold">
            <ChevronLeft className="w-4 h-4" /> {t("home.branches.viewAll")}
          </Link>
          <h1 className="text-4xl font-bold text-white mb-3">{branch.name}</h1>
          <div className="flex flex-wrap items-center gap-5 text-slate-300 text-sm">
            <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {branch.address}</span>
            {branch.phone && <span className="inline-flex items-center gap-1.5"><Phone className="w-4 h-4" /> {branch.phone}</span>}
            <span className="inline-flex items-center gap-1.5"><BedDouble className="w-4 h-4" /> {branch.total_rooms || 0} {t("home.branches.rooms")}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">{t("rooms.allTypes")}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {(branch.rooms || []).map((room, idx) => (
            <div key={room.room_id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="relative h-52 overflow-hidden">
                <img
                  src={MOCK_ROOM_IMAGES[idx % MOCK_ROOM_IMAGES.length]}
                  alt={room.room_type_name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span className="absolute top-3 left-3 bg-(--main) text-white text-xs font-bold px-3 py-1 rounded-full">
                  {room.room_type_name}
                </span>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold text-slate-900 mb-1">{room.room_type_name}</h3>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{room.description || "Room at AuroraHotel"}</p>

                <div className="space-y-3 mb-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
                    <Users className="w-4 h-4 text-(--main)" />
                    <span>{room.people_number || 0} {t("common.people")}</span>
                  </div>

                  {room.room_amenities?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {room.room_amenities.map((amenity) => (
                        <span
                          key={`${room.room_id}-${amenity.name}`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100"
                        >
                          {amenity.icon_url ? (
                            <img
                              src={amenity.icon_url}
                              alt={amenity.name}
                              className="w-3.5 h-3.5 object-contain"
                            />
                          ) : (
                            <Tag className="w-3 h-3" />
                          )}
                          {amenity.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">{t("booking.roomPrice")}</p>
                    <p className="text-xl font-bold text-(--main)">{formatPrice(room.price)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/rooms/${room.room_id}`}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-full transition-colors"
                    >
                      {"Chi tiết"}
                    </Link>
                    <Link
                      to={`/booking?branchId=${branch.branch_code}&roomId=${room.room_id}`}
                      className="bg-(--main) hover:bg-[#52DBA9] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
                    >
                      {t("rooms.bookNow")}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {(branch.rooms || []).length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-slate-500 mt-2">
            {t("common.noData")}
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchDetailPage;
