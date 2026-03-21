import React, { useEffect, useMemo, useState } from "react";
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [bookings, setBookings] = useState([]);
  const [branches, setBranches] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState("");

  const loadBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/Admin/bookings/`);
      if (!res.ok) throw new Error(t("booking.bookingFailed"));
      const data = await res.json();
      setBookings(Array.isArray(data) ? data.map(mapBooking) : []);
    } catch (fetchError) {
      setError(fetchError.message || t("booking.bookingFailed"));
    } finally {
      setLoading(false);
    }
  };

  const loadBranches = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/branches/branches-list?page=1&page_size=100`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBranches(Array.isArray(data?.items) ? data.items : []);
    } catch {
      setBranches([]);
    }
  };

  const loadRooms = async (branchId) => {
    if (!branchId) {
      setRooms([]);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/admin/rooms/rooms-list?branch_code=${branchId}&page=1&page_size=100`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRooms(Array.isArray(data?.items) ? data.items.filter((room) => Number(room.del_flg) === 0) : []);
    } catch {
      setRooms([]);
    }
  };

  useEffect(() => {
    loadBookings();
    loadBranches();
  }, []);

  useEffect(() => {
    if (!modalOpen || editItem) return;
    loadRooms(form.branch_code);
  }, [modalOpen, editItem, form.branch_code]);

  const filtered = useMemo(() => bookings.filter((booking) => {
    const keyword = search.trim().toLowerCase();
    const matchSearch = !keyword || booking.bookingCode.toLowerCase().includes(keyword) || booking.guest.toLowerCase().includes(keyword) || booking.email.toLowerCase().includes(keyword);
    const matchStatus = statusFilter === "all" || booking.status === statusFilter;
    return matchSearch && matchStatus;
  }), [bookings, search, statusFilter]);

  const today = new Date().toISOString().split("T")[0];
  const statCards = [
    { label: t("admin.bookings.totalBookings"), value: bookings.length, icon: CalendarCheck, bg: "bg-blue-50", text: "text-blue-600" },
    { label: t("admin.bookings.pendingBookings"), value: bookings.filter((booking) => booking.status === "pending").length, icon: Clock, bg: "bg-amber-50", text: "text-amber-600" },
    { label: t("admin.bookings.todayCheckIn"), value: bookings.filter((booking) => booking.checkIn === today).length, icon: LogIn, bg: "bg-emerald-50", text: "text-emerald-600" },
    { label: t("admin.bookings.todayCheckOut"), value: bookings.filter((booking) => booking.checkOut === today).length, icon: LogOutIcon, bg: "bg-violet-50", text: "text-violet-600" },
  ];

  const openAdd = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setRooms([]);
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
    setRooms([]);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value, ...(field === "branch_code" ? { room_id: "" } : {}) }));
  };

  const handleSave = async () => {
    setSubmitting(true);
    setError("");

    try {
      if (editItem) {
        const res = await fetch(`${API_BASE}/Admin/bookings/${editItem.bookingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer_name: form.customer_name.trim(),
            customer_email: form.customer_email.trim(),
            customer_phonenumber: form.customer_phonenumber.trim(),
            note: form.note.trim() || null,
            from_date: form.from_date,
            to_date: form.to_date,
            status: denormalizeStatus(form.status),
            payment_status: form.payment_status,
          }),
        });

        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload.detail || t("booking.bookingFailed"));
        }
      } else {
        const res = await fetch(`${API_BASE}/Admin/bookings/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
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
          }),
        });

        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload.detail || t("booking.bookingFailed"));
        }
      }

      await loadBookings();
      closeModal();
    } catch (saveError) {
      setError(saveError.message || t("booking.bookingFailed"));
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
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.detail || t("common.delete"));
      }
      await loadBookings();
      setDeleteTarget(null);
    } catch (deleteError) {
      setError(deleteError.message || t("common.delete"));
    } finally {
      setSubmitting(false);
    }
  };

  const paymentOptions = editItem && ["paid", "refunded"].includes(editItem.paymentStatus) ? ["paid"] : PAYMENT_STATUS_OPTIONS;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t("admin.bookings.title")}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{t("admin.bookings.subtitle")}</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors">
          <Plus size={16} /> {t("admin.bookings.addBooking")}
        </button>
      </div>

      {error && !modalOpen && !deleteTarget && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
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

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-6 py-4 border-b border-gray-100">
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

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {[t("admin.bookings.bookingId"), t("admin.bookings.guestName"), t("admin.bookings.roomType"), t("admin.bookings.branch"), t("admin.bookings.checkIn"), t("admin.bookings.checkOut"), t("admin.bookings.totalAmount"), t("admin.bookings.paymentStatus"), t("admin.bookings.bookingStatus"), t("common.action")].map((header) => (
                  <th key={header} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={10} className="py-10 text-center text-sm text-gray-400"><span className="inline-flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> {t("common.loading")}</span></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={10} className="py-10 text-center text-sm text-gray-400">{t("common.noData")}</td></tr>
              ) : filtered.map((booking) => {
                const statusStyle = statusConfig[booking.status] || statusConfig.pending;
                const paymentStyle = paymentConfig[booking.paymentStatus] || paymentConfig.unpaid;
                return (
                  <tr key={booking.bookingId} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3.5 text-sm font-mono font-bold text-gray-800">{booking.bookingCode}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{(booking.guest || "?").charAt(0)}</div>
                        <div>
                          <div className="text-sm font-medium text-gray-800 whitespace-nowrap">{booking.guest}</div>
                          <div className="text-xs text-gray-400">{booking.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">{booking.room} · {booking.roomType}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">{booking.branch}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">{formatDate(booking.checkIn)}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">{formatDate(booking.checkOut)}</td>
                    <td className="px-4 py-3.5 text-sm font-bold text-gray-800 whitespace-nowrap">{formatCurrency(booking.amount)}</td>
                    <td className="px-4 py-3.5"><span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", paymentStyle.bg, paymentStyle.text)}>{t(`admin.bookings.paymentStatuses.${booking.paymentStatus}`)}</span></td>
                    <td className="px-4 py-3.5"><span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", statusStyle.bg, statusStyle.text)}><span className={cn("w-1.5 h-1.5 rounded-full", statusStyle.dot)} />{t(`admin.bookings.statuses.${booking.status}`)}</span></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openEdit(booking)} className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors"><Pencil size={13} /></button>
                        <button onClick={() => setDeleteTarget(booking)} className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

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
                {editItem && ["paid", "refunded"].includes(editItem.paymentStatus) && <p className="mt-1.5 text-xs text-gray-400">{t("admin.bookings.paymentLockedHint")}</p>}
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
