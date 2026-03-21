import React, { useEffect, useState, useMemo } from "react";
import {
  List,
  Search,
  Loader2,
  Calendar,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import API_BASE from "@/utils/api";

const actionConfig = {
  CREATE: { bg: "bg-emerald-100", text: "text-emerald-700" },
  UPDATE: { bg: "bg-blue-100", text: "text-blue-700" },
  DELETE: { bg: "bg-red-100", text: "text-red-700" },
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN");
};

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters
  const [keyword, setKeyword] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  
  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const loadLogs = async () => {
    setLoading(true);
    setError("");
    try {
      let url = `${API_BASE}/admin/audits/?page=${page}&page_size=${pageSize}`;
      if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
      if (actionFilter !== "all") url += `&action=${actionFilter}`;
      if (entityFilter !== "all") url += `&entity_type=${entityFilter}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Không thể tải lịch sử thao tác");
      const data = await res.json();
      setLogs(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      setError(err.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page, actionFilter, entityFilter]); 
  
  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) {
        setPage(1); // loadLogs will run due to page change
      } else {
        loadLogs();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lịch sử thao tác</h2>
          <p className="text-sm text-gray-500 mt-0.5">Theo dõi lịch sử chỉnh sửa dữ liệu hệ thống</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-3 px-6 py-4 border-b border-gray-100">
          <div className="relative col-span-1 sm:col-span-2">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              value={keyword} 
              onChange={(e) => setKeyword(e.target.value)} 
              placeholder="Tìm kiếm theo mã, tin nhắn, người dùng..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 transition" 
            />
          </div>
          <div className="relative">
            <select 
              value={actionFilter} 
              onChange={(e) => setActionFilter(e.target.value)} 
              className="w-full appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white text-gray-700 cursor-pointer"
            >
              <option value="all">Tất cả thao tác</option>
              <option value="CREATE">Tạo mới (CREATE)</option>
              <option value="UPDATE">Cập nhật (UPDATE)</option>
              <option value="DELETE">Xóa (DELETE)</option>
            </select>
            <Filter size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select 
              value={entityFilter} 
              onChange={(e) => setEntityFilter(e.target.value)} 
              className="w-full appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white text-gray-700 cursor-pointer"
            >
              <option value="all">Tất cả dữ liệu</option>
              <option value="booking">Đặt phòng (Booking)</option>
              <option value="branch">Cơ sở (Branch)</option>
              <option value="room">Phòng (Room)</option>
              <option value="user">Người dùng (User)</option>
            </select>
            <Filter size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Thời gian</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Người dùng</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Thao tác</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Chi tiết</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Thông điệp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="py-10 text-center text-sm text-gray-400"><span className="inline-flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Đang tải...</span></td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="py-10 text-center text-sm text-gray-400">Không có dữ liệu</td></tr>
              ) : logs.map((log) => {
                const actStyle = actionConfig[log.action] || { bg: "bg-gray-100", text: "text-gray-700" };
                return (
                  <tr key={log._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(log.event_time)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-800">
                        {log.actor?.name || log.actor?.role || "System"}
                      </div>
                      {typeof log.actor?.user_id === "string" && (
                        <div className="text-xs text-gray-400 font-mono">
                          {log.actor.user_id.slice(0, 8)}...
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-1 rounded-md text-xs font-bold", actStyle.bg, actStyle.text)}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-gray-700">
                        {log.entity_type.toUpperCase()}
                      </div>
                      {log.branch_code && (
                        <div className="text-xs text-gray-500">
                          CN: {log.branch_code}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {log.result?.message || log.business_context?.reason || "Hoàn thành"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Hiển thị trang <span className="font-semibold">{page}</span> / <span className="font-semibold">{totalPages}</span> 
            (Tổng {total} bản ghi)
          </p>
          <div className="flex gap-2">
            <button 
              disabled={page <= 1} 
              onClick={() => setPage(p => p - 1)}
              className="p-1 px-3 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft size={16} className="inline mr-1" /> Trước
            </button>
            <button 
              disabled={page >= totalPages} 
              onClick={() => setPage(p => p + 1)}
              className="p-1 px-3 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
            >
              Sau <ChevronRight size={16} className="inline ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogs;
