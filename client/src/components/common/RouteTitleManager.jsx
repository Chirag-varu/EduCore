import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Centralized, safe defaults for document.title based on current route.
// Pages may still override with their own useEffect; this provides a fallback
// so titles never get stuck from a previous route.
export default function RouteTitleManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    const path = pathname.toLowerCase();

    const mapTitle = () => {
      // Public/student routes
      if (path === "/" || path === "/home") return "Home — EduCore";
      if (path.startsWith("/courses")) return "Courses — EduCore";
      if (path.startsWith("/about")) return "About — EduCore"; // page may override
      if (path.startsWith("/cart")) return "Cart — EduCore";
      if (path.startsWith("/checkout")) return "Checkout — EduCore";
      if (path.includes("/payment-return")) return "Payment — EduCore";
      if (path.includes("/student-courses")) return "My Courses — EduCore";
      if (path.includes("/course/details")) return "Course Details — EduCore";
      if (path.includes("/course-progress")) return "Course Progress — EduCore";
      if (path.includes("/quiz/")) return "Quiz — EduCore";
      if (path.includes("/assignment/")) return "Assignment — EduCore";

      // Auth routes
      if (path === "/auth") return "Login — EduCore";
      if (path.startsWith("/auth/signup")) return "Sign Up — EduCore";
      if (path.startsWith("/auth/forgotpassword")) return "Forgot Password — EduCore";
      if (path.startsWith("/auth/resetpassword")) return "Reset Password — EduCore";

      // Instructor routes
      if (path === "/instructor") return "Instructor Dashboard — EduCore";
      if (path.startsWith("/instructor/home")) return "Instructor Home — EduCore";
      if (path.startsWith("/instructor/create-new-course")) return "Create Course — EduCore";
      if (path.startsWith("/instructor/edit-course")) return "Edit Course — EduCore";
      if (path.startsWith("/instructor/messages")) return "Messages — EduCore";
      if (path.startsWith("/instructor/quiz")) return "Quiz — EduCore";
      if (path.startsWith("/instructor/assignment")) return "Assignment — EduCore";

      // Admin routes
      if (path === "/admin") return "Admin Dashboard — EduCore";
      if (path.startsWith("/admin/newsletters")) return "Newsletters — EduCore";
      if (path.startsWith("/admin/subscribers")) return "Subscribers — EduCore";
      if (path.startsWith("/admin/user-management")) return "User Management — EduCore";
      if (path.startsWith("/admin/course-moderation")) return "Course Moderation — EduCore";

      // Newsletter public
      if (path.startsWith("/newsletter/confirm")) return "Confirm Subscription — EduCore";
      if (path.startsWith("/newsletter/unsubscribe")) return "Unsubscribe — EduCore";

      return "EduCore"; // default fallback
    };

    // Set a sane default; page components may still override afterward
    document.title = mapTitle();
  }, [pathname]);

  return null;
}
