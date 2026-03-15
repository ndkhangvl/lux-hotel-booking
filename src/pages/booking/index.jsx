import { useLanguage } from "@/utils/LanguageContext";
import { BedDouble, CalendarCheck, CheckCircle2, Home, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const MOCK_ROOMS = {
  1: { nameVn: "Phòng Standard View Vườn", nameEn: "Standard Garden View", type: "Standard", branch: "AuroraHotel Cần Thơ", price: 900000, people: 2 },
  2: { nameVn: "Phòng Deluxe View Thành Phố", nameEn: "Deluxe City View", type: "Deluxe", branch: "AuroraHotel Cần Thơ", price: 1500000, people: 2 },
  3: { nameVn: "Phòng Superior King Bed", nameEn: "Superior King Bed", type: "Superior", branch: "AuroraHotel Hồ Chí Minh", price: 2200000, people: 2 },
  4: { nameVn: "Suite Gia Đình", nameEn: "Family Suite", type: "Suite", branch: "AuroraHotel Hồ Chí Minh", price: 3800000, people: 4 },
  5: { nameVn: "Phòng Deluxe Đà Lạt", nameEn: "Deluxe Da Lat", type: "Deluxe", branch: "AuroraHotel Đà Lạt", price: 1800000, people: 2 },
  6: { nameVn: "Penthouse Sky View", nameEn: "Sky View Penthouse", type: "Penthouse", branch: "AuroraHotel Hồ Chí Minh", price: 7500000, people: 6 },
};

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

const today = () => new Date().toISOString().split("T")[0];
const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};

const calcNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const diff = new Date(checkOut) - new Date(checkIn);
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
};

const BookingPage = () => {
  const { t, lang } = useLanguage();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("room");
  const room = roomId ? MOCK_ROOMS[parseInt(roomId)] : null;

  const [form, setForm] = useState({
    checkIn: today(),
    checkOut: tomorrow(),
    guests: 1,
    name: "",
    email: "",
    phone: "",
    specialRequests: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const nights = calcNights(form.checkIn, form.checkOut);
  const total = room ? room.price * nights : 0;

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 2000));
    setSubmitting(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-12 text-center max-w-lg w-full">
          <div className="w-20 h-20 bg-[#ECFDF5] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-(--main)" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">{t("booking.successTitle")}</h2>
          <p className="text-slate-500 mb-8">{t("booking.successDesc")}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-(--main) hover:bg-[#52DBA9] text-white px-8 py-3 rounded-full font-semibold transition-all shadow-lg shadow-(--main)/20"
          >
            <Home className="w-4 h-4" /> {t("booking.backHome")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-slate-900 py-16">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-3">{t("booking.title")}</h1>
          <p className="text-slate-400 max-w-xl mx-auto">{t("booking.subtitle")}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-12">
        {!room ? (
          <div className="text-center py-20">
            <BedDouble className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-600 mb-6">{t("booking.noRoom")}</p>
            <Link
              to="/rooms"
              className="inline-flex items-center gap-2 bg-(--main) hover:bg-[#52DBA9] text-white px-7 py-3 rounded-full font-semibold transition-all"
            >
              {t("booking.browseRooms")}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stay Info */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-(--main)" />
                  {t("booking.stayInfo")}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t("booking.checkIn")}</label>
                    <input
                      type="date"
                      name="checkIn"
                      min={today()}
                      value={form.checkIn}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-(--main) focus:ring-2 focus:ring-(--main)/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t("booking.checkOut")}</label>
                    <input
                      type="date"
                      name="checkOut"
                      min={form.checkIn || today()}
                      value={form.checkOut}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-(--main) focus:ring-2 focus:ring-(--main)/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {t("booking.guests")}
                    </label>
                    <input
                      type="number"
                      name="guests"
                      min={1}
                      max={room.people}
                      value={form.guests}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-(--main) focus:ring-2 focus:ring-(--main)/20"
                    />
                  </div>
                </div>
              </div>

              {/* Guest Info */}
              <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Users className="w-5 h-5 text-(--main)" />
                  {t("booking.guestInfo")}
                </h2>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t("booking.guestName")}</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder={t("booking.guestNamePlaceholder")}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-(--main) focus:ring-2 focus:ring-(--main)/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t("booking.guestEmail")}</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder={t("booking.guestEmailPlaceholder")}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-(--main) focus:ring-2 focus:ring-(--main)/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t("booking.guestPhone")}</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={form.phone}
                      onChange={handleChange}
                      placeholder={t("booking.guestPhonePlaceholder")}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-(--main) focus:ring-2 focus:ring-(--main)/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t("booking.specialRequests")}</label>
                    <textarea
                      name="specialRequests"
                      rows={3}
                      value={form.specialRequests}
                      onChange={handleChange}
                      placeholder={t("booking.specialRequestsPlaceholder")}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-(--main) focus:ring-2 focus:ring-(--main)/20 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || nights === 0}
                    className="w-full flex items-center justify-center gap-2 bg-(--main) hover:bg-[#52DBA9] disabled:opacity-60 text-white py-3.5 rounded-full font-semibold transition-all shadow-lg shadow-(--main)/20 active:scale-95"
                  >
                    {submitting && <span className="animate-spin border-2 border-white/30 border-t-white w-4 h-4 rounded-full" />}
                    {submitting ? t("booking.processing") : t("booking.confirm")}
                  </button>
                </div>
              </form>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-7 sticky top-24">
                <h2 className="text-lg font-bold text-slate-900 mb-5">{t("booking.summary")}</h2>

                {/* Room Image placeholder */}
                <div className="w-full h-36 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl mb-5 flex items-center justify-center">
                  <BedDouble className="w-10 h-10 text-slate-400" />
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">{t("booking.roomType")}</span>
                    <span className="font-semibold text-slate-800">{room.type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">{t("booking.branch")}</span>
                    <span className="font-semibold text-slate-800 text-right max-w-[60%]">{room.branch}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">{t("booking.roomPrice")}</span>
                    <span className="font-semibold text-slate-800">{formatPrice(room.price)}<span className="text-slate-400 text-xs ml-1">{t("booking.perNight")}</span></span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">{t("booking.checkIn")}</span>
                    <span className="font-semibold text-slate-800">{form.checkIn}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">{t("booking.checkOut")}</span>
                    <span className="font-semibold text-slate-800">{form.checkOut}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">{t("booking.guests")}</span>
                    <span className="font-semibold text-slate-800">{form.guests}</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-slate-500">{t("booking.totalPrice")}</p>
                      <p className="text-xs text-slate-400">{nights} {t("booking.nights")}</p>
                    </div>
                    <p className="text-2xl font-bold text-(--main)">{formatPrice(total)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
