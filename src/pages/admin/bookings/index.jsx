import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  AlertCircle,
  CalendarCheck,
  ChevronDown,
  Clock,
  Loader2,
  LogIn,
  LogOut as LogOutIcon,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useLanguage } from "@/utils/LanguageContext";
import { cn } from "@/lib/utils";
import API_BASE from "@/utils/api";

const statusConfig = {
  pending: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  confirmed: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  checkedIn: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  checkedOut: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
  cancelled: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
};

const paymentConfig = {
  paid: { bg: "bg-emerald-100", text: "text-emerald-700" },
  unpaid: { bg: "bg-red-100", text: "text-red-600" },
  refunded: { bg: "bg-gray-100", text: "text-gray-600" },
};

const BOOKING_STATUS_OPTIONS = ["pending", "checkedIn", "checkedOut"];
const PAYMENT_STATUS_OPTIONS = ["unpaid", "paid"];

const EMPTY_FORM = {
  customer_name: "",
  customer_email: "",
  customer_phonenumber: "",
  branch_code: "",
  room_id: "",
  from_date: "",
  to_date: "",
  note: "",
  status: "pending",
  payment_status: "unpaid",
};

const normalizeStatus = (value) => {
  switch ((value || "").toLowerCase()) {
    case "confirmed":
      return "pending";
    case "checked-in":
      return "checkedIn";
    case "completed":
      return "checkedOut";
    case "cancelled":
      return "cancelled";
    default:
      return "pending";
  }
};

const denormalizeStatus = (value) => {
  switch (value) {
    case "checkedIn":
      return "Checked-in";
    case "checkedOut":
      return "Completed";
    default:
      return "Pending";
  }
};

const normalizePaymentStatus = (value) => {
  switch ((value || "").toLowerCase()) {
    case "paid":
      return "paid";
    case "refunded":
      return "refunded";
    default:
      return "unpaid";
  }
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN");
};

const formatCurrency = (value) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(value || 0));

const mapBooking = (booking) => ({
  bookingId: booking.booking_id,
  bookingCode: booking.booking_code || booking.booking_id,
  guest: booking.customer_name,
  email: booking.customer_email,
  phone: booking.customer_phonenumber,
  room: booking.room_number || "-",
  roomType: booking.room_type_name || "-",
  branch: booking.branch_name || "-",
  branchId: booking.branch_code || "",
  roomId: booking.room_id || "",
  checkIn: booking.from_date,
  checkOut: booking.to_date,
  amount: Number(booking.total_price || 0),
  paymentStatus: normalizePaymentStatus(booking.payment_status),
  status: normalizeStatus(booking.status),
  note: booking.note || "",
  createdAt: booking.created_date,
});

const getEditablePaymentStatus = (value) => (value === "paid" || value === "refunded" ? "paid" : "unpaid");

