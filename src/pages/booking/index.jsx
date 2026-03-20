import { useLanguage } from "@/utils/LanguageContext";
import API_BASE from "@/utils/api";
import { ACCESS_TOKEN } from "@/utils/constant";
import { AlertCircle, BedDouble, CalendarCheck, CheckCircle2, Home, Loader2, MapPin, Phone, Tag, Users } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

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

const getAccessToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN);
};

const getUserIdFromToken = () => {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;
    const payloadJson = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadJson);
    return payload.sub ?? null;
  } catch {
    return null;
  }
};

const normalizeAmenityList = (amenities) =>
  Array.isArray(amenities)
    ? amenities.map((amenity) => ({
        name: amenity?.name ?? "",
        icon_url: amenity?.icon_url ?? null,
      }))
    : [];

const BookingPage = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId") || searchParams.get("room");
  const roomTypeId = searchParams.get("roomTypeId");
  const branchId = searchParams.get("branchId");
  const userId = useMemo(() => getUserIdFromToken(), []);

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomLoading, setRoomLoading] = useState(true);
  const [roomError, setRoomError] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  const [form, setForm] = useState({
    checkIn: today(),
    checkOut: tomorrow(),
    guests: 1,
    name: "",
    email: "",
    phone: "",
    specialRequests: "",
  });
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successBooking, setSuccessBooking] = useState(null);

  useEffect(() => {
    const fetchRoom = async () => {
      setRoomLoading(true);
      setRoomError("");

      try {
        if (branchId) {
          const branchRes = await fetch(`${API_BASE}/user/branches/${branchId}`);
          if (!branchRes.ok) throw new Error(t("booking.roomFetchError"));
          const branch = await branchRes.json();
          const rooms = Array.isArray(branch.rooms) ? branch.rooms : [];

          let room = null;
          if (roomId) {
            room = rooms.find((item) => String(item.room_id) === String(roomId));
          } else if (roomTypeId) {
            room = rooms.find((item) => String(item.room_type_id) === String(roomTypeId));
          }

          if (!room) throw new Error(t("booking.roomNotFound"));

          setSelectedRoom({
            ...room,
            branch_name: branch.name,
            branch_address: branch.address,
            branch_phone: branch.phone,
            room_amenities: normalizeAmenityList(room.room_amenities),
          });
          setForm((prev) => ({
            ...prev,
            guests: Math.min(prev.guests, Number(room.people_number || 1)),
          }));
          return;
        }

        if (roomId) {
          const roomRes = await fetch(`${API_BASE}/user/rooms/${roomId}`);
          if (!roomRes.ok) throw new Error(t("booking.roomNotFound"));
          const room = await roomRes.json();
          setSelectedRoom({
            ...room,
            branch_name: "",
            branch_address: "",
            branch_phone: "",
            room_amenities: normalizeAmenityList(room.amenities),
          });
          setForm((prev) => ({
            ...prev,
            guests: Math.min(prev.guests, Number(room.people_number || 1)),
          }));
          return;
        }

        setSelectedRoom(null);
      } catch (error) {
        setSelectedRoom(null);
        setRoomError(error.message || t("booking.roomFetchError"));
      } finally {
        setRoomLoading(false);
      }
    };

    fetchRoom();
  }, [branchId, roomId, roomTypeId, t]);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = getAccessToken();
      if (!userId || !token) return;

      setProfileLoading(true);
      try {
        const res = await fetch(`${API_BASE}/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error();
        const profile = await res.json();
        setForm((prev) => ({
          ...prev,
          name: prev.name || profile.name || "",
          email: prev.email || profile.email || "",
          phone: prev.phone || profile.phone || "",
        }));
      } catch {
        // Silent fail: booking page can still work without prefill.
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const nights = calcNights(form.checkIn, form.checkOut);
  const total = selectedRoom ? Number(selectedRoom.price || 0) * nights : 0;
  const isLoggedIn = Boolean(userId && getAccessToken());
  const guestLimitExceeded = selectedRoom ? Number(form.guests) > Number(selectedRoom.people_number || 1) : false;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "guests") {
      const maxGuests = Number(selectedRoom?.people_number || 1);
      const numericValue = Number(value || 1);
      setForm((prev) => ({
        ...prev,
        guests: Math.max(1, Math.min(maxGuests, numericValue)),
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRoom?.room_id) {
      setSubmitError(t("booking.roomNotFound"));
      return;
    }
    if (!isLoggedIn) {
      setSubmitError(t("booking.loginRequired"));
      return;
    }
    if (nights <= 0) {
      setSubmitError(t("booking.invalidDateRange"));
      return;
    }
    if (guestLimitExceeded) {
      setSubmitError(t("booking.exceedCapacity"));
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch(`${API_BASE}/bookings/user/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          room_id: selectedRoom.room_id,
          from_date: form.checkIn,
          to_date: form.checkOut,
          voucher_code: null,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || t("booking.bookingFailed"));
      }

      const booking = await res.json();
      setSuccessBooking(booking);
    } catch (error) {
      setSubmitError(error.message || t("booking.bookingFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  if (successBooking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-12 text-center max-w-lg w-full">
          <div className="w-20 h-20 bg-[#ECFDF5] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-(--main)" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">{t("booking.successTitle")}</h2>
          <p className="text-slate-500 mb-2">{t("booking.successDesc")}</p>
          <p className="text-sm text-slate-400 mb-8">
            {t("booking.bookingCode")}: <span className="font-semibold text-slate-700">{successBooking.booking_id}</span>
          </p>
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
      <div className="bg-slate-900 py-16">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-3">{t("booking.title")}</h1>
          <p className="text-slate-400 max-w-xl mx-auto">{t("booking.subtitle")}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-12">
        {roomLoading ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 flex flex-col items-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-(--main)" />
            <p>{t("common.loading")}</p>
          </div>
        ) : !selectedRoom ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <BedDouble className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-600 mb-3">{roomError || t("booking.noRoom")}</p>
            <Link
              to="/branches"
              className="inline-flex items-center gap-2 bg-(--main) hover:bg-[#52DBA9] text-white px-7 py-3 rounded-full font-semibold transition-all"
            >
              {t("booking.browseRooms")}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {!isLoggedIn && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="font-semibold text-amber-900">{t("booking.loginRequired")}</p>
                    <p className="text-sm text-amber-700 mt-1">{t("booking.loginHint")}</p>
                  </div>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
                  >
                    {t("booking.loginNow")}
                  </Link>
                </div>
              )}

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
                      max={selectedRoom.people_number || 1}
                      value={form.guests}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-(--main) focus:ring-2 focus:ring-(--main)/20"
                    />
                  </div>
                </div>
                {nights <= 0 && (
                  <p className="mt-3 text-sm text-red-500">{t("booking.invalidDateRange")}</p>
                )}
                {guestLimitExceeded && (
                  <p className="mt-3 text-sm text-red-500">{t("booking.exceedCapacity")}</p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Users className="w-5 h-5 text-(--main)" />
                  {t("booking.guestInfo")}
                </h2>
                {profileLoading && (
                  <div className="mb-4 flex items-center gap-2 text-sm text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin" /> {t("booking.prefillLoading")}
                  </div>
                )}
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

                  {submitError && (
                    <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" /> {submitError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || nights <= 0 || guestLimitExceeded || !selectedRoom.room_id || !isLoggedIn}
                    className="w-full flex items-center justify-center gap-2 bg-(--main) hover:bg-[#52DBA9] disabled:opacity-60 text-white py-3.5 rounded-full font-semibold transition-all shadow-lg shadow-(--main)/20 active:scale-95"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {submitting ? t("booking.processing") : t("booking.confirm")}
                  </button>
                </div>
              </form>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-7 sticky top-24">
                <h2 className="text-lg font-bold text-slate-900 mb-5">{t("booking.summary")}</h2>

                <img
                  src={MOCK_ROOM_IMAGES[0]}
                  alt={selectedRoom.room_type_name}
                  className="w-full h-36 object-cover rounded-2xl mb-5"
                />

                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">{t("booking.selectedRoom")}</p>
                    <p className="font-semibold text-slate-900">{selectedRoom.room_type_name}</p>
                  </div>

                  {selectedRoom.branch_name && (
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 mt-0.5 text-(--main)" />
                      <div>
                        <p className="font-semibold text-slate-800">{selectedRoom.branch_name}</p>
                        {selectedRoom.branch_address && <p className="text-slate-500">{selectedRoom.branch_address}</p>}
                      </div>
                    </div>
                  )}

                  {selectedRoom.branch_phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-4 h-4 text-(--main)" />
                      <span>{selectedRoom.branch_phone}</span>
                    </div>
                  )}

                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
                    <Users className="w-4 h-4 text-(--main)" />
                    <span>{selectedRoom.people_number} {t("common.people")}</span>
                  </div>

                  {selectedRoom.room_amenities?.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-400 mb-2">{t("booking.amenities")}</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedRoom.room_amenities.map((amenity) => (
                          <span
                            key={`${selectedRoom.room_id}-${amenity.name}`}
                            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100"
                          >
                            {amenity.icon_url ? (
                              <img src={amenity.icon_url} alt={amenity.name} className="w-3.5 h-3.5 object-contain" />
                            ) : (
                              <Tag className="w-3 h-3" />
                            )}
                            {amenity.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 border-t border-gray-100 pt-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t("booking.roomPrice")}</span>
                      <span className="font-semibold text-slate-800">{formatPrice(selectedRoom.price)} <span className="text-slate-400 text-xs">{t("booking.perNight")}</span></span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t("booking.checkIn")}</span>
                      <span className="font-semibold text-slate-800">{form.checkIn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t("booking.checkOut")}</span>
                      <span className="font-semibold text-slate-800">{form.checkOut}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t("booking.guests")}</span>
                      <span className="font-semibold text-slate-800">{form.guests}</span>
                    </div>
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
