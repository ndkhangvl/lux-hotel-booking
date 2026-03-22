import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import API_BASE from "@/utils/api";
import { ACCESS_TOKEN } from "@/utils/constant";
import { Star, ChevronLeft, MapPin, Users, Tag, UserCircle } from "lucide-react";

// Mock Customer for now
const MOCK_CUSTOMER = {
  user_id: "test-user-dev",
  name: "Khách Viếng Thăm",
};

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price || 0);

const RoomDetailPage = () => {
  const { roomId } = useParams();
  
  const [room, setRoom] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Review Form
  const [rating, setRating] = useState({ overall: 5, cleanliness: 5, service: 5, location: 5 });
  const [comment, setComment] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestContact, setGuestContact] = useState(""); // Email or Phone
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const token = localStorage.getItem(ACCESS_TOKEN);

  const fetchRoomData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch Room
      const resRoom = await fetch(`${API_BASE}/user/rooms/${roomId}`);
      if (resRoom.ok) {
        const dataRoom = await resRoom.json();
        setRoom(dataRoom);
      }
      // Fetch Reviews
      const resReviews = await fetch(`${API_BASE}/reviews/room/${roomId}`);
      if (resReviews.ok) {
        const dataReviews = await resReviews.json();
        setReviews(dataReviews);
      }
    } catch (error) {
      console.error("Failed to load room details:", error);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    if (roomId) fetchRoomData();
  }, [roomId, fetchRoomData]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setSubmitError("Vui lòng nhập bình luận đánh giá");
      return;
    }
    
    if (!token && (!guestName.trim() || !guestContact.trim())) {
      setSubmitError("Vui lòng nhập Tên và (Email/Số điện thoại) để xác thực bạn đã từng đặt phòng.");
      return;
    }
    
    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");
    
    const isEmail = guestContact.includes("@");
    
    const payload = {
      branch_code: room?.branch_code || "Unknown",
      booking_id: "mock-booking-" + Math.floor(Math.random() * 1000000),
      room_id: roomId,
      customer: {
         user_id: null,
         name: guestName || "Guest",
         email: isEmail ? guestContact : null,
         phone: !isEmail ? guestContact : null
      },
      booking_info: {
        booking_code: "BKG-MOCK-123",
        room_type_name: room?.room_type_name || "Unknown Room",
        room_number: "TBD",
        check_in_date: new Date().toISOString(),
        check_out_date: new Date(Date.now() + 86400000).toISOString(),
        total_nights: 1,
        traveler_type: "Couple"
      },
      rating,
      comment,
      attached_images: []
    };

    try {
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      
      const res = await fetch(`${API_BASE}/reviews/`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });
      
      const responseData = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        throw new Error(responseData.detail || "Lỗi khi gửi đánh giá");
      }
      
      setSubmitSuccess("Đánh giá của bạn đã được gửi thành công!");
      setComment("");
      if (!token) {
         setGuestName("");
         setGuestContact("");
      }
      setRating({ overall: 5, cleanliness: 5, service: 5, location: 5 });
      
      // Refresh reviews
      fetchRoomData();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Đang tải...</div>;
  if (!room) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"><p className="text-slate-500">Phòng không tồn tại hoặc đã bị xóa</p><Link to="/branches" className="block text-center mt-4 text-[#52DBA9] font-bold">Quay lại danh sách</Link></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-20">
      {/* Header Info Banner */}
      <div className="bg-slate-900 py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <Link to={`/branches/${room.branch_code}`} className="inline-flex items-center gap-1 text-slate-300 hover:text-white mb-6 text-sm font-semibold">
            <ChevronLeft className="w-4 h-4" /> Quay lại {room.branch_name || room.branch_code}
          </Link>
          <h1 className="text-4xl font-bold text-white mb-3">{room.room_type_name}</h1>
          <div className="flex flex-wrap items-center gap-5 text-slate-300 text-sm">
             <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Chi nhánh: {room.branch_name || room.branch_code}</span>
             <span className="inline-flex items-center gap-1.5"><Users className="w-4 h-4" /> Sức chứa: {room.people_number || 2} người</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-10 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transition-all hover:shadow-md">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Mô tả phòng</h2>
              <p className="text-slate-600 leading-relaxed mb-6 whitespace-pre-wrap">
                {room.description || "Phòng nghỉ được thiết kế hiện đại, đầy đủ tiện nghi, mang đến cho bạn cảm giác thoải mái nhất trong suốt kỳ lưu trú tại khách sạn của chúng tôi. Với tầm nhìn tuyệt vời và dịch vụ hàng đầu, đây sẽ là lựa chọn hoàn hảo."}
              </p>
              
              <h3 className="font-bold text-slate-800 mb-3">Tiện ích bao gồm</h3>
              <div className="flex flex-wrap gap-2">
                {(room.room_amenities || []).map((amenity, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-800 border border-emerald-100">
                     {amenity.icon_url ? <img src={amenity.icon_url} alt="" className="w-4 h-4" /> : <Tag className="w-3.5 h-3.5 text-emerald-600" />}
                     {amenity.name}
                  </span>
                ))}
                {(!room.room_amenities || room.room_amenities.length === 0) && (
                   <span className="text-sm text-slate-400">Không có thông tin tiện ích</span>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transition-all hover:shadow-md">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span>Đánh giá từ khách hàng</span>
                <span className="bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full text-sm">{reviews.length}</span>
              </h2>
              
              {reviews.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                  <Star className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 font-semibold mb-1">Chưa có đánh giá nào</p>
                  <p className="text-sm text-slate-400">Hãy là người đầu tiên đánh giá phòng này.</p>
                </div>
              ) : (
                <div className="space-y-6 mb-8">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="border border-gray-100 p-5 rounded-2xl bg-white shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {rev.customer?.avatar_url ? (
                             <img src={rev.customer.avatar_url} alt="avatar" className="w-10 h-10 rounded-full border border-gray-100" />
                          ) : (
                             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-[#52DBA9] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                               {rev.customer?.name ? rev.customer.name[0].toUpperCase() : "U"}
                             </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-800">{rev.customer?.name}</p>
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                               Đã đăng lúc {new Date(rev.created_at).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full text-amber-600 font-bold text-sm">
                          <Star className="w-4 h-4 fill-current" />
                          {rev.rating?.overall}/5
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">{rev.comment}</p>
                      
                      {rev.hotel_reply && (
                        <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100 relative">
                          <div className="absolute -top-2 left-6 w-4 h-4 bg-slate-50 border-t border-l border-slate-100 rotate-45" />
                          <p className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">Phản hồi từ {rev.hotel_reply.replied_by_name}:</p>
                          <p className="text-sm text-slate-600">{rev.hotel_reply.content}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Review Form */}
              <div className="pt-6 border-t border-gray-100 mt-8">
                <h3 className="font-bold text-slate-800 mb-5 text-lg">Viết đánh giá của bạn</h3>
                
                {submitSuccess && (
                  <div className="mb-5 p-4 bg-emerald-50 text-emerald-800 rounded-xl text-sm border border-emerald-100 flex items-center gap-2 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {submitSuccess}
                  </div>
                )}
                {submitError && (
                  <div className="mb-5 p-4 bg-red-50 text-red-800 rounded-xl text-sm border border-red-100 flex items-center gap-2 font-medium">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    {submitError}
                  </div>
                )}

                <form onSubmit={handleSubmitReview} className="space-y-5 bg-slate-50 border border-slate-100 p-6 rounded-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {["overall", "cleanliness", "service", "location"].map((metric) => (
                      <div key={metric} className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                        <span className="text-sm font-semibold text-slate-700 capitalize">
                          {metric === "overall" ? "Tổng quan" : metric === "cleanliness" ? "Sạch sẽ" : metric === "service" ? "Dịch vụ" : "Vị trí"}
                        </span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setRating({...rating, [metric]: star})}
                              className={`transition-colors transform active:scale-90 ${star <= rating[metric] ? "text-amber-400 drop-shadow-sm" : "text-slate-200"}`}
                            >
                              <Star className="w-6 h-6 fill-current" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {!token && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Tên của bạn</label>
                        <input 
                          type="text"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="Nguyễn Văn A"
                          className="w-full p-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#52DBA9] focus:ring-4 focus:ring-[#52DBA9]/20 text-sm transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Email hoặc Số điện thoại</label>
                        <input 
                          type="text"
                          value={guestContact}
                          onChange={(e) => setGuestContact(e.target.value)}
                          placeholder="Dùng để xác thực đặt phòng"
                          className="w-full p-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#52DBA9] focus:ring-4 focus:ring-[#52DBA9]/20 text-sm transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Chia sẻ trải nghiệm của bạn</label>
                    <textarea 
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Trải nghiệm của bạn đáng giá bao nhiêu sao?"
                      className="w-full p-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#52DBA9] focus:ring-4 focus:ring-[#52DBA9]/20 resize-none min-h-[120px] text-sm transition-all"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full md:w-auto bg-[#52DBA9] hover:bg-emerald-500 text-white font-bold py-3.5 px-8 rounded-xl transition-colors disabled:opacity-50 shadow-md shadow-emerald-500/20 active:translate-y-0.5"
                  >
                    {submitting ? "Đang gửi..." : "Gửi đánh giá ngay"}
                  </button>
                </form>
              </div>

            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl shadow-slate-200/50 sticky top-24">
               {room.images && room.images.length > 0 ? (
                 <div className="relative mb-6 rounded-2xl overflow-hidden group">
                   <img src={room.images[0].url} alt="Room cover" className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110" />
                   <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-bold px-3 py-1.5 rounded-full text-slate-800 shadow-sm border border-white/50">
                     {room.room_type_name}
                   </div>
                 </div>
               ) : (
                 <div className="w-full h-56 bg-slate-100 flex items-center justify-center rounded-2xl mb-6 text-slate-400 italic">Chưa có ảnh mô tả</div>
               )}
               <p className="text-sm font-semibold text-slate-500 mb-1">Giá mỗi đêm từ</p>
               <p className="text-3xl font-black text-(--main) mb-6">{formatPrice(room.price)}</p>
               
               <Link
                 to={`/booking?branchId=${room.branch_code}&roomId=${room.room_id}`}
                 className="block w-full text-center bg-(--main) hover:bg-emerald-500 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-[#52DBA9]/30 hover:shadow-xl hover:shadow-[#52DBA9]/40 active:translate-y-0.5 mb-4 text-base"
               >
                 Đặt phòng ngay
               </Link>
               <div className="text-center rounded-lg bg-emerald-50 py-3 border border-emerald-100">
                 <p className="text-sm font-medium text-emerald-800">✅ Không cần thẻ tín dụng</p>
                 <p className="text-xs text-emerald-600 mt-1 flex justify-center items-center gap-1">Hoạt động trơn tru trong 1 phút!</p>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RoomDetailPage;
