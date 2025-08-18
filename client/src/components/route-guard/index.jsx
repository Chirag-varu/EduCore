import { Navigate, useLocation } from "react-router-dom";
import { Fragment } from "react";

function RouteGuard({ authenticated, user, element }) {
  const location = useLocation();

  const path = location.pathname;

  // 🔹 Redirect rules based on roles
  const roleRedirects = {
    instructor: "/",  // default page for instructor
    user: "/home",    // default page for normal user
  };

  // 1️⃣ If not authenticated → only allow /auth/*
  if (!authenticated && !path.startsWith("/auth")) {
    return <Navigate to="/auth" replace />;
  }

  // 2️⃣ If authenticated & tries to access /auth → redirect by role
  if (authenticated && path.startsWith("/auth")) {
    const redirectPath = roleRedirects[user?.role] || "/home";
    return <Navigate to={redirectPath} replace />;
  }

  // 3️⃣ If user is not instructor but tries to access /instructor
  if (authenticated && user?.role !== "instructor" && path.startsWith("/instructor")) {
    return <Navigate to="/home" replace />;
  }

  // ✅ Otherwise, render the element
  return <Fragment>{element}</Fragment>;
}

export default RouteGuard;
