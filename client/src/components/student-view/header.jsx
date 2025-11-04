import { TvMinimalPlay, Menu, X, User as UserIcon, LogOut, ShoppingCart, LayoutDashboard } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "@/context/auth-context";
import EduCore_Logo from "@/assets/logoImg.png";
import CartIcon from "@/components/ui/cart-icon";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import LogoutButton from "@/components/common/logout-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function StudentViewCommonHeader() {
  const navigate = useNavigate();
  const { resetCredentials, auth } = useContext(AuthContext);
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileRef = useRef();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close when clicking outside
  useEffect(() => {
    function onDoc(e) {
      if (mobileRef.current && !mobileRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  function getInitials(name) {
    if (!name) return "U";
    const parts = String(name).trim().split(/\s+/);
    const first = parts[0]?.[0] || "U";
    const second = parts[1]?.[0] || "";
    return (first + second).toUpperCase();
  }

  const isActive = (path) =>
    location.pathname === path ||
    location.pathname.startsWith(path + "/") ||
    location.pathname.includes(path);

  return (
    <header className="sticky top-0 z-50 bg-background border-b shadow-sm">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        {/* Left section - Logo & Nav */}
        <div className="flex items-center space-x-6">
          {/* Logo */}
          <Link
            to="/home"
            aria-label="EduCore home"
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <img
              src={EduCore_Logo}
              alt="EduCore Logo"
              className="w-10 md:w-11"
            />
            <span className="font-extrabold md:text-xl text-base text-foreground">
              EduCore
            </span>
          </Link>

          {/* Nav buttons (desktop) */}
          <nav
            className="hidden md:flex items-center space-x-2"
            role="navigation"
            aria-label="Main navigation"
          >
            <Button
              variant={isActive("/courses") ? "default" : "ghost"}
              onClick={() => {
                if (!location.pathname.includes("/courses"))
                  navigate("/courses");
              }}
              aria-label="Explore Courses"
              className={`text-sm md:text-[16px] font-medium ${
                isActive("/courses") ? "" : "hover:bg-muted/40"
              }`}
            >
              Explore Courses
            </Button>

            <Button
              variant={isActive("/about") ? "default" : "ghost"}
              onClick={() => navigate("/about")}
              aria-label="About us"
              className={`text-sm md:text-[16px] font-medium ${
                isActive("/about") ? "" : "hover:bg-muted/40"
              }`}
            >
              About Us
            </Button>
          </nav>

          {/* Mobile hamburger */}
          <div className="md:hidden">
            <button
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((s) => !s)}
              className="p-2 rounded-md hover:bg-muted/30"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Right section - Cart, User (hover menu) (only show if authenticated) */}
        <div className="flex items-center space-x-4">
          {auth.authenticate ? (
            <>
              {/* Cart Icon */}
              <CartIcon />
              {/* User Avatar + Hover Menu */}
              <div
                onMouseEnter={() => setMenuOpen(true)}
                onMouseLeave={() => setMenuOpen(false)}
                className="relative"
              >
                <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <button
                      aria-label="User menu"
                      className="rounded-full ring-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-sm font-semibold">
                          {getInitials(auth.user?.userName)}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-64"
                    onMouseEnter={() => setMenuOpen(true)}
                    onMouseLeave={() => setMenuOpen(false)}
                  >
                    <DropdownMenuLabel>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="text-sm font-semibold">
                            {getInitials(auth.user?.userName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold leading-tight truncate">
                            {auth.user?.userName || "User"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {auth.user?.userEmail || ""}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => navigate("/student-courses")}>
                      <TvMinimalPlay className="mr-2 h-4 w-4" /> My learning
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => navigate("/cart")}>
                      <ShoppingCart className="mr-2 h-4 w-4" /> My cart
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                      <UserIcon className="mr-2 h-4 w-4" /> Profile
                    </DropdownMenuItem>
                    {auth?.user?.role === "instructor" && (
                      <DropdownMenuItem onSelect={() => navigate("/instructor")}> 
                        <LayoutDashboard className="mr-2 h-4 w-4" /> Instructor dashboard
                      </DropdownMenuItem>
                    )}
                    {auth?.user?.role === "admin" && (
                      <DropdownMenuItem onSelect={() => navigate("/admin")}> 
                        <LayoutDashboard className="mr-2 h-4 w-4" /> Admin dashboard
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <LogoutButton
                      onLoggedOut={() => setMenuOpen(false)}
                      trigger={
                        // Prevent default onSelect so the dialog can open without immediate menu action
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <LogOut className="mr-2 h-4 w-4" /> Log out
                        </DropdownMenuItem>
                      }
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          ) : (
            /* Show Sign In button for non-authenticated users */
            <Button
              onClick={() => navigate("/auth")}
              variant="default"
              aria-label="Sign in"
              className="font-medium"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div
          ref={mobileRef}
          className="md:hidden absolute right-4 top-full mt-2 w-56 bg-popover border rounded-lg shadow-lg py-2 z-50"
        >
          <nav
            className="flex flex-col px-2"
            role="menu"
            aria-label="Mobile navigation"
          >
            <button
              onClick={() => navigate("/courses")}
              className={`text-left px-3 py-2 rounded ${
                isActive("/courses")
                  ? "bg-muted/40 font-semibold"
                  : "hover:bg-muted/20"
              }`}
              aria-label="Explore Courses"
            >
              Explore Courses
            </button>
            <button
              onClick={() => navigate("/about")}
              className={`text-left px-3 py-2 rounded ${
                isActive("/about")
                  ? "bg-muted/40 font-semibold"
                  : "hover:bg-muted/20"
              }`}
              aria-label="About us"
            >
              About Us
            </button>
            <div className="border-t my-2"></div>
            {auth.authenticate ? (
              <>
                <button
                  onClick={() => navigate("/student-courses")}
                  className="text-left px-3 py-2 rounded hover:bg-muted/20"
                  aria-label="My courses"
                >
                  My Courses
                </button>
                <LogoutButton
                  onLoggedOut={() => setMobileOpen(false)}
                  trigger={
                    <button
                      className="text-left px-3 py-2 rounded hover:bg-muted/20"
                      aria-label="Sign out"
                    >
                      Sign Out
                    </button>
                  }
                />
              </>
            ) : (
              <button
                onClick={() => navigate("/auth")}
                className="text-left px-3 py-2 rounded hover:bg-muted/20"
                aria-label="Sign in"
              >
                Sign In
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export default StudentViewCommonHeader;
