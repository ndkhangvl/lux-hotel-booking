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
import RoomsPage from "./pages/rooms/index";
import ServicesPage from "./pages/services/index";
import BlogPage from "./pages/blog/index";
import ContactPage from "./pages/contact/index";
import BookingPage from "./pages/booking/index";
import AdminLayout from "./pages/admin/layout/AdminLayout";
import AdminDashboard from "./pages/admin/dashboard/index";
import AdminAccounts from "./pages/admin/accounts/index";
import AdminBranches from "./pages/admin/branches/index";
import AdminBookings from "./pages/admin/bookings/index";
import AdminSettings from "./pages/admin/settings/index";
import AdminBranchRooms from "./pages/admin/branches/rooms/index";
import { RouteErrorBoundary } from "./components/ErrorBoundary";
import { ACCESS_TOKEN } from "./utils/constant";

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

function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN);
}

function getUserRoleFromToken() {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;

    const payloadJson = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadJson);

    return (
      payload.role ||
      payload.Role ||
      (Array.isArray(payload.roles) ? payload.roles[0] : null) ||
      null
    );
  } catch (error) {
    console.error("Invalid access token format:", error);
    return null;
  }
}

function hasAdminAccess() {
  const role = getUserRoleFromToken();
  return role === "Admin" || role === "Receptionist";
}

function RequireAdmin({ children }) {
  const location = useLocation();

  if (!getAccessToken() || !hasAdminAccess()) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "rooms",
        element: <RoomsPage />,
      },
      {
        path: "services",
        element: <ServicesPage />,
      },
      {
        path: "blog",
        element: <BlogPage />,
      },
      {
        path: "contact",
        element: <ContactPage />,
      },
      {
        path: "booking",
        element: <BookingPage />,
      },
      {
        path: "login",
        element: <Login />,
      },
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
    element: (
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: "accounts",
        element: <AdminAccounts />,
      },
      {
        path: "branches",
        element: <AdminBranches />,
      },
      {
        path: "branches/:branchId",
        element: <AdminBranchRooms />,
      },
      {
        path: "bookings",
        element: <AdminBookings />,
      },
      {
        path: "settings",
        element: <AdminSettings />,
      },
    ],
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
