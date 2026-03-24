import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Eye,
  EyeOff,
} from "lucide-react";
import { useLanguage } from "@/utils/LanguageContext";
import { cn } from "@/lib/utils";
import API_BASE from "@/utils/api";
import moment from "moment";

/*
FastAPI UserResponse model:
class UserResponse(BaseModel):
    user_id: UUID 
    name: str
    email: EmailStr
    phone: Optional[str]
    role: str
    created_date: Optional[date]
    created_time: Optional[time]
    del_flg: int
*/

const roleColors = {
  Admin: { bg: "bg-violet-100", text: "text-violet-700" },
  Manager: { bg: "bg-blue-100", text: "text-blue-700" },
  Receptionist: { bg: "bg-teal-100", text: "text-teal-700" },
  Customer: { bg: "bg-gray-100", text: "text-gray-600" },
};

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  role: "Receptionist",
  password: "",
  confirmPassword: "",
  del_flg: 0,
};

function getToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }
  return null;
}

// Đổi method xoá sang deleted
const deleted = async ({ deleteId, setAccounts, setDeleteId, t }) => {
  const token = getToken();
  try {
    const res = await fetch(`${API_BASE}/users/${deleteId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ del_flg: 1 }),
    });
    if (!res.ok) throw new Error("Delete failed");
    setAccounts((prev) =>
      prev.map((a) =>
        a.user_id === deleteId ? { ...a, del_flg: 1 } : a
      )
    );
    setDeleteId(null);
  } catch (err) {
    alert("Failed to delete user");
  }
};

const AdminAccounts = () => {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [accounts, setAccounts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    confirmPassword: false,
  });
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalAccounts, setTotalAccounts] = useState(0);

  const fetchAccounts = async (pageNum, isLoadMore = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/users?page=${pageNum}&page_size=128`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      
      const newItems = data.items.map((a) => ({
        ...a,
        created_date: a.created_date || "",
        created_time: a.created_time || "",
      }));

      if (isLoadMore) {
        setAccounts(prev => [...prev, ...newItems]);
      } else {
        setAccounts(newItems);
        setTotalAccounts(data.total);
      }
      setHasMore(data.items.length === 128); // if full page received, might have more
    } catch (err) {
      if (!isLoadMore) setAccounts([]);
    } finally {
      if (pageNum === 1) setLoading(false);
      else setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchAccounts(1, false);
  }, []);

  useEffect(() => {
    if (page > 1) {
      fetchAccounts(page, true);
    }
  }, [page]);

  const observer = useRef();
  const lastAccountElementRef = useCallback(node => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  // Filter active users by search/role
  const filtered = accounts.filter((a) => {
    const matchSearch =
      (a.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.email || "").toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || a.role === roleFilter;
    return matchSearch && matchRole && a.del_flg === 0;
  });

  const openAdd = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setPasswordVisibility({ password: false, confirmPassword: false });
    setModalOpen(true);
  };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      ...item,
      password: "",
      confirmPassword: "",
    });
    setPasswordVisibility({ password: false, confirmPassword: false });
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditItem(null);
    setPasswordVisibility({ password: false, confirmPassword: false });
  };

  // ADD/EDIT user with FastAPI API
  const handleSave = async () => {
    // Basic validation per FastAPI UserCreate/UserUpdate
    if (!form.name || !form.email || !form.role) return;
    if (!editItem && (!form.password || form.password !== form.confirmPassword)) return;
    if (editItem && form.password && form.password !== form.confirmPassword) return;
    const token = getToken();

    try {
      if (editItem) {
        // UserUpdate model: PATCH only changed fields
        const payload = {};
        if (form.name !== undefined && form.name !== editItem.name) payload.name = form.name;
        if (form.email !== undefined && form.email !== editItem.email) payload.email = form.email;
        if (form.phone !== undefined && form.phone !== editItem.phone) payload.phone = form.phone;
        if (form.role !== undefined && form.role !== editItem.role) payload.role = form.role;
        if (form.password) payload.password = form.password;
        payload.del_flg = form.del_flg;

        const res = await fetch(`${API_BASE}/users/${editItem.user_id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          if (res.status === 400) {
            const errData = await res.json();
            if (errData.detail && /email/i.test(errData.detail)) {
              alert(t("admin.accounts.emailExists"));
              return;
            }
          }
          throw new Error("Update failed");
        }
        const updated = await res.json();
        setAccounts(prev =>
          prev.map((a) => (a.user_id === updated.user_id ? { ...a, ...updated } : a))
        );
      } else {
        // UserCreate: all required except phone
        const payload = {
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          role: form.role,
          password: form.password,
        };
        // POST /users/register (no token needed)
        const res = await fetch(API_BASE + "/users/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          if (res.status === 400) {
            const errData = await res.json();
            if (errData.detail && /email/i.test(errData.detail)) {
              alert(t("admin.accounts.emailExists"));
              return;
            }
          }
          throw new Error("Create failed");
        }
        const newUser = await res.json();
        setAccounts((prev) => [
          ...prev,
          {
            ...newUser,
            created_date: newUser.created_date ?? "",
            created_time: newUser.created_time ?? "",
          },
        ]);
      }
      closeModal();
    } catch (err) {
      alert("Failed to save user");
    }
  };

  // Gọi deleted thay vì handleDelete tại các chỗ xác nhận xóa
  // User statistics
  const totals = {
    all: totalAccounts,
    active: totalAccounts,
    inactive: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t("admin.accounts.title")}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{t("admin.accounts.subtitle")}</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
        >
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
              onChange={e => setSearch(e.target.value)}
              placeholder={t("admin.accounts.searchPlaceholder")}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 transition"
            />
          </div>
          <div className="relative">
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white text-gray-700 cursor-pointer"
            >
              <option value="all">{t("common.all")}</option>
              <option value="Admin">{t("admin.accounts.roles.admin")}</option>
              <option value="Manager">{t("admin.accounts.roles.manager")}</option>
              <option value="Receptionist">{t("admin.accounts.roles.receptionist")}</option>
              <option value="Customer">{t("admin.accounts.roles.customer")}</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {[
                  t("admin.accounts.fullName"),
                  t("admin.accounts.email"),
                  t("admin.accounts.phone"),
                  t("admin.accounts.role"),
                  t("common.createdDate"),
                  t("common.createdTime"),
                  t("common.status"),
                  t("common.action"),
                ].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm text-gray-400">{t("common.loading")}</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm text-gray-400">{t("common.noData")}</td>
                </tr>
              ) : (
                filtered.map((a, index) => {
                  const rCfg = roleColors[a.role] || roleColors.Customer;
                  
                  const isLastElement = filtered.length === index + 1;
                  
                  return (
                    <tr ref={isLastElement ? lastAccountElementRef : null} key={a.user_id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                            {(a.name || "").charAt(0)}
                          </div>
                          <span className="text-sm font-semibold text-gray-800">{a.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-600">{a.email}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-600">{a.phone}</td>
                      <td className="px-4 py-3.5">
                        <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", rCfg.bg, rCfg.text)}>
                          {t(`admin.accounts.roles.${a.role?.toLowerCase()}`)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-600">
                        {a.created_date
                          ? moment(a.created_date).format("DD/MM/YYYY")
                          : "\u2014"}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-600">
                        {a.created_time
                          ? moment(a.created_time, ["HH:mm:ss", "HH:mm"]).format("HH:mm")
                          : "\u2014"}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
                            a.del_flg === 0
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-100 text-gray-500"
                          )}
                        >
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              a.del_flg === 0 ? "bg-emerald-500" : "bg-gray-400"
                            )}
                          />
                          {a.del_flg === 0 ? t("common.active") : t("common.inactive")}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEdit(a)}
                            className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors"
                            disabled={a.del_flg !== 0}
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteId(a.user_id)}
                            className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
                            disabled={a.del_flg !== 0}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
              {loadingMore && (
                <tr>
                  <td colSpan={8} className="py-4 text-center text-sm text-gray-400">Loading more...</td>
                </tr>
              )}
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
              <h3 className="text-base font-bold text-gray-900">
                {editItem ? t("admin.accounts.editAccount") : t("admin.accounts.addAccount")}
              </h3>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50"
              >
                <X size={15} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: t("admin.accounts.fullName"), field: "name", type: "text" },
                { label: t("admin.accounts.email"), field: "email", type: "email" },
                { label: t("admin.accounts.phone"), field: "phone", type: "tel" },
                { label: t("admin.accounts.password"), field: "password", type: "password" },
                { label: t("admin.accounts.confirmPassword"), field: "confirmPassword", type: "password" },
              ].map(({ label, field, type }) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
                  {field === "password" || field === "confirmPassword" ? (
                    <div className="relative">
                      <input
                        type={passwordVisibility[field] ? "text" : "password"}
                        value={form[field] || ""}
                        onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                        className="w-full px-3 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 transition"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setPasswordVisibility((prev) => ({
                            ...prev,
                            [field]: !prev[field],
                          }))
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label={passwordVisibility[field] ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        {passwordVisibility[field] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  ) : (
                    <input
                      type={type}
                      value={form[field] || ""}
                      onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 transition"
                    />
                  )}
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{t("admin.accounts.role")}</label>
                  <select
                    value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  >
                    {["Admin", "Manager", "Receptionist", "Customer"].map(r => (
                      <option key={r} value={r}>{t(`admin.accounts.roles.${r.toLowerCase()}`)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                    {t("common.status")}
                  </label>
                  <select
                    value={form.del_flg}
                    onChange={e =>
                      setForm(f => ({
                        ...f,
                        del_flg: parseInt(e.target.value, 10)
                      }))
                    }
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  >
                    <option value={0}>{t("common.active")}</option>
                    <option value={1}>{t("common.inactive")}</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors"
              >
                {t("common.save")}
              </button>
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
              <button
                onClick={() => setDeleteId(null)}
                className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={() =>
                  deleted({ 
                    deleteId, 
                    setAccounts, 
                    setDeleteId, 
                    t 
                  })
                }
                className="px-5 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl"
              >
                {t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAccounts;
