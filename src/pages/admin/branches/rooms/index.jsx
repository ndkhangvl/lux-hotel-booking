import React, { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  BedDouble,
  CheckCircle2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Plus,
  Pencil,
  Image as ImageIcon,
  UploadCloud,
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

const extractGoogleDriveFileId = (url) => {
  if (!url) return null;

  const directIdMatch = url.match(/[?&]id=([^&]+)/i);
  if (directIdMatch?.[1]) return directIdMatch[1];

  const filePathMatch = url.match(/\/d\/([^/]+)/i);
  if (filePathMatch?.[1]) return filePathMatch[1];

  return null;
};

const buildRoomImageSources = (url) => {
  if (!url) return [];

  const driveFileId = extractGoogleDriveFileId(url);
  const sources = driveFileId
    ? [
        `https://lh3.googleusercontent.com/d/${driveFileId}=w1600`,
        `https://drive.google.com/thumbnail?id=${driveFileId}&sz=w1600`,
        `https://drive.google.com/uc?export=view&id=${driveFileId}`,
        url,
      ]
    : [url];

  return [...new Set(sources.filter(Boolean))];
};

const RoomImagePreview = ({ imageUrl, alt, className }) => {
  const [sourceIndex, setSourceIndex] = useState(0);
  const [isBroken, setIsBroken] = useState(false);
  const sources = buildRoomImageSources(imageUrl);
  const currentSource = sources[sourceIndex] ?? null;

  useEffect(() => {
    setSourceIndex(0);
    setIsBroken(false);
  }, [imageUrl]);

  if (!currentSource || isBroken) {
    return (
      <div className={cn("flex items-center justify-center bg-slate-100 text-slate-400", className)}>
        <div className="flex flex-col items-center gap-2 px-4 text-center">
          <ImageIcon size={28} />
          <span className="text-xs font-medium">Image unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={currentSource}
      alt={alt}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer"
      onLoad={() => setIsBroken(false)}
      onError={() => {
        if (sourceIndex < sources.length - 1) {
          setSourceIndex(sourceIndex + 1);
          return;
        }
        setIsBroken(true);
      }}
    />
  );
};

// ─── Room Dialog ──────────────────────────────────────────────────────────────
const EMPTY_FORM = { room_type_id: "", price: "", people_number: "1", del_flg: 0, amenity_ids: [] };
const EMPTY_BRANCH_ROOM_FORM = { room_id: "", room_number: "", del_flg: 0 };

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
              room_type_id: String(initialData.room_type_id ?? ""),

              price: String(initialData.price ?? ""),
              people_number: String(initialData.people_number ?? 1),
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
        room_type_id: form.room_type_id || null,
        price: form.price !== "" ? Number(form.price) : null,
        people_number: form.people_number !== "" ? Number(form.people_number) : 1,
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
                {t("admin.branches.rooms.peopleNumber")}
              </label>
              <input
                name="people_number"
                type="number"
                value={form.people_number}
                onChange={handleChange}
                placeholder="2"
                min={1}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300 transition"
              />
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

const BranchRoomDialog = ({ open, mode, initialData, branchId, roomOptions, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const [form, setForm] = useState(EMPTY_BRANCH_ROOM_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setForm(
      mode === "update" && initialData
        ? {
            room_id: String(initialData.room_id ?? ""),
            room_number: String(initialData.room_number ?? ""),
            del_flg: Number(initialData.del_flg ?? 0),
          }
        : EMPTY_BRANCH_ROOM_FORM
    );
    setError(null);
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
      const body = {
        branch_id: branchId,
        room_id: form.room_id,
        room_number: form.room_number.trim(),
        del_flg: Number(form.del_flg),
      };
      if (mode === "update" && initialData?.branch_room_id) {
        body.branch_room_id = String(initialData.branch_room_id);
      }
      const res = await fetch(`${API_BASE}/admin/rooms/branch-rooms`, {
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
        <div className={cn(
          "flex items-center justify-between px-6 py-4 border-b border-gray-100 rounded-t-2xl",
          isUpdate ? "bg-amber-50" : "bg-blue-50"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center",
              isUpdate ? "bg-amber-100" : "bg-blue-100"
            )}>
              {isUpdate ? <Pencil size={16} className="text-amber-600" /> : <Plus size={16} className="text-blue-600" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                {t(isUpdate ? "admin.branches.rooms.branchRoomDialogUpdateTitle" : "admin.branches.rooms.branchRoomDialogInsertTitle")}
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("admin.branches.rooms.roomType")}</label>
              <select
                name="room_id"
                value={form.room_id}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 transition bg-white"
              >
                <option value="">-- {t("admin.branches.rooms.roomType")} --</option>
                {roomOptions.map((room) => (
                  <option key={String(room.room_id)} value={String(room.room_id)}>
                    {room.room_type_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("admin.branches.rooms.roomNumber")}</label>
              <input
                name="room_number"
                value={form.room_number}
                onChange={handleChange}
                placeholder="101"
                required
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                <AlertCircle size={15} /> {error}
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <button type="button" onClick={onClose} disabled={submitting} className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors">
              {t("common.cancel")}
            </button>
            <button type="submit" disabled={submitting} className={cn("flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl disabled:opacity-60 transition-colors", isUpdate ? "bg-amber-500 hover:bg-amber-600" : "bg-blue-500 hover:bg-blue-600")}>
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
  const [activeTab, setActiveTab] = useState("rooms");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);

  const [stats, setStats] = useState({
    total_rooms: 0,
    available_rooms: 0,
    booked_rooms: 0,
    in_use_rooms: 0,
    unavailable_rooms: 0,
  });
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

  const [branchRooms, setBranchRooms] = useState([]);
  const [branchRoomsTotal, setBranchRoomsTotal] = useState(0);
  const [branchRoomsTotalPages, setBranchRoomsTotalPages] = useState(1);
  const [branchRoomsLoading, setBranchRoomsLoading] = useState(true);
  const [branchRoomsError, setBranchRoomsError] = useState(null);
  const [roomOptions, setRoomOptions] = useState([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("insert");
  const [dialogData, setDialogData] = useState(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageDialogRoom, setImageDialogRoom] = useState(null);
  const [roomImages, setRoomImages] = useState([]);
  const [roomImagesLoading, setRoomImagesLoading] = useState(false);
  const [roomImagesError, setRoomImagesError] = useState(null);
  const [imageUploadFiles, setImageUploadFiles] = useState([]);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [imageDeleteLoadingId, setImageDeleteLoadingId] = useState(null);
  const [imageDeleteError, setImageDeleteError] = useState(null);
  const [isImageDropActive, setIsImageDropActive] = useState(false);
  const [branchRoomDialogOpen, setBranchRoomDialogOpen] = useState(false);
  const [branchRoomDialogMode, setBranchRoomDialogMode] = useState("insert");
  const [branchRoomDialogData, setBranchRoomDialogData] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [branchRoomDeleteTarget, setBranchRoomDeleteTarget] = useState(null);
  const [branchRoomDeleteLoading, setBranchRoomDeleteLoading] = useState(false);
  const [branchRoomDeleteError, setBranchRoomDeleteError] = useState(null);

  const hasInvalidDateRange = Boolean(startDate && endDate && endDate < startDate);

  const buildDateRangeQuery = () => `start_date=${startDate}&end_date=${endDate}`;

  const fetchStats = useCallback(async () => {
    if (hasInvalidDateRange) {
      setStatsError(t("admin.branches.rooms.invalidDateRange"));
      setStatsLoading(false);
      return;
    }

    setStatsLoading(true);
    setStatsError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/rooms/initialize?branch_id=${branchId}&${buildDateRangeQuery()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setStatsError(err.message);
    } finally {
      setStatsLoading(false);
    }
  }, [branchId, endDate, hasInvalidDateRange, startDate, t]);

  const fetchRooms = useCallback(async (currentPage, currentPageSize) => {
    if (hasInvalidDateRange) {
      setTableError(t("admin.branches.rooms.invalidDateRange"));
      setTableLoading(false);
      setRooms([]);
      return;
    }

    setTableLoading(true);
    setTableError(null);
    try {
      const res = await fetch(
        `${API_BASE}/admin/rooms/rooms-list?branch_id=${branchId}&${buildDateRangeQuery()}&page=${currentPage}&page_size=${currentPageSize}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRooms(data.items);
      setRoomOptions(data.items);
      setTotal(data.total);
      setTotalPages(data.total_pages);
    } catch (err) {
      setTableError(err.message);
      setRooms([]);
    } finally {
      setTableLoading(false);
    }
  }, [branchId, endDate, hasInvalidDateRange, startDate, t]);

  const fetchBranchRooms = useCallback(async (currentPage, currentPageSize) => {
    if (hasInvalidDateRange) {
      setBranchRoomsError(t("admin.branches.rooms.invalidDateRange"));
      setBranchRoomsLoading(false);
      setBranchRooms([]);
      return;
    }

    setBranchRoomsLoading(true);
    setBranchRoomsError(null);
    try {
      const res = await fetch(
        `${API_BASE}/admin/rooms/branch-rooms-list?branch_id=${branchId}&${buildDateRangeQuery()}&page=${currentPage}&page_size=${currentPageSize}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setBranchRooms(data.items);
      setBranchRoomsTotal(data.total);
      setBranchRoomsTotalPages(data.total_pages);
    } catch (err) {
      setBranchRoomsError(err.message);
      setBranchRooms([]);
    } finally {
      setBranchRoomsLoading(false);
    }
  }, [branchId, endDate, hasInvalidDateRange, startDate, t]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => {
    if (activeTab === "rooms") {
      fetchRooms(page, pageSize);
      return;
    }
    fetchBranchRooms(page, pageSize);
  }, [activeTab, fetchRooms, fetchBranchRooms, page, pageSize]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(1);
  };

  const handleImageFileSelect = (files) => {
    setImageUploadError(null);
    setImageUploadFiles(Array.isArray(files) ? files : []);
  };

  const loadRoomImages = async (room) => {
    setRoomImages([]);
    setRoomImagesError(null);
    setRoomImagesLoading(true);

    try {
      const res = await fetch(`${API_BASE}/room-images/room/${room.room_id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRoomImages(Array.isArray(data?.items) ? data.items : []);
    } catch (err) {
      setRoomImagesError(err.message || t("common.noData"));
    } finally {
      setRoomImagesLoading(false);
    }
  };

  const handleOpenImageDialog = async (room) => {
    setImageDialogOpen(true);
    setImageDialogRoom(room);
    setImageUploadFiles([]);
    setImageUploadError(null);
    setImageDeleteError(null);
    setIsImageDropActive(false);
    await loadRoomImages(room);
  };

  const handleCloseImageDialog = () => {
    setImageDialogOpen(false);
    setImageDialogRoom(null);
    setRoomImages([]);
    setRoomImagesError(null);
    setRoomImagesLoading(false);
    setImageUploadFiles([]);
    setImageUploadError(null);
    setImageUploadLoading(false);
    setImageDeleteLoadingId(null);
    setImageDeleteError(null);
    setIsImageDropActive(false);
  };

  const handleUploadRoomImage = async () => {
    if (!imageDialogRoom) return;
    if (imageUploadFiles.length === 0) {
      setImageUploadError(t("admin.branches.rooms.selectImageFirst"));
      return;
    }

    setImageUploadLoading(true);
    setImageUploadError(null);

    try {
      for (const [index, file] of imageUploadFiles.entries()) {
        const formData = new FormData();
        formData.append("room_id", String(imageDialogRoom.room_id));
        formData.append("branch_id", String(branchId));
        formData.append("sort_order", String(roomImages.length + index + 1));
        formData.append("is_thumbnail", roomImages.length === 0 && index === 0 ? "true" : "false");
        formData.append("file", file);

        const res = await fetch(`${API_BASE}/room-images/upload`, {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || `HTTP ${res.status}`);
        }
      }

      setImageUploadFiles([]);
      await loadRoomImages(imageDialogRoom);
    } catch (err) {
      setImageUploadError(err.message || t("booking.bookingFailed"));
    } finally {
      setImageUploadLoading(false);
    }
  };

  const handleImageDrop = (event) => {
    event.preventDefault();
    setIsImageDropActive(false);
    const files = Array.from(event.dataTransfer?.files ?? []).filter((file) => file.type?.startsWith("image/"));
    handleImageFileSelect(files);
  };

  const handleDeleteRoomImage = async (imageId) => {
    if (!imageDialogRoom || !imageId) return;

    setImageDeleteLoadingId(imageId);
    setImageDeleteError(null);

    try {
      const res = await fetch(`${API_BASE}/room-images/${imageId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }

      await loadRoomImages(imageDialogRoom);
    } catch (err) {
      setImageDeleteError(err.message || t("booking.bookingFailed"));
    } finally {
      setImageDeleteLoadingId(null);
    }
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

  const handleConfirmDeleteBranchRoom = async () => {
    if (!branchRoomDeleteTarget) return;
    setBranchRoomDeleteLoading(true);
    setBranchRoomDeleteError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/branches/${branchId}/branch-rooms`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branch_room_id: String(branchRoomDeleteTarget.branch_room_id) }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? `HTTP ${res.status}`);
      }
      setBranchRoomDeleteTarget(null);
      fetchStats();
      fetchBranchRooms(page, pageSize);
    } catch (err) {
      setBranchRoomDeleteError(err.message);
    } finally {
      setBranchRoomDeleteLoading(false);
    }
  };

  const normalizedSearch = search.trim().toLowerCase();
  const isRoomsTab = activeTab === "rooms";

  const filteredRooms = rooms.filter((room) => {
    if (!normalizedSearch) return true;
    const amenityNames = Array.isArray(room.amenities) ? room.amenities.map((amenity) => amenity.name) : [];
    return [room.room_type_name, room.price, room.people_number, ...amenityNames]
      .some((value) => String(value ?? "").toLowerCase().includes(normalizedSearch));
  });

  const filteredBranchRooms = branchRooms.filter((room) => {
    if (!normalizedSearch) return true;
    return [room.room_number, room.room_type_name]
      .some((value) => String(value ?? "").toLowerCase().includes(normalizedSearch));
  });

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(248,250,252,0.94))] shadow-sm">
        <div className="bg-[radial-gradient(circle_at_top_left,_rgba(139,92,246,0.12),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.12),_transparent_28%),linear-gradient(180deg,_#ffffff,_#f8fafc)] px-6 py-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-white hover:text-slate-900"
              >
                <ArrowLeft size={15} />
                {t("common.back")}
              </button>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">
                  <BedDouble size={12} />
                  {isRoomsTab ? t("admin.branches.rooms.roomsTab") : t("admin.branches.rooms.branchRoomsTab")}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{branch?.branch_name ?? `Branch #${branchId}`}</h1>
                  <p className="mt-1 text-sm text-slate-500">{branch?.address ?? branch?.location ?? t("admin.branches.rooms.roomType")}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[420px]">
              <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                <label htmlFor="branch-rooms-start-date" className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  <CalendarDays size={13} />
                  {t("admin.branches.rooms.startDate")}
                </label>
                <input
                  id="branch-rooms-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-300"
                />
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                <label htmlFor="branch-rooms-end-date" className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  <CalendarDays size={13} />
                  {t("admin.branches.rooms.endDate")}
                </label>
                <input
                  id="branch-rooms-end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-300"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-slate-200/80 pt-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span>{t("admin.branches.rooms.availableRooms")}: {stats.available_rooms}</span>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
              <button
                onClick={() => {
                  fetchStats();
                  if (isRoomsTab) {
                    fetchRooms(page, pageSize);
                    return;
                  }
                  fetchBranchRooms(page, pageSize);
                }}
                disabled={statsLoading || tableLoading || branchRoomsLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw size={15} className={cn((statsLoading || tableLoading || branchRoomsLoading) && "animate-spin")} />
                {t("common.refresh")}
              </button>
              {isRoomsTab ? (
                <button
                  onClick={() => { setDialogMode("insert"); setDialogData(null); setDialogOpen(true); }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-600"
                >
                  <Plus size={15} />
                  {t("admin.branches.rooms.addRoom")}
                </button>
              ) : (
                <button
                  onClick={() => { setBranchRoomDialogMode("insert"); setBranchRoomDialogData(null); setBranchRoomDialogOpen(true); }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
                >
                  <Plus size={15} />
                  {t("admin.branches.rooms.addBranchRoom")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {hasInvalidDateRange && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          <AlertCircle size={16} /> {t("admin.branches.rooms.invalidDateRange")}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard label={t("admin.branches.rooms.totalRooms")} value={stats.total_rooms} icon={BedDouble} bg="bg-violet-50" iconColor="text-violet-600" loading={statsLoading} />
        <StatCard label={t("admin.branches.rooms.availableRooms")} value={stats.available_rooms} icon={CheckCircle2} bg="bg-emerald-50" iconColor="text-emerald-600" loading={statsLoading} />
        <StatCard label={t("admin.branches.rooms.bookedRooms")} value={stats.booked_rooms} icon={Layers} bg="bg-blue-50" iconColor="text-blue-600" loading={statsLoading} />
        <StatCard label={t("admin.branches.rooms.inUseRooms")} value={stats.in_use_rooms} icon={Hash} bg="bg-amber-50" iconColor="text-amber-600" loading={statsLoading} />
        <StatCard label={t("admin.branches.rooms.unavailableRooms")} value={stats.unavailable_rooms} icon={X} bg="bg-gray-100" iconColor="text-gray-500" loading={statsLoading} />
      </div>

      {statsError && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          <AlertCircle size={16} /> {statsError}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-2">
          {[
            { key: "rooms", label: t("admin.branches.rooms.roomsTab") },
            { key: "branchRooms", label: t("admin.branches.rooms.branchRoomsTab") },
          ].map((tab) => {
            const selected = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  setPage(1);
                  setSearch("");
                }}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-semibold border transition-colors",
                  selected
                    ? "bg-violet-500 text-white border-violet-500"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="px-6 py-4 border-b border-gray-100">
          <div className="relative max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t(isRoomsTab ? "admin.branches.rooms.searchPlaceholder" : "admin.branches.rooms.branchRoomsSearchPlaceholder")}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300 transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isRoomsTab ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center gap-1"><Hash size={11} /> #</div>
                  </th>
                  {[
                    t("admin.branches.rooms.roomType"),
                    t("admin.branches.rooms.amenities"),
                    t("admin.branches.rooms.price"),
                    t("admin.branches.rooms.peopleNumber"),
                    t("admin.branches.rooms.totalRooms"),
                    t("admin.branches.rooms.availableRooms"),
                    t("common.action"),
                  ].map((label, index) => (
                    <th
                      key={label}
                      className={cn(
                        "px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap",
                        index >= 4 && index <= 7 ? "text-center" : "text-left"
                      )}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tableLoading ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <Loader2 size={24} className="animate-spin text-violet-500" />
                        <span className="text-sm">{t("common.loading")}</span>
                      </div>
                    </td>
                  </tr>
                ) : tableError ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-red-400">
                        <AlertCircle size={24} />
                        <span className="text-sm">{tableError}</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredRooms.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-sm text-gray-400">
                      {t("common.noData")}
                    </td>
                  </tr>
                ) : (
                  filteredRooms.map((r, idx) => {
                    const rowNum = (page - 1) * pageSize + idx + 1;
                    const totalRoomCount = Number(r.available_rooms ?? 0) + Number(r.booked_rooms ?? 0) + Number(r.in_use_rooms ?? 0) + Number(r.unavailable_rooms ?? 0);
                    return (
                      <tr key={String(r.room_id)} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-400 font-mono">{rowNum}</td>
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
                        <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                          {r.people_number != null ? `${r.people_number} ${t("common.people")}` : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-4 text-center whitespace-nowrap">
                          <span className="inline-flex min-w-10 items-center justify-center rounded-full bg-violet-50 px-3 py-1 text-sm font-semibold text-violet-700 border border-violet-200">
                            {totalRoomCount}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center whitespace-nowrap">
                          <span className={cn(
                            "inline-flex min-w-10 items-center justify-center rounded-full px-3 py-1 text-sm font-semibold border",
                            Number(r.available_rooms ?? 0) === 0
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          )}>
                            {r.available_rooms ?? 0}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenImageDialog(r)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors whitespace-nowrap"
                            >
                              <ImageIcon size={12} />
                              {t("admin.branches.rooms.viewImages")}
                            </button>
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
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center gap-1"><Hash size={11} /> #</div>
                  </th>
                  {[t("admin.branches.rooms.roomNumber"), t("admin.branches.rooms.roomType"), t("common.status"), t("common.action")].map((label) => (
                    <th key={label} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {branchRoomsLoading ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <Loader2 size={24} className="animate-spin text-violet-500" />
                        <span className="text-sm">{t("common.loading")}</span>
                      </div>
                    </td>
                  </tr>
                ) : branchRoomsError ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-red-400">
                        <AlertCircle size={24} />
                        <span className="text-sm">{branchRoomsError}</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredBranchRooms.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-sm text-gray-400">
                      {t("common.noData")}
                    </td>
                  </tr>
                ) : (
                  filteredBranchRooms.map((room, idx) => {
                    const rowNum = (page - 1) * pageSize + idx + 1;
                    const statusCfg = ROOM_STATUS[room.occupancy_status ?? room.del_flg] ?? ROOM_STATUS[0];
                    return (
                      <tr key={String(room.branch_room_id)} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-400 font-mono">{rowNum}</td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-700 whitespace-nowrap">{room.room_number}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{room.room_type_name ?? <span className="text-gray-300">—</span>}</td>
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
                              onClick={() => { setBranchRoomDialogMode("update"); setBranchRoomDialogData(room); setBranchRoomDialogOpen(true); }}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors whitespace-nowrap"
                            >
                              <Pencil size={12} />
                              {t("common.edit")}
                            </button>
                            <button
                              onClick={() => { setBranchRoomDeleteError(null); setBranchRoomDeleteTarget(room); }}
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
          )}
        </div>

        {!((isRoomsTab ? tableLoading : branchRoomsLoading) || (isRoomsTab ? tableError : branchRoomsError)) && (isRoomsTab ? total : branchRoomsTotal) > 0 && (
          <Pagination
            page={page}
            totalPages={isRoomsTab ? totalPages : branchRoomsTotalPages}
            total={isRoomsTab ? total : branchRoomsTotal}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            loading={isRoomsTab ? tableLoading : branchRoomsLoading}
            t={t}
          />
        )}
      </div>

      {isRoomsTab && (
        <RoomDialog
          open={dialogOpen}
          mode={dialogMode}
          initialData={dialogData}
          branchId={branchId}
          onClose={() => setDialogOpen(false)}
          onSuccess={() => { fetchStats(); fetchRooms(page, pageSize); fetchBranchRooms(page, pageSize); }}
        />
      )}

      {imageDialogOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-2 sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleCloseImageDialog} />
          <div className="relative mx-auto my-2 flex max-h-[calc(100vh-1rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[22px] border border-white/60 bg-white shadow-[0_32px_100px_rgba(15,23,42,0.2)] sm:my-4 sm:max-h-[calc(100vh-2rem)] sm:rounded-[28px]">
            <div className="border-b border-slate-100 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_36%),linear-gradient(180deg,_#ffffff,_#f8fbff)] px-4 py-4 sm:px-6 sm:py-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700 sm:text-xs">
                    <ImageIcon size={12} /> {t("admin.branches.rooms.roomImagesTitle")}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 sm:text-xl">{imageDialogRoom?.room_type_name ?? "-"}</h3>
                    <p className="mt-1 pr-2 text-sm leading-6 text-slate-500">{t("admin.branches.rooms.roomImagesHint")}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-600 sm:px-4 sm:text-sm">
                    <span className="font-semibold text-slate-900">{roomImages.length}</span>
                    <span>{t("admin.branches.rooms.imageCount")}</span>
                  </div>
                  <button onClick={handleCloseImageDialog} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600">
                    <X size={15} />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid min-h-0 flex-1 gap-0 overflow-hidden lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)]">
              <div className="overflow-y-auto border-b border-slate-100 bg-slate-50/70 p-4 sm:p-5 lg:border-b-0 lg:border-r lg:border-slate-100 lg:p-6">
                <div className="rounded-[20px] border border-sky-100 bg-white p-4 shadow-sm sm:rounded-[24px] sm:p-5">
                  <div className="mb-4 space-y-1">
                    <h4 className="text-sm font-semibold text-slate-900">{t("admin.branches.rooms.uploadImageTitle")}</h4>
                    <p className="text-sm leading-6 text-slate-500">{t("admin.branches.rooms.uploadImageHint")}</p>
                  </div>

                  <label
                    htmlFor="room-image-upload-input"
                    onDragOver={(event) => {
                      event.preventDefault();
                      setIsImageDropActive(true);
                    }}
                    onDragLeave={() => setIsImageDropActive(false)}
                    onDrop={handleImageDrop}
                    className={cn(
                      "group flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-[20px] border border-dashed px-4 py-6 text-center transition-all sm:min-h-[220px] sm:rounded-[22px] sm:px-6 sm:py-8",
                      isImageDropActive
                        ? "border-sky-400 bg-sky-50 shadow-[0_0_0_6px_rgba(14,165,233,0.08)]"
                        : "border-sky-200 bg-[linear-gradient(180deg,_rgba(240,249,255,0.9),_rgba(255,255,255,1))] hover:border-sky-300 hover:bg-sky-50/80"
                    )}
                  >
                    <input
                      id="room-image-upload-input"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(event) => handleImageFileSelect(Array.from(event.target.files ?? []))}
                      className="hidden"
                    />
                    <div className={cn(
                      "mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition-colors",
                      isImageDropActive ? "bg-sky-500 text-white" : "bg-sky-100 text-sky-700 group-hover:bg-sky-500 group-hover:text-white"
                    )}>
                      <UploadCloud size={28} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-slate-900 sm:text-base">{t("admin.branches.rooms.dropImageHere")}</p>
                      <p className="text-sm text-slate-500">{t("admin.branches.rooms.dropImageSubtext")}</p>
                    </div>
                  </label>

                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{t("admin.branches.rooms.selectedFileLabel")}</p>
                      <p className="mt-1 truncate text-sm font-medium text-slate-700">
                        {imageUploadFiles.length === 0
                          ? t("admin.branches.rooms.noFileSelected")
                          : imageUploadFiles.length === 1
                            ? imageUploadFiles[0].name
                            : `${imageUploadFiles.length} ảnh đã chọn`}
                      </p>
                    </div>
                    <button
                      onClick={handleUploadRoomImage}
                      disabled={imageUploadLoading}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-600 disabled:opacity-60"
                    >
                      {imageUploadLoading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                      {t("admin.branches.rooms.addImage")}
                    </button>
                  </div>

                  {imageUploadError && (
                    <div className="mt-4 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
                      <AlertCircle size={15} /> {imageUploadError}
                    </div>
                  )}
                </div>
              </div>

              <div className="min-h-0 overflow-y-auto bg-white p-4 sm:p-5 lg:p-6">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{t("admin.branches.rooms.gallerySectionTitle")}</h4>
                    <p className="mt-1 text-sm text-slate-500">{t("admin.branches.rooms.gallerySectionHint")}</p>
                  </div>
                  <div className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 sm:hidden">
                    <span className="text-slate-900">{roomImages.length}</span>
                    <span>{t("admin.branches.rooms.imageCount")}</span>
                  </div>
                </div>

                {imageDeleteError && (
                  <div className="mb-4 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    <AlertCircle size={16} /> {imageDeleteError}
                  </div>
                )}

                {roomImagesLoading ? (
                  <div className="py-20 text-center text-sm text-gray-400">
                    <span className="inline-flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> {t("common.loading")}</span>
                  </div>
                ) : roomImagesError ? (
                  <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    <AlertCircle size={16} /> {roomImagesError}
                  </div>
                ) : roomImages.length === 0 ? (
                  <div className="flex min-h-[240px] flex-col items-center justify-center rounded-[20px] border border-dashed border-slate-200 bg-slate-50/70 px-5 text-center sm:min-h-[320px] sm:rounded-[24px] sm:px-6">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200/70 text-slate-500">
                      <ImageIcon size={26} />
                    </div>
                    <p className="text-base font-semibold text-slate-800">{t("admin.branches.rooms.noImages")}</p>
                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{t("admin.branches.rooms.emptyGalleryHint")}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {roomImages.map((image) => (
                      <div key={image._id || image.id} className="group overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                          <RoomImagePreview imageUrl={image.image_url} alt={imageDialogRoom?.room_type_name || "room"} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
                          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
                            <span className="rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">#{image.sort_order ?? 1}</span>
                            <div className="flex items-center gap-2">
                              {image.is_thumbnail && (
                                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
                                  {t("admin.branches.rooms.thumbnail")}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteRoomImage(image._id || image.id)}
                                disabled={imageDeleteLoadingId === (image._id || image.id)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-200 bg-white/90 text-red-500 shadow-sm transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                aria-label={t("common.delete")}
                              >
                                {imageDeleteLoadingId === (image._id || image.id) ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="px-4 py-3">
                          <p className="truncate text-sm font-medium text-slate-700">{imageDialogRoom?.room_type_name || "-"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 px-4 py-4 sm:px-6">
              <button onClick={handleCloseImageDialog} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 sm:w-auto sm:py-2">{t("common.close")}</button>
            </div>
          </div>
        </div>
      )}

      {!isRoomsTab && (
        <BranchRoomDialog
          open={branchRoomDialogOpen}
          mode={branchRoomDialogMode}
          initialData={branchRoomDialogData}
          branchId={branchId}
          roomOptions={roomOptions}
          onClose={() => setBranchRoomDialogOpen(false)}
          onSuccess={() => { fetchBranchRooms(page, pageSize); fetchStats(); }}
        />
      )}

      {/* Delete confirm */}
      {isRoomsTab && deleteTarget && (
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
                  {t("admin.branches.rooms.roomType")}: {deleteTarget.room_type_name ?? "—"}
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

      {!isRoomsTab && branchRoomDeleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !branchRoomDeleteLoading && setBranchRoomDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-auto p-6 flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">{t("admin.branches.rooms.deleteBranchRoom")}</h3>
                <p className="text-sm text-gray-500 mt-1">{t("admin.branches.rooms.deleteBranchRoomConfirm")}</p>
                <p className="text-sm font-semibold text-gray-800 mt-2">
                  {t("admin.branches.rooms.roomNumber")}: {branchRoomDeleteTarget.room_number}
                </p>
              </div>
            </div>
            {branchRoomDeleteError && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                <AlertCircle size={15} /> {branchRoomDeleteError}
              </div>
            )}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setBranchRoomDeleteTarget(null)}
                disabled={branchRoomDeleteLoading}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleConfirmDeleteBranchRoom}
                disabled={branchRoomDeleteLoading}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl disabled:opacity-60 transition-colors"
              >
                {branchRoomDeleteLoading && <Loader2 size={14} className="animate-spin" />}
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
