import React, { useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  CalendarCheck,
  Clock,
  LogIn,
  LogOut as LogOutIcon,
  ChevronDown,
} from "lucide-react";
import { useLanguage } from "@/utils/LanguageContext";
import { cn } from "@/lib/utils";

const SAMPLE_BOOKINGS = [
  { id: "#BK2401", guest: "Nguyễn Văn An", room: "101", roomType: "Deluxe", branch: "Cần Thơ", checkIn: "14/03/2026", checkOut: "16/03/2026", nights: 2, guests: 2, amount: "₫ 3,200,000", paymentStatus: "paid", status: "confirmed", createdAt: "10/03/2026" },
  { id: "#BK2400", guest: "Trần Thị Bình", room: "205", roomType: "Suite", branch: "Hà Nội", checkIn: "13/03/2026", checkOut: "15/03/2026", nights: 2, guests: 3, amount: "₫ 5,600,000", paymentStatus: "paid", status: "checkedIn", createdAt: "09/03/2026" },
  { id: "#BK2399", guest: "Lê Minh Châu", room: "312", roomType: "Standard", branch: "Đà Nẵng", checkIn: "12/03/2026", checkOut: "14/03/2026", nights: 2, guests: 1, amount: "₫ 4,100,000", paymentStatus: "paid", status: "checkedOut", createdAt: "08/03/2026" },
  { id: "#BK2398", guest: "Phạm Quốc Dũng", room: "401", roomType: "Presidential", branch: "TP.HCM", checkIn: "15/03/2026", checkOut: "17/03/2026", nights: 2, guests: 4, amount: "₫ 7,200,000", paymentStatus: "unpaid", status: "pending", createdAt: "12/03/2026" },
  { id: "#BK2397", guest: "Hoàng Thu Hà", room: "103", roomType: "Deluxe", branch: "Vũng Tàu", checkIn: "10/03/2026", checkOut: "12/03/2026", nights: 2, guests: 2, amount: "₫ 2,900,000", paymentStatus: "refunded", status: "cancelled", createdAt: "07/03/2026" },
  { id: "#BK2396", guest: "Vũ Thanh Long", room: "215", roomType: "Superior", branch: "Cần Thơ", checkIn: "16/03/2026", checkOut: "18/03/2026", nights: 2, guests: 2, amount: "₫ 3,800,000", paymentStatus: "unpaid", status: "confirmed", createdAt: "13/03/2026" },
  { id: "#BK2395", guest: "Ngô Thị Kim", room: "322", roomType: "Suite", branch: "TP.HCM", checkIn: "14/03/2026", checkOut: "17/03/2026", nights: 3, guests: 2, amount: "₫ 8,400,000", paymentStatus: "paid", status: "checkedIn", createdAt: "11/03/2026" },
];

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

const EMPTY_FORM = { guest: "", room: "", roomType: "Deluxe", branch: "", checkIn: "", checkOut: "", nights: 1, guests: 1, amount: "", paymentStatus: "unpaid", status: "pending" };

