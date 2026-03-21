import { useLanguage } from "@/utils/LanguageContext";
import API_BASE from "@/utils/api";
import { BedDouble, MapPin } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const PAGE_SIZE = 6;

const MOCK_BRANCH_IMAGES = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80",
  "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=900&q=80",
  "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=900&q=80",
  "https://images.unsplash.com/photo-1439130490301-25e322d88054?w=900&q=80",
  "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=900&q=80",
  "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=900&q=80",
];

const BranchesPage = () => {
  const { t } = useLanguage();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchBranches = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/user/branches/branches-list?page=${page}&page_size=${PAGE_SIZE}`);
        if (!res.ok) throw new Error("Failed to fetch branches");
        const data = await res.json();
        setBranches(Array.isArray(data?.items) ? data.items : []);
        setTotal(Number(data?.total || 0));
        setTotalPages(Math.max(1, Number(data?.total_pages || 1)));
      } catch {
        setBranches([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, [page]);

  const startIndex = useMemo(() => (page - 1) * PAGE_SIZE + 1, [page]);
  const endIndex = useMemo(() => Math.min(page * PAGE_SIZE, total), [page, total]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-slate-900 py-16">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-3">{t("home.branches.title")}</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">{t("home.branches.subtitle")}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-10">
        {!loading && branches.length > 0 && (
          <p className="text-sm text-slate-500 mb-6">
            {t("common.showing")} {startIndex}-{endIndex} {t("common.of")} {total} {t("common.entries")}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading &&
            Array.from({ length: PAGE_SIZE }).map((_, idx) => (
              <div key={idx} className="h-80 rounded-2xl bg-slate-200 animate-pulse" />
            ))}

          {!loading &&
            branches.map((branch, idx) => (
              <div
                key={branch.branch_code}
                className="group relative rounded-2xl overflow-hidden h-80 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <img
                  src={MOCK_BRANCH_IMAGES[idx % MOCK_BRANCH_IMAGES.length]}
                  alt={branch.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="font-bold text-xl mb-1">{branch.name}</h3>
                  <div className="flex items-start gap-1.5 text-white/70 text-sm mb-3">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{branch.address}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <BedDouble className="w-4 h-4 text-(--main)" />
                      <span className="text-white/80">{branch.total_rooms || 0} {t("home.branches.rooms")}</span>
                    </div>
                    <Link
                      to={`/branches/${branch.branch_code}`}
                      className="text-(--main) text-sm font-semibold hover:text-white transition-colors"
                    >
                      {t("home.branches.viewDetail")}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {!loading && branches.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-slate-500 mt-2">
            {t("common.noData")}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:border-(--main)"
            >
              {t("common.prevPage")}
            </button>
            <span className="px-3 py-2 text-sm font-semibold text-slate-600">
              {t("common.page")} {page} {t("common.of")} {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:border-(--main)"
            >
              {t("common.nextPage")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchesPage;
