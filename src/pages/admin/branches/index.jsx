import React, { useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  GitBranch,
  BedDouble,
  Star,
  MapPin,
} from "lucide-react";
import { useLanguage } from "@/utils/LanguageContext";
import { cn } from "@/lib/utils";

const SAMPLE_BRANCHES = [
  { id: 1, name: "Aurora Hotel - Cần Thơ", address: "36 Hai Bà Trưng, Ninh Kiều", city: "Cần Thơ", phone: "0292 3812 345", email: "cantho@aurora.vn", manager: "Trần Thị Mai", totalRooms: 48, availableRooms: 12, rating: 4.7, openDate: "15/01/2020", status: "active", description: "Chi nhánh đầu tiên của Aurora Hotel tại vùng sông nước miền Tây." },
  { id: 2, name: "Aurora Hotel - TP.HCM", address: "123 Lê Lai, Bến Thành, Q.1", city: "TP. Hồ Chí Minh", phone: "028 3829 1234", email: "hcm@aurora.vn", manager: "Nguyễn Quốc Hùng", totalRooms: 72, availableRooms: 8, rating: 4.9, openDate: "01/03/2018", status: "active", description: "Chi nhánh lớn nhất tại trung tâm thành phố Hồ Chí Minh." },
  { id: 3, name: "Aurora Hotel - Hà Nội", address: "45 Phan Đình Phùng, Ba Đình", city: "Hà Nội", phone: "024 3845 6789", email: "hanoi@aurora.vn", manager: "Lê Minh Phương", totalRooms: 60, availableRooms: 15, rating: 4.6, openDate: "10/06/2019", status: "active", description: "Chi nhánh tại thủ đô với kiến trúc Đông Dương độc đáo." },
  { id: 4, name: "Aurora Hotel - Đà Nẵng", address: "89 Bạch Đằng, Hải Châu", city: "Đà Nẵng", phone: "0236 3921 456", email: "danang@aurora.vn", manager: "Hoàng Minh Tuấn", totalRooms: 54, availableRooms: 20, rating: 4.8, openDate: "20/09/2020", status: "active", description: "Chi nhánh ven biển Mỹ Khê với tầm nhìn biển tuyệt đẹp." },
  { id: 5, name: "Aurora Hotel - Vũng Tàu", address: "12 Trần Phú, TP. Vũng Tàu", city: "Vũng Tàu", phone: "0254 3812 789", email: "vungtau@aurora.vn", manager: "Vũ Thị Hương", totalRooms: 36, availableRooms: 10, rating: 4.5, openDate: "05/04/2022", status: "active", description: "Chi nhánh resort tại bãi biển Vũng Tàu." },
];

const EMPTY_FORM = { name: "", address: "", city: "", phone: "", email: "", manager: "", totalRooms: "", description: "", status: "active" };

