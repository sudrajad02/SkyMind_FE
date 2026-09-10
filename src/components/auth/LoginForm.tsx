import { Check, Eye, EyeOff, Lock, Mail } from "lucide-react";
import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import googleIcon from "@/assets/icon_google.svg";
import windowsIcon from "@/assets/icon_windows.svg";
import appleIcon from "@/assets/icon_apple.svg";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export function LoginForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });

    if (error) setError("");
  };

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.email || !form.password) {
      setError("Email/Password wajib diisi.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Ambil URL dari environment variable (dengan fallback default jika kosong)
      const apiUrl = import.meta.env.VITE_BE_URL;

      // Send request POST menggunakan AXIOS
      const response = await axios.post(`${apiUrl}/auth/login`, {
        email: form.email,
        password: form.password,
      });

      // Save access token ke local storage
      if (response.data?.data?.access_token) {
        localStorage.setItem("access_token", response.data.data.access_token);
        if (response.data?.data?.user) {
          localStorage.setItem("user", JSON.stringify(response.data.data.user));
        }
      }

      // Berpindah ke halaman chat setelah login berhasil
      navigate("/chat");
    } catch (error) {
      console.error("Login gagal:", error);

      // Tangkap error message
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Email atau password yang kamu masukkan salah.";

      setError(errorMessage);
    } finally {
      // Mematikan status loading setelah proses selesai (baik sukses maupun gagal)
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log("Google login");
  };
  const handleWindowsLogin = () => {
    console.log("Windows login");
  };
  const handleAppleLogin = () => {
    console.log("Apple login");
  };

  return (
    <div className="w-full">
      {/* Heading */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-950">
          Welcome Back
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Log in to your ChatBotApp account
        </p>
      </div>

      {/* Form */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-md text-red-900 flex items-center justify-center">
          {error}
        </div>
      )}
      <form onSubmit={handleLogin} className="space-y-4">
        {/* Email */}
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            className="h-11 pl-10"
          />
        </div>

        {/* Password */}
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            className="h-11 pl-10 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? (
              <EyeOff className="h-4-w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setRememberMe(!rememberMe)}
            className="flex items-center gap-2 text-sm text-slate-600"
          >
            <span
              className={`flex h-4 w-4 items-center justify-center rounded border ${rememberMe ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white"}`}
            >
              {rememberMe && <Check className="h-3 w-3" />}
            </span>
            Remember me
          </button>
          <button
            type="button"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            Forgot password?
          </button>
        </div>

        {/* Login */}
        <Button
          type="submit"
          className="h-11 w-full bg-slate-950 text-white hover:bg-slate-800"
        >
          {loading ? "Log in..." : "Log in"}
        </Button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs text-slate-400">or continue with</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {/* Social Login */}
      <div className="space-y-3">
        <SocialButton onClick={handleGoogleLogin}>
          <img src={googleIcon} alt="Google" className="h-5 w-5" />
          Continue with Google
        </SocialButton>

        <SocialButton onClick={handleWindowsLogin}>
          <img src={windowsIcon} alt="Windows" className="h-5 w-5" />
          Continue with Microsoft
        </SocialButton>

        <SocialButton onClick={handleAppleLogin}>
          <img src={appleIcon} alt="Apple" className="h-5 w-5" />
          Continue with Apple
        </SocialButton>
      </div>

      {/* Register */}
      <p className="mt-10 text-center text-sm text-slate-500">
        Don't have an account?{" "}
        <button
          type="button"
          className="font-medium text-emerald-600 hover:text-emerald-700"
        >
          Sign up
        </button>
      </p>
    </div>
  );
}

function SocialButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      className="h-11 w-full gap-3 border-slate-200 bg-white text-sm font-medium hover:bg-slate-50"
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
