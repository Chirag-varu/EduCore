import { Navigate, useLocation } from "react-router-dom";

function RouteGuard({ authenticated, user, element }) {
  const { pathname } = useLocation();

  const roleRedirects = {
    instructor: "/instructor",
    student: "/home",
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

  // 3️ Students cannot access /instructor/*
  if (role !== "instructor" && pathname.startsWith("/instructor")) {
    return <Navigate to="/home" replace />;
  }

  // 4️ Default landing page when visiting `/`
  // if (pathname === "/" && authenticated) {
  //   return <Navigate to="/home" replace />;
  // }

  // Otherwise → allow (instructors can stay on /home if they go there manually)
  return element;
}

export default RouteGuard;
