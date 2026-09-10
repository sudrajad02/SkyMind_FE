import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// 1. IMPORT IKON DARI LUCIDE-REACT
// Lucide-react menyediakan kumpulan ikon vektor (SVG) yang ringan dan mudah di-custom ukurannya via class Tailwind
import {
  Sparkles, // Ikon logo utama (bintang berkilau)
  Zap, // Ikon petir untuk fitur "Fast answers"
  ShieldCheck, // Ikon perisai centang untuk fitur "Private by design"
  Users, // Ikon pengguna untuk fitur "Built for everyone"
  Mail, // Ikon amplop di dalam input Email
  LockKeyhole, // Ikon gembok di dalam input Password
  Eye, // Ikon mata terbuka (saat password disembunyikan/show toggle)
  EyeOff, // Ikon mata dicoret (saat password terlihat)
  ArrowRight, // Ikon panah kanan pada tombol "Sign in"
} from "lucide-react";

// 2. IMPORT KOMPONEN UI DARI SHADCN
// Komponen-komponen ini modular, siap pakai, accessible, dan sudah terintegrasi dengan Tailwind CSS
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

export default function Login() {
  // Hook navigasi dari React Router untuk berpindah halaman secara terprogram
  const navigate = useNavigate();
  // ==========================================
  // STATE MANAGEMENT (Penyimpanan Data Lokal)
  // ==========================================

  // State untuk toggle visibilitas password:
  // false = tipe input "password" (karakter tertutup bintang/titik)
  // true = tipe input "text" (karakter password terbaca)
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // State untuk mencatat apakah checkbox "Remember me" dicentang atau tidak
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  // State status loading saat user menekan tombol login (misal menunggu respon API)
  const [loading, setLoading] = useState<boolean>(false);

  // State objek untuk menampung nilai input email dan password secara terkontrol (controlled inputs)
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // ==========================================
  // EVENT HANDLERS (Fungsi Pengendali Aksi)
  // ==========================================

  /**
   * Mengupdate state `form` secara dinamis saat user mengetik.
   * `event.target.name` mengambil nama input ("email" atau "password")
   * `event.target.value` mengambil teks yang sedang diketik user
   */
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  /**
   * Menangani pengiriman form saat user menekan Enter atau klik tombol "Sign in"
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    // Mencegah perilaku default form HTML (yang biasanya me-refresh seluruh halaman)
    event.preventDefault();

    // Validasi sederhana: pastikan email dan password tidak kosong
    if (!form.email || !form.password) {
      return;
    }

    // Mengaktifkan status loading (tombol akan disabled & teks berganti "Signing in...")
    setLoading(true);

    try {
      // Simulasi jeda request ke server selama 1 detik (1000ms)
      // Nantinya bisa diganti dengan fetch/axios ke backend autentikasi kamu:
      // const res = await fetch("/api/auth/login", { method: "POST", body: JSON.stringify(form) });
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Data Login:", {
        email: form.email,
        password: form.password,
        rememberMe,
      });

      // Berpindah ke halaman chat setelah login berhasil
      navigate("/chat");
    } catch (error) {
      console.error("Login gagal:", error);
    } finally {
      // Mematikan status loading setelah proses selesai (baik sukses maupun gagal)
      setLoading(false);
    }
  };

  /**
   * Menangani autentikasi menggunakan akun Google
   */
  const handleGoogleLogin = () => {
    // TODO: Pasang integrasi OAuth Google (misal: Firebase, Supabase, atau Google Identity Services)
    console.log("Tombol Google login diklik");
    // Langsung arahkan ke halaman chat
    navigate("/chat");
  };

  // ==========================================
  // TAMPILAN (JSX / UI)
  // ==========================================
  return (
    // <main>: Tag semantik HTML5 untuk konten utama halaman.
    // min-h-screen: Tinggi minimal 100vh (seluruh tinggi layar browser).
    // bg-background: Menggunakan warna latar belakang dari tema shadcn.
    <main className="min-h-screen bg-background">
      {/* 
        GRID LAYOUT 2 KOLOM:
        - Di layar HP (< 1024px): 1 kolom biasa (karena grid-cols tidak diset secara default).
        - Di layar laptop/desktop (lg:): dibagi menjadi 2 kolom sama lebar (lg:grid-cols-2).
      */}
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* =========================================================================
            SISI KIRI: PANEL BRANDING & FITUR
            - hidden: Di HP/tablet disembunyikan agar layar tidak penuh sesak.
            - lg:flex: Di layar desktop (>= 1024px) ditampilkan dalam mode Flexbox.
            - bg-zinc-950: Background gelap modern.
        ========================================================================= */}
        <section className="relative hidden overflow-hidden bg-zinc-950 lg:flex">
          {/* Efek dekorasi lingkaran blur abstrak di latar belakang */}
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-white/[0.04]" />
          <div className="absolute -bottom-40 -right-20 h-[500px] w-[500px] rounded-full bg-white/[0.03]" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
            {/* Bagian Atas: Logo Aplikasi */}
            <div className="flex items-center gap-3 text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/5">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-lg font-semibold">ChatBotApp</span>
            </div>

            {/* Bagian Tengah: Judul Promosi & Daftar Fitur */}
            <div className="max-w-lg">
              <p className="mb-5 text-sm font-medium text-zinc-400">
                AI ASSISTANT
              </p>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">
                Smarter conversations. <br /> Better results.
              </h1>
              <p className="mt-6 max-w-md text-base leading-7 text-zinc-400">
                Get help with writing, coding, learning, brainstorming,
                research, and everyday tasks with your AI assistant.
              </p>

              {/* Memanggil komponen reusable <Feature /> untuk menampilkan poin-poin keunggulan */}
              <div className="mt-10 space-y-5">
                <Feature
                  icon={Zap}
                  title="Fast answers"
                  description="Get useful answers in seconds."
                />
                <Feature
                  icon={ShieldCheck}
                  title="Private by design"
                  description="Your conversations stay protected."
                />
                <Feature
                  icon={Users}
                  title="Built for everyone"
                  description="A simple AI experience for every workflow."
                />
              </div>
            </div>

            {/* Bagian Bawah: Copyright Footer */}
            <p className="text-xs text-zinc-600">
              &copy; 2026 ChatBotApp. All rights reserved.
            </p>
          </div>
        </section>

        {/* =========================================================================
            SISI KANAN: FORMULIR LOGIN
            - flex items-center justify-center: Menempatkan kartu form tepat di tengah layar.
        ========================================================================= */}
        <section className="flex min-h-screen items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Logo untuk Tampilan Mobile (hanya muncul di layar kecil, tersembunyi di desktop: lg:hidden) */}
            <div className="mb-12 flex items-center gap-3 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-950 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-semibold">ChatBotApp</span>
            </div>

            {/* Header Form */}
            <div className="mb-8">
              <p className="mb-2 text-sm text-muted-foreground">Welcome back</p>
              <h2 className="text-3xl font-semibold tracking-tight">
                Sign in to ChatBotApp
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Continue your conversations and pick up right where you left
                off.
              </p>
            </div>

            {/* Formulir Utama */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* INPUT 1: EMAIL */}
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  {/* Ikon amplop ditempatkan secara absolut di sisi kiri dalam input */}
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    className="h-11 pl-10" /* pl-10 memberi padding kiri agar teks tidak menimpa ikon */
                  />
                </div>
              </div>

              {/* INPUT 2: PASSWORD */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  {/* Ikon gembok di sisi kiri */}
                  <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={
                      showPassword ? "text" : "password"
                    } /* Dinamis tergantung state showPassword */
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    className="h-11 pl-10 pr-10" /* pr-10 memberi ruang untuk tombol mata di kanan */
                  />
                  {/* Tombol toggle mata untuk melihat/menyembunyikan password */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* OPSI: REMEMBER ME & FORGOT PASSWORD */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(!!checked)}
                  />
                  <Label
                    htmlFor="remember"
                    className="cursor-pointer text-sm font-normal text-muted-foreground"
                  >
                    Remember me
                  </Label>
                </div>
                <a
                  href="/forgot-password"
                  className="text-sm font-medium underline-offset-4 hover:underline"
                >
                  Forgot password?
                </a>
              </div>

              {/* TOMBOL SUBMIT: SIGN IN */}
              <Button type="submit" disabled={loading} className="h-11 w-full">
                {loading ? "Signing in..." : "Sign in"}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>

              {/* GARIS PEMISAH "OR" */}
              <div className="flex items-center gap-4 py-2">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">OR</span>
                <Separator className="flex-1" />
              </div>

              {/* TOMBOL SOCIAL: LOGIN DENGAN GOOGLE */}
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full"
                onClick={handleGoogleLogin}
              >
                <GoogleIcon /> Continue with Google
              </Button>
            </form>

            {/* LINK REGISTRASI / BUAT AKUN */}
            <p className="mt-8 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <a
                href="/register"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Create an account
              </a>
            </p>

            {/* SYARAT & KETENTUAN (TERMS OF SERVICE) */}
            <p className="mt-8 text-center text-xs leading-5 text-muted-foreground">
              By continuing, you agree to our{" "}
              <a href="/terms" className="underline underline-offset-4">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="underline underline-offset-4">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

// =========================================================================
// KOMPONEN HELPER 1: FEATURE ITEM
// Digunakan untuk menampilkan poin fitur di panel samping kiri secara rapi & reusable
// =========================================================================

// TypeScript Interface: Menentukan tipe data apa saja yang wajib dikirim ke komponen Feature
interface FeatureProps {
  icon: React.ComponentType<{ className?: string }>; // Menerima komponen ikon Lucide
  title: string; // Teks judul fitur
  description: string; // Teks penjelasan singkat
}

function Feature({ icon: Icon, title, description }: FeatureProps) {
  return (
    <div className="flex items-center gap-4">
      {/* Kotak latar belakang ikon dengan border tipis transparan */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
        <Icon className="h-4 w-4 text-zinc-300" />
      </div>
      <div>
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="mt-1 text-xs text-zinc-500">{description}</p>
      </div>
    </div>
  );
}

// =========================================================================
// KOMPONEN HELPER 2: GOOGLE ICON (LOGO GOOGLE RESMI)
// Dibuat menggunakan elemen SVG murni (Scalable Vector Graphics).
// Setiap tag <path> merepresentasikan satu segmen warna khas dari huruf "G" Google:
// 1. Biru (#4285F4)   -> Sayap horizontal kanan
// 2. Hijau (#34A853)  -> Lengkungan bawah
// 3. Kuning (#FBBC05) -> Lengkungan kiri bawah
// 4. Merah (#EA4335)  -> Lengkungan atas
// Keuntungannya: Tidak perlu mengunduh gambar eksternal (png/jpg) sehingga lebih cepat,
// tajam di semua resolusi layar, dan ukuran filenya sangat kecil.
// =========================================================================
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" aria-hidden="true">
      {/* Bagian 1: Biru (Sayap kanan) */}
      <path
        fill="#4285F4"
        d="M21.35 12.27c0-.68-.06-1.35-.18-1.98H12v3.75h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.16Z"
      />
      {/* Bagian 2: Hijau (Lengkungan bawah) */}
      <path
        fill="#34A853"
        d="M12 21.5c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.93-3.31.93-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.5Z"
      />
      {/* Bagian 3: Kuning (Lengkungan kiri) */}
      <path
        fill="#FBBC05"
        d="M6.54 13.6a5.85 5.85 0 0 1 0-3.2V7.87H3.3a9.5 9.5 0 0 0 0 8.26l3.24-2.53Z"
      />
      {/* Bagian 4: Merah (Lengkungan atas) */}
      <path
        fill="#EA4335"
        d="M12 6.37c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.83 3.48 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.7 5.37l3.24 2.53C7.31 8.09 9.46 6.37 12 6.37Z"
      />
    </svg>
  );
}
