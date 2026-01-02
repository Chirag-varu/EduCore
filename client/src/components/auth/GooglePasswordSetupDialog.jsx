import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PasswordStrengthIndicator from "@/components/ui/password-strength-indicator";
import { setGoogleUserPasswordService, skipPasswordSetupService } from "@/services";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";

export default function GooglePasswordSetupDialog({ 
  isOpen, 
  onClose, 
  onSuccess,
  userEmail 
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSetPassword = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "❌ Passwords don't match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "❌ Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await setGoogleUserPasswordService(password);
      
      if (response.success) {
        toast({
          title: "✅ Password set successfully",
          description: "You can now login with your email and password.",
        });
        
        // Update user in localStorage
        if (response.data?.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }
        
        onSuccess?.(response.data?.user);
        onClose();
      } else {
        toast({
          title: "❌ Failed to set password",
          description: response.message || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      const response = await skipPasswordSetupService();
      
      if (response.success) {
        toast({
          title: "⏭️ Skipped for now",
          description: "You can set a password later from your profile settings.",
        });
        
        // Update user in localStorage
        if (response.data?.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }
        
        onSuccess?.(response.data?.user);
        onClose();
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">
            Secure Your Account
          </DialogTitle>
          <DialogDescription className="text-center">
            Create a password to also login with your email{" "}
            <span className="font-medium text-foreground">{userEmail}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSetPassword} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {password && <PasswordStrengthIndicator password={password} />}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 pr-10"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-sm text-destructive">Passwords don't match</p>
            )}
            {confirmPassword && password === confirmPassword && confirmPassword.length >= 8 && (
              <p className="text-sm text-green-600">Passwords match ✓</p>
            )}
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !password || !confirmPassword || password !== confirmPassword}
            >
              {loading ? "Setting Password..." : "Set Password"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={handleSkip}
              disabled={loading}
            >
              Skip for now
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
