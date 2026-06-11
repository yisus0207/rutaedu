"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { 
  Users, Shield, Plus, CheckCircle, AlertTriangle, 
  Mail, Lock, BookOpen, RefreshCw, Key, ArrowRight 
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

// Local Type Definitions
type PartnerAdmin = {
  id: string;
  user_id: string;
  campus_id: string;
  campuses: {
    name: string;
    address: string;
    institutions: {
      name: string;
      slug: string;
    } | null;
  } | null;
  profiles: {
    email: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [partners, setPartners] = useState<PartnerAdmin[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Form States
  const [form, setForm] = useState({
    email: "",
    password: "",
    universityName: ""
  });
  const [formLoading, setFormLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    checkAdminSession();
  }, []);

  const checkAdminSession = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role_id")
        .eq("id", session.user.id)
        .single();

      if (profile?.role_id) {
        const { data: role } = await supabase
          .from("roles")
          .select("name")
          .eq("id", profile.role_id)
          .single();
        
        if (role?.name === "super_admin") {
          setIsAdmin(true);
          await loadPartners();
          setLoading(false);
          return;
        }
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Error checking admin status:", err);
      router.push("/dashboard");
    }
  };

  const loadPartners = async () => {
    setRefreshing(true);
    try {
      // Query all campus_admins linked to their campuses and institutions
      const { data, error } = await supabase
        .from("campus_admins")
        .select(`
          id,
          user_id,
          campus_id,
          campuses (
            name,
            address,
            institutions (
              name,
              slug
            )
          ),
          profiles (
            email,
            first_name,
            last_name
          )
        `);

      if (error) throw error;
      setPartners((data as unknown as PartnerAdmin[]) || []);
    } catch (err: any) {
      console.error("Error loading partners:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRegisterPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!form.email || !form.password || !form.universityName) {
      setErrorMsg("Todos los campos son obligatorios.");
      return;
    }

    if (form.password.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setFormLoading(true);

    try {
      // 1. Initialize temporary client in memory (persistSession: false)
      // to avoid signing out the current super_admin user session.
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
      
      const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      });

      // 2. Register the user in Auth
      const { data: authData, error: authError } = await tempClient.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            first_name: "Administrador",
            last_name: form.universityName
          }
        }
      });

      if (authError) throw authError;
      if (!authData?.user) throw new Error("No se pudo crear la cuenta de usuario.");

      const newUserId = authData.user.id;

      // 3. Update the user role to 'campus_admin'
      const { error: roleError } = await supabase
        .from("profiles")
        .update({ role_id: "00000000-0000-0000-0000-000000000003" }) // campus_admin UUID
        .eq("id", newUserId);

      if (roleError) throw roleError;

      // Remove default student profile created by trigger
      await supabase
        .from("student_profiles")
        .delete()
        .eq("id", newUserId);

      // 4. Create the Institution
      const cleanSlug = form.universityName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") + "-" + Math.floor(Math.random() * 1000);

      const { data: instData, error: instError } = await supabase
        .from("institutions")
        .insert({
          name: form.universityName,
          slug: cleanSlug,
          type: "universidad",
          description: `Espacio de administración de ${form.universityName}.`,
          accreditation_status: "No Acreditada",
          status: "active"
        })
        .select("id")
        .single();

      if (instError) throw instError;

      // 5. Create the Campus
      const { data: campusData, error: campusError } = await supabase
        .from("campuses")
        .insert({
          institution_id: instData.id,
          name: "Campus Principal",
          slug: `campus-principal-${cleanSlug}`,
          country_id: "d17d6cb4-e593-4a11-b1e7-fb6cf74431e7", // Colombia
          department_id: "9a63327d-ea08-41d6-8408-72648be1be76", // Bogotá D.C.
          city_id: "c0000000-0000-0000-0000-000000000001", // Bogotá
          address: "Dirección por definir",
          status: "active"
        })
        .select("id")
        .single();

      if (campusError) throw campusError;

      // 6. Link Admin to Campus
      const { error: linkError } = await supabase
        .from("campus_admins")
        .insert({
          campus_id: campusData.id,
          user_id: newUserId
        });

      if (linkError) throw linkError;

      setSuccessMsg(`¡Socio registrado con éxito! Usuario: ${form.email}`);
      setForm({ email: "", password: "", universityName: "" });
      await loadPartners();
    } catch (err: any) {
      console.error("Error registrando socio:", err);
      setErrorMsg(err.message || "Ocurrió un error inesperado.");
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FAFAF9]">
        <Navbar />
        <main className="flex-1 flex flex-col justify-center items-center py-12">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-[#00875A] animate-spin" />
            <p className="text-xs font-bold text-slate-500">Verificando nivel de acceso de administrador...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAF9] text-[#0F172A] font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Head Banner */}
        <div className="bg-gradient-to-r from-[#0A1E3A] to-[#00875A] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden mb-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent)] pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">Consola de Administración</h1>
              <p className="text-xs sm:text-sm text-emerald-100 mt-1 font-medium">
                Gestiona y registra cuentas de socios universitarios de RutaEdu.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left / Center: Partners list */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#00875A]" />
                  <h2 className="text-base sm:text-lg font-bold text-[#0A1E3A]">Socios Universitarios</h2>
                </div>
                <button
                  onClick={loadPartners}
                  disabled={refreshing}
                  className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-[#00875A] active:scale-95 transition-all"
                  title="Refrescar lista"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-[#00875A]" : ""}`} />
                </button>
              </div>

              {partners.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs font-semibold">
                  No hay socios universitarios registrados todavía.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[#64748B] font-bold uppercase tracking-wider">
                        <th className="py-3.5 px-3">Universidad</th>
                        <th className="py-3.5 px-3">Administrador</th>
                        <th className="py-3.5 px-3">Campus Principal</th>
                        <th className="py-3.5 px-3">Acceso</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                      {partners.map((partner) => {
                        const uniName = partner.campuses?.institutions?.name || "No vinculada";
                        const adminEmail = partner.profiles?.email || "Sin email";
                        const campusName = partner.campuses?.name || "Sin sede";
                        return (
                          <tr key={partner.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3.5 px-3 text-[#0A1E3A] font-extrabold">{uniName}</td>
                            <td className="py-3.5 px-3 flex flex-col">
                              <span>{adminEmail}</span>
                              <span className="text-[10px] text-slate-400 font-medium">Rol: campus_admin</span>
                            </td>
                            <td className="py-3.5 px-3 text-slate-500">{campusName}</td>
                            <td className="py-3.5 px-3">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-50 text-[#00875A]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#00875A]" />
                                Activo
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right: Quick register Form */}
          <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-5 sm:p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Plus className="w-5 h-5 text-[#00875A]" />
              <h2 className="text-base sm:text-lg font-bold text-[#0A1E3A]">Alta Rápida de Socio</h2>
            </div>

            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold rounded-2xl p-4 flex items-start gap-2.5 shadow-sm">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="bg-red-50 border border-red-100 text-red-800 text-xs font-bold rounded-2xl p-4 flex items-start gap-2.5 shadow-sm">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleRegisterPartner} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-[#0A1E3A] uppercase tracking-wider block mb-1.5">
                  Nombre de la Universidad
                </label>
                <div className="relative flex items-center">
                  <BookOpen className="absolute left-3.5 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    required
                    placeholder="Ej. Universidad del Norte"
                    value={form.universityName}
                    onChange={(e) => setForm(prev => ({ ...prev, universityName: e.target.value }))}
                    className="w-full pl-10 pr-4 h-11 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold outline-none focus:bg-white focus:border-[#00875A] transition-all"
                    style={{ minHeight: "44px" }}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#0A1E3A] uppercase tracking-wider block mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 text-slate-400 w-4 h-4" />
                  <input
                    type="email"
                    required
                    placeholder="admin@ejemplo.edu.co"
                    value={form.email}
                    onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-10 pr-4 h-11 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold outline-none focus:bg-white focus:border-[#00875A] transition-all"
                    style={{ minHeight: "44px" }}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#0A1E3A] uppercase tracking-wider block mb-1.5">
                  Contraseña Temporal
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    required
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-10 pr-4 h-11 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold outline-none focus:bg-white focus:border-[#00875A] transition-all"
                    style={{ minHeight: "44px" }}
                  />
                </div>
                <span className="text-[9px] text-slate-400 font-semibold mt-1 block">
                  Asigna una clave temporal que el socio usará al iniciar sesión por primera vez.
                </span>
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full h-12 bg-[#00875A] hover:bg-[#006F48] text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                style={{ minHeight: "48px" }}
              >
                {formLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Registrando Socio...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    <span>Registrar y Dar Acceso</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
