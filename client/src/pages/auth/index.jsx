import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { AuthContext } from "@/context/auth-context";
import { useContext, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import EduCore_Logo from "@/assets/logoImg.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import auth_image from "@/assets/auth_image.jpg";

function AuthPage() {
  const {
    signInFormData,
    setSignInFormData,
    handleLoginUser,
  } = useContext(AuthContext);
  const { toast } = useToast();

  const handleSignIn = async (e) => {
    e.preventDefault(); // prevent page reload
    try {
      const res = await handleLoginUser(e);

      if (res?.success) {
        toast({
          title: "✅ Sign In Successful",
          description: "Welcome back!",
        });
      } else {
        toast({
          title: "❌ Sign In Failed",
          description: res?.message || "Invalid credentials. Please try again.",
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
      setSignInFormData({
        userEmail: "",
        password: "",
      });
    }
  };

  const checkIfSignInFormIsValid = () =>
    signInFormData.userEmail !== "" && signInFormData.password !== "";

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
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm md:max-w-3xl">
          <div className="flex flex-col gap-6">
            <Card className="overflow-hidden">
              <CardContent className="grid p-0 md:grid-cols-2">
                {/* Login Form */}
                <form className="p-6 md:p-8" onSubmit={handleSignIn}>
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center text-center">
                      <h1 className="text-2xl font-bold">Welcome back</h1>
                      <p className="text-balance text-muted-foreground">
                        Login to your EduCore account
                      </p>
                    </div>

                    {/* Email */}
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        value={signInFormData.userEmail}
                        onChange={(e) =>
                          setSignInFormData({
                            ...signInFormData,
                            userEmail: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Password */}
                    <div className="grid gap-2">
                      <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        <a
                          href="#"
                          className="ml-auto text-sm underline-offset-2 hover:underline"
                        >
                          Forgot your password?
                        </a>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        value={signInFormData.password}
                        onChange={(e) =>
                          setSignInFormData({
                            ...signInFormData,
                            password: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Submit */}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={!checkIfSignInFormIsValid()}
                      onClick={handleSignIn}
                    >
                      Login
                    </Button>

                    {/* Divider */}
                    <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                      <span className="relative z-10 bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>

                    {/* Google Login */}
                    <div className="grid gap-4 w-full">
                      <Button variant="outline" className="w-full">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                            fill="currentColor"
                          />
                        </svg>{" "}
                        Google
                        <span className="sr-only">Login with Google</span>
                      </Button>
                    </div>

                    {/* Sign Up Link */}
                    <div className="text-center text-sm">
                      Don&apos;t have an account?{" "}
                      <Link to="/signup" className="underline underline-offset-4">
                        Sign up
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
              <a href="#">Terms of Service</a> and{" "}
              <a href="#">Privacy Policy</a>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
