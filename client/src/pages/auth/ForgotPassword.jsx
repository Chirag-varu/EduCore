import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false); // You also need to add the loading state

  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Call backend API: POST /api/v1/auth/forgotPassword
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/v1/auth/forgotPassword",
        { email },
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data.success) {
        toast({
          title: "✅ Email Sent",
          description: "Check your inbox for the reset link",
        });
      } else {
        toast({
          title: "❌ Failed",
          description: res.data.message || "Unable to send reset email",
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
  }; // <-- Add this closing brace

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-6 border rounded-lg shadow">
        <h1 className="text-xl font-bold mb-4">Forgot Password</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Enter your email and we’ll send you a reset link.
        </p>
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
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;