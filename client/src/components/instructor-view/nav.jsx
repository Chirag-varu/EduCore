import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { BarChart, Book, LogOut, Menu, MessageSquare, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function InstructorNav({
  activeTab,
  setActiveTab,
  handleLogout,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
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
    if (menuItem.value === "logout") {
      setLogoutOpen(true);
      return;
    }

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
        className={`md:hidden fixed top-4 left-4 z-50 ${isOpen ? "ml-48" : ""}`}
        size="icon"
        variant="ghost"
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
          <nav>
            {menuItems.map((menuItem) => (
              <div key={menuItem.value}>
                <Button
                  className={`w-full justify-start mb-2 
                    ${
                      menuItem.value === "logout"
                        ? "text-destructive hover:text-destructive"
                        : ""
                    }
                    ${
                      isCurrentPath(menuItem)
                        ? "bg-gray-200 dark:bg-gray-700 text-foreground"
                        : ""
                    }
                  `}
                  variant="ghost"
                  onClick={() => handleNavigation(menuItem)}
                >
                  <menuItem.icon
                    className={`mr-2 h-4 w-4 ${
                      menuItem.value === "logout" ? "text-destructive" : ""
                    }`}
                  />
                  {menuItem.label}
                </Button>
              </div>
            ))}
          </nav>

          <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Logout</DialogTitle>
                <DialogDescription>
                  Are you sure you want to logout?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setLogoutOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleLogout}>
                  Logout
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </aside>
    </>
  );
}
