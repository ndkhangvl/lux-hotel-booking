import { Calendar, CalendarCheck, MapPin, Search, Users } from "lucide-react";
import React from "react";

/**
 * Hero section for homepage.
 * Tone color: #34D399 (emerald).
 * All icon classes (fa-*) require Font Awesome CSS to be globally loaded.
 * Image should be replaced to suit your assets.
 */
const Hero = () => {
  return (
    <section className="relative h-[555px] md:h-[600px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="https://theluxurytravelexpert.com/wp-content/uploads/2023/02/best-hotels-to-see-the-Northern-Lights.jpg"
          alt="Aurora Hotel"
          className="w-full h-full object-cover scale-100 animate-pulse-slow"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      </div>
      <div className="container mx-auto px-4 relative z-10 text-center space-y-8">
        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
            Nghỉ dưỡng dưới ánh Cực Quang
          </h1>
          <p className="text-lg md:text-xl text-white/90 font-medium">
            Phòng sang trọng • Dịch vụ chuẩn 4–5★ • Đặt phòng trong 60 giây
          </p>
        </div>
        {/* Search Box */}
        {/* <div className="bg-white p-4 md:p-2 rounded-[20px] md:rounded-[20px] shadow-2xl shadow-black/20 max-w-5xl mx-auto border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2">
            <div className="flex items-center gap-3 px-6 py-3 border-b md:border-b-0 md:border-r border-gray-100 group">
              <div className="w-10 h-10 rounded-full bg-[#ECFDF5] flex items-center justify-center text-[#34D399] group-hover:bg-[#34D399] group-hover:text-white transition-colors">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Địa điểm</p>
                <p className="text-sm font-semibold text-gray-900">Cần Thơ, Việt Nam</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 border-b md:border-b-0 md:border-r border-gray-100 group">
              <div className="w-10 h-10 rounded-full bg-[#ECFDF5] flex items-center justify-center text-[#34D399] group-hover:bg-[#34D399] group-hover:text-white transition-colors">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Nhận phòng</p>
                <p className="text-sm font-semibold text-gray-900">Thêm ngày</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 border-b md:border-b-0 md:border-r border-gray-100 group">
              <div className="w-10 h-10 rounded-full bg-[#ECFDF5] flex items-center justify-center text-[#34D399] group-hover:bg-[#34D399] group-hover:text-white transition-colors">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Trả phòng</p>
                <p className="text-sm font-semibold text-gray-900">Thêm ngày</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#ECFDF5] flex items-center justify-center text-[#34D399]">
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Khách</p>
                  <p className="text-sm font-semibold text-gray-900">Thêm khách</p>
                </div>
              </div>
              <button className="bg-[#34D399] hover:bg-[#059669] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200 transition-all active:scale-90">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div> */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <a
          href="/booking"
          className="w-full sm:w-auto rounded-full px-6 py-3 font-semibold text-white
                     bg-(--main) hover:bg-[#52DBA9]
                     shadow-lg hover:opacity-95"
        >
          Đặt phòng ngay
        </a>

        <a
          href="/rooms"
          className="w-full sm:w-auto rounded-full px-6 py-3 font-semibold
                     text-white border border-white/30 hover:bg-white/10"
        >
          Xem phòng
        </a>
      </div>
      </div>
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1.05); }
          50% { transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 20s infinite ease-in-out;
        }
      `}</style>
    </section>
  );
};

export default Hero;