import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  CalendarCheck,
  Users,
  GitBranch,
  DollarSign,
  ArrowUpRight,
} from "lucide-react";
import { useLanguage } from "@/utils/LanguageContext";
import { cn } from "@/lib/utils";
import dashboardApi from "@/api/DashboardApi";

const MAP_ICONS = {
  "admin.dashboard.totalRevenue": { icon: DollarSign, color: "from-emerald-500 to-teal-400", bg: "bg-emerald-50", iconColor: "text-emerald-600" },
  "admin.dashboard.totalBookings": { icon: CalendarCheck, color: "from-blue-500 to-cyan-400", bg: "bg-blue-50", iconColor: "text-blue-600" },
  "admin.dashboard.totalBranches": { icon: GitBranch, color: "from-violet-500 to-purple-400", bg: "bg-violet-50", iconColor: "text-violet-600" },
  "admin.dashboard.totalAccounts": { icon: Users, color: "from-orange-500 to-amber-400", bg: "bg-orange-50", iconColor: "text-orange-600" }
};

const statusConfig = {
  pending: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  confirmed: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  checkedIn: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  checkedOut: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
  cancelled: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
};

const AdminDashboard = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [topBranches, setTopBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardApi.getStats();
        setStats(response?.stats || []);
        setRecentBookings(response?.recentBookings || []);
        setTopBranches(response?.topBranches || []);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t("admin.dashboard.title")}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{t("admin.dashboard.subtitle")}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {(stats || []).map(({ key, value, change, up }) => {
          const { icon: Icon, bg, iconColor } = MAP_ICONS[key] || MAP_ICONS["admin.dashboard.totalBookings"];
          return (
            <div key={key} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", bg)}>
                  <Icon size={20} className={iconColor} />
                </div>
                <span className={cn("flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full", up ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")}>
                  {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {change}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{t(key)}</p>
                <p className="text-xs text-gray-400 mt-1">{t("admin.dashboard.vsLastMonth")}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom grid: Recent Bookings + Top Branches */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Recent Bookings */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">{t("admin.dashboard.recentBookings")}</h3>
            <button className="flex items-center gap-1 text-xs text-emerald-600 font-semibold hover:underline">
              {t("common.viewAll")} <ArrowUpRight size={13} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-50">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t("admin.dashboard.bookingId")}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t("admin.dashboard.guest")}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">{t("admin.dashboard.branch")}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">{t("admin.dashboard.checkIn")}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t("admin.dashboard.amount")}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t("common.status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(recentBookings || []).map((b) => {
                  const cfg = statusConfig[b.status];
                  return (
                    <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3.5 text-sm font-mono font-semibold text-gray-800">{b.id}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-700 font-medium">{b.guest}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-500 hidden md:table-cell">{b.branch}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-500 hidden lg:table-cell">{b.checkIn}</td>
                      <td className="px-4 py-3.5 text-sm font-semibold text-gray-800">{b.amount}</td>
                      <td className="px-4 py-3.5">
                        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", cfg.bg, cfg.text)}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
                          {t(`admin.dashboard.${b.status}`)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Branches */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">{t("admin.dashboard.topBranches")}</h3>
            <button className="flex items-center gap-1 text-xs text-emerald-600 font-semibold hover:underline">
              {t("common.viewAll")} <ArrowUpRight size={13} />
            </button>
          </div>
          <div className="p-6 space-y-5">
            {(topBranches || []).map((b, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="text-sm font-medium text-gray-800 truncate max-w-[140px]">{b.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-600">{b.revenue}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-teal-400 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${b.fill}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{b.bookings} {t("admin.dashboard.totalBookings").toLowerCase()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
