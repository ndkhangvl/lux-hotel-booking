import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import API_BASE from "@/utils/api";
import { ACCESS_TOKEN } from "@/utils/constant";
import { Clock, MapPin, Search, Calendar, CreditCard, ChevronRight } from "lucide-react";

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price || 0);

const getStatusBadge = (status) => {
  const norm = (status || "").toLowerCase();
  if (norm === "completed" || norm === "checked-out") 
     return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">Hoàn tất</span>;
  if (norm === "checked-in")
     return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">Đang ở</span>;
  if (norm === "confirmed")
     return <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">Đã xác nhận</span>;
  if (norm === "cancelled")
     return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">Đã hủy</span>;
  
  return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">Chờ duyệt</span>;
};

export const UserBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem(ACCESS_TOKEN);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchBookings = async () => {
      try {
        const res = await fetch(`${API_BASE}/bookings/user/me`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error("Không thể lấy danh sách đặt phòng");
        const data = await res.json();
        setBookings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [token]);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 flex flex-col">
      <main className="flex-1 container mx-auto px-4 lg:px-8 max-w-5xl">
         <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Lịch sử đặt phòng</h1>
            <p className="text-slate-500">Xem và quản lý các danh sách phòng bạn đã đặt.</p>
         </div>

         {loading ? (
           <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#52DBA9]"></div>
           </div>
         ) : error ? (
           <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 text-center font-medium">
             {error}
           </div>
         ) : bookings.length === 0 ? (
           <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center shadow-sm">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-slate-400" />
             </div>
             <h3 className="text-lg font-bold text-slate-800 mb-2">Chưa có chuyến đi nào</h3>
             <p className="text-slate-500 mb-6">Bạn chưa đặt phòng nào tại Aurora Hotel. Hãy bắt đầu khám phá các chi nhánh của chúng tôi.</p>
             <Link to="/branches" className="bg-[#52DBA9] hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md active:translate-y-0.5 inline-block">
                Khám phá ngay
             </Link>
           </div>
         ) : (
           <div className="space-y-6">
             {bookings.map((bkg) => (
               <div key={bkg.booking_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                 <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
                   {/* Left Col - Context */}
                   <div className="flex-1">
                     <div className="flex items-center gap-3 mb-4">
                       {getStatusBadge(bkg.status)}
                       <span className="text-sm font-semibold text-slate-400">#{bkg.booking_code}</span>
                     </div>
                     <h2 className="text-xl font-bold text-slate-900 mb-2">{bkg.room_type_name}</h2>
                     <div className="flex items-center gap-2 text-slate-600 text-sm mb-4">
                       <MapPin className="w-4 h-4 text-emerald-600" />
                       <span>{bkg.branch_name} • Phòng {bkg.room_number || "Chưa xếp"}</span>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div>
                          <p className="text-xs text-slate-400 font-semibold mb-1 uppercase tracking-wider">Nhận phòng</p>
                          <p className="font-bold text-slate-800">{new Date(bkg.from_date).toLocaleDateString("vi-VN")}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-semibold mb-1 uppercase tracking-wider">Trả phòng</p>
                          <p className="font-bold text-slate-800">{new Date(bkg.to_date).toLocaleDateString("vi-VN")}</p>
                        </div>
                     </div>
                   </div>

                   {/* Right Col - Price & Actions */}
                   <div className="md:w-64 flex flex-col justify-between md:items-end border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-6">
                     <div className="text-left md:text-right mb-4 md:mb-0">
                       <p className="text-sm text-slate-500 font-medium mb-1">Tổng chi phí</p>
                       <p className="text-2xl font-black text-[#52DBA9]">{formatPrice(bkg.total_price)}</p>
                       <div className="mt-2 flex items-center justify-start md:justify-end gap-1.5">
                         {bkg.payment_status === "paid" ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full"><CreditCard className="w-3.5 h-3.5" /> Đã thanh toán</span>
                         ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full"><Clock className="w-3.5 h-3.5" /> Chưa thanh toán</span>
                         )}
                       </div>
                     </div>
                     
                     {/* Call to actions */}
                     <Link to={`/rooms/${bkg.room_id}`} className="mt-auto w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold py-3 px-4 rounded-xl transition-colors">
                        Xem chi tiết phòng <ChevronRight className="w-4 h-4" />
                     </Link>
                   </div>
                 </div>
               </div>
             ))}
           </div>
         )}
      </main>
    </div>
  );
};
