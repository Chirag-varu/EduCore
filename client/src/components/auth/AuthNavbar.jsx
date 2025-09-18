import { Link } from "react-router-dom";
import EduCore_Logo from "@/assets/logoImg.png";
import { Button } from "@/components/ui/button";

function AuthNavbar() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b bg-background shadow-sm">
      {/* Left section - Logo */}
      <div className="flex items-center space-x-6">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <img src={EduCore_Logo} alt="EduCore Logo" className="w-10 md:w-11" />
          <span className="font-extrabold md:text-xl text-base text-foreground">
            EduCore
          </span>
        </Link>
      </div>

      {/* Right section - Navigation */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          onClick={() => window.location.href = "/auth"}
          className="text-sm md:text-[16px] font-medium hover:bg-muted/40"
        >
          Login
        </Button>
        <Button
          variant="ghost"
          onClick={() => window.location.href = "/auth/signup"}
          className="text-sm md:text-[16px] font-medium hover:bg-muted/40"
        >
          Sign Up
        </Button>
      </div>
    </header>
  );
}

export default AuthNavbar;