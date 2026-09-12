import axios from "axios";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import googleIcon from "@/assets/icon_google.svg";

interface RegisterFormProps {
  onSwitchToLogin: (registeredEmail?: string) => void;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    full_name: "",
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

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.full_name || !form.email || !form.password) {
      setError("Semua field wajib diisi.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_BE_URL;
      const response = await axios.post(`${apiUrl}/auth/register`, {
        full_name: form.full_name,
        email: form.email,
        password: form.password,
      });

      console.log("Registrasi berhasil:", response.data);
      setSuccess("Pendaftaran berhasil! Mengalihkan ke halaman login...");

      setTimeout(() => {
        onSwitchToLogin(form.email);
      }, 1200);
    } catch (err: any) {
      console.error("Registrasi gagal:", err);
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Gagal mendaftar. Silakan coba lagi.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Heading */}
      <div className="mb-4">
        <h2 className="text-3xl font-bold tracking-tight text-slate-950">
          Create an account
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Sign up to get started with SkyMind.
        </p>
      </div>

      {/* Message Success */}
      {success && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {/* Message Error */}
      {error && (
        <div className="mb-4 flex items-center justify-center rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleRegister} className="space-y-4">
        {/* Full Name */}
        <div className="relative">
          <User className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="full_name"
            name="full_name"
            type="text"
            placeholder="Full Name"
            value={form.full_name}
            onChange={handleChange}
            autoComplete="full-name"
            className="pl-10 h-11"
          />
        </div>

        {/* Email */}
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            className="pl-10 h-11"
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
            autoComplete="new-password"
            className="pl-10 h-11"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Tombol Submit */}
        <Button
          type="submit"
          disabled={loading}
          className="h-11 w-full bg-slate-950 text-white hover:bg-slate-800"
        >
          {loading ? "Creating account..." : "Sign up"}
        </Button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs text-slate-400">or continue with</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {/* Social Button */}
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full gap-3 border-slate-200 bg-white text-sm font-medium hover:bg-slate-50"
      >
        <img src={googleIcon} alt="Google" className="h-5 w-5" />
        Continue with Google
      </Button>

      {/* Switch ke Login */}
      <p className="mt-8 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => onSwitchToLogin()}
          className="font-medium text-emerald-600 hover:text-emerald-700"
        >
          Log in
        </button>
      </p>
    </div>
  );
}
