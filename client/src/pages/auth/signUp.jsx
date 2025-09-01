import { Card, CardContent } from "@/components/ui/card";
import { AuthContext } from "@/context/auth-context";
import { useContext } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import EduCore_Logo from "@/assets/logoImg.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import auth_image from "@/assets/auth_image.jpg";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

function Sign_up() {
  const {
    signUpFormData,
    setSignUpFormData,
    handleRegisterUser,
    handleGoogleLogin,
  } = useContext(AuthContext);

  const { toast } = useToast();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const res = await handleRegisterUser(e);

      if (res?.success) {
        toast({
          title: "🎉 Account Created",
          description: "Welcome to EduCore! Please login.",
        });
      } else {
        toast({
          title: "❌ Sign Up Failed",
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
      setSignUpFormData({
        fullName: "",
        userEmail: "",
        password: "",
      });
    }
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

  const checkIfSignUpFormIsValid = () =>
    signUpFormData.fullName !== "" &&
    signUpFormData.userEmail !== "" &&
    signUpFormData.password !== "";

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
                {/* SignUp Form */}
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
                        value={signUpFormData.fullName}
                        onChange={(e) =>
                          setSignUpFormData({
                            ...signUpFormData,
                            fullName: e.target.value,
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
                      disabled={!checkIfSignUpFormIsValid()}
                      onClick={handleSignUp}
                    >
                      Sign Up
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
    </div>
  );
}

export default Sign_up;
