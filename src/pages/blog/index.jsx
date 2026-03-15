import { useLanguage } from "@/utils/LanguageContext";
import { ArrowRight, Clock, Search } from "lucide-react";
import React, { useState } from "react";

const MOCK_POSTS = [
  {
    id: 1,
    titleVn: "Khám Phá Cần Thơ: Thành Phố Sông Nước Miền Tây",
    titleEn: "Exploring Can Tho: The Water City of the Mekong Delta",
    excerptVn: "Cần Thơ không chỉ nổi tiếng với chợ nổi Cái Răng mà còn là điểm đến lý tưởng cho những tâm hồn yêu thiên nhiên và ẩm thực địa phương đặc sắc.",
    excerptEn: "Can Tho is famous not only for its Cai Rang floating market but is also an ideal destination for nature and local cuisine lovers.",
    category: "travel",
    minRead: 5,
    date: "12/06/2025",
    image: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&q=80",
    author: "Minh Tuấn",
  },
  {
    id: 2,
    titleVn: "Top 10 Nhà Hàng Sang Trọng Đáng Thử Ở Việt Nam",
    titleEn: "Top 10 Luxury Restaurants Worth Trying in Vietnam",
    excerptVn: "Ẩm thực Việt Nam đang vươn tầm quốc tế với những nhà hàng fine dining đẳng cấp, mang lại trải nghiệm ẩm thực khó quên.",
    excerptEn: "Vietnamese cuisine is going international with world-class fine dining restaurants offering unforgettable culinary experiences.",
    category: "cuisine",
    minRead: 7,
    date: "05/06/2025",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    author: "Thu Hương",
  },
  {
    id: 3,
    titleVn: "5 Mẹo Đặt Phòng Khách Sạn Để Tiết Kiệm Nhất",
    titleEn: "5 Hotel Booking Tips to Save the Most Money",
    excerptVn: "Việc đặt phòng khách sạn đúng thời điểm và đúng cách có thể giúp bạn tiết kiệm đến 40% chi phí lưu trú trong mỗi chuyến đi.",
    excerptEn: "Booking hotel rooms at the right time and in the right way can help you save up to 40% on accommodation costs per trip.",
    category: "tips",
    minRead: 4,
    date: "28/05/2025",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
    author: "Quang Hải",
  },
  {
    id: 4,
    titleVn: "Lối Sống Wellness: Xu Hướng Nghỉ Dưỡng Mới",
    titleEn: "Wellness Lifestyle: The New Travel Trend",
    excerptVn: "Ngày càng nhiều du khách tìm kiếm những kỳ nghỉ kết hợp với chăm sóc sức khỏe, thiền định và các liệu pháp wellness cao cấp.",
    excerptEn: "More and more travelers are seeking vacations that combine health care, meditation, and premium wellness therapies.",
    category: "lifestyle",
    minRead: 6,
    date: "20/05/2025",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80",
    author: "Lan Anh",
  },
  {
    id: 5,
    titleVn: "Đà Lạt – Thành Phố Mộng Mơ Trong Sương",
    titleEn: "Da Lat – The Dreamy City in the Mist",
    excerptVn: "Đà Lạt với khí hậu mát mẻ, hoa đào và những ngôi biệt thự cổ điển luôn là điểm đến hàng đầu cho những ai muốn thoát khỏi cái nóng đô thị.",
    excerptEn: "Da Lat with its cool climate, peach blossoms, and classic villas is always a top destination for those who want to escape the urban heat.",
    category: "travel",
    minRead: 5,
    date: "15/05/2025",
    image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80",
    author: "Minh Tuấn",
  },
  {
    id: 6,
    titleVn: "Ẩm Thực Miền Tây: Hành Trình Khám Phá Hương Vị",
    titleEn: "Mekong Delta Cuisine: A Journey of Flavors",
    excerptVn: "Miền Tây không chỉ nổi tiếng với phong cảnh sông nước mà còn là thiên đường ẩm thực với những món ăn độc đáo, dân dã mà hấp dẫn.",
    excerptEn: "The Mekong Delta is not only famous for its waterways but is also a culinary paradise with unique, rustic yet appealing dishes.",
    category: "cuisine",
    minRead: 8,
    date: "08/05/2025",
    image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80",
    author: "Thu Hương",
  },
];

const CATEGORY_COLORS = {
  travel: "bg-blue-100 text-blue-700",
  cuisine: "bg-amber-100 text-amber-700",
  tips: "bg-emerald-100 text-emerald-700",
  lifestyle: "bg-purple-100 text-purple-700",
};

const BlogPage = () => {
  const { t, lang } = useLanguage();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", "travel", "cuisine", "lifestyle", "tips"];

  const filtered = MOCK_POSTS.filter((p) => {
    const title = lang === "vn" ? p.titleVn : p.titleEn;
    const excerpt = lang === "vn" ? p.excerptVn : p.excerptEn;
    const matchSearch = search === "" || title.toLowerCase().includes(search.toLowerCase()) || excerpt.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === "all" || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-slate-900 py-16">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-3">{t("blog.title")}</h1>
          <p className="text-slate-400 max-w-xl mx-auto">{t("blog.subtitle")}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-10">
        {/* Search + Categories */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("blog.searchPlaceholder")}
                className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-(--main) focus:ring-2 focus:ring-(--main)/20"
              />
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    selectedCategory === cat
                      ? "bg-(--main) text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {t(`blog.categories.${cat}`)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Post (first item) */}
        {filtered.length > 0 && selectedCategory === "all" && search === "" && (
          <div className="mb-8 rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm grid grid-cols-1 lg:grid-cols-2">
            <div className="h-72 lg:h-auto relative overflow-hidden">
              <img
                src={filtered[0].image}
                alt={lang === "vn" ? filtered[0].titleVn : filtered[0].titleEn}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${CATEGORY_COLORS[filtered[0].category]}`}>
                  {t(`blog.categories.${filtered[0].category}`)}
                </span>
              </div>
            </div>
            <div className="p-10 flex flex-col justify-center">
              <div className="flex items-center gap-3 text-slate-400 text-xs mb-4">
                <span>{filtered[0].date}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{filtered[0].minRead} {t("blog.minRead")}</span>
                </div>
                <span>•</span>
                <span>{filtered[0].author}</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 leading-tight">
                {lang === "vn" ? filtered[0].titleVn : filtered[0].titleEn}
              </h2>
              <p className="text-slate-500 leading-relaxed mb-6">
                {lang === "vn" ? filtered[0].excerptVn : filtered[0].excerptEn}
              </p>
              <button className="flex items-center gap-2 text-(--main) font-semibold text-sm w-fit hover:gap-3 transition-all">
                {t("blog.readMore")} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Posts Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <p>{t("blog.noResults")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(selectedCategory === "all" && search === "" ? filtered.slice(1) : filtered).map((post) => (
              <div
                key={post.id}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
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
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-3 text-slate-400 text-xs">
                    <span>{post.date}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{post.minRead} {t("blog.minRead")}</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900 leading-snug group-hover:text-(--main) transition-colors line-clamp-2">
                    {lang === "vn" ? post.titleVn : post.titleEn}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
                    {lang === "vn" ? post.excerptVn : post.excerptEn}
                  </p>
                  <div className="flex items-center gap-1 text-(--main) text-sm font-semibold pt-1">
                    {t("blog.readMore")} <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
