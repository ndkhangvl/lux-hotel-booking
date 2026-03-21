import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  GitBranch,
  BedDouble,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  MapPin,
  Phone,
  Hash,
  Plus,
  Pencil,
  X,
  Trash2,
} from "lucide-react";
import { useLanguage } from "@/utils/LanguageContext";
import { cn } from "@/lib/utils";
import API_BASE from "@/utils/api";

// ─── Stat Card ──────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, bg, iconColor, loading }) => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
    <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", bg)}>
      <Icon size={20} className={iconColor} />
    </div>
    <div>
      {loading ? (
        <div className="w-12 h-6 bg-gray-100 rounded animate-pulse mb-1" />
      ) : (
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      )}
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

// ─── Pagination ──────────────────────────────────────────────────────────────
const Pagination = ({ page, totalPages, total, pageSize, onPageChange, onPageSizeChange, loading, t }) => {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4 border-t border-gray-100">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>{t("common.rowsPerPage")}:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          disabled={loading}
          className="border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
        >
          {[5, 10, 20, 50].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span>
          {t("common.showing")} <span className="font-semibold text-gray-800">{from}�{to}</span>{" "}
          {t("common.of")} <span className="font-semibold text-gray-800">{total}</span> {t("common.entries")}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || loading}
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={15} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .reduce((acc, p, idx, arr) => {
              if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              p === "..." ? (
                <span key={`e-${i}`} className="px-1 text-gray-400">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  disabled={loading}
                  className={cn(
                    "w-8 h-8 rounded-lg text-sm font-medium transition-colors",
                    p === page
                      ? "bg-emerald-500 text-white"
                      : "border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                  )}
                >
                  {p}
                </button>
              )
            )}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || loading}
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
// --- Branch Dialog -----------------------------------------------------------
const EMPTY_BRANCH_FORM = { name: "", address: "", phone: "", del_flg: 0 };

const BranchDialog = ({ open, mode, initialData, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const [form, setForm] = useState(EMPTY_BRANCH_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setForm(
        mode === "update" && initialData
          ? {
              name: initialData.name,
              address: initialData.address,
              phone: initialData.phone ?? "",
              del_flg: initialData.del_flg,
            }
          : EMPTY_BRANCH_FORM
      );
      setError(null);
    }
  }, [open, mode, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const body = { ...form, del_flg: Number(form.del_flg) };
      if (mode === "update" && initialData?.branch_code) {
        body.branch_code = String(initialData.branch_code);
      }
      const res = await fetch(`${API_BASE}/admin/branches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? `HTTP ${res.status}`);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;
  const isUpdate = mode === "update";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between px-6 py-4 border-b border-gray-100 rounded-t-2xl",
          isUpdate ? "bg-amber-50" : "bg-emerald-50"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center",
              isUpdate ? "bg-amber-100" : "bg-emerald-100"
            )}>
              {isUpdate
                ? <Pencil size={16} className="text-amber-600" />
                : <Plus size={16} className="text-emerald-600" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                {isUpdate ? t("admin.branches.dialogUpdateTitle") : t("admin.branches.dialogInsertTitle")}
              </h3>
              {isUpdate && initialData && (
                <p className="text-xs text-gray-400 mt-0.5">{initialData.name}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t("admin.branches.branchName")} <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder={t("admin.branches.branchName")}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 transition"
              />
            </div>
            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t("admin.branches.address")} <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                rows={2}
                placeholder={t("admin.branches.address")}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 transition resize-none"
              />
            </div>
            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t("admin.branches.phone")}
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="0xxx xxx xxx"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 transition"
              />
            </div>
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t("common.status")}
              </label>
              <div className="flex gap-3">
                {[
                  { value: "0", label: t("common.active") },
                  { value: "1", label: t("common.inactive") },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={cn(
                      "flex items-center gap-2 flex-1 px-4 py-2.5 rounded-xl border cursor-pointer text-sm font-medium transition-all",
                      String(form.del_flg) === opt.value
                        ? opt.value === "0"
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : "border-gray-300 bg-gray-50 text-gray-600"
                        : "border-gray-200 text-gray-400 hover:border-gray-300"
                    )}
                  >
                    <input
                      type="radio"
                      name="del_flg"
                      value={opt.value}
                      checked={String(form.del_flg) === opt.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className={cn("w-2 h-2 rounded-full", opt.value === "0" ? "bg-emerald-500" : "bg-gray-400")} />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                <AlertCircle size={15} /> {error}
              </div>
            )}
          </div>
          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl disabled:opacity-60 transition-colors",
                isUpdate ? "bg-amber-500 hover:bg-amber-600" : "bg-emerald-500 hover:bg-emerald-600"
              )}
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {t("common.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main Component -----------------------------------------------------------
const AdminBranches = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ total_branches: 0, active_branches: 0, total_rooms: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  const [branches, setBranches] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [tableLoading, setTableLoading] = useState(true);
  const [tableError, setTableError] = useState(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("insert");
  const [dialogData, setDialogData] = useState(null);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/branches/initialize`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setStatsError(err.message);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchBranches = useCallback(async (currentPage, currentPageSize) => {
    setTableLoading(true);
    setTableError(null);
    try {
      const res = await fetch(
        `${API_BASE}/admin/branches/branches-list?page=${currentPage}&page_size=${currentPageSize}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setBranches(data.items);
      setTotal(data.total);
      setTotalPages(data.total_pages);
    } catch (err) {
      setTableError(err.message);
      setBranches([]);
    } finally {
      setTableLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchBranches(page, pageSize); }, [fetchBranches, page, pageSize]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(1);
  };

  const handleOpenInsert = () => {
    setDialogMode("insert");
    setDialogData(null);
    setDialogOpen(true);
  };

  const handleOpenUpdate = (branch) => {
    setDialogMode("update");
    setDialogData(branch);
    setDialogOpen(true);
  };

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/branches`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branch_code: String(deleteTarget.branch_code) }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? `HTTP ${res.status}`);
      }
      setDeleteTarget(null);
      fetchStats();
      fetchBranches(page, pageSize);
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDialogSuccess = () => {
    fetchStats();
    fetchBranches(page, pageSize);
  };

  const filtered = branches.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.address.toLowerCase().includes(search.toLowerCase()) ||
      (b.phone || "").includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t("admin.branches.title")}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{t("admin.branches.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { fetchStats(); fetchBranches(page, pageSize); }}
            disabled={statsLoading || tableLoading}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={15} className={cn((statsLoading || tableLoading) && "animate-spin")} />
            {t("common.refresh")}
          </button>
          <button
            onClick={handleOpenInsert}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            <Plus size={15} />
            {t("admin.branches.addBranch")}
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label={t("admin.branches.totalBranches")} value={stats.total_branches} icon={GitBranch} bg="bg-violet-50" iconColor="text-violet-600" loading={statsLoading} />
        <StatCard label={t("admin.branches.activeBranches")} value={stats.active_branches} icon={CheckCircle2} bg="bg-emerald-50" iconColor="text-emerald-600" loading={statsLoading} />
        <StatCard label={t("admin.branches.totalRoomsAll")} value={stats.total_rooms} icon={BedDouble} bg="bg-blue-50" iconColor="text-blue-600" loading={statsLoading} />
      </div>

      {statsError && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          <AlertCircle size={16} /> Lỗi tải thống kê: {statsError}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Search */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="relative max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("admin.branches.searchPlaceholder")}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1"><Hash size={11} /> #</div>
                </th>
                {[
                  [t("admin.branches.branchName"), GitBranch],
                  [t("admin.branches.address"), MapPin],
                  [t("admin.branches.phone"), Phone],
                  [t("admin.branches.totalRooms"), BedDouble],
                  [t("admin.branches.createdAt"), null],
                  [t("common.status"), null],
                  [t("common.action"), null],
                ].map(([label, Icon]) => (
                  <th key={label} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {Icon && <Icon size={11} />}
                      {label}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tableLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Loader2 size={24} className="animate-spin text-emerald-500" />
                      <span className="text-sm">{t("common.loading")}</span>
                    </div>
                  </td>
                </tr>
              ) : tableError ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-red-400">
                      <AlertCircle size={24} />
                      <span className="text-sm">Lỗi: {tableError}</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-sm text-gray-400">
                    {t("common.noData")}
                  </td>
                </tr>
              ) : (
                filtered.map((b, idx) => {
                  const rowNum = (page - 1) * pageSize + idx + 1;
                  const isActive = b.del_flg === 0;
                  return (
                    <tr
                      key={String(b.branch_code)}
                      className="hover:bg-gray-50/60 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/branches/${b.branch_code}`, { state: { branch: b } })}
                    >
                      <td className="px-6 py-4 text-sm text-gray-400 font-mono">{rowNum}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {b.name.charAt(0)}
                          </div>
                          <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">{b.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600 max-w-[260px] truncate block" title={b.address}>
                          {b.address}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {b.phone ?? <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                          <BedDouble size={11} /> {b.total_rooms}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {b.created_date ?? <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-4">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
                          isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                        )}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", isActive ? "bg-emerald-500" : "bg-gray-400")} />
                          {t(isActive ? "common.active" : "common.inactive")}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenUpdate(b); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors whitespace-nowrap"
                          >
                            <Pencil size={12} />
                            {t("common.edit")}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteError(null); setDeleteTarget(b); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors whitespace-nowrap"
                          >
                            <Trash2 size={12} />
                            {t("common.delete")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!tableLoading && !tableError && total > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            loading={tableLoading}
            t={t}
          />
        )}
      </div>

      <BranchDialog
        open={dialogOpen}
        mode={dialogMode}
        initialData={dialogData}
        onClose={() => setDialogOpen(false)}
        onSuccess={handleDialogSuccess}
      />

      {/* Delete confirm dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !deleteLoading && setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-auto p-6 flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">{t("admin.branches.deleteBranch")}</h3>
                <p className="text-sm text-gray-500 mt-1">{t("admin.branches.deleteConfirm")}</p>
                <p className="text-sm font-semibold text-gray-800 mt-2 truncate">{deleteTarget.name}</p>
              </div>
            </div>
            {deleteError && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                <AlertCircle size={15} /> {deleteError}
              </div>
            )}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl disabled:opacity-60 transition-colors"
              >
                {deleteLoading && <Loader2 size={14} className="animate-spin" />}
                {t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBranches;
