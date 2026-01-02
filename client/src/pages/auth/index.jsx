import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AuthContext } from "@/context/auth-context";
import { useContext, useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import EduCore_Logo from "@/assets/logoImg.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import auth_image from "@/assets/auth_image.jpg";
import { GoogleLogin } from "@react-oauth/google";
import ApiConfig from "@/lib/ApiConfig";
import { signInFormControls, signUpFormControls } from "@/config";
import GooglePasswordSetupDialog from "@/components/auth/GooglePasswordSetupDialog";

function AuthPage() {
  // Page title
  const [activeTab, setActiveTab] = useState("login");

  useEffect(() => {
    document.title = activeTab === "login" ? "Login — EduCore" : "Register — EduCore";
  }, [activeTab]);
  const {
    signInFormData,
    setSignInFormData,
    signUpFormData,
    setSignUpFormData,
    handleLoginUser,
    handleRegisterUser,
    handleGoogleLogin,
  } = useContext(AuthContext);
  const { toast } = useToast();
  const navigate = useNavigate();

  const roleRedirects = {
    instructor: "/instructor",
    student: "/home",
    admin: "/admin/newsletters",
  };

  // State for Google password setup dialog
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [googleUserEmail, setGoogleUserEmail] = useState("");
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null);

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      // Use context login to keep auth state consistent
      const response = await handleLoginUser(e);

      if (response?.success) {
        const user = response?.data?.user || JSON.parse(localStorage.getItem("user"));

        toast({
          title: "✅ Sign In Successful",
          description: "Welcome back!",
        });

        // Navigate based on role
        const redirectPath = roleRedirects[user?.role] || "/home";
        navigate(redirectPath, { replace: true });
      } else {
        toast({
          title: "❌ Sign In Failed",
          description: response?.message || "Invalid credentials.",
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
      setSignInFormData({ userEmail: "", password: "" });
    }
  };

  const googleLoginSuccess = async (credential) => {
    try {
      // Use dedicated Google login endpoint from ApiConfig
      const response = await ApiConfig.auth.googleLogin(credential);

      if (ApiConfig.isSuccessResponse(response)) {
        // Persist token and user
        if (response.data?.accessToken) {
          localStorage.setItem("token", response.data.accessToken);
        }
        if (response.data?.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }

        const user = response?.data?.user;
        
        // Check if new user needs to set password
        if (response.data?.needsPasswordSetup) {
          // DON'T update auth context yet - we need to stay on this page for password setup
          setGoogleUserEmail(user?.userEmail || "");
          setPendingGoogleUser(user);
          setShowPasswordSetup(true);
          toast({
            title: "🎉 Account created!",
            description: "Please create a password to secure your account.",
          });
        } else {
          // Update auth context only for existing users (no password setup needed)
          if (handleGoogleLogin) {
            await handleGoogleLogin(response);
          }
          toast({
            title: "✅ Google login successful",
            description: "Welcome back to EduCore!",
          });
          const redirectPath = roleRedirects[user?.role] || "/home";
          navigate(redirectPath, { replace: true });
        }
      } else {
        toast({
          title: "❌ Google login failed",
          description: ApiConfig.getErrorMessage(response),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to authenticate with Google",
        variant: "destructive",
      });
    }
  };

  const handlePasswordSetupComplete = (updatedUser) => {
    // Now update auth context after password is set/skipped
    const user = updatedUser || pendingGoogleUser;
    const token = localStorage.getItem("token");
    
    // Manually set auth state
    if (handleGoogleLogin) {
      handleGoogleLogin({
        success: true,
        data: {
          accessToken: token,
          user: user,
        }
      });
    }
    
    const redirectPath = roleRedirects[user?.role] || "/home";
    navigate(redirectPath, { replace: true });
  };

  const checkIfSignInFormIsValid = () =>
    signInFormData.userEmail !== "" && signInFormData.password !== "";

  const checkIfSignUpFormIsValid = () =>
    signUpFormData.userName !== "" &&
    signUpFormData.userEmail !== "" &&
    signUpFormData.password !== "";

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await handleRegisterUser();

      if (response?.success) {
        toast({
          title: "📧 OTP Sent",
          description: "We've sent a verification code to your email.",
        });
        // Navigate to signup page for OTP verification
        navigate("/auth/signup", { state: { step: 2, email: signUpFormData.userEmail } });
      } else {
        toast({
          title: "❌ Registration failed",
          description: response?.message || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderControls = useMemo(() => ({
    login: signInFormControls,
    register: signUpFormControls,
  }), []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link to={"/"} className="flex items-center justify-center">
          <img src={EduCore_Logo} alt="EduCore Logo" className="w-11" />
          <span className="font-extrabold text-xl">EduCore</span>
        </Link>
      </header>

      {/* Auth Section */}
      <div className="bg-muted flex h-screen items-center justify-center">
        <div className="w-full max-w-sm md:max-w-3xl">
          <div className="flex flex-col gap-6">
            <Card className="overflow-hidden">
              <CardContent className="grid p-0 md:grid-cols-2">
                {/* Auth Forms with Tabs */}
                <div className="p-6 md:p-8">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="login">Login</TabsTrigger>
                      <TabsTrigger value="register">Register</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login">
                      <form className="mt-4 flex flex-col gap-6" onSubmit={handleSignIn}>
                        <div className="flex flex-col items-center text-center">
                          <h1 className="text-2xl font-bold">Welcome back</h1>
                          <p className="text-balance text-muted-foreground">
                            Login to your EduCore account
                          </p>
                        </div>

                        {/* Dynamic Login Controls */}
                        {renderControls.login.map((ctrl) => (
                          <div className="grid gap-2" key={ctrl.name}>
                            <Label htmlFor={`login-${ctrl.name}`}>{ctrl.label}</Label>
                            <Input
                              id={`login-${ctrl.name}`}
                              type={ctrl.type}
                              placeholder={ctrl.placeholder}
                              autoComplete={ctrl.name === "userEmail" ? "email" : "current-password"}
                              required
                              value={signInFormData[ctrl.name]}
                              onChange={(e) =>
                                setSignInFormData({
                                  ...signInFormData,
                                  [ctrl.name]: e.target.value,
                                })
                              }
                            />
                          </div>
                        ))}

                        {/* Forgot Password Link */}
                        <div className="flex items-center justify-end -mt-2">
                          <Link
                            to="/auth/forgotPassword"
                            className="ml-auto text-sm underline-offset-2 hover:underline"
                          >
                            Forgot your password?
                          </Link>
                        </div>

                        {/* Submit */}
                        <Button type="submit" className="w-full" disabled={!checkIfSignInFormIsValid()}>
                          Login
                        </Button>

                        {/* Divider */}
                        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                          <span className="relative z-10 bg-background px-2 text-muted-foreground">
                            Or
                          </span>
                        </div>

                        {/* Google Login */}
                        <div className="grid gap-4 w-full">
                          <GoogleLogin
                            onSuccess={(credentialResponse) => {
                              googleLoginSuccess(credentialResponse.credential);
                            }}
                            onError={() => {
                              console.log("Login Failed");
                            }}
                            text="continue_with"
                          />
                        </div>
                      </form>
                    </TabsContent>

                    <TabsContent value="register">
                      <form className="mt-4 flex flex-col gap-6" onSubmit={handleRegister}>
                        <div className="flex flex-col items-center text-center">
                          <h1 className="text-2xl font-bold">Create your account</h1>
                          <p className="text-balance text-muted-foreground">
                            Join EduCore and start learning
                          </p>
                        </div>

                        {/* Dynamic Register Controls */}
                        {renderControls.register.map((ctrl) => (
                          <div className="grid gap-2" key={ctrl.name}>
                            <Label htmlFor={`register-${ctrl.name}`}>{ctrl.label}</Label>
                            <Input
                              id={`register-${ctrl.name}`}
                              type={ctrl.type}
                              placeholder={ctrl.placeholder}
                              autoComplete={
                                ctrl.name === "userEmail" ? "email" : ctrl.name === "password" ? "new-password" : "on"
                              }
                              required
                              value={signUpFormData[ctrl.name]}
                              onChange={(e) =>
                                setSignUpFormData({
                                  ...signUpFormData,
                                  [ctrl.name]: e.target.value,
                                })
                              }
                            />
                          </div>
                        ))}

                        {/* Submit */}
                        <Button type="submit" className="w-full" disabled={!checkIfSignUpFormIsValid()}>
                          Create account
                        </Button>

                        {/* Switch to Login */}
                        <div className="text-center text-sm">
                          Already have an account?{" "}
                          <button
                            type="button"
                            onClick={() => setActiveTab("login")}
                            className="underline underline-offset-4"
                          >
                            Sign in
                          </button>
                        </div>
                      </form>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Right Image */}
                <div className="relative hidden md:block">
                  <div className="absolute left-0 top-0 h-full w-[2px] bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200"></div>
                  <img
                    src={auth_image}
                    alt="Authentication"
                    className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Terms */}
            <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
              By clicking continue, you agree to our{" "}
              <a
                href="https://github.com/Chirag-varu/EduCore/blob/main/LICENSE"
                target="_blank"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="https://github.com/Chirag-varu/EduCore/blob/main/LICENSE"
                target="_blank"
              >
                Privacy Policy
              </a>
              .
            </div>
          </div>
        </div>
      </div>

      {/* Google Password Setup Dialog */}
      <GooglePasswordSetupDialog
        isOpen={showPasswordSetup}
        onClose={() => setShowPasswordSetup(false)}
        onSuccess={handlePasswordSetupComplete}
        userEmail={googleUserEmail}
      />
    </div>
  );
}

export default AuthPage;
