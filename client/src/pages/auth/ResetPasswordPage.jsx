// pages/auth/ResetPassword.jsx
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
      const res = await axios.post(
        `http://localhost:5000/api/v1/auth/resetPassword/${token}`,
        { password },
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data.success) {
        toast({
          title: "✅ Success",
          description: "Password reset successfully",
        });
        navigate("/auth"); // back to login
      } else {
        toast({
          title: "❌ Failed",
          description: res.data.message || "Unable to reset password",
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
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-6 border rounded-lg shadow">
        <h1 className="text-xl font-bold mb-4">Reset Password</h1>
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
      </div>
    </div>
  );
}

export default ResetPasswordPage;
