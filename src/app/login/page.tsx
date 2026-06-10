"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { LogIn, Mail, Lock, Sparkles, Globe } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Inicio de sesión de demostración exitoso.");
    }, 1000);
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
              onClick={() => alert("Google Auth Triggered (Demo)")}
              className="flex items-center justify-center gap-2 h-11 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-text-primary transition-all"
              style={{ minHeight: "44px" }}
            >
              <Globe className="w-4 h-4 text-red-500" />
              <span>Google</span>
            </button>
            <button
              onClick={() => alert("Microsoft Auth Triggered (Demo)")}
              className="flex items-center justify-center gap-2 h-11 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-text-primary transition-all"
              style={{ minHeight: "44px" }}
            >
              <Sparkles className="w-4 h-4 text-blue-500" />
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
