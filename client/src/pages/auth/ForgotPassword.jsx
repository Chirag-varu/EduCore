import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { requestPasswordResetService } from "@/services"; 
import AuthNavbar from "@/components/auth/AuthNavbar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; 
import { CheckCircle2 } from "lucide-react";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    document.title = "Forgot Password — EduCore";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await requestPasswordResetService(email);

      if (response.success) {
        setIsEmailSent(true);
        toast({
          title: "✅ Email Sent",
          description: "Check your inbox for the password reset link",
        });
      } else {
        toast({
          title: "❌ Failed",
          description: response.message || "Unable to send reset email",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
      console.log('====================================');
      console.log(error);
      console.log('====================================');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthNavbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-73px)]">
        <div className="w-full max-w-md p-6 border rounded-lg shadow">
          <h1 className="text-xl font-bold mb-4">Forgot Password</h1>
          
          {isEmailSent ? (
            <Alert className="bg-green-50 border-green-200 mb-4">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <AlertTitle className="text-green-800 font-medium">Check your email</AlertTitle>
              <AlertDescription className="text-green-700">
                We've sent a password reset link to <span className="font-medium">{email}</span>. 
                Please check your inbox and follow the instructions to reset your password.
              </AlertDescription>
            </Alert>
          ) : (
            <p className="text-sm text-muted-foreground mb-6">
              Enter your email and we'll send you a reset link.
            </p>
          )}
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isEmailSent}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || isEmailSent}
            >
              {loading ? "Sending..." : isEmailSent ? "Email Sent" : "Send Reset Link"}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}

export default ForgotPasswordPage;