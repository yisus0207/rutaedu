"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { User, Mail, Lock, UserPlus, Globe, Sparkles, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg(
          "¡Registro exitoso! Revisa tu correo electrónico para confirmar tu cuenta y poder iniciar sesión."
        );
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
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
        <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-text-primary">Crear cuenta</h1>
            <p className="text-xs text-text-secondary">Únete a RutaEdu y comienza tu camino académico ideal.</p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3.5 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-teal-50 border border-teal-200 text-teal-800 text-xs rounded-xl p-3.5 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-text-primary uppercase tracking-wider block mb-1.5">
                  Nombre
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full pl-10 pr-4 h-11 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold outline-none focus:bg-white focus:border-primary transition-all"
                    style={{ minHeight: "44px" }}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-text-primary uppercase tracking-wider block mb-1.5">
                  Apellido
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    required
                    placeholder="Ej. Pérez"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full pl-10 pr-4 h-11 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold outline-none focus:bg-white focus:border-primary transition-all"
                    style={{ minHeight: "44px" }}
                  />
                </div>
              </div>
            </div>

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
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full pl-10 pr-4 h-11 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold outline-none focus:bg-white focus:border-primary transition-all"
                  style={{ minHeight: "44px" }}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-text-primary uppercase tracking-wider block mb-1.5">
                Confirmar Contraseña
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 text-slate-400 w-4 h-4" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
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
              <UserPlus className="w-4 h-4" />
              <span>{loading ? "Registrando..." : "Crear cuenta gratis"}</span>
            </button>
          </form>

          {/* Social signup divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-200 w-full" />
            <span className="absolute bg-white px-3 text-[10px] text-text-secondary font-bold uppercase tracking-wider">
              O registrarte con
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => alert("Google Sign Up Triggered (Demo)")}
              className="flex items-center justify-center gap-2 h-11 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-text-primary transition-all"
              style={{ minHeight: "44px" }}
            >
              <Globe className="w-4 h-4 text-red-500" />
              <span>Google</span>
            </button>
            <button
              onClick={() => alert("Microsoft Sign Up Triggered (Demo)")}
              className="flex items-center justify-center gap-2 h-11 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-text-primary transition-all"
              style={{ minHeight: "44px" }}
            >
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>Microsoft</span>
            </button>
          </div>

          <p className="text-[10px] text-text-secondary text-center">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
