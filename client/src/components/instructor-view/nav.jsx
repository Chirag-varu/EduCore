import { Button } from "@/components/ui/button";
import LogoutButton from "@/components/common/logout-button";
import { BarChart, Book, LogOut, Menu, MessageSquare, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function InstructorNav({
  activeTab,
  setActiveTab,
  handleLogout,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: BarChart,
      label: "Dashboard",
      value: "dashboard",
      href: "/instructor",
    },
    {
      icon: Book,
      label: "Courses",
      value: "courses",
      href: "/instructor",
    },
    {
      icon: MessageSquare,
      label: "Messages",
      value: "messages",
      href: "/instructor/messages",
    },
    {
      icon: LogOut,
      label: "Logout",
      value: "logout",
    },
  ];

  const handleNavigation = (menuItem) => {
    if (menuItem.value === "logout") return; // handled by LogoutButton

    if (menuItem.href) {
      if (menuItem.href === "/instructor") {
        // For dashboard and courses, navigate to main instructor page
        navigate("/instructor");
        // Set the appropriate tab based on the menu item
        if (setActiveTab) {
          setTimeout(() => setActiveTab(menuItem.value), 0);
        }
      } else {
        // For other routes like messages, navigate directly
        navigate(menuItem.href);
      }
    } else if (setActiveTab) {
      setActiveTab(menuItem.value);
    }
    
    setIsOpen(false);
  };

  const isCurrentPath = (menuItem) => {
    if (menuItem.value === "messages") {
      return location.pathname === "/instructor/messages";
    } else if (menuItem.value === "dashboard" || menuItem.value === "courses") {
      return location.pathname === "/instructor" && activeTab === menuItem.value;
    }
    return false;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        className={`md:hidden fixed top-4 left-4 z-50 ${isOpen ? "ml-48" : ""} bg-white/80 backdrop-blur-sm`}
        size="icon"
        variant="ghost"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:relative inset-y-0 left-0 z-40 w-64 bg-white shadow-md transition-transform duration-300 ease-in-out`}
      >
        <div className="p-4 h-full">
          <h2 className="text-2xl font-bold mb-4">Instructor View</h2>
          <nav aria-label="Instructor navigation">
            {menuItems.map((menuItem) => (
              <div key={menuItem.value}>
                {menuItem.value === "logout" ? (
                  <LogoutButton
                    trigger={
                      <Button
                        className={`w-full justify-start mb-2 text-left px-3 py-2 rounded-md text-destructive hover:text-destructive`}
                        variant="ghost"
                        aria-label={menuItem.label}
                      >
                        <menuItem.icon className="mr-2 h-4 w-4 text-destructive" aria-hidden="true" />
                        {menuItem.label}
                      </Button>
                    }
                    onLoggedOut={() => setIsOpen(false)}
                  />
                ) : (
                  <Button
                    className={`w-full justify-start mb-2 text-left px-3 py-2 rounded-md 
                    ${isCurrentPath(menuItem) ? "bg-gray-100 dark:bg-gray-700 text-foreground" : "hover:bg-muted/20"}
                  `}
                    variant="ghost"
                    onClick={() => handleNavigation(menuItem)}
                    aria-current={isCurrentPath(menuItem) ? "page" : undefined}
                    aria-label={menuItem.label}
                  >
                    <menuItem.icon className="mr-2 h-4 w-4" aria-hidden="true" />
                    {menuItem.label}
                  </Button>
                )}
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
