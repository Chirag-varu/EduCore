// pages/auth/ResetPassword.jsx
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { verifyResetTokenService, resetPasswordService } from "@/services";
import AuthNavbar from "@/components/auth/AuthNavbar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle } from "lucide-react";

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(true);
  const [isVerifying, setIsVerifying] = useState(true);
  const [resetSuccess, setResetSuccess] = useState(false);
  
  useEffect(() => {
    // Skip verification since we don't have a dedicated verify endpoint
    // The token will be verified when they submit the new password
    setIsVerifying(false);
    
    // In a production app, we would verify the token here
    // But for now, we'll just assume it's valid and let the reset API verify it
    setIsTokenValid(true);
  }, [token, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "❌ Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await resetPasswordService(token, password);

      if (response.success) {
        setResetSuccess(true);
        toast({
          title: "✅ Success",
          description: "Password reset successfully",
        });
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/auth");
        }, 3000);
      } else {
        toast({
          title: "❌ Failed",
          description: response.message || "Unable to reset password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthNavbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-73px)]">
        <div className="w-full max-w-md p-6 border rounded-lg shadow">
          <h1 className="text-xl font-bold mb-4">Reset Password</h1>
          
          {isVerifying ? (
            <div className="flex items-center justify-center p-6">
              <p>Verifying reset token...</p>
            </div>
          ) : !isTokenValid ? (
            <Alert className="bg-red-50 border-red-200 mb-4">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <AlertTitle className="text-red-800 font-medium">Invalid or expired token</AlertTitle>
              <AlertDescription className="text-red-700">
                The password reset link is invalid or has expired. Please request a new password reset link.
              </AlertDescription>
            </Alert>
          ) : resetSuccess ? (
            <Alert className="bg-green-50 border-green-200 mb-4">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <AlertTitle className="text-green-800 font-medium">Password reset successful!</AlertTitle>
              <AlertDescription className="text-green-700">
                Your password has been reset successfully. You will be redirected to the login page.
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter new password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

export default ResetPasswordPage;
