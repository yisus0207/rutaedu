"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { 
  Users, Shield, Plus, CheckCircle, AlertTriangle, 
  Mail, Lock, BookOpen, RefreshCw, Key, ArrowRight,
  Search, Trash2, ExternalLink, Globe, X
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

type AdminProgram = {
  id: string;
  name: string;
  slug: string;
  level: string;
  description: string;
  category: string;
  degree_title: string;
  is_external: boolean;
  affiliate_url: string | null;
  platform_name: string | null;
  created_at: string;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [partners, setPartners] = useState<PartnerAdmin[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<"partners" | "programs">("partners");

  // Programs States
  const [programs, setPrograms] = useState<AdminProgram[]>([]);
  const [programSearch, setProgramSearch] = useState("");
  const [programModalOpen, setProgramModalOpen] = useState(false);
  const [programFormLoading, setProgramFormLoading] = useState(false);
  const [programForm, setProgramForm] = useState({
    name: "",
    level: "curso",
    category: "Tecnología",
    degreeTitle: "Certificado",
    description: "",
    isExternal: true, // Default to external for quick course creation
    platformName: "Udemy",
    affiliateUrl: "",
    tuitionCost: "49000"
  });

  // Partner Form States
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
          await Promise.all([loadPartners(), loadPrograms()]);
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

  const loadPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPrograms((data as AdminProgram[]) || []);
    } catch (err: any) {
      console.error("Error loading programs:", err);
    }
  };

  const handleProgramSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!programForm.name.trim()) {
      setErrorMsg("El nombre del programa/curso es obligatorio.");
      return;
    }

    if (programForm.isExternal && (!programForm.platformName.trim() || !programForm.affiliateUrl.trim())) {
      setErrorMsg("Para cursos externos, la plataforma y el enlace de afiliado son obligatorios.");
      return;
    }

    setProgramFormLoading(true);

    try {
      if (programForm.isExternal) {
        const platformNameClean = programForm.platformName.trim();
        const cost = parseFloat(programForm.tuitionCost) || 0;

        // 1. Find or create Platform Institution
        let instId = "";
        const { data: instData, error: instError } = await supabase
          .from("institutions")
          .select("id")
          .eq("name", platformNameClean)
          .eq("type", "plataforma")
          .limit(1);

        if (instError) throw instError;

        if (instData && instData.length > 0) {
          instId = instData[0].id;
        } else {
          // create institution
          const cleanInstSlug = platformNameClean
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "") + "-" + Math.floor(Math.random() * 1000);

          const { data: newInst, error: newInstErr } = await supabase
            .from("institutions")
            .insert({
              name: platformNameClean,
              slug: cleanInstSlug,
              type: "plataforma",
              description: `Plataforma online de aprendizaje.`,
              accreditation_status: "No Acreditada",
              status: "active"
            })
            .select("id")
            .single();

          if (newInstErr || !newInst) throw new Error("No se pudo crear la institución para la plataforma: " + newInstErr?.message);
          instId = newInst.id;
        }

        // 2. Find or create Virtual Campus
        let campusId = "";
        const { data: campusData, error: campusError } = await supabase
          .from("campuses")
          .select("id")
          .eq("institution_id", instId)
          .eq("name", "Plataforma Online")
          .limit(1);

        if (campusError) throw campusError;

        if (campusData && campusData.length > 0) {
          campusId = campusData[0].id;
        } else {
          const cleanCampSlug = `campus-online-${platformNameClean.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
          const { data: newCamp, error: newCampErr } = await supabase
            .from("campuses")
            .insert({
              institution_id: instId,
              name: "Plataforma Online",
              slug: cleanCampSlug,
              country_id: "d17d6cb4-e593-4a11-b1e7-fb6cf74431e7", // Colombia
              department_id: "9a63327d-ea08-41d6-8408-72648be1be76", // Bogotá D.C.
              city_id: "c0000000-0000-0000-0000-000000000001", // Bogotá
              address: "Virtual",
              status: "active"
            })
            .select("id")
            .single();

          if (newCampErr || !newCamp) throw new Error("No se pudo crear la sede virtual: " + newCampErr?.message);
          campusId = newCamp.id;
        }

        // 3. Create program
        const cleanSlug = programForm.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "") + "-" + Math.floor(Math.random() * 1000);

        const { data: newProg, error: newProgErr } = await supabase
          .from("programs")
          .insert({
            name: programForm.name.trim(),
            slug: cleanSlug,
            level: programForm.level,
            category: programForm.category,
            degree_title: programForm.degreeTitle.trim() || "Certificado",
            description: programForm.description.trim(),
            is_external: true,
            platform_name: platformNameClean,
            affiliate_url: programForm.affiliateUrl.trim(),
            status: "active"
          })
          .select("id")
          .single();

        if (newProgErr || !newProg) throw new Error("No se pudo crear el programa: " + newProgErr?.message);

        // 4. Create program_campus relationship
        const { error: relError } = await supabase
          .from("program_campuses")
          .insert({
            program_id: newProg.id,
            campus_id: campusId,
            tuition_cost: cost,
            currency: "COP",
            duration_semesters: 1,
            modality: "virtual",
            status: "active"
          });

        if (relError) throw relError;

        setSuccessMsg(`¡Curso de afiliación creado correctamente en la plataforma ${platformNameClean}!`);
      } else {
        // Regular university program
        const cleanSlug = programForm.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "") + "-" + Math.floor(Math.random() * 1000);

        const { error: newProgErr } = await supabase
          .from("programs")
          .insert({
            name: programForm.name.trim(),
            slug: cleanSlug,
            level: programForm.level,
            category: programForm.category,
            degree_title: programForm.degreeTitle.trim() || programForm.name.trim(),
            description: programForm.description.trim(),
            is_external: false,
            platform_name: null,
            affiliate_url: null,
            status: "active"
          });

        if (newProgErr) throw newProgErr;

        setSuccessMsg(`¡Programa universitario "${programForm.name}" creado. Ya está disponible para ser ofertado por las sedes.`);
      }

      // Reset Form and reload
      setProgramForm({
        name: "",
        level: "curso",
        category: "Tecnología",
        degreeTitle: "Certificado",
        description: "",
        isExternal: true,
        platformName: "Udemy",
        affiliateUrl: "",
        tuitionCost: "49000"
      });
      setProgramModalOpen(false);
      await loadPrograms();
    } catch (err: any) {
      console.error("Error submitting program:", err);
      setErrorMsg(err.message || "Ocurrió un error inesperado al guardar el programa.");
    } finally {
      setProgramFormLoading(false);
    }
  };

  const handleDeleteProgram = async (programId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este programa/curso? Se retirará de todas las sedes y búsquedas.")) return;
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { error } = await supabase
        .from("programs")
        .delete()
        .eq("id", programId);

      if (error) throw error;

      setSuccessMsg("Programa/Curso eliminado correctamente.");
      await loadPrograms();
    } catch (err: any) {
      console.error("Error deleting program:", err);
      setErrorMsg("No se pudo eliminar el programa. Es posible que tenga prospectos de contacto asociados en la base de datos.");
    }
  };

  const filteredPrograms = programs.filter(p => {
    const searchLower = programSearch.toLowerCase();
    return p.name.toLowerCase().includes(searchLower) ||
           (p.platform_name && p.platform_name.toLowerCase().includes(searchLower)) ||
           p.category.toLowerCase().includes(searchLower) ||
           p.level.toLowerCase().includes(searchLower);
  });

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
                Gestiona y registra cuentas de socios universitarios y programas/cursos de RutaEdu.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1.5 border-b border-slate-200 mb-8 max-w-md">
          <button
            onClick={() => setActiveTab("partners")}
            className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider transition-all border-b-2 ${
              activeTab === "partners"
                ? "border-[#00875A] text-[#00875A]"
                : "border-transparent text-slate-500 hover:text-[#0A1E3A]"
            }`}
          >
            Socios Universitarios
          </button>
          <button
            onClick={() => setActiveTab("programs")}
            className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider transition-all border-b-2 ${
              activeTab === "programs"
                ? "border-[#00875A] text-[#00875A]"
                : "border-transparent text-slate-500 hover:text-[#0A1E3A]"
            }`}
          >
            Programas y Cursos
          </button>
        </div>

        {activeTab === "partners" ? (
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
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left / Center: Programs list */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#00875A]" />
                    <h2 className="text-base sm:text-lg font-bold text-[#0A1E3A]">Programas y Cursos Académicos</h2>
                  </div>
                  <div className="relative flex items-center max-w-xs w-full">
                    <Search className="absolute left-3 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar programa..."
                      value={programSearch}
                      onChange={(e) => setProgramSearch(e.target.value)}
                      className="w-full pl-9 pr-3 h-9 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold outline-none focus:bg-white focus:border-[#00875A] transition-all"
                    />
                  </div>
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

                {filteredPrograms.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs font-semibold">
                    No se encontraron programas o cursos académicos.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-[#64748B] font-bold uppercase tracking-wider">
                          <th className="py-3.5 px-3">Nombre</th>
                          <th className="py-3.5 px-3">Nivel / Categoría</th>
                          <th className="py-3.5 px-3">Tipo / Plataforma</th>
                          <th className="py-3.5 px-3 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                        {filteredPrograms.map((prog) => (
                          <tr key={prog.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3.5 px-3">
                              <div className="font-extrabold text-[#0A1E3A]">{prog.name}</div>
                              {prog.description && (
                                <div className="text-[10px] text-slate-400 font-medium line-clamp-1 max-w-sm">
                                  {prog.description}
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-3">
                              <span className="capitalize">{prog.level}</span>
                              <span className="text-slate-300 mx-1">•</span>
                              <span className="text-slate-500">{prog.category}</span>
                            </td>
                            <td className="py-3.5 px-3">
                              {prog.is_external ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 font-extrabold">
                                  <Globe className="w-3 h-3" />
                                  Externo ({prog.platform_name})
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100">
                                  Universidad
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {prog.is_external && prog.affiliate_url && (
                                  <a
                                    href={prog.affiliate_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-slate-50"
                                    title="Ver enlace de afiliado"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}
                                <button
                                  onClick={() => handleDeleteProgram(prog.id)}
                                  className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-slate-50"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Quick actions for programs */}
            <div className="space-y-6">
              <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-5 sm:p-6 space-y-4">
                <h3 className="text-sm sm:text-base font-extrabold text-[#0A1E3A]">Acciones de Contenido</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Crea nuevos programas que las universidades asociadas puedan ofrecer o agrega cursos con tu enlace de referidos.
                </p>
                <button
                  onClick={() => setProgramModalOpen(true)}
                  className="w-full h-12 bg-[#00875A] hover:bg-[#006F48] text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  style={{ minHeight: "48px" }}
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear Nuevo Programa/Curso</span>
                </button>
              </div>

              <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-5 sm:p-6 space-y-4">
                <h3 className="text-sm font-extrabold text-[#0A1E3A]">Resumen de Oferta</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/60 font-semibold">
                    <span className="text-[10px] text-slate-500 font-bold block">Programas U.</span>
                    <span className="text-lg font-extrabold text-[#0A1E3A]">{programs.filter(p => !p.is_external).length}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/60 font-semibold">
                    <span className="text-[10px] text-slate-500 font-bold block">Cursos Afiliados</span>
                    <span className="text-lg font-extrabold text-indigo-700">{programs.filter(p => p.is_external).length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Program Creation Modal */}
      {programModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-xs">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2 text-[#0A1E3A]">
                <Plus className="w-5 h-5 text-[#00875A]" />
                <h2 className="text-sm sm:text-base font-extrabold">Crear Nuevo Programa/Curso</h2>
              </div>
              <button
                onClick={() => setProgramModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-200 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProgramSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Type Switcher */}
              <div className="bg-slate-50 p-1 rounded-xl border border-slate-100 flex gap-1">
                <button
                  type="button"
                  onClick={() => setProgramForm(prev => ({ ...prev, isExternal: false }))}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold text-center transition-all ${
                    !programForm.isExternal
                      ? "bg-white text-[#0A1E3A] shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Programa Universitario
                </button>
                <button
                  type="button"
                  onClick={() => setProgramForm(prev => ({ ...prev, isExternal: true }))}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold text-center transition-all ${
                    programForm.isExternal
                      ? "bg-white text-[#0A1E3A] shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Curso Externo (Afiliado)
                </button>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#0A1E3A] uppercase tracking-wider block mb-1">
                  Nombre del Programa/Curso
                </label>
                <input
                  type="text"
                  required
                  placeholder={programForm.isExternal ? "Ej. Desarrollo Web Completo" : "Ej. Ingeniería de Sistemas"}
                  value={programForm.name}
                  onChange={(e) => setProgramForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 h-11 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold outline-none focus:bg-white focus:border-[#00875A] transition-all"
                  style={{ minHeight: "44px" }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-[#0A1E3A] uppercase tracking-wider block mb-1">
                    Nivel de Estudios
                  </label>
                  <select
                    value={programForm.level}
                    onChange={(e) => setProgramForm(prev => ({ ...prev, level: e.target.value }))}
                    className="w-full px-3.5 h-11 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold outline-none focus:bg-white focus:border-[#00875A] transition-all"
                    style={{ minHeight: "44px" }}
                  >
                    <option value="technical">Técnico</option>
                    <option value="technologist">Tecnólogo</option>
                    <option value="pregrado">Pregrado</option>
                    <option value="especializacion">Especialización</option>
                    <option value="maestria">Maestría</option>
                    <option value="doctorado">Doctorado</option>
                    <option value="bootcamp">Bootcamp</option>
                    <option value="curso">Curso Corto</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#0A1E3A] uppercase tracking-wider block mb-1">
                    Categoría
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Tecnología, Idiomas, Salud"
                    value={programForm.category}
                    onChange={(e) => setProgramForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3.5 h-11 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold outline-none focus:bg-white focus:border-[#00875A] transition-all"
                    style={{ minHeight: "44px" }}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#0A1E3A] uppercase tracking-wider block mb-1">
                  Título Otorgado
                </label>
                <input
                  type="text"
                  required
                  placeholder={programForm.isExternal ? "Ej. Certificado de Udemy" : "Ej. Ingeniero de Sistemas"}
                  value={programForm.degreeTitle}
                  onChange={(e) => setProgramForm(prev => ({ ...prev, degreeTitle: e.target.value }))}
                  className="w-full px-3.5 h-11 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold outline-none focus:bg-white focus:border-[#00875A] transition-all"
                  style={{ minHeight: "44px" }}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#0A1E3A] uppercase tracking-wider block mb-1">
                  Descripción
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detalles sobre el contenido del curso o plan de estudios..."
                  value={programForm.description}
                  onChange={(e) => setProgramForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold outline-none focus:bg-white focus:border-[#00875A] transition-all resize-none"
                />
              </div>

              {/* Conditional External Fields */}
              {programForm.isExternal && (
                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block font-extrabold">
                    Información del Afiliado y Plataforma
                  </span>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-bold text-[#0A1E3A] uppercase tracking-wider block mb-1">
                        Plataforma (Proveedor)
                      </label>
                      <input
                        type="text"
                        required={programForm.isExternal}
                        placeholder="Ej. Udemy, Platzi, Coursera"
                        value={programForm.platformName}
                        onChange={(e) => setProgramForm(prev => ({ ...prev, platformName: e.target.value }))}
                        className="w-full px-3 h-10 border border-slate-200 rounded-xl bg-white text-xs font-semibold outline-none focus:border-[#00875A] transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-[#0A1E3A] uppercase tracking-wider block mb-1">
                        Precio único (COP)
                      </label>
                      <input
                        type="number"
                        required={programForm.isExternal}
                        placeholder="Ej. 49000"
                        value={programForm.tuitionCost}
                        onChange={(e) => setProgramForm(prev => ({ ...prev, tuitionCost: e.target.value }))}
                        className="w-full px-3 h-10 border border-slate-200 rounded-xl bg-white text-xs font-semibold outline-none focus:border-[#00875A] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-[#0A1E3A] uppercase tracking-wider block mb-1">
                      Enlace de Afiliado (URL)
                    </label>
                    <input
                      type="url"
                      required={programForm.isExternal}
                      placeholder="https://click.linksynergy.com/..."
                      value={programForm.affiliateUrl}
                      onChange={(e) => setProgramForm(prev => ({ ...prev, affiliateUrl: e.target.value }))}
                      className="w-full px-3 h-10 border border-slate-200 rounded-xl bg-white text-xs font-semibold outline-none focus:border-[#00875A] transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setProgramModalOpen(false)}
                  className="flex-1 h-11 border border-slate-200 hover:bg-slate-100 text-[#0A1E3A] font-bold text-xs rounded-xl transition-all"
                  style={{ minHeight: "44px" }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={programFormLoading}
                  className="flex-1 h-11 bg-[#00875A] hover:bg-[#006F48] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                  style={{ minHeight: "44px" }}
                >
                  {programFormLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Guardar Programa</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