const AdminBookings = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // 500ms debounce
    return () => clearTimeout(timer);
  }, [search]);

  // 1. Bookings Query (Infinite)
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: bookingsLoading,
  } = useInfiniteQuery({
    queryKey: ["admin-bookings", debouncedSearch, statusFilter],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        page: pageParam,
        page_size: 100,
      });
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const res = await fetch(`${API_BASE}/Admin/bookings/?${params.toString()}`);
      if (!res.ok) throw new Error(t("booking.bookingFailed"));
      return res.json();
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) return lastPage.page + 1;
      return undefined;
    },
    initialPageParam: 1,
  });

  const bookings = useMemo(() => {
    return data?.pages.flatMap((page) => page.items.map(mapBooking)) || [];
  }, [data]);

  const totalBookings = data?.pages[0]?.total || 0;

  // 2. Branches Query
  const { data: branchesRaw } = useInfiniteQuery({
    queryKey: ["admin-branches"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/branches/branches-list?page=1&page_size=100`);
      return res.json();
    },
    initialPageParam: 1,
    getNextPageParam: () => undefined,
  });
  const branches = branchesRaw?.pages[0]?.items || [];

  // 3. Rooms Query
  const { data: roomsRaw } = useInfiniteQuery({
    queryKey: ["admin-rooms", form.branch_code],
    queryFn: async () => {
      if (!form.branch_code) return { items: [] };
      const res = await fetch(`${API_BASE}/admin/rooms/rooms-list?branch_code=${form.branch_code}&page=1&page_size=100`);
      return res.json();
    },
    enabled: modalOpen && !!form.branch_code && !editItem,
    initialPageParam: 1,
    getNextPageParam: () => undefined,
  });
  const rooms = (roomsRaw?.pages[0]?.items || []).filter(r => Number(r.del_flg) === 0);

  // Virtualization
  const parentRef = useRef();
  const rowVirtualizer = useVirtualizer({
    count: bookings.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 61,
    overscan: 10,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  // Infinite Scroll Trigger
  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1];
    if (lastItem && lastItem.index >= bookings.length - 1 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [virtualItems, bookings.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const today = new Date().toISOString().split("T")[0];
  const statCards = [
    { label: t("admin.bookings.totalBookings"), value: totalBookings, icon: CalendarCheck, bg: "bg-blue-50", text: "text-blue-600" },
    { label: t("admin.bookings.pendingBookings"), value: bookings.filter((b) => b.status === "pending").length, icon: Clock, bg: "bg-amber-50", text: "text-amber-600" },
    { label: t("admin.bookings.todayCheckIn"), value: bookings.filter((b) => b.checkIn === today).length, icon: LogIn, bg: "bg-emerald-50", text: "text-emerald-600" },
    { label: t("admin.bookings.todayCheckOut"), value: bookings.filter((b) => b.checkOut === today).length, icon: LogOutIcon, bg: "bg-violet-50", text: "text-violet-600" },
  ];

  const openAdd = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      customer_name: item.guest,
      customer_email: item.email,
      customer_phonenumber: item.phone,
      branch_code: item.branchId,
      room_id: item.roomId,
      from_date: item.checkIn,
      to_date: item.checkOut,
      note: item.note,
      status: item.status,
      payment_status: getEditablePaymentStatus(item.paymentStatus),
    });
    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditItem(null);
    setForm(EMPTY_FORM);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value, ...(field === "branch_code" ? { room_id: "" } : {}) }));
  };

  const handleSave = async () => {
    setSubmitting(true);
    setError("");
    try {
      const url = editItem ? `${API_BASE}/Admin/bookings/${editItem.bookingId}` : `${API_BASE}/Admin/bookings/`;
      const method = editItem ? "PATCH" : "POST";
      const body = editItem ? {
        customer_name: form.customer_name.trim(),
        customer_email: form.customer_email.trim(),
        customer_phonenumber: form.customer_phonenumber.trim(),
        note: form.note.trim() || null,
        from_date: form.from_date,
        to_date: form.to_date,
        status: denormalizeStatus(form.status),
        payment_status: form.payment_status,
      } : {
        user_id: null,
        branch_code: form.branch_code,
        room_id: form.room_id,
        customer_name: form.customer_name.trim(),
        customer_email: form.customer_email.trim(),
        customer_phonenumber: form.customer_phonenumber.trim(),
        note: form.note.trim() || null,
        from_date: form.from_date,
        to_date: form.to_date,
        status: denormalizeStatus(form.status),
        payment_status: form.payment_status,
        voucher_code: null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.detail || t("booking.bookingFailed"));
      }

      await queryClient.invalidateQueries(["admin-bookings"]);
      closeModal();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/Admin/bookings/${deleteTarget.bookingId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(t("common.delete"));
      await queryClient.invalidateQueries(["admin-bookings"]);
      setDeleteTarget(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const paymentOptions = editItem && ["paid", "refunded"].includes(editItem.paymentStatus) ? ["paid"] : PAYMENT_STATUS_OPTIONS;

  return (
    <div className="flex flex-col h-[calc(100vh-115px)] space-y-4 overflow-hidden p-0 max-h-[calc(100vh-115px)]">
      <style>{`
        .custom-active-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-active-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-active-scrollbar::-webkit-scrollbar-thumb {
          background: #10b981;
          border-radius: 10px;
        }
        .custom-active-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #059669;
        }
        /* Firefox */
        .custom-active-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #10b981 #f1f5f9;
        }
      `}</style>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t("admin.bookings.title")}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{t("admin.bookings.subtitle")}</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors">
          <Plus size={16} /> {t("admin.bookings.addBooking")}
        </button>
      </div>

      {error && !modalOpen && !deleteTarget && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 shrink-0">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 shrink-0">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bg)}>
              <stat.icon size={18} className={stat.text} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Area */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="flex flex-col sm:flex-row items-center gap-3 px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("admin.bookings.searchPlaceholder")} className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 transition" />
          </div>
          <div className="relative">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white text-gray-700 cursor-pointer">
              <option value="all">{t("common.all")}</option>
              {Object.keys(statusConfig).map((status) => (<option key={status} value={status}>{t(`admin.bookings.statuses.${status}`)}</option>))}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="overflow-auto relative flex-1 custom-active-scrollbar" ref={parentRef}>
          <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: "100%", position: "relative", minWidth: "1500px" }}>
            <table className="w-full text-left border-collapse sticky top-0 bg-white z-20 shadow-sm table-fixed">
              <thead>
                <tr className="bg-gray-50/50 uppercase text-xs font-semibold text-gray-400 tracking-wider">
                  <th className="px-4 py-3 w-[100px]">{t("common.action")}</th>
                  <th className="px-4 py-3 w-[160px]">{t("admin.bookings.bookingId")}</th>
                  <th className="px-4 py-3 w-[250px]">{t("admin.bookings.guestName")}</th>
                  <th className="px-4 py-3 w-[200px]">{t("admin.bookings.roomType")}</th>
                  <th className="px-4 py-3 w-[180px]">{t("admin.bookings.branch")}</th>
                  <th className="px-4 py-3 w-[140px]">{t("admin.bookings.checkIn")}</th>
                  <th className="px-4 py-3 w-[140px]">{t("admin.bookings.checkOut")}</th>
                  <th className="px-4 py-3 w-[150px]">{t("admin.bookings.totalAmount")}</th>
                  <th className="px-4 py-3 w-[150px]">{t("admin.bookings.paymentStatus")}</th>
                  <th className="px-4 py-3 w-[160px]">{t("admin.bookings.bookingStatus")}</th>
                </tr>
              </thead>
            </table>
            
            <div className="relative">
              {virtualItems.map((virtualRow) => {
                const booking = bookings[virtualRow.index];
                const statusStyle = statusConfig[booking.status] || statusConfig.pending;
                const paymentStyle = paymentConfig[booking.paymentStatus] || paymentConfig.unpaid;
                return (
                  <div
                    key={booking.bookingId}
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: `${virtualRow.size}px`, transform: `translateY(${virtualRow.start}px)` }}
                    className="flex items-center border-b border-gray-50 hover:bg-gray-50/60 transition-colors px-0 cursor-default"
                  >
                    <div className="w-full flex items-center">
                      <div className="px-4 py-2 w-[100px] flex items-center gap-1.5 shrink-0">
                        <button onClick={() => openEdit(booking)} title="Edit" className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"><Pencil size={13} /></button>
                        <button onClick={() => setDeleteTarget(booking)} title="Delete" className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 size={13} /></button>
                      </div>
                      <div className="px-4 py-2 w-[160px] text-sm font-mono font-bold text-gray-800 truncate shrink-0" title={booking.bookingCode}>{booking.bookingCode}</div>
                      <div className="px-4 py-2 w-[250px] flex items-center gap-2 overflow-hidden shrink-0">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">{(booking.guest || "?").charAt(0)}</div>
                        <div className="truncate">
                          <div className="text-sm font-medium text-gray-800 truncate">{booking.guest}</div>
                          <div className="text-xs text-gray-400 truncate">{booking.email}</div>
                        </div>
                      </div>
                      <div className="px-4 py-2 w-[200px] text-sm text-gray-600 truncate shrink-0">{booking.room} · {booking.roomType}</div>
                      <div className="px-4 py-2 w-[180px] text-sm text-gray-600 truncate shrink-0">{booking.branch}</div>
                      <div className="px-4 py-2 w-[140px] text-sm text-gray-600 whitespace-nowrap shrink-0">{formatDate(booking.checkIn)}</div>
                      <div className="px-4 py-2 w-[140px] text-sm text-gray-600 whitespace-nowrap shrink-0">{formatDate(booking.checkOut)}</div>
                      <div className="px-4 py-2 w-[150px] text-sm font-bold text-gray-800 shrink-0">{formatCurrency(booking.amount)}</div>
                      <div className="px-4 py-2 w-[150px] shrink-0">
                        <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", paymentStyle.bg, paymentStyle.text)}>
                          {t(`admin.bookings.paymentStatuses.${booking.paymentStatus}`)}
                        </span>
                      </div>
                      <div className="px-4 py-2 w-[160px] shrink-0">
                        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", statusStyle.bg, statusStyle.text)}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", statusStyle.dot)} />
                          {t(`admin.bookings.statuses.${booking.status}`)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {isFetchingNextPage && (
            <div className="py-6 flex justify-center items-center gap-2 text-emerald-500 bg-white/80 sticky bottom-0 z-30 border-t border-gray-100">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm font-medium text-gray-500 uppercase tracking-widest">{t("common.loading")}...</span>
            </div>
          )}
          {bookingsLoading && bookings.length === 0 && (
            <div className="py-20 text-center">
              <Loader2 size={30} className="animate-spin text-emerald-500 mx-auto" />
              <p className="mt-2 text-sm text-gray-400">{t("common.loading")}</p>
            </div>
          )}
          {!bookingsLoading && bookings.length === 0 && (
             <div className="py-20 text-center text-gray-400 italic text-sm">{t("common.noData")}</div>
          )}
        </div>
      </div>

      {/* Modals remain the same as before but slightly cleaner */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">{editItem ? t("admin.bookings.editBooking") : t("admin.bookings.addBooking")}</h3>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50"><X size={15} /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && (<div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"><AlertCircle size={16} /> {error}</div>)}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{t("admin.bookings.guestName")}</label>
                  <input value={form.customer_name} onChange={(e) => handleFormChange("customer_name", e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Email</label>
                  <input type="email" value={form.customer_email} onChange={(e) => handleFormChange("customer_email", e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 transition" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Phone</label>
                  <input value={form.customer_phonenumber} onChange={(e) => handleFormChange("customer_phonenumber", e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{t("admin.bookings.bookingStatus")}</label>
                  <select value={form.status} onChange={(e) => handleFormChange("status", e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300">
                    {BOOKING_STATUS_OPTIONS.map((status) => (<option key={status} value={status}>{t(`admin.bookings.statuses.${status}`)}</option>))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{t("admin.bookings.paymentStatus")}</label>
                <select value={form.payment_status} onChange={(e) => handleFormChange("payment_status", e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300">
                  {paymentOptions.map((status) => (<option key={status} value={status}>{t(`admin.bookings.paymentStatuses.${status}`)}</option>))}
                </select>
              </div>
              {!editItem && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{t("admin.bookings.branch")}</label>
                    <select value={form.branch_code} onChange={(e) => handleFormChange("branch_code", e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300">
                      <option value="">--</option>
                      {branches.map((branch) => (<option key={branch.branch_code} value={branch.branch_code}>{branch.name}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{t("admin.bookings.roomType")}</label>
                    <select value={form.room_id} onChange={(e) => handleFormChange("room_id", e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300">
                      <option value="">--</option>
                      {rooms.map((room) => (<option key={room.room_id} value={room.room_id}>{room.room_type_name} · {formatCurrency(room.price)}</option>))}
                    </select>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{t("admin.bookings.checkIn")}</label>
                  <input type="date" value={form.from_date} onChange={(e) => handleFormChange("from_date", e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{t("admin.bookings.checkOut")}</label>
                  <input type="date" value={form.to_date} onChange={(e) => handleFormChange("to_date", e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 transition" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{t("admin.bookings.notes")}</label>
                <textarea value={form.note} onChange={(e) => handleFormChange("note", e.target.value)} rows={3} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 transition resize-none" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">{t("common.cancel")}</button>
              <button disabled={submitting} onClick={handleSave} className="px-4 py-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors disabled:opacity-60 inline-flex items-center gap-2">{submitting && <Loader2 size={14} className="animate-spin" />}{t("common.save")}</button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto"><Trash2 size={22} className="text-red-500" /></div>
            <h3 className="text-base font-bold text-gray-900">{t("admin.bookings.deleteBooking")}</h3>
            <p className="text-sm text-gray-500">{t("admin.bookings.deleteConfirm")}</p>
            <div className="flex gap-3 justify-center pt-2">
              <button onClick={() => setDeleteTarget(null)} className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">{t("common.cancel")}</button>
              <button disabled={submitting} onClick={handleDelete} className="px-5 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl inline-flex items-center gap-2 disabled:opacity-60">{submitting && <Loader2 size={14} className="animate-spin" />}{t("common.delete")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
