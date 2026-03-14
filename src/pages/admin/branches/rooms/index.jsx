import React, { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  BedDouble,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  X,
  Hash,
  Tag,
  Layers,
} from "lucide-react";
import { useLanguage } from "@/utils/LanguageContext";
import { cn } from "@/lib/utils";
import API_BASE from "@/utils/api";

// ─── Stat Card ───────────────────────────────────────────────────────────────
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

// ─── Pagination ───────────────────────────────────────────────────────────────
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
          className="border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-300"
        >
          {[5, 10, 20, 50].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span>
          {t("common.showing")} <span className="font-semibold text-gray-800">{from}–{to}</span>{" "}
          {t("common.of")} <span className="font-semibold text-gray-800">{total}</span>
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
                      ? "bg-violet-500 text-white"
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

// ─── Room Status Config ───────────────────────────────────────────────────────
const ROOM_STATUS = {
  0: { labelKey: "admin.branches.rooms.statusAvailable", bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  1: { labelKey: "admin.branches.rooms.statusBooked",    bg: "bg-blue-100",    text: "text-blue-700",    dot: "bg-blue-500" },
  2: { labelKey: "admin.branches.rooms.statusInUse",     bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-500" },
  3: { labelKey: "admin.branches.rooms.statusUnavailable", bg: "bg-gray-100",  text: "text-gray-500",    dot: "bg-gray-400" },
};

// ─── Room Dialog ──────────────────────────────────────────────────────────────
const EMPTY_FORM = { room_number: "", room_type_id: "", price: "", del_flg: 0, amenity_ids: [] };

const RoomDialog = ({ open, mode, initialData, branchId, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  const [roomTypesLoading, setRoomTypesLoading] = useState(false);
  const [amenities, setAmenities] = useState([]);
  const [amenitiesLoading, setAmenitiesLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        mode === "update" && initialData
          ? {
              room_number: initialData.room_number ?? "",
              room_type_id: String(initialData.room_type_id ?? ""),

              price: String(initialData.price ?? ""),
              del_flg: initialData.del_flg,
              amenity_ids: (initialData.amenities ?? []).map((a) => String(a.amenity_id)),
            }
          : EMPTY_FORM
      );
      setError(null);
      // Fetch room types and amenities in parallel
      setRoomTypesLoading(true);
      setAmenitiesLoading(true);
      fetch(`${API_BASE}/admin/rooms/room-types`)
        .then((r) => r.json())
        .then((data) => setRoomTypes(Array.isArray(data) ? data : []))
        .catch(() => setRoomTypes([]))
        .finally(() => setRoomTypesLoading(false));
      fetch(`${API_BASE}/admin/rooms/amenities`)
        .then((r) => r.json())
        .then((data) => setAmenities(Array.isArray(data) ? data : []))
        .catch(() => setAmenities([]))
        .finally(() => setAmenitiesLoading(false));
    }
  }, [open, mode, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmenityToggle = (id) => {
    setForm((prev) => {
      const ids = prev.amenity_ids.includes(id)
        ? prev.amenity_ids.filter((x) => x !== id)
        : [...prev.amenity_ids, id];
      return { ...prev, amenity_ids: ids };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const body = {
        room_number: form.room_number,
        room_type_id: form.room_type_id || null,
        price: form.price !== "" ? Number(form.price) : null,
        del_flg: Number(form.del_flg),
        branch_id: branchId,
        amenity_ids: form.amenity_ids,
      };
      if (mode === "update" && initialData?.room_id) {
        body.room_id = String(initialData.room_id);
      }
      const res = await fetch(`${API_BASE}/admin/rooms`, {
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
          isUpdate ? "bg-amber-50" : "bg-violet-50"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center",
              isUpdate ? "bg-amber-100" : "bg-violet-100"
            )}>
              {isUpdate
                ? <Pencil size={16} className="text-amber-600" />
                : <Plus size={16} className="text-violet-600" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                {isUpdate ? t("admin.branches.rooms.dialogUpdateTitle") : t("admin.branches.rooms.dialogInsertTitle")}
              </h3>
              {isUpdate && initialData && (
                <p className="text-xs text-gray-400 mt-0.5">{t("admin.branches.rooms.roomNumber")}: {initialData.room_number}</p>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t("admin.branches.rooms.roomNumber")} <span className="text-red-500">*</span>
              </label>
              <input
                name="room_number"
                value={form.room_number}
                onChange={handleChange}
                required
                placeholder="101"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t("admin.branches.rooms.roomType")}
              </label>
              <select
                name="room_type_id"
                value={form.room_type_id}
                onChange={handleChange}
                disabled={roomTypesLoading}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300 transition bg-white disabled:opacity-60"
              >
                <option value="">{roomTypesLoading ? t("common.loading") : `-- ${t("admin.branches.rooms.roomType")} --`}</option>
                {roomTypes.map((rt) => (
                  <option key={String(rt.room_type_id)} value={String(rt.room_type_id)}>
                    {rt.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t("admin.branches.rooms.price")}
              </label>
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                placeholder="500000"
                min={0}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t("common.status")}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(ROOM_STATUS).map(([val, cfg]) => {
                  const selected = String(form.del_flg) === val;
                  return (
                    <label
                      key={val}
                      className={cn(
                        "flex items-center gap-2 px-3.5 py-2.5 rounded-xl border cursor-pointer text-sm font-medium transition-all",
                        selected
                          ? cn(cfg.bg, cfg.text, "border-transparent")
                          : "border-gray-200 text-gray-400 hover:border-gray-300"
                      )}
                    >
                      <input
                        type="radio"
                        name="del_flg"
                        value={val}
                        checked={selected}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <span className={cn("w-2 h-2 rounded-full flex-shrink-0", selected ? cfg.dot : "bg-gray-300")} />
                      {t(cfg.labelKey)}
                    </label>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t("admin.branches.rooms.amenities")}
              </label>
              {amenitiesLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                  <Loader2 size={14} className="animate-spin" /> {t("common.loading")}
                </div>
              ) : amenities.length === 0 ? (
                <p className="text-sm text-gray-400 py-2">{t("common.noData")}</p>
              ) : (
                <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-xl">
                  {amenities.map((a) => {
                    const sid = String(a.amenity_id);
                    const selected = form.amenity_ids.includes(sid);
                    return (
                      <button
                        key={sid}
                        type="button"
                        onClick={() => handleAmenityToggle(sid)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all",
                          selected
                            ? "bg-violet-100 border-violet-300 text-violet-700"
                            : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                        )}
                      >
                        <Tag size={11} />
                        {a.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            {error && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                <AlertCircle size={15} /> {error}
              </div>
            )}
          </div>
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
                isUpdate ? "bg-amber-500 hover:bg-amber-600" : "bg-violet-500 hover:bg-violet-600"
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

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminBranchRooms = () => {
  const { branchId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const branch = location.state?.branch ?? null;

  const [stats, setStats] = useState({ total_rooms: 0, available_rooms: 0, occupied_rooms: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  const [rooms, setRooms] = useState([]);
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

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/rooms/initialize?branch_id=${branchId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setStatsError(err.message);
    } finally {
      setStatsLoading(false);
    }
  }, [branchId]);

  const fetchRooms = useCallback(async (currentPage, currentPageSize) => {
    setTableLoading(true);
    setTableError(null);
    try {
      const res = await fetch(
        `${API_BASE}/admin/rooms/rooms-list?branch_id=${branchId}&page=${currentPage}&page_size=${currentPageSize}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRooms(data.items);
      setTotal(data.total);
      setTotalPages(data.total_pages);
    } catch (err) {
      setTableError(err.message);
      setRooms([]);
    } finally {
      setTableLoading(false);
    }
  }, [branchId]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchRooms(page, pageSize); }, [fetchRooms, page, pageSize]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(1);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/branches/${branchId}/rooms`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_id: String(deleteTarget.room_id) }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? `HTTP ${res.status}`);
      }
      setDeleteTarget(null);
      fetchStats();
      fetchRooms(page, pageSize);
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filtered = rooms.filter(
    (r) =>
      (r.room_number ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (r.room_type_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb / Back */}
      <div>
        <button
          onClick={() => navigate("/admin/branches")}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-3"
        >
          <ArrowLeft size={15} />
          {t("admin.branches.rooms.backToBranches")}
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t("admin.branches.rooms.title")}</h2>
            {branch && (
              <p className="text-sm text-gray-500 mt-0.5">
                {branch.name}
                {branch.address && <> &mdash; {branch.address}</>}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { fetchStats(); fetchRooms(page, pageSize); }}
              disabled={statsLoading || tableLoading}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <RefreshCw size={15} className={cn((statsLoading || tableLoading) && "animate-spin")} />
              {t("common.refresh")}
            </button>
            <button
              onClick={() => { setDialogMode("insert"); setDialogData(null); setDialogOpen(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-violet-500 hover:bg-violet-600 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              <Plus size={15} />
              {t("admin.branches.rooms.addRoom")}
            </button>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label={t("admin.branches.rooms.totalRooms")} value={stats.total_rooms} icon={BedDouble} bg="bg-violet-50" iconColor="text-violet-600" loading={statsLoading} />
        <StatCard label={t("admin.branches.rooms.availableRooms")} value={stats.available_rooms} icon={CheckCircle2} bg="bg-emerald-50" iconColor="text-emerald-600" loading={statsLoading} />
        <StatCard label={t("admin.branches.rooms.occupiedRooms")} value={stats.occupied_rooms} icon={Layers} bg="bg-orange-50" iconColor="text-orange-500" loading={statsLoading} />
      </div>

      {statsError && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          <AlertCircle size={16} /> {statsError}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="relative max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("admin.branches.rooms.searchPlaceholder")}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300 transition"
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
                  t("admin.branches.rooms.roomNumber"),
                  t("admin.branches.rooms.roomType"),
                  t("admin.branches.rooms.amenities"),
                  t("admin.branches.rooms.price"),
                  t("common.status"),
                  t("common.action"),
                ].map((label) => (
                  <th key={label} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tableLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Loader2 size={24} className="animate-spin text-violet-500" />
                      <span className="text-sm">{t("common.loading")}</span>
                    </div>
                  </td>
                </tr>
              ) : tableError ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-red-400">
                      <AlertCircle size={24} />
                      <span className="text-sm">{tableError}</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-sm text-gray-400">
                    {t("common.noData")}
                  </td>
                </tr>
              ) : (
                filtered.map((r, idx) => {
                  const rowNum = (page - 1) * pageSize + idx + 1;
                  const statusCfg = ROOM_STATUS[r.del_flg] ?? ROOM_STATUS[0];
                  return (
                    <tr key={String(r.room_id)} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-400 font-mono">{rowNum}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {String(r.room_number ?? "?").slice(0, 2)}
                          </div>
                          <span className="text-sm font-semibold text-gray-800">{r.room_number}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {r.room_type_name ?? <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-4">
                        {r.amenities && r.amenities.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {r.amenities.slice(0, 3).map((a) => (
                              <span
                                key={String(a.amenity_id)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-violet-50 border border-violet-100 text-xs text-violet-600 whitespace-nowrap"
                              >
                                <Tag size={9} />{a.name}
                              </span>
                            ))}
                            {r.amenities.length > 3 && (
                              <span className="text-xs text-gray-400 self-center">+{r.amenities.length - 3}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {r.price != null
                          ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(r.price)
                          : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-4">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
                          statusCfg.bg, statusCfg.text
                        )}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", statusCfg.dot)} />
                          {t(statusCfg.labelKey)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setDialogMode("update"); setDialogData(r); setDialogOpen(true); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors whitespace-nowrap"
                          >
                            <Pencil size={12} />
                            {t("common.edit")}
                          </button>
                          <button
                            onClick={() => { setDeleteError(null); setDeleteTarget(r); }}
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

      <RoomDialog
        open={dialogOpen}
        mode={dialogMode}
        initialData={dialogData}
        branchId={branchId}
        onClose={() => setDialogOpen(false)}
        onSuccess={() => { fetchStats(); fetchRooms(page, pageSize); }}
      />

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !deleteLoading && setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-auto p-6 flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">{t("admin.branches.rooms.deleteRoom")}</h3>
                <p className="text-sm text-gray-500 mt-1">{t("admin.branches.rooms.deleteConfirm")}</p>
                <p className="text-sm font-semibold text-gray-800 mt-2">
                  {t("admin.branches.rooms.roomNumber")}: {deleteTarget.room_number}
                </p>
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

export default AdminBranchRooms;
