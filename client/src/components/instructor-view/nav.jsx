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
import { BarChart, Book, LogOut, Menu } from "lucide-react";
import { useState } from "react";

export default function InstructorNav({
  activeTab,
  setActiveTab,
  handleLogout,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const menuItems = [
    {
      icon: BarChart,
      label: "Dashboard",
      value: "dashboard",
    },
    {
      icon: Book,
      label: "Courses",
      value: "courses",
    },
    {
      icon: LogOut,
      label: "Logout",
      value: "logout",
    },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        className="md:hidden fixed top-4 left-4 z-50"
        size="icon"
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu className="h-5 w-5" />
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
              <Button
                className={`w-full justify-start mb-2 
                  ${
                    menuItem.value === "logout"
                      ? "text-destructive hover:text-destructive"
                      : ""
                  }
                  ${
                    activeTab === menuItem.value
                      ? "bg-gray-200 dark:bg-gray-700 text-foreground"
                      : ""
                  }
                `}
                key={menuItem.value}
                variant="ghost"
                onClick={
                  menuItem.value === "logout"
                    ? () => setLogoutOpen(true)
                    : () => {
                        setActiveTab(menuItem.value);
                        setIsOpen(false);
                      }
                }
              >
                <menuItem.icon
                  className={`mr-2 h-4 w-4 ${
                    menuItem.value === "logout" ? "text-destructive" : ""
                  }`}
                />
                {menuItem.label}
              </Button>
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
