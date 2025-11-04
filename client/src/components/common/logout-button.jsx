import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import PropTypes from "prop-types";

/**
 * LogoutButton - Shows a confirmation dialog before logging the user out.
 *
 * Props:
 * - label?: string (button label, defaults to "Log out")
 * - variant?: string (shadcn/ui button variant)
 * - size?: string (shadcn/ui button size)
 * - onLoggedOut?: () => void (optional callback after logout completes)
 * - trigger?: ReactNode (optional custom trigger; if provided, 'label' is ignored)
 */
export default function LogoutButton({ label = "Log out", variant = "outline", size, onLoggedOut, trigger }) {
  const { logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    // Clear auth and navigate to /auth
    logout();
    toast({ title: "You have been logged out" });
    setOpen(false);
    navigate("/auth", { replace: true });
    if (onLoggedOut) onLoggedOut();
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button variant={variant} size={size}>{label}</Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Log out?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to log out of your EduCore account?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Yes, log me out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

LogoutButton.propTypes = {
  label: PropTypes.string,
  variant: PropTypes.string,
  size: PropTypes.string,
  onLoggedOut: PropTypes.func,
  trigger: PropTypes.node,
};
