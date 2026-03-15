import { useLanguage } from "@/utils/LanguageContext";
import { Calendar, CalendarCheck, MapPin, Search, Users } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  const { t } = useLanguage();

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
            {t("home.hero.title")}
          </h1>
          <p className="text-lg md:text-xl text-white/90 font-medium">
            {t("home.hero.subtitle")}
          </p>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/booking"
            className="w-full sm:w-auto rounded-full px-6 py-3 font-semibold text-white bg-(--main) hover:bg-[#52DBA9] shadow-lg hover:opacity-95"
          >
            {t("home.hero.bookNow")}
          </Link>
          <Link
            to="/rooms"
            className="w-full sm:w-auto rounded-full px-6 py-3 font-semibold text-white border border-white/30 hover:bg-white/10"
          >
            {t("home.hero.viewRooms")}
          </Link>
        </div>
      </div>
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1.05); }
          50% { transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default Hero;