const AdminBookings = () => {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [bookings, setBookings] = useState(SAMPLE_BOOKINGS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState(null);

  const filtered = bookings.filter((b) => {
    const matchSearch = b.id.toLowerCase().includes(search.toLowerCase()) || b.guest.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (item) => { setEditItem(item); setForm({ ...item }); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditItem(null); };

  const handleSave = () => {
    if (editItem) {
      setBookings((prev) => prev.map((b) => (b.id === editItem.id ? { ...b, ...form } : b)));
    } else {
      const newId = `#BK${Date.now().toString().slice(-4)}`;
      setBookings((prev) => [{ ...form, id: newId, createdAt: new Date().toLocaleDateString("vi-VN") }, ...prev]);
    }
    closeModal();
  };

  const handleDelete = () => {
    setBookings((prev) => prev.filter((b) => b.id !== deleteId));
    setDeleteId(null);
  };

  const statCards = [
    { label: t("admin.bookings.totalBookings"), value: bookings.length, icon: CalendarCheck, bg: "bg-blue-50", text: "text-blue-600" },
    { label: t("admin.bookings.pendingBookings"), value: bookings.filter((b) => b.status === "pending").length, icon: Clock, bg: "bg-amber-50", text: "text-amber-600" },
    { label: t("admin.bookings.todayCheckIn"), value: bookings.filter((b) => b.checkIn === "14/03/2026").length, icon: LogIn, bg: "bg-emerald-50", text: "text-emerald-600" },
    { label: t("admin.bookings.todayCheckOut"), value: bookings.filter((b) => b.checkOut === "14/03/2026").length, icon: LogOutIcon, bg: "bg-violet-50", text: "text-violet-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t("admin.bookings.title")}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{t("admin.bookings.subtitle")}</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors">
          <Plus size={16} /> {t("admin.bookings.addBooking")}
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", s.bg)}>
              <s.icon size={18} className={s.text} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-6 py-4 border-b border-gray-100">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("admin.bookings.searchPlaceholder")}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 transition"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white text-gray-700 cursor-pointer"
            >
              <option value="all">{t("common.all")}</option>
              {Object.keys(statusConfig).map((s) => (
                <option key={s} value={s}>{t(`admin.bookings.statuses.${s}`)}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {[t("admin.bookings.bookingId"), t("admin.bookings.guestName"), t("admin.bookings.roomType"), t("admin.bookings.branch"), t("admin.bookings.checkIn"), t("admin.bookings.checkOut"), t("admin.bookings.totalAmount"), t("admin.bookings.paymentStatus"), t("admin.bookings.bookingStatus"), t("common.action")].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="py-10 text-center text-sm text-gray-400">{t("common.noData")}</td></tr>
              ) : filtered.map((b) => {
                const sCfg = statusConfig[b.status];
                const pCfg = paymentConfig[b.paymentStatus];
                return (
                  <tr key={b.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3.5 text-sm font-mono font-bold text-gray-800">{b.id}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{b.guest.charAt(0)}</div>
                        <span className="text-sm font-medium text-gray-800 whitespace-nowrap">{b.guest}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">{b.room} · {b.roomType}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">{b.branch}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">{b.checkIn}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">{b.checkOut}</td>
                    <td className="px-4 py-3.5 text-sm font-bold text-gray-800 whitespace-nowrap">{b.amount}</td>
                    <td className="px-4 py-3.5">
                      <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", pCfg.bg, pCfg.text)}>
                        {t(`admin.bookings.paymentStatuses.${b.paymentStatus}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", sCfg.bg, sCfg.text)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", sCfg.dot)} />
                        {t(`admin.bookings.statuses.${b.status}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openEdit(b)} className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setDeleteId(b.id)} className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">{editItem ? t("admin.bookings.editBooking") : t("admin.bookings.addBooking")}</h3>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50"><X size={15} /></button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: t("admin.bookings.guestName"), field: "guest" },
                { label: t("admin.bookings.roomNumber"), field: "room" },
                { label: t("admin.bookings.branch"), field: "branch" },
                { label: t("admin.bookings.checkIn"), field: "checkIn" },
                { label: t("admin.bookings.checkOut"), field: "checkOut" },
                { label: t("admin.bookings.totalAmount"), field: "amount" },
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
                  <input type="text" value={form[field] || ""} onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 transition" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{t("admin.bookings.roomType")}</label>
                  <select value={form.roomType} onChange={(e) => setForm((f) => ({ ...f, roomType: e.target.value }))} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300">
                    {["Standard", "Superior", "Deluxe", "Suite", "Presidential"].map((r) => (<option key={r}>{r}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{t("admin.bookings.bookingStatus")}</label>
                  <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300">
                    {Object.keys(statusConfig).map((s) => (<option key={s} value={s}>{t(`admin.bookings.statuses.${s}`)}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{t("admin.bookings.paymentStatus")}</label>
                  <select value={form.paymentStatus} onChange={(e) => setForm((f) => ({ ...f, paymentStatus: e.target.value }))} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300">
                    {["paid", "unpaid", "refunded"].map((s) => (<option key={s} value={s}>{t(`admin.bookings.paymentStatuses.${s}`)}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{t("admin.bookings.guests")}</label>
                  <input type="number" min="1" value={form.guests} onChange={(e) => setForm((f) => ({ ...f, guests: e.target.value }))} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 transition" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">{t("common.cancel")}</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors">{t("common.save")}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto"><Trash2 size={22} className="text-red-500" /></div>
            <h3 className="text-base font-bold text-gray-900">{t("admin.bookings.deleteBooking")}</h3>
            <p className="text-sm text-gray-500">{t("admin.bookings.deleteConfirm")}</p>
            <div className="flex gap-3 justify-center pt-2">
              <button onClick={() => setDeleteId(null)} className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">{t("common.cancel")}</button>
              <button onClick={handleDelete} className="px-5 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl">{t("common.delete")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
