import React from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  useLocation,
  Outlet,
  Navigate,
} from "react-router-dom";
import "./index.css";
import { LanguageProvider } from "./utils/LanguageContext";
import Login from "./pages/auth/login";
import Header from "./pages/common/header";
import Footer from "./pages/common/footer";
import Home from "./pages/home";
import AdminLayout from "./pages/admin/layout/AdminLayout";
import AdminDashboard from "./pages/admin/dashboard/index";
import AdminAccounts from "./pages/admin/accounts/index";
import AdminBranches from "./pages/admin/branches/index";
import AdminBookings from "./pages/admin/bookings/index";
import AdminSettings from "./pages/admin/settings/index";

function MainLayout() {
  const location = useLocation();
  const path = location.pathname;
  const hideLayout = path.startsWith("/admin") || path.startsWith("/login") || path.startsWith("/dashboard-admin");

  if (hideLayout) {
    return <Outlet />;
  }

  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}

function hasAccessToken() {
  return document.cookie.split("; ").some(cookie => cookie.startsWith("accessToken=") && cookie.split("=")[1]);
}

function RequireAuth({ children }) {
  const location = useLocation();
  if (!hasAccessToken()) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return children;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "login",
        element: <Login />,
      },
      // {
      //   path: ":categorySlug",
      //   element: <CategoryPage />,
      // },
      // {
      //   path: ":categorySlug/:subCategorySlug",
      //   element: <SubCategoryPage />,
      // },
      // {
      //   path: ":categorySlug/:subCategorySlug/:productSlug",
      //   element: <ProductDetail />,
      // },
      {
        path: "*",
        element: (
          <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-4xl font-bold">404</h1>
            <p>Trang bạn tìm kiếm không tồn tại.</p>
            <a href="/" className="mt-4 text-primary hover:underline">
              Quay lại trang chủ
            </a>
          </div>
        ),
      },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout><AdminDashboard /></AdminLayout>,
  },
  {
    path: "/admin/accounts",
    element: <AdminLayout><AdminAccounts /></AdminLayout>,
  },
  {
    path: "/admin/branches",
    element: <AdminLayout><AdminBranches /></AdminLayout>,
  },
  {
    path: "/admin/bookings",
    element: <AdminLayout><AdminBookings /></AdminLayout>,
  },
  {
    path: "/admin/settings",
    element: <AdminLayout><AdminSettings /></AdminLayout>,
  },
]);

function Main() {
  return (
    <React.StrictMode>
      <LanguageProvider>
        <RouterProvider router={router} />
      </LanguageProvider>
    </React.StrictMode>
  );
}

createRoot(document.getElementById("root")).render(<Main />);

export default Main;
