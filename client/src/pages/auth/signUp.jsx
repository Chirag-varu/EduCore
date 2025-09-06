import { Card, CardContent } from "@/components/ui/card";
import { AuthContext } from "@/context/auth-context";
import { useContext, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import EduCore_Logo from "@/assets/logoImg.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import auth_image from "@/assets/auth_image.jpg";
import { GoogleLogin } from "@react-oauth/google";

function Sign_up() {
  const {
    signUpFormData,
    setSignUpFormData,
    handleRegisterUser,
    handleOTPVerification,
    handleGoogleLogin,
  } = useContext(AuthContext);

  const { toast } = useToast();
  const [registrationStep, setRegistrationStep] = useState(1); // 1 = registration form, 2 = OTP verification
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await handleRegisterUser(signUpFormData);

      if (res?.success) {
        toast({
          title: "📧 OTP Sent",
          description: "We've sent a verification code to your email.",
        });
        setRegistrationStep(2);
      } else {
        toast({
          title: "❌ Failed to Send OTP",
          description: res?.message || "Something went wrong. Try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await handleOTPVerification({
        userEmail: signUpFormData.userEmail,
        user_otp: otp,
      });

      if (res?.success) {
        toast({
          title: "🎉 Account Verified",
          description: "Your account has been successfully created!",
        });
        // Form will be reset by the context after successful registration
      } else {
        toast({
          title: "❌ Verification Failed",
          description: res?.message || "Invalid OTP. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToRegistration = () => {
    setRegistrationStep(1);
    setOtp("");
  };

  //   const googleSignupSuccess = async (credential) => {
  //     try {
  //       const res = await axios.post(
  //         "http://localhost:5000/api/v1/auth/google/signup",
  //         { credential },
  //         { headers: { "Content-Type": "application/json" } }
  //       );

  //       const data = await handleGoogleLogin(res.data);
  //       if (data) {
  //         toast({ title: "✅ Google signup successful" });
  //       } else {
  //         toast({
  //           title: "❌ Google signup failed",
  //           description: data.message || "Failed to create account with Google",
  //           variant: "destructive",
  //         });
  //       }
  //     } catch (error) {
  //       toast({
  //         title: "❌ Error",
  //         description: error.response?.data?.message || error.message,
  //         variant: "destructive",
  //       });
  //     }
  //   };

  const checkIfSignUpFormIsValid = () => {
    return (
      signUpFormData.userName.trim() !== "" &&
      signUpFormData.userEmail.trim() !== "" &&
      signUpFormData.password.trim() !== ""
    );
  };

  const checkIfOtpFormIsValid = () => {
    return otp.trim().length === 6;
  };

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
                {/* Registration Form Step 1 */}
                {registrationStep === 1 && (
                  <form className="p-6 md:p-8" onSubmit={handleSignUp}>
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col items-center text-center">
                        <h1 className="text-2xl font-bold">Create Account</h1>
                        <p className="text-balance text-muted-foreground">
                          Sign up for your EduCore account
                        </p>
                      </div>

                      {/* Full Name */}
                      <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="your name"
                          required
                          value={signUpFormData.userName}
                          onChange={(e) =>
                            setSignUpFormData({
                              ...signUpFormData,
                              userName: e.target.value,
                            })
                          }
                        />
                      </div>

                      {/* Email */}
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          autoComplete="email"
                          required
                          value={signUpFormData.userEmail}
                          onChange={(e) =>
                            setSignUpFormData({
                              ...signUpFormData,
                              userEmail: e.target.value,
                            })
                          }
                        />
                      </div>

                      {/* Password */}
                      <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••••"
                          autoComplete="new-password"
                          required
                          value={signUpFormData.password}
                          onChange={(e) =>
                            setSignUpFormData({
                              ...signUpFormData,
                              password: e.target.value,
                            })
                          }
                        />
                      </div>

                      {/* Submit */}
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={!checkIfSignUpFormIsValid() || loading}
                      >
                        {loading ? "Sending OTP..." : "Send Verification Code"}
                      </Button>

                      {/* Divider */}
                      <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                        <span className="relative z-10 bg-background px-2 text-muted-foreground">
                          Or
                        </span>
                      </div>

                      {/* Google Signup */}
                      <div className="grid gap-4 w-full">
                        <GoogleLogin
                          onSuccess={(credentialResponse) => {
                            googleLoginSuccess(credentialResponse.credential);
                          }}
                          onError={() => {
                            console.log("Google SignUp Failed");
                          }}
                          text="continue_with"
                        />
                      </div>

                      {/* Login Link */}
                      <div className="text-center text-sm">
                        Already have an account?{" "}
                        <Link
                          to="/auth"
                          className="underline underline-offset-4"
                        >
                          Log in
                        </Link>
                      </div>
                    </div>
                  </form>
                )}

                {/* OTP Verification Step 2 */}
                {registrationStep === 2 && (
                  <form className="p-6 md:p-8" onSubmit={handleVerifyOTP}>
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col items-center text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleBackToRegistration}
                          className="self-start mb-2"
                        >
                          ← Back
                        </Button>
                        <h1 className="text-2xl font-bold">Verify Email</h1>
                        <p className="text-balance text-muted-foreground">
                          Enter the verification code sent to{" "}
                          {signUpFormData.userEmail}
                        </p>
                      </div>

                      {/* OTP Input */}
                      <div className="grid gap-2">
                        <Label htmlFor="otp">Verification Code</Label>
                        <Input
                          id="otp"
                          type="text"
                          placeholder="Enter 6-digit code"
                          required
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          maxLength={6}
                        />
                      </div>

                      {/* Submit */}
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={!checkIfOtpFormIsValid() || loading}
                      >
                        {loading ? "Verifying..." : "Verify & Create Account"}
                      </Button>

                      {/* Resend OTP Option */}
                      <div className="text-center text-sm">
                        Didn't receive the code?{" "}
                        <Button
                          variant="link"
                          className="p-0 h-auto"
                          onClick={handleSignUp}
                          disabled={loading}
                        >
                          Resend code
                        </Button>
                      </div>
                    </div>
                  </form>
                )}

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
            {registrationStep === 1 && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sign_up;
