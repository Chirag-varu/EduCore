import { TvMinimalPlay } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useContext } from "react";
import { AuthContext } from "@/context/auth-context";
import EduCore_Logo from "@/assets/logoImg.png";

function StudentViewCommonHeader() {
  const navigate = useNavigate();
  const { resetCredentials, auth } = useContext(AuthContext);

  function handleLogout() {
    resetCredentials();
    sessionStorage.clear();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b bg-background shadow-sm">
      {/* Left section - Logo & Nav */}
      <div className="flex items-center space-x-6">
        {/* Logo */}
        <Link to="/home" className="flex items-center gap-2 hover:opacity-80 transition">
          <img src={EduCore_Logo} alt="EduCore Logo" className="w-10 md:w-11" />
          <span className="font-extrabold md:text-xl text-base text-foreground">
            EduCore
          </span>
        </Link>

        {/* Nav buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            onClick={() => {
              if (!location.pathname.includes("/courses")) {
                navigate("/courses");
              }
            }}
            className="text-sm md:text-[16px] font-medium hover:bg-muted/40"
          >
            Explore Courses
          </Button>

          <Button
            variant="ghost"
            onClick={() => navigate("/about")}
            className="text-sm md:text-[16px] font-medium hover:bg-muted/40"
          >
            About Us
          </Button>
        </div>
      </div>

      {/* Right section - User & Logout (only show if authenticated) */}
      <div className="flex items-center space-x-6">
        {auth.authenticate ? (
          <>
            {/* User Info */}
            <div
              onClick={() => navigate("/student-courses")}
              className="flex cursor-pointer items-center gap-2 hover:opacity-80 transition"
            >
              <span className="font-bold md:text-lg text-sm text-foreground">
                {auth.user?.userName || "User"}
              </span>
              <TvMinimalPlay className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            </div>

            {/* Logout */}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="font-medium hover:bg-destructive hover:text-white transition"
            >
              Sign Out
            </Button>
          </>
        ) : (
          /* Show Sign In button for non-authenticated users */
          <Button
            onClick={() => navigate("/auth")}
            variant="default"
            className="font-medium"
          >
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
}

export default StudentViewCommonHeader;
