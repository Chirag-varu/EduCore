import { Route, Routes } from "react-router-dom";
import AuthPage from "./pages/auth";
import Sign_up from "./pages/auth/signup";
import RouteGuard from "./components/route-guard";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "./context/auth-context";
import { ChatProvider } from "./context/chat-context";
import InstructorDashboardpage from "./pages/instructor";
import StudentViewCommonLayout from "./components/student-view/common-layout";
import StudentHomePage from "./pages/student/home";
import NotFoundPage from "./pages/not-found";
import AddNewCoursePage from "./pages/instructor/add-new-course";
import Instructor from "./pages/instructor/instructor";
import InstructorView from "./pages/instructor/instructor-view";
import CreateCourse from "./pages/instructor/CreateCourse";
import InstructorChatPage from "./pages/instructor/instructor-chat";
import StudentViewCoursesPage from "./pages/student/courses";
import AboutPage from "./pages/AboutUs/index";
import StudentViewCourseDetailsPage from "./pages/student/course-details";
import PaypalPaymentReturnPage from "./pages/student/payment-return";
import StudentCoursesPage from "./pages/student/student-courses";
import StudentViewCourseProgressPage from "./pages/student/course-progress";
import CartPage from "./pages/student/cart";
import CheckoutPage from "./pages/student/checkout";
import ConfirmSubscription from "./pages/newsletter/ConfirmSubscription";
import Unsubscribe from "./pages/newsletter/Unsubscribe";
import NewsletterDashboard from "./pages/admin/NewsletterDashboard";
import NewsletterForm from "./pages/admin/NewsletterForm";
import SubscriberManagement from "./pages/admin/SubscriberManagement";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import CourseModeration from "./pages/admin/CourseModeration";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "@/components/ui/toaster";
import ForgotPasswordPage from "./pages/auth/ForgotPassword";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import QuizCreator from "./pages/instructor/QuizCreator";
import AssignmentCreator from "./pages/instructor/AssignmentCreator";
import QuizTaking from "./pages/student/QuizTaking";
import AssignmentSubmission from "./pages/student/AssignmentSubmission";
import RouteTitleManager from "./components/common/RouteTitleManager";
import AccountSettings from "./pages/student/AccountSettings";
import ProfilePage from "./pages/student/profile";
import Loader from "@/components/common/Loader";

function App() {
  const { auth, setAuth } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      const parsed = JSON.parse(user);
      const normalizedUser = {
        ...parsed,
        userId: parsed?.userId || parsed?._id || parsed?.id,
      };
      setAuth({ authenticate: true, user: normalizedUser });
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <Loader message="Signing you in..." />;
  }

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ChatProvider>
        {/* Global page title defaults (pages can still override locally) */}
        <RouteTitleManager />
        <Routes>
          <Route path="/instructor/:id" element={<InstructorView />} />
          {/* About page should use the common layout to include nav/header */}
          <Route path="/instructor/home" element={<Instructor />} />
          <Route path="/instructor/CreateCourse" element={<CreateCourse />} />
          <Route
            path="/instructor/messages"
            element={
              <RouteGuard
                element={<InstructorChatPage />}
                authenticated={auth?.authenticate}
                user={auth?.user}
              />
            }
          />
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
          path="/admin"
          element={
            <RouteGuard
              element={<AdminDashboard />}
              authenticated={auth?.authenticate}
              user={auth?.user}
              allowedRoles={["admin"]}
            />
          }
        />
        <Route
          path="/admin/user-management"
          element={
            <RouteGuard
              element={<UserManagement />}
              authenticated={auth?.authenticate}
              user={auth?.user}
              allowedRoles={["admin"]}
            />
          }
        />
        <Route
          path="/admin/course-moderation"
          element={
            <RouteGuard
              element={<CourseModeration />}
              authenticated={auth?.authenticate}
              user={auth?.user}
              allowedRoles={["admin"]}
            />
          }
        />
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
        
        {/* Assessment routes for instructors */}
        <Route
          path="/instructor/quiz/create/:courseId"
          element={
            <RouteGuard
              element={<QuizCreator />}
              authenticated={auth?.authenticate}
              user={auth?.user}
              allowedRoles={["instructor"]}
            />
          }
        />
        <Route
          path="/instructor/quiz/:quizId/edit"
          element={
            <RouteGuard
              element={<QuizCreator />}
              authenticated={auth?.authenticate}
              user={auth?.user}
              allowedRoles={["instructor"]}
            />
          }
        />
        <Route
          path="/instructor/assignment/create/:courseId"
          element={
            <RouteGuard
              element={<AssignmentCreator />}
              authenticated={auth?.authenticate}
              user={auth?.user}
              allowedRoles={["instructor"]}
            />
          }
        />
        <Route
          path="/instructor/assignment/:assignmentId/edit"
          element={
            <RouteGuard
              element={<AssignmentCreator />}
              authenticated={auth?.authenticate}
              user={auth?.user}
              allowedRoles={["instructor"]}
            />
          }
        />
        <Route
          path="/auth/resetPassword/:token"
          element={<ResetPasswordPage />}
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
          <Route path="about" element={<AboutPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="account" element={<AccountSettings />} />
          <Route path="profile" element={<ProfilePage />} />
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
          
          {/* Assessment routes for students */}
          <Route
            path="quiz/:quizId"
            element={<QuizTaking />}
          />
          <Route
            path="assignment/:assignmentId"
            element={<AssignmentSubmission />}
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
          path="/auth/forgotPassword"
          element={
            <RouteGuard
              element={<ForgotPasswordPage />}
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
      </ChatProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
