import { useLanguage } from "@/utils/LanguageContext";
import { ArrowRight, Clock } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const MOCK_POSTS = [
  {
    id: 1,
    titleVn: "Khám Phá Cần Thơ: Thành Phố Sông Nước Miền Tây",
    titleEn: "Exploring Can Tho: The Water City of the Mekong Delta",
    excerptVn: "Cần Thơ không chỉ nổi tiếng với chợ nổi Cái Răng mà còn là điểm đến lý tưởng cho những tâm hồn yêu thiên nhiên và ẩm thực...",
    excerptEn: "Can Tho is famous not only for its Cai Rang floating market but is also an ideal destination for nature and cuisine lovers...",
    category: "travel",
    minRead: 5,
    date: "12/06/2025",
    image: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600&q=80",
  },
  {
    id: 2,
    titleVn: "Top 10 Nhà Hàng Sang Trọng Đáng Thử Ở Việt Nam",
    titleEn: "Top 10 Luxury Restaurants Worth Trying in Vietnam",
    excerptVn: "Ẩm thực Việt Nam đang vươn tầm quốc tế với những nhà hàng fine dining đẳng cấp, mang lại trải nghiệm khó quên cho thực khách...",
    excerptEn: "Vietnamese cuisine is going international with world-class fine dining restaurants, offering unforgettable experiences for diners...",
    category: "cuisine",
    minRead: 7,
    date: "05/06/2025",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
  },
  {
    id: 3,
    titleVn: "5 Mẹo Đặt Phòng Khách Sạn Để Tiết Kiệm Nhất",
    titleEn: "5 Hotel Booking Tips to Save the Most Money",
    excerptVn: "Việc đặt phòng khách sạn đúng thời điểm và đúng cách có thể giúp bạn tiết kiệm đến 40% chi phí lưu trú...",
    excerptEn: "Booking hotel rooms at the right time and in the right way can help you save up to 40% on accommodation costs...",
    category: "tips",
    minRead: 4,
    date: "28/05/2025",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80",
  },
];

const CATEGORY_COLORS = {
  travel: "bg-blue-100 text-blue-700",
  cuisine: "bg-amber-100 text-amber-700",
  tips: "bg-emerald-100 text-emerald-700",
  lifestyle: "bg-purple-100 text-purple-700",
};

const TravelInspiration = () => {
  const { t, lang } = useLanguage();

  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-sm font-bold text-(--main) uppercase tracking-widest mb-2">
              Blog
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              {t("home.inspiration.title")}
            </h2>
            <p className="mt-3 text-slate-500 max-w-xl">
              {t("home.inspiration.subtitle")}
            </p>
          </div>
          <Link
            to="/blog"
            className="flex items-center gap-2 text-(--main) font-semibold text-sm hover:gap-3 transition-all shrink-0"
          >
            {t("home.inspiration.viewAll")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_POSTS.map((post) => (
            <Link
              to="/blog"
              key={post.id}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block"
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={post.image}
                  alt={lang === "vn" ? post.titleVn : post.titleEn}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${CATEGORY_COLORS[post.category] || "bg-gray-100 text-gray-600"}`}>
                    {t(`blog.categories.${post.category}`)}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-3 text-slate-400 text-xs">
                  <span>{post.date}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{post.minRead} {t("home.inspiration.minRead")}</span>
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 leading-snug group-hover:text-(--main) transition-colors line-clamp-2">
                  {lang === "vn" ? post.titleVn : post.titleEn}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
                  {lang === "vn" ? post.excerptVn : post.excerptEn}
                </p>
                <div className="flex items-center gap-1 text-(--main) text-sm font-semibold pt-1">
                  {t("home.inspiration.readMore")} <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TravelInspiration;
