"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { LogIn, Mail, Lock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="flex-1 flex flex-col justify-center items-center px-4 py-12">
        <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-text-primary">Iniciar sesión</h1>
            <p className="text-xs text-text-secondary">Encuentra tu camino académico y guarda tus opciones favoritas.</p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3.5 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-text-primary uppercase tracking-wider block mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 text-slate-400 w-4 h-4" />
                <input
                  type="email"
                  required
                  placeholder="nombre@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full pl-10 pr-4 h-11 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold outline-none focus:bg-white focus:border-primary transition-all"
                  style={{ minHeight: "44px" }}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-text-primary uppercase tracking-wider block mb-1.5">
                Contraseña
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 text-slate-400 w-4 h-4" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full pl-10 pr-4 h-11 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold outline-none focus:bg-white focus:border-primary transition-all"
                  style={{ minHeight: "44px" }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
              style={{ minHeight: "48px" }}
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? "Iniciando..." : "Ingresar con correo"}</span>
            </button>
          </form>

          {/* Social login providers divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-200 w-full" />
            <span className="absolute bg-white px-3 text-[10px] text-text-secondary font-bold uppercase tracking-wider">
              O continuar con
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={async () => {
                await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/dashboard` } });
              }}
              className="flex items-center justify-center gap-2 h-11 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-text-primary transition-all"
              style={{ minHeight: "44px" }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              <span>Google</span>
            </button>
            <button
              onClick={async () => {
                await supabase.auth.signInWithOAuth({ provider: "azure", options: { redirectTo: `${window.location.origin}/dashboard` } });
              }}
              className="flex items-center justify-center gap-2 h-11 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-text-primary transition-all"
              style={{ minHeight: "44px" }}
            >
              <svg viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4"><path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M12 1h10v10H12z"/><path fill="#05a6f0" d="M1 12h10v10H1z"/><path fill="#ffba08" d="M12 12h10v10H12z"/></svg>
              <span>Microsoft</span>
            </button>
          </div>

          <p className="text-[10px] text-text-secondary text-center">
            ¿No tienes cuenta?{" "}
            <Link href="/registro" className="text-primary font-bold hover:underline">
              Regístrate gratis
            </Link>
          </p>

        </div>
      </main>
    </div>
  );
}
