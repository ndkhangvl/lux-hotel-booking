import React, { useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Users,
  UserCheck,
  UserX,
  ChevronDown,
} from "lucide-react";
import { useLanguage } from "@/utils/LanguageContext";
import { cn } from "@/lib/utils";

const SAMPLE_ACCOUNTS = [
  { id: 1, name: "Nguyễn Văn Admin", email: "admin@aurora.vn", phone: "0901234567", role: "admin", branch: "Tất cả", status: "active", createdAt: "01/01/2024", lastLogin: "14/03/2026" },
  { id: 2, name: "Trần Thị Mai", email: "mai.tran@aurora.vn", phone: "0912345678", role: "manager", branch: "Cần Thơ", status: "active", createdAt: "15/03/2024", lastLogin: "13/03/2026" },
  { id: 3, name: "Lê Hoàng Nam", email: "nam.le@aurora.vn", phone: "0923456789", role: "receptionist", branch: "TP.HCM", status: "active", createdAt: "20/04/2024", lastLogin: "14/03/2026" },
  { id: 4, name: "Phạm Thị Liên", email: "lien.pham@aurora.vn", phone: "0934567890", role: "receptionist", branch: "Hà Nội", status: "inactive", createdAt: "10/05/2024", lastLogin: "01/02/2026" },
  { id: 5, name: "Hoàng Minh Tuấn", email: "tuan.hoang@aurora.vn", phone: "0945678901", role: "manager", branch: "Đà Nẵng", status: "active", createdAt: "01/06/2024", lastLogin: "12/03/2026" },
  { id: 6, name: "Vũ Thị Hương", email: "huong.vu@aurora.vn", phone: "0956789012", role: "receptionist", branch: "Vũng Tàu", status: "active", createdAt: "15/07/2024", lastLogin: "14/03/2026" },
];

const roleColors = {
  admin: { bg: "bg-violet-100", text: "text-violet-700" },
  manager: { bg: "bg-blue-100", text: "text-blue-700" },
  receptionist: { bg: "bg-teal-100", text: "text-teal-700" },
  customer: { bg: "bg-gray-100", text: "text-gray-600" },
};

const EMPTY_FORM = { name: "", email: "", phone: "", role: "receptionist", branch: "", status: "active", password: "", confirmPassword: "" };

const AdminAccounts = () => {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [accounts, setAccounts] = useState(SAMPLE_ACCOUNTS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState(null);

  const filtered = accounts.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || a.role === roleFilter;
    return matchSearch && matchRole;
  });

  const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (item) => { setEditItem(item); setForm({ ...item, password: "", confirmPassword: "" }); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditItem(null); };

  const handleSave = () => {
    if (editItem) {
      setAccounts((prev) => prev.map((a) => (a.id === editItem.id ? { ...a, ...form } : a)));
    } else {
      setAccounts((prev) => [...prev, { ...form, id: Date.now(), createdAt: new Date().toLocaleDateString("vi-VN"), lastLogin: "—" }]);
    }
    closeModal();
  };

  const handleDelete = () => {
    setAccounts((prev) => prev.filter((a) => a.id !== deleteId));
    setDeleteId(null);
  };

  const totals = { all: accounts.length, active: accounts.filter((a) => a.status === "active").length, inactive: accounts.filter((a) => a.status === "inactive").length };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t("admin.accounts.title")}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{t("admin.accounts.subtitle")}</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors">
          <Plus size={16} /> {t("admin.accounts.addAccount")}
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: t("admin.accounts.totalAccounts"), value: totals.all, icon: Users, bg: "bg-blue-50", text: "text-blue-600" },
          { label: t("admin.accounts.activeAccounts"), value: totals.active, icon: UserCheck, bg: "bg-emerald-50", text: "text-emerald-600" },
          { label: t("admin.accounts.inactiveAccounts"), value: totals.inactive, icon: UserX, bg: "bg-red-50", text: "text-red-500" },
        ].map((s, i) => (
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
              placeholder={t("admin.accounts.searchPlaceholder")}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 transition"
            />
          </div>
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white text-gray-700 cursor-pointer"
            >
              <option value="all">{t("common.all")}</option>
              <option value="admin">{t("admin.accounts.roles.admin")}</option>
              <option value="manager">{t("admin.accounts.roles.manager")}</option>
              <option value="receptionist">{t("admin.accounts.roles.receptionist")}</option>
              <option value="customer">{t("admin.accounts.roles.customer")}</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {[t("admin.accounts.fullName"), t("admin.accounts.email"), t("admin.accounts.phone"), t("admin.accounts.role"), t("admin.accounts.branch"), t("common.status"), t("admin.accounts.lastLogin"), t("common.action")].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-10 text-center text-sm text-gray-400">{t("common.noData")}</td></tr>
              ) : filtered.map((a) => {
                const rCfg = roleColors[a.role] || roleColors.customer;
                return (
                  <tr key={a.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {a.name.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-gray-800">{a.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{a.email}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{a.phone}</td>
                    <td className="px-4 py-3.5">
                      <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", rCfg.bg, rCfg.text)}>{t(`admin.accounts.roles.${a.role}`)}</span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{a.branch}</td>
                    <td className="px-4 py-3.5">
                      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold", a.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500")}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", a.status === "active" ? "bg-emerald-500" : "bg-gray-400")} />
                        {t(`common.${a.status}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-500">{a.lastLogin}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openEdit(a)} className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setDeleteId(a.id)} className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors">
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
              <h3 className="text-base font-bold text-gray-900">{editItem ? t("admin.accounts.editAccount") : t("admin.accounts.addAccount")}</h3>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50"><X size={15} /></button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: t("admin.accounts.fullName"), field: "name", type: "text" },
                { label: t("admin.accounts.email"), field: "email", type: "email" },
                { label: t("admin.accounts.phone"), field: "phone", type: "tel" },
                { label: t("admin.accounts.branch"), field: "branch", type: "text" },
                { label: t("admin.accounts.password"), field: "password", type: "password" },
                { label: t("admin.accounts.confirmPassword"), field: "confirmPassword", type: "password" },
              ].map(({ label, field, type }) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
                  <input
                    type={type}
                    value={form[field] || ""}
                    onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 transition"
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{t("admin.accounts.role")}</label>
                  <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300">
                    {["admin", "manager", "receptionist", "customer"].map((r) => (<option key={r} value={r}>{t(`admin.accounts.roles.${r}`)}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{t("common.status")}</label>
                  <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300">
                    <option value="active">{t("common.active")}</option>
                    <option value="inactive">{t("common.inactive")}</option>
                  </select>
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
            <h3 className="text-base font-bold text-gray-900">{t("admin.accounts.deleteAccount")}</h3>
            <p className="text-sm text-gray-500">{t("admin.accounts.deleteConfirm")}</p>
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

export default AdminAccounts;
