import { useRouteError, useNavigate, isRouteErrorResponse } from "react-router-dom";
import { AlertTriangle, Home, RefreshCw, ArrowLeft } from "lucide-react";

export function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  let status = 500;
  let title = "Đã xảy ra lỗi không mong muốn";
  let message = "Vui lòng thử lại hoặc quay về trang chủ.";

  if (isRouteErrorResponse(error)) {
    status = error.status;
    if (status === 404) {
      title = "Trang không tồn tại";
      message = "Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.";
    } else if (status === 403) {
      title = "Không có quyền truy cập";
      message = "Bạn không có quyền truy cập vào trang này.";
    } else if (status === 401) {
      title = "Chưa đăng nhập";
      message = "Vui lòng đăng nhập để tiếp tục.";
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <AlertTriangle size={28} className="text-red-500" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold mb-4">
          Lỗi {status}
        </span>

        <h1 className="text-xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-sm text-gray-500 mb-8">{message}</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={15} />
            Quay lại
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={15} />
            Tải lại
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-violet-500 hover:bg-violet-600 rounded-xl transition-colors"
          >
            <Home size={15} />
            Trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
