import { useLanguage } from "@/utils/LanguageContext";
import API_BASE from "@/utils/api";
import { ACCESS_TOKEN } from "@/utils/constant";
import countries from "@/data/countries.json";
import { AlertCircle, BadgeCheck, BedDouble, CalendarCheck, CheckCircle2, CreditCard, Home, Landmark, Loader2, MapPin, Phone, Tag, Users, Wallet } from "lucide-react";
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

const DEFAULT_COUNTRY_CODE = "VN";

const getCountryName = (country, lang) => (lang === "vn" ? country?.name_vi : country?.name) ?? country?.name ?? "";

const normalizePhoneNumber = (value) => String(value || "").replace(/\D/g, "");

const getPhoneParts = (value) => {
  const cleaned = String(value || "").replace(/[^\d+]/g, "");
  if (!cleaned) {
    return { countryCode: DEFAULT_COUNTRY_CODE, phone: "" };
  }

  const normalized = cleaned.startsWith("+") ? cleaned : `+${cleaned}`;

  const matchedCountry = [...countries]
    .sort((left, right) => right.dial_code.length - left.dial_code.length)
    .find((country) => normalized.startsWith(country.dial_code));

  if (!matchedCountry) {
    return { countryCode: DEFAULT_COUNTRY_CODE, phone: cleaned.replace(/^\+/, "") };
  }

  return {
    countryCode: matchedCountry.code,
    phone: normalized.slice(matchedCountry.dial_code.length),
  };
};

const BOOKING_STEPS = ["details", "payment", "confirmation"];

const PAYMENT_METHODS = [
  { key: "bank_transfer", icon: Landmark },
  { key: "credit_card", icon: CreditCard },
  { key: "pay_at_hotel", icon: Wallet },
];