const AdminBranches = () => {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [branches, setBranches] = useState(SAMPLE_BRANCHES);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const filtered = branches.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.city.toLowerCase().includes(search.toLowerCase()) ||
    b.address.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (item) => { setEditItem(item); setForm({ ...item }); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditItem(null); };

  const handleSave = () => {
    if (editItem) {
      setBranches((prev) => prev.map((b) => (b.id === editItem.id ? { ...b, ...form } : b)));
    } else {
      setBranches((prev) => [...prev, { ...form, id: Date.now(), availableRooms: 0, rating: 0, openDate: new Date().toLocaleDateString("vi-VN") }]);
    }
    closeModal();
  };

  const handleDelete = () => {
    setBranches((prev) => prev.filter((b) => b.id !== deleteId));
    setDeleteId(null);
  };

  const totalRooms = branches.reduce((s, b) => s + Number(b.totalRooms), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t("admin.branches.title")}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{t("admin.branches.subtitle")}</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors">
          <Plus size={16} /> {t("admin.branches.addBranch")}
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: t("admin.branches.totalBranches"), value: branches.length, icon: GitBranch, bg: "bg-violet-50", text: "text-violet-600" },
          { label: t("admin.branches.activeBranches"), value: branches.filter((b) => b.status === "active").length, icon: GitBranch, bg: "bg-emerald-50", text: "text-emerald-600" },
          { label: t("admin.branches.totalRoomsAll"), value: totalRooms, icon: BedDouble, bg: "bg-blue-50", text: "text-blue-600" },
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

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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

        {/* Branch cards grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <p className="col-span-full text-center py-10 text-sm text-gray-400">{t("common.noData")}</p>
          ) : filtered.map((b) => (
            <div
              key={b.id}
              className="group border border-gray-100 rounded-2xl p-5 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelectedBranch(b)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 truncate">{b.name}</h4>
                  <div className="flex items-center gap-1 mt-1 text-gray-400">
                    <MapPin size={12} />
                    <span className="text-xs truncate">{b.city}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 ml-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); openEdit(b); }}
                    className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteId(b.id); }}
                    className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                  <p className="text-base font-bold text-gray-800">{b.totalRooms}</p>
                  <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{t("admin.branches.totalRooms")}</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-2.5 text-center">
                  <p className="text-base font-bold text-emerald-700">{b.availableRooms}</p>
                  <p className="text-[10px] text-emerald-500 leading-tight mt-0.5">{t("admin.branches.availableRooms")}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-2.5 text-center">
                  <div className="flex items-center justify-center gap-0.5">
                    <Star size={11} className="text-amber-500 fill-amber-500" />
                    <p className="text-base font-bold text-amber-700">{b.rating}</p>
                  </div>
                  <p className="text-[10px] text-amber-500 leading-tight mt-0.5">{t("admin.branches.rating")}</p>
                </div>
              </div>

              <div className="space-y-1 text-xs text-gray-500">
                <p className="truncate"><span className="font-medium text-gray-600">{t("admin.branches.manager")}:</span> {b.manager}</p>
                <p className="truncate"><span className="font-medium text-gray-600">{t("admin.branches.phone")}:</span> {b.phone}</p>
              </div>

              {/* Occupancy bar */}
              <div className="mt-3">
                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                  <span>Lấp đầy</span>
                  <span>{Math.round(((b.totalRooms - b.availableRooms) / b.totalRooms) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-teal-400 h-1.5 rounded-full"
                    style={{ width: `${((b.totalRooms - b.availableRooms) / b.totalRooms) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Branch detail modal */}
      {selectedBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedBranch(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-base font-bold text-gray-900">{selectedBranch.name}</h3>
              <button onClick={() => setSelectedBranch(null)} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50"><X size={15} /></button>
            </div>
            <div className="p-6 space-y-3 text-sm text-gray-600">
              <p><span className="font-semibold text-gray-800">{t("admin.branches.address")}:</span> {selectedBranch.address}, {selectedBranch.city}</p>
              <p><span className="font-semibold text-gray-800">{t("admin.branches.phone")}:</span> {selectedBranch.phone}</p>
              <p><span className="font-semibold text-gray-800">{t("admin.branches.email")}:</span> {selectedBranch.email}</p>
              <p><span className="font-semibold text-gray-800">{t("admin.branches.manager")}:</span> {selectedBranch.manager}</p>
              <p><span className="font-semibold text-gray-800">{t("admin.branches.openDate")}:</span> {selectedBranch.openDate}</p>
              <p><span className="font-semibold text-gray-800">{t("admin.branches.description")}:</span> {selectedBranch.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">{editItem ? t("admin.branches.editBranch") : t("admin.branches.addBranch")}</h3>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50"><X size={15} /></button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: t("admin.branches.branchName"), field: "name" },
                { label: t("admin.branches.address"), field: "address" },
                { label: t("admin.branches.city"), field: "city" },
                { label: t("admin.branches.phone"), field: "phone" },
                { label: t("admin.branches.email"), field: "email" },
                { label: t("admin.branches.manager"), field: "manager" },
                { label: t("admin.branches.totalRooms"), field: "totalRooms" },
                { label: t("admin.branches.description"), field: "description", textarea: true },
              ].map(({ label, field, textarea }) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
                  {textarea ? (
                    <textarea value={form[field] || ""} onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))} rows={3} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none transition" />
                  ) : (
                    <input type="text" value={form[field] || ""} onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 transition" />
                  )}
                </div>
              ))}
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
            <h3 className="text-base font-bold text-gray-900">{t("admin.branches.deleteBranch")}</h3>
            <p className="text-sm text-gray-500">{t("admin.branches.deleteConfirm")}</p>
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

export default AdminBranches;
