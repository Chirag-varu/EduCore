import { Skeleton } from "@/components/ui/skeleton";
import { initialSignInFormData, initialSignUpFormData } from "@/config";
import {
  checkAuthService,
  loginService,
  registerService,
  verifyOTPService,
} from "@/services";
import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";

export const AuthContext = createContext(null);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default function AuthProvider({ children }) {
  const [signInFormData, setSignInFormData] = useState(initialSignInFormData);
  const [signUpFormData, setSignUpFormData] = useState(initialSignUpFormData);
  const [auth, setAuth] = useState({
    authenticate: false,
    user: null,
  });
  const [loading, setLoading] = useState(true);

  async function handleRegisterUser() {
    try {
      return await registerService(signUpFormData);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error; // Re-throw the error to be handled in the component
    }
    // return await registerService(signUpFormData);
  }

  async function handleOTPVerification(otpData) {
    const data = await verifyOTPService(otpData);

    if (data.success) {
      // After successful OTP verification, login the user
      const loginData = await loginService({
        userEmail: otpData.userEmail,
        password: signUpFormData.password,
      });

      if (loginData.success) {
        sessionStorage.setItem(
          "accessToken",
          JSON.stringify(loginData.data.accessToken)
        );
        localStorage.setItem("token", loginData.data.accessToken);
        localStorage.setItem("user", JSON.stringify(loginData.data.user));
        setAuth({
          authenticate: true,
          user: loginData.data.user,
        });
      }
    }

    return data;
  }

  async function handleLoginUser(e) {
    e.preventDefault();
    const data = await loginService(signInFormData);
    console.log(data, "datadatadatadatadata");

    if (data.success) {
      sessionStorage.setItem(
        "accessToken",
        JSON.stringify(data.data.accessToken)
      );
      localStorage.setItem("token", data.data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      setAuth({
        authenticate: true,
        user: data.data.user,
      });
    } else {
      setAuth({
        authenticate: false,
        user: null,
      });
    }

    return data;
  }

  async function handleGoogleLogin(data) {
    try {
      if (data.success) {
        sessionStorage.setItem(
          "accessToken",
          JSON.stringify(data.data.accessToken)
        );
        localStorage.setItem("token", data.data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        setAuth({
          authenticate: true,
          user: data.data.user,
        });
      } else {
        setAuth({
          authenticate: false,
          user: null,
        });
      }

      return data;
    } catch (error) {
      console.error("Google login failed:", error);
      setAuth({
        authenticate: false,
        user: null,
      });
    }
  }

  //check auth user
  async function checkAuthUser() {
    try {
      const data = await checkAuthService();
      console.log("====================================");
      console.log(data);
      console.log("====================================");
      if (data.success) {
        setAuth({
          authenticate: true,
          user: data.data.user,
        });
      } else {
        setAuth({
          authenticate: false,
          user: null,
        });
      }
    } catch (error) {
      console.log(error);
      setAuth({
        authenticate: false,
        user: null,
      });
    } finally {
      setLoading(false);
    }
  }

  function resetCredentials() {
    setAuth({
      authenticate: false,
      user: null,
    });
  }

  // Unified logout helper (clears tokens and auth state)
  function logout() {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      sessionStorage.clear();
    } catch (_) {
      // noop
    }
    resetCredentials();
  }

  useEffect(() => {
    checkAuthUser();
  }, []);

  // console.log(auth, "gf");

  return (
    <AuthContext.Provider
      value={{
        signInFormData,
        setSignInFormData,
        signUpFormData,
        setSignUpFormData,
        handleRegisterUser,
        handleOTPVerification,
        handleLoginUser,
        handleGoogleLogin,
        auth,
        setAuth,
        resetCredentials,
        logout,
      }}
    >
      {loading ? <Skeleton /> : children}
    </AuthContext.Provider>
  );
}

// PropTypes validation
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