const BookingPage = () => {
  const { t, lang } = useLanguage();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId") || searchParams.get("room");
  const roomTypeId = searchParams.get("roomTypeId");
  const branchId = searchParams.get("branchId");
  const userId = useMemo(() => getUserIdFromToken(), []);

  // Lấy ngày từ URL nếu có
  const initialCheckIn = searchParams.get("checkIn") || today();
  const initialCheckOut = searchParams.get("checkOut") || tomorrow();

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomLoading, setRoomLoading] = useState(true);
  const [roomError, setRoomError] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const [form, setForm] = useState({
    checkIn: initialCheckIn,
    checkOut: initialCheckOut,
    guests: 1,
    name: "",
    email: "",
    countryCode: DEFAULT_COUNTRY_CODE,
    phone: "",
    specialRequests: "",
  });
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successBooking, setSuccessBooking] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [payment, setPayment] = useState({
    method: "bank_transfer",
    cardHolder: "",
    cardNumber: "",
    expiryDate: "",
  });

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
        const phoneParts = profile.phone ? getPhoneParts(profile.phone) : null;
        setForm((prev) => ({
          ...prev,
          name: prev.name || profile.name || "",
          email: prev.email || profile.email || "",
          countryCode: prev.phone ? prev.countryCode : phoneParts?.countryCode || prev.countryCode,
          phone: prev.phone || phoneParts?.phone || "",
        }));
      } catch {
        // Silent fail: booking page can still work without prefill.
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  // Kiểm tra phòng trống khi chọn ngày
  useEffect(() => {
    const checkRoomAvailability = async () => {
      if (!selectedRoom || !form.checkIn || !form.checkOut || nights <= 0) {
        setAvailabilityError("");
        return;
      }

      setCheckingAvailability(true);
      setAvailabilityError("");

      try {
        const branchCode = selectedRoom.branch_code || branchId;
        if (!branchCode) {
          setCheckingAvailability(false);
          return;
        }

        const params = new URLSearchParams({
          branch_code: branchCode,
          from_date: form.checkIn,
          to_date: form.checkOut,
        });

        const res = await fetch(`${API_BASE}/user/rooms/available-rooms?${params}`);

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || t("booking.roomUnavailable"));
        }

        const availableRooms = await res.json();

        // Kiểm tra xem phòng hiện tại có trong danh sách phòng trống không
        const roomIdStr = String(selectedRoom.room_id);
        const branchRoomIdStr = String(selectedRoom.branch_room_id || "");
        const isCurrentRoomAvailable = availableRooms.some(
          (room) =>
            String(room.room_id) === roomIdStr ||
            (branchRoomIdStr && String(room.branch_room_id) === branchRoomIdStr),
        );

        if (!isCurrentRoomAvailable) {
          setAvailabilityError(t("booking.roomUnavailableForDates") || "Phòng này không có sẵn cho những ngày đã chọn. Vui lòng chọn ngày khác.");
        }
      } catch (error) {
        setAvailabilityError(error.message || t("booking.roomUnavailable"));
      } finally {
        setCheckingAvailability(false);
      }
    };

    checkRoomAvailability();
  }, [form.checkIn, form.checkOut, selectedRoom, branchId, t]);

  const nights = calcNights(form.checkIn, form.checkOut);
  const total = selectedRoom ? Number(selectedRoom.price || 0) * nights : 0;
  const isLoggedIn = Boolean(userId && getAccessToken());
  const guestLimitExceeded = selectedRoom ? Number(form.guests) > Number(selectedRoom.people_number || 1) : false;
  const selectedCountry = useMemo(
    () => countries.find((country) => country.code === form.countryCode) || countries.find((country) => country.code === DEFAULT_COUNTRY_CODE) || countries[0],
    [form.countryCode],
  );
  const dialDigits = normalizePhoneNumber(selectedCountry?.dial_code || "");
  const maxPhoneDigits = Math.max(1, 15 - dialDigits.length);
  const guestPhoneFull = `${selectedCountry?.dial_code || ""} ${normalizePhoneNumber(form.phone)}`.trim();
  const selectedPaymentMethod = PAYMENT_METHODS.find((method) => method.key === payment.method);

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

    if (name === "countryCode") {
      const nextCountry = countries.find((country) => country.code === value);
      const nextDialDigits = normalizePhoneNumber(nextCountry?.dial_code || "");
      const nextMaxPhoneDigits = Math.max(1, 15 - nextDialDigits.length);
      setForm((prev) => ({
        ...prev,
        countryCode: value,
        phone: normalizePhoneNumber(prev.phone).slice(0, nextMaxPhoneDigits),
      }));
      return;
    }

    if (name === "phone") {
      setForm((prev) => ({
        ...prev,
        phone: normalizePhoneNumber(value).slice(0, maxPhoneDigits),
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateBookingStep = () => {
    if (!selectedRoom?.room_id) {
      setSubmitError(t("booking.roomNotFound"));
      return false;
    }
    if (nights <= 0) {
      setSubmitError(t("booking.invalidDateRange"));
      return false;
    }
    if (guestLimitExceeded) {
      setSubmitError(t("booking.exceedCapacity"));
      return false;
    }
    if (!form.name.trim() || !form.email.trim()) {
      setSubmitError(t("booking.missingGuestInfo"));
      return false;
    }

    const localPhoneNumber = normalizePhoneNumber(form.phone);
    const customerPhoneNumber = `${dialDigits}${localPhoneNumber}`;
    if (!localPhoneNumber || customerPhoneNumber.length > 15) {
      setSubmitError(t("booking.invalidPhone"));
      return false;
    }

    setSubmitError("");
    return true;
  };

  const validatePaymentStep = () => {
    if (!payment.method) {
      setSubmitError(t("booking.invalidPaymentMethod"));
      return false;
    }

    if (payment.method === "credit_card") {
      if (!payment.cardHolder.trim() || !normalizePhoneNumber(payment.cardNumber) || !payment.expiryDate.trim()) {
        setSubmitError(t("booking.invalidPaymentMethod"));
        return false;
      }
    }

    setSubmitError("");
    return true;
  };

  const goToPaymentStep = () => {
    if (!validateBookingStep()) return;
    setCurrentStep(2);
  };

  const goToConfirmationStep = () => {
    if (!validatePaymentStep()) return;
    setCurrentStep(3);
  };

  const verifyRoomAvailabilityBeforeSubmit = async () => {
    /**
     * Kiểm tra lần nữa phòng còn trống không trước khi submit
     * Để tránh race condition khi 2 khách đặt cùng phòng
     */
    if (!selectedRoom || !form.checkIn || !form.checkOut) {
      return true;
    }

    try {
      const branchCode = selectedRoom.branch_code || branchId;
      if (!branchCode) return true;

      const params = new URLSearchParams({
        branch_code: branchCode,
        from_date: form.checkIn,
        to_date: form.checkOut,
      });

      const res = await fetch(`${API_BASE}/user/rooms/available-rooms?${params}`);

      if (!res.ok) {
        throw new Error("Failed to verify availability");
      }

      const availableRooms = await res.json();
      const roomIdStr = String(selectedRoom.room_id);
      const branchRoomIdStr = String(selectedRoom.branch_room_id || "");
      const isStillAvailable = availableRooms.some(
        (room) =>
          String(room.room_id) === roomIdStr ||
          (branchRoomIdStr && String(room.branch_room_id) === branchRoomIdStr),
      );

      if (!isStillAvailable) {
        setSubmitError(
          "Phòng này vừa được khách khác đặt. Vui lòng chọn phòng khác hoặc chọn ngày khác."
        );
        return false;
      }

      return true;
    } catch (error) {
      setSubmitError("Không thể xác nhận tính khả dụng của phòng. Vui lòng thử lại.");
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateBookingStep() || !validatePaymentStep()) return;

    setSubmitting(true);
    setSubmitError("");

    // Kiểm tra lần nữa phòng trống trước khi submit
    const isAvailable = await verifyRoomAvailabilityBeforeSubmit();
    if (!isAvailable) {
      setSubmitting(false);
      return;
    }

    try {
      const localPhoneNumber = normalizePhoneNumber(form.phone);
      const customerPhoneNumber = `${dialDigits}${localPhoneNumber}`;
      const res = await fetch(`${API_BASE}/bookings/user/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          branch_code: selectedRoom.branch_code || branchId || null,
          branch_room_id: selectedRoom.branch_room_id || null,
          room_id: selectedRoom.room_id,
          customer_name: form.name.trim(),
          customer_email: form.email.trim(),
          customer_phonenumber: customerPhoneNumber,
          note: form.specialRequests.trim() || null,
          from_date: form.checkIn,
          to_date: form.checkOut,
          total_price: total,
          voucher_code: payment.method === "bank_transfer" ? "BANKPAY" : null,
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
          <p className="text-sm text-slate-400 mb-2">{t("booking.successQueueNotice")}</p>
          <p className="text-sm text-slate-400 mb-8">
            {t("booking.bookingCode")}: <span className="font-semibold text-slate-700">{successBooking.booking_code || successBooking.booking_id}</span>
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
                <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="font-semibold text-sky-900">{t("booking.guestBookingTitle")}</p>
                    <p className="text-sm text-sky-700 mt-1">{t("booking.guestBookingHint")}</p>
                  </div>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 transition-colors"
                  >
                    {t("booking.loginNow")}
                  </Link>
                </div>
              )}

              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {BOOKING_STEPS.map((stepKey, index) => {
                    const stepNumber = index + 1;
                    const isActive = currentStep === stepNumber;
                    const isCompleted = currentStep > stepNumber;

                    return (
                      <div
                        key={stepKey}
                        className={`rounded-2xl border px-4 py-4 transition-all ${isActive ? "border-(--main) bg-emerald-50" : isCompleted ? "border-emerald-200 bg-emerald-50/60" : "border-gray-200 bg-white"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${isActive || isCompleted ? "bg-(--main) text-white" : "bg-slate-100 text-slate-500"}`}>
                            {stepNumber}
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{t("booking.stepLabel")}</p>
                            <p className="text-sm font-semibold text-slate-800">{t(`booking.steps.${stepKey}`)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {currentStep === 1 && (
                <>
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
                    )}                    {availabilityError && (
                      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                        <AlertCircle className="w-4 h-4 mt-0.5 text-red-600 shrink-0" />
                        <p className="text-sm text-red-600">{availabilityError}</p>
                      </div>
                    )}
                    {checkingAvailability && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t("booking.checkingAvailability") || "Kiểm tra phòng trống..."}
                      </div>
                    )}                    {guestLimitExceeded && (
                      <p className="mt-3 text-sm text-red-500">{t("booking.exceedCapacity")}</p>
                    )}
                  </div>

                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
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
                        <div className="grid grid-cols-1 sm:grid-cols-[220px_minmax(0,1fr)] gap-3">
                          <select
                            name="countryCode"
                            value={form.countryCode}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-(--main) focus:ring-2 focus:ring-(--main)/20"
                          >
                            {countries.map((country) => (
                              <option key={country.code} value={country.code}>
                                {country.flag} {getCountryName(country, lang)} ({country.dial_code})
                              </option>
                            ))}
                          </select>

                          <div className="flex items-center rounded-xl border border-gray-200 focus-within:border-(--main) focus-within:ring-2 focus-within:ring-(--main)/20 overflow-hidden bg-white">
                            <div className="shrink-0 px-4 py-2.5 bg-slate-50 border-r border-gray-200 text-sm font-semibold text-slate-600">
                              {selectedCountry?.dial_code}
                            </div>
                            <input
                              type="tel"
                              name="phone"
                              required
                              value={form.phone}
                              onChange={handleChange}
                              inputMode="numeric"
                              maxLength={maxPhoneDigits}
                              placeholder={t("booking.guestPhonePlaceholder")}
                              className="w-full px-4 py-2.5 text-sm focus:outline-none"
                            />
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          {t("booking.guestPhonePreview")}: <span className="font-semibold text-slate-700">{guestPhoneFull}</span>
                        </p>
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
                        type="button"
                        onClick={goToPaymentStep}
                        disabled={nights <= 0 || guestLimitExceeded || !selectedRoom.room_id || !!availabilityError || checkingAvailability}
                        className="w-full flex items-center justify-center gap-2 bg-(--main) hover:bg-[#52DBA9] disabled:opacity-60 text-white py-3.5 rounded-full font-semibold transition-all shadow-lg shadow-(--main)/20 active:scale-95"
                      >
                        {t("booking.continueToPayment")}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {currentStep === 2 && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-(--main)" />
                      {t("booking.paymentMethod")}
                    </h2>
                    <p className="text-sm text-slate-500">{t("booking.paymentHint")}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {PAYMENT_METHODS.map((method) => {
                      const Icon = method.icon;
                      const selected = payment.method === method.key;
                      return (
                        <button
                          key={method.key}
                          type="button"
                          onClick={() => setPayment((prev) => ({ ...prev, method: method.key }))}
                          className={`rounded-2xl border p-5 text-left transition-all ${selected ? "border-(--main) bg-emerald-50 shadow-sm" : "border-gray-200 hover:border-emerald-200 hover:bg-slate-50"}`}
                        >
                          <div className="w-11 h-11 rounded-2xl bg-white border border-gray-100 flex items-center justify-center mb-4">
                            <Icon className="w-5 h-5 text-(--main)" />
                          </div>
                          <p className="font-semibold text-slate-800 mb-1">{t(`booking.paymentMethods.${method.key}.label`)}</p>
                          <p className="text-sm text-slate-500">{t(`booking.paymentMethods.${method.key}.description`)}</p>
                        </button>
                      );
                    })}
                  </div>

                  {payment.method === "bank_transfer" && (
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 space-y-2">
                      <p className="font-semibold text-slate-800">{t("booking.bankTransferTitle")}</p>
                      <p className="text-sm text-slate-600">{t("booking.bankTransferBank")}: Aurora Hotel Bank</p>
                      <p className="text-sm text-slate-600">{t("booking.bankTransferAccount")}: 1900 2026 8888</p>
                      <p className="text-sm text-slate-600">{t("booking.bankTransferOwner")}: AURORA HOSPITALITY GROUP</p>
                      <p className="text-sm text-slate-500">{t("booking.bankTransferNote")}</p>
                    </div>
                  )}

                  {payment.method === "credit_card" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t("booking.cardHolder")}</label>
                        <input
                          type="text"
                          value={payment.cardHolder}
                          onChange={(e) => setPayment((prev) => ({ ...prev, cardHolder: e.target.value }))}
                          placeholder={t("booking.cardHolderPlaceholder")}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-(--main) focus:ring-2 focus:ring-(--main)/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t("booking.cardNumber")}</label>
                        <input
                          type="text"
                          value={payment.cardNumber}
                          onChange={(e) => setPayment((prev) => ({ ...prev, cardNumber: normalizePhoneNumber(e.target.value).slice(0, 16) }))}
                          placeholder={t("booking.cardNumberPlaceholder")}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-(--main) focus:ring-2 focus:ring-(--main)/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t("booking.expiryDate")}</label>
                        <input
                          type="text"
                          value={payment.expiryDate}
                          onChange={(e) => setPayment((prev) => ({ ...prev, expiryDate: e.target.value }))}
                          placeholder={t("booking.expiryDatePlaceholder")}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-(--main) focus:ring-2 focus:ring-(--main)/20"
                        />
                      </div>
                    </div>
                  )}

                  {payment.method === "pay_at_hotel" && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                      {t("booking.payAtHotelNote")}
                    </div>
                  )}

                  {submitError && (
                    <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" /> {submitError}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="sm:flex-1 border border-gray-200 text-slate-700 py-3.5 rounded-full font-semibold hover:bg-slate-50 transition-colors"
                    >
                      {t("booking.backToDetails")}
                    </button>
                    <button
                      type="button"
                      onClick={goToConfirmationStep}
                      className="sm:flex-1 bg-(--main) hover:bg-[#52DBA9] text-white py-3.5 rounded-full font-semibold transition-all shadow-lg shadow-(--main)/20"
                    >
                      {t("booking.continueToConfirmation")}
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <BadgeCheck className="w-5 h-5 text-(--main)" />
                      {t("booking.confirmationTitle")}
                    </h2>
                    <p className="text-sm text-slate-500">{t("booking.confirmationHint")}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="rounded-2xl border border-gray-100 bg-slate-50 p-5">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400 mb-3">{t("booking.reviewGuestInfo")}</p>
                      <div className="space-y-2 text-sm text-slate-600">
                        <p><span className="font-semibold text-slate-800">{t("booking.guestName")}: </span>{form.name}</p>
                        <p><span className="font-semibold text-slate-800">{t("booking.guestEmail")}: </span>{form.email}</p>
                        <p><span className="font-semibold text-slate-800">{t("booking.guestPhone")}: </span>{guestPhoneFull}</p>
                        {form.specialRequests && <p><span className="font-semibold text-slate-800">{t("booking.specialRequests")}: </span>{form.specialRequests}</p>}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-slate-50 p-5">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400 mb-3">{t("booking.reviewPayment")}</p>
                      <div className="space-y-2 text-sm text-slate-600">
                        <p><span className="font-semibold text-slate-800">{t("booking.paymentMethod")}: </span>{t(`booking.paymentMethods.${payment.method}.label`)}</p>
                        {payment.method === "credit_card" && (
                          <>
                            <p><span className="font-semibold text-slate-800">{t("booking.cardHolder")}: </span>{payment.cardHolder}</p>
                            <p><span className="font-semibold text-slate-800">{t("booking.cardNumber")}: </span>•••• •••• •••• {payment.cardNumber.slice(-4)}</p>
                          </>
                        )}
                        {payment.method === "bank_transfer" && <p>{t("booking.bankTransferSummary")}</p>}
                        {payment.method === "pay_at_hotel" && <p>{t("booking.payAtHotelSummary")}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm text-slate-700">
                    {t("booking.finalNotice")}
                  </div>

                  {submitError && (
                    <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" /> {submitError}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="sm:flex-1 border border-gray-200 text-slate-700 py-3.5 rounded-full font-semibold hover:bg-slate-50 transition-colors"
                    >
                      {t("booking.backToPayment")}
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="sm:flex-1 flex items-center justify-center gap-2 bg-(--main) hover:bg-[#52DBA9] disabled:opacity-60 text-white py-3.5 rounded-full font-semibold transition-all shadow-lg shadow-(--main)/20 active:scale-95"
                    >
                      {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      {submitting ? t("booking.processing") : t("booking.placeBooking")}
                    </button>
                  </div>
                </div>
              )}
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
                  <div className="mb-4 rounded-2xl bg-slate-50 px-4 py-3 border border-slate-100">
                    <p className="text-xs text-slate-400 mb-1">{t("booking.currentStep")}</p>
                    <p className="font-semibold text-slate-800">{t(`booking.steps.${BOOKING_STEPS[currentStep - 1]}`)}</p>
                    {selectedPaymentMethod && currentStep >= 2 && (
                      <p className="text-xs text-slate-500 mt-1">{t(`booking.paymentMethods.${selectedPaymentMethod.key}.label`)}</p>
                    )}
                  </div>
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
