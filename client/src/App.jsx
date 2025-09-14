import { Route, Routes } from "react-router-dom";
import AuthPage from "./pages/auth";
import Sign_up from "./pages/auth/signup";
import RouteGuard from "./components/route-guard";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "./context/auth-context";
import InstructorDashboardpage from "./pages/instructor";
import StudentViewCommonLayout from "./components/student-view/common-layout";
import StudentHomePage from "./pages/student/home";
import NotFoundPage from "./pages/not-found";
import AddNewCoursePage from "./pages/instructor/add-new-course";
import Instructor from "./pages/instructor/instructor";
import InstructorView from "./pages/instructor/instructor-view";
import CreateCourse from "./pages/instructor/CreateCourse";
import StudentViewCoursesPage from "./pages/student/courses";
import AboutPage from "./pages/AboutUs/index";
import StudentViewCourseDetailsPage from "./pages/student/course-details";
import PaypalPaymentReturnPage from "./pages/student/payment-return";
import StudentCoursesPage from "./pages/student/student-courses";
import StudentViewCourseProgressPage from "./pages/student/course-progress";
import ConfirmSubscription from "./pages/newsletter/ConfirmSubscription";
import Unsubscribe from "./pages/newsletter/Unsubscribe";
import NewsletterDashboard from "./pages/admin/NewsletterDashboard";
import NewsletterForm from "./pages/admin/NewsletterForm";
import SubscriberManagement from "./pages/admin/SubscriberManagement";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "@/components/ui/toaster";

function App() {
  const { auth, setAuth } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      setAuth({ token, user: JSON.parse(user), authenticate: true });
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>; // or spinner
  }

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Routes>
        <Route path="/instructor/:id" element={<InstructorView />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/instructor/home" element={<Instructor />} />
        <Route path="/instructor/CreateCourse" element={<CreateCourse />} />
        <Route
          path="/instructor/create-new-course"
          element={
            <RouteGuard
              element={<AddNewCoursePage />}
              authenticated={auth?.authenticate}
              user={auth?.user}
            />
          }
        />
        
        {/* Newsletter public routes */}
        <Route path="/newsletter/confirm/:token" element={<ConfirmSubscription />} />
        <Route path="/newsletter/unsubscribe" element={<Unsubscribe />} />
        
        {/* Newsletter admin routes */}
        <Route
          path="/admin/newsletters"
          element={
            <RouteGuard
              element={<NewsletterDashboard />}
              authenticated={auth?.authenticate}
              user={auth?.user}
              allowedRoles={["admin"]}
            />
          }
        />
        <Route
          path="/admin/newsletters/create"
          element={
            <RouteGuard
              element={<NewsletterForm />}
              authenticated={auth?.authenticate}
              user={auth?.user}
              allowedRoles={["admin"]}
            />
          }
        />
        <Route
          path="/admin/newsletters/:id"
          element={
            <RouteGuard
              element={<NewsletterForm />}
              authenticated={auth?.authenticate}
              user={auth?.user}
              allowedRoles={["admin"]}
            />
          }
        />
        <Route
          path="/admin/subscribers"
          element={
            <RouteGuard
              element={<SubscriberManagement />}
              authenticated={auth?.authenticate}
              user={auth?.user}
              allowedRoles={["admin"]}
            />
          }
        />
        <Route
          path="/instructor/edit-course/:courseId"
          element={
            <RouteGuard
              element={<AddNewCoursePage />}
              authenticated={auth?.authenticate}
              user={auth?.user}
            />
          }
        />
        <Route
          path="/"
          element={
            <RouteGuard
              element={<StudentViewCommonLayout />}
              authenticated={auth?.authenticate}
              user={auth?.user}
            />
          }
        >
          <Route path="" element={<StudentHomePage />} />
          <Route path="home" element={<StudentHomePage />} />
          <Route path="courses" element={<StudentViewCoursesPage />} />
          <Route
            path="course/details/:id"
            element={<StudentViewCourseDetailsPage />}
          />
          <Route path="payment-return" element={<PaypalPaymentReturnPage />} />
          <Route path="student-courses" element={<StudentCoursesPage />} />
          <Route
            path="course-progress/:id"
            element={<StudentViewCourseProgressPage />}
          />
        </Route>
        <Route
          path="/auth"
          element={
            <RouteGuard
              element={<AuthPage />}
              authenticated={auth?.authenticate}
              user={auth?.user}
            />
          }
        />
        <Route
          path="/auth/signup"
          element={
            <RouteGuard
              element={<Sign_up />}
              authenticated={auth?.authenticate}
              user={auth?.user}
            />
          }
        />
        <Route
          path="/instructor"
          element={
            <RouteGuard
              element={<InstructorDashboardpage />}
              authenticated={auth?.authenticate}
              user={auth?.user}
            />
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
    </GoogleOAuthProvider>
  );
}

export default App;
