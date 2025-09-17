import { Navigate, useLocation } from "react-router-dom";

function RouteGuard({ authenticated, user, element, allowedRoles = [] }) {
  const { pathname } = useLocation();

  const roleRedirects = {
    instructor: "/instructor",
    student: "/home",
    admin: "/admin/newsletters",
  };

  // 1️ If not authenticated → only allow /auth/*
  if (!authenticated) {
    return pathname.startsWith("/auth")
      ? element
      : <Navigate to="/auth" replace />;
  }

  const role = user?.role;
  const redirectPath = roleRedirects[role] || "/home";

  // 2️ If authenticated → block /auth/*
  if (pathname.startsWith("/auth")) {
    return <Navigate to={redirectPath} replace />;
  }

  // 3️ Role-based access control
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to={redirectPath} replace />;
  }

  // 4️ Students cannot access /instructor/*
  if (role !== "instructor" && pathname.startsWith("/instructor")) {
    return <Navigate to="/home" replace />;
  }

  // 5️ Only admins can access /admin/* routes
  if (role !== "admin" && pathname.startsWith("/admin")) {
    return <Navigate to="/home" replace />;
  }

  // Otherwise → allow (users can stay on their authorized pages)
  return element;
}

export default RouteGuard;
