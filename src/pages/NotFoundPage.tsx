import { Button } from "@/components/ui/button";
import { ArrowLeft, CloudOff, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function NotFoundPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  const targetHome = token ? "/chat" : "/login";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f4f7fa] px-6 text-center">
      <div className="mx-auto max-w-md">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/60">
          <CloudOff className="h-10 w-10 text-slate-400" />
        </div>

        <p className="text-sm font-semibold tracking-wider text-emerald-600 uppercase">
          404 Error
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-3 text-sm text-slate-500 leading-relaxed">
          Maaf, halaman yang kamu cari tidak dapat ditemukan atau mungkin telah
          dipindahkan.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="gap-2 border-slate-300 bg-white hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>

          <Button
            onClick={() => navigate(targetHome)}
            className="gap-2 bg-slate-950 text-white hover:bg-slate-800"
          >
            <Home className="h-4 w-4" />
            {token ? "Kembali ke chat" : "Kembali ke login"}
          </Button>
        </div>
      </div>
    </main>
  );
}
