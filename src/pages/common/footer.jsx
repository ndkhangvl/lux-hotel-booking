import { HotelShareIcon } from "@/utils/share_icon";
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from "lucide-react";
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      {/* Main Footer */}
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="space-y-6">
            <a href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-(--main) rounded-xl flex items-center justify-center text-white">
                <HotelShareIcon width={22} height={22} fill="#fff" />
              </div>
             <span className="text-2xl font-bold tracking-tight">
                <span className="text-(--main)">Aurora</span>
                <span className="text-white">Hotel</span>
            </span>
            </a>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              AuroraHotel – Nơi hành trình nghỉ dưỡng tỏa sáng như cực quang.
            </p>
          </div>
          {/* Công Ty */}
          <div className="space-y-6">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">
              Giới thiệu khách sạn
            </h4>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-slate-400 text-sm hover:text-(--main) transition-colors">
                  Giới thiệu khách sạn
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 text-sm hover:text-(--main) transition-colors">
                  Phòng & Giá
                </a>
              </li>
              <li>
                <a href="/blog" className="text-slate-400 text-sm hover:text-(--main) transition-colors">
                  Blog / Tin tức
                </a>
              </li>
            </ul>
          </div>
          {/* Hỗ Trợ */}
          <div className="space-y-6">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">
              Hỗ Trợ
            </h4>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-slate-400 text-sm hover:text-(--main) transition-colors">
                  Hỗ trợ đặt phòng
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 text-sm hover:text-(--main) transition-colors">
                  Câu hỏi thường gặp
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 text-sm hover:text-(--main) transition-colors">
                  Liên hệ
                </a>
              </li>
            </ul>
          </div>
          {/* Liên Hệ */}
          <div className="space-y-6">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">
              Liên Hệ
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="text-(--main) mt-1 w-4 h-4" />
                <span className="text-slate-400 text-sm">+84 123 456 789</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="text-(--main) mt-1 w-4 h-4" />
                <span className="text-slate-400 text-sm">contact@aurorahotel.vn</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="text-(--main) mt-1 w-4 h-4" />
                <span className="text-slate-400 text-sm">Cần Thơ, Việt Nam</span>
              </li>
            </ul>
            {/* Social */}
            <div className="flex items-center gap-4 pt-4">
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-(--main) hover:text-white transition-all"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-(--main) hover:text-white transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-(--main) hover:text-white transition-all"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* Bottom Footer */}
      <div className="border-t border-slate-800 py-8">
        <div className="container mx-auto px-4 lg:px-8 flex flex-col items-center justify-center gap-4">
          <p className="text-slate-500 text-xs text-center w-full">
            © 2026 AuroraHotel. Copyright by AuroraHotel.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;