"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { 
  Users, BookOpen, TrendingUp, Award, Settings, Plus, Edit2, Trash2, 
  Check, AlertTriangle, FileText, CheckCircle, Mail, Phone, ExternalLink, RefreshCw,
  Menu, X
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// Local types definition
type Institution = {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string;
  logo_url: string;
  banner_url: string;
  accreditation_status: string;
};

type Campus = {
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  institutions?: Institution;
};

type Program = {
  id: string;
  name: string;
  slug: string;
  level: string;
  description: string;
  category: string;
  degree_title: string;
};

type ProgramOffering = {
  id: string;
  program_id: string;
  campus_id: string;
  tuition_cost: number;
  duration_semesters: number;
  modality: string;
  programs?: Program;
};

type Lead = {
  id: string;
  student_id: string | null;
  program_id: string;
  campus_id: string;
  status: string;
  source: string;
  created_at: string;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  programs?: Program;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
};

type Scholarship = {
  id: string;
  name: string;
  provider: string;
  coverage_percentage: number;
  description: string;
  benefits: string;
  requirements: string;
  deadline: string;
};

export default function UniversidadDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"resumen" | "prospectos" | "programas" | "becas" | "config">("resumen");
  const [loading, setLoading] = useState(true);
  const [campusId, setCampusId] = useState<string | null>(null);
  
  // Data States
  const [campus, setCampus] = useState<Campus | null>(null);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [programOfferings, setProgramOfferings] = useState<ProgramOffering[]>([]);
  const [globalPrograms, setGlobalPrograms] = useState<Program[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);

  // UI States
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Modals / Forms States
  const [programModalOpen, setProgramModalOpen] = useState(false);
  const [editingOffering, setEditingOffering] = useState<ProgramOffering | null>(null);
  const [offeringForm, setOfferingForm] = useState({
    programId: "",
    tuitionCost: "",
    durationSemesters: "10",
    modality: "presencial",
    // Custom program creation helper
    isNewProgramName: false,
    newProgramName: "",
    newProgramLevel: "pregrado",
    newProgramCategory: "Tecnología",
    newProgramDegree: ""
  });

  const [scholarshipModalOpen, setScholarshipModalOpen] = useState(false);
  const [scholarshipForm, setScholarshipForm] = useState({
    name: "",
    provider: "",
    coverage: "50",
    description: "",
    benefits: "",
    requirements: "",
    deadline: ""
  });

  const [configForm, setConfigForm] = useState({
    name: "",
    address: "",
    description: "",
    logoUrl: "",
    bannerUrl: ""
  });

  useEffect(() => {
    loadInitialSession();
  }, []);

  const loadInitialSession = async () => {
    setLoading(true);
    setErrorMsg("");

    let activeCampusId: string | null = null;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login");
      return;
    }

    // Check if super_admin to redirect to admin dashboard
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
        router.push("/admin/dashboard");
        return;
      }
    }

    // Query campus linked to user
    const { data: campusAdmin, error } = await supabase
      .from("campus_admins")
      .select("campus_id")
      .eq("user_id", session.user.id)
      .single();

    if (error || !campusAdmin) {
      // Fallback check: institution admin
      const { data: instAdmin } = await supabase
        .from("institution_admins")
        .select("institution_id")
        .eq("user_id", session.user.id)
        .single();

      if (instAdmin) {
        // Get first campus of this institution
        const { data: firstCampus } = await supabase
          .from("campuses")
          .select("id")
          .eq("institution_id", instAdmin.institution_id)
          .limit(1)
          .single();
        if (firstCampus) {
          activeCampusId = firstCampus.id;
        }
      }
    } else {
      activeCampusId = campusAdmin.campus_id;
    }

    if (!activeCampusId) {
      setErrorMsg("No se encontró una sede vinculada a tu cuenta administrativa. Contacta a soporte.");
      setLoading(false);
      return;
    }

    setCampusId(activeCampusId);
    await loadDashboardData(activeCampusId);
  };

  const loadDashboardData = async (cId: string) => {
    try {
      // 1. Fetch Campus & Institution
      const { data: campusData } = await supabase
        .from("campuses")
        .select("id, name, address, email, phone, institution_id, institutions(*)")
        .eq("id", cId)
        .single();

      if (campusData) {
        setCampus({
          id: campusData.id,
          name: campusData.name,
          address: campusData.address || "",
          email: campusData.email || "",
          phone: campusData.phone || ""
        });
        if (campusData.institutions) {
          const inst = campusData.institutions as unknown as Institution;
          setInstitution(inst);
          setConfigForm({
            name: inst.name,
            address: campusData.address || "",
            description: inst.description || "",
            logoUrl: inst.logo_url || "",
            bannerUrl: inst.banner_url || ""
          });
        }
      }

      // 2. Fetch Leads
      const { data: leadsData } = await supabase
        .from("leads")
        .select("*, programs(*), profiles(first_name, last_name, email, phone)")
        .eq("campus_id", cId)
        .order("created_at", { ascending: false });

      if (leadsData) {
        setLeads(leadsData as unknown as Lead[]);
      }

      // 3. Fetch Program Offerings
      const { data: relationData } = await supabase
        .from("program_campuses")
        .select("*, programs(*)")
        .eq("campus_id", cId);

      if (relationData) {
        setProgramOfferings(relationData as unknown as ProgramOffering[]);
      }

      // 4. Fetch Global Programs list for Adding Dropdown
      const { data: globalProgs } = await supabase
        .from("programs")
        .select("*")
        .eq("status", "active")
        .order("name", { ascending: true });

      if (globalProgs) {
        setGlobalPrograms(globalProgs);
      }

      // 5. Fetch scholarships owned by this institution
      const { data: scholarshipsData } = await supabase
        .from("scholarships")
        .select("*")
        .eq("institution_id", campusData.institution_id);
      
      if (scholarshipsData) {
        setScholarships(scholarshipsData);
      }

    } catch (err: any) {
      console.error("Error cargando dashboard:", err);
      setErrorMsg("Ocurrió un error al cargar la información del panel.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("leads")
        .update({ status: newStatus })
        .eq("id", leadId);

      if (error) throw error;

      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      triggerSuccess("Estado de prospecto actualizado correctamente.");
    } catch (err: any) {
      setErrorMsg("Error al actualizar estado del lead: " + err.message);
    }
  };

  const handleProgramSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campusId) return;
    setErrorMsg("");

    try {
      let finalProgramId = offeringForm.programId;

      // Create program name if it is custom
      if (offeringForm.isNewProgramName) {
        if (!offeringForm.newProgramName.trim()) {
          setErrorMsg("Debes especificar el nombre de la carrera.");
          return;
        }

        const cleanSlug = offeringForm.newProgramName
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");

        const { data: newProg, error: progErr } = await supabase
          .from("programs")
          .insert({
            name: offeringForm.newProgramName,
            slug: `${cleanSlug}-${Date.now().toString().slice(-4)}`,
            level: offeringForm.newProgramLevel,
            category: offeringForm.newProgramCategory,
            degree_title: offeringForm.newProgramDegree || offeringForm.newProgramName,
            status: "active"
          })
          .select()
          .single();

        if (progErr || !newProg) {
          throw new Error("No se pudo crear el programa base: " + progErr?.message);
        }

        finalProgramId = newProg.id;
      }

      if (!finalProgramId) {
        setErrorMsg("Selecciona un programa o marca crear nuevo.");
        return;
      }

      if (editingOffering) {
        // Edit relation
        const { error } = await supabase
          .from("program_campuses")
          .update({
            tuition_cost: parseFloat(offeringForm.tuitionCost),
            duration_semesters: parseInt(offeringForm.durationSemesters),
            modality: offeringForm.modality
          })
          .eq("id", editingOffering.id);

        if (error) throw error;
        triggerSuccess("Programa actualizado correctamente.");
      } else {
        // Add relation
        const { error } = await supabase
          .from("program_campuses")
          .insert({
            program_id: finalProgramId,
            campus_id: campusId,
            tuition_cost: parseFloat(offeringForm.tuitionCost),
            duration_semesters: parseInt(offeringForm.durationSemesters),
            modality: offeringForm.modality,
            status: "active"
          });

        if (error) throw error;
        triggerSuccess("Programa ofertado con éxito en esta sede.");
      }

      setProgramModalOpen(false);
      setEditingOffering(null);
      resetOfferingForm();
      loadDashboardData(campusId);

    } catch (err: any) {
      setErrorMsg("Error al guardar programa: " + err.message);
    }
  };

  const handleEditOfferingClick = (offering: ProgramOffering) => {
    setEditingOffering(offering);
    setOfferingForm({
      programId: offering.program_id,
      tuitionCost: offering.tuition_cost.toString(),
      durationSemesters: offering.duration_semesters.toString(),
      modality: offering.modality,
      isNewProgramName: false,
      newProgramName: "",
      newProgramLevel: "pregrado",
      newProgramCategory: "Tecnología",
      newProgramDegree: ""
    });
    setProgramModalOpen(true);
  };

  const handleDeleteOffering = async (offeringId: string) => {
    if (!confirm("¿Estás seguro de que deseas retirar este programa de tu oferta académica en este campus?")) return;
    if (!campusId) return;

    try {
      const { error } = await supabase
        .from("program_campuses")
        .delete()
        .eq("id", offeringId);

      if (error) throw error;

      triggerSuccess("Programa retirado de la oferta.");
      loadDashboardData(campusId);
    } catch (err: any) {
      setErrorMsg("Error al eliminar programa: " + err.message);
    }
  };

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campusId || !institution) return;
    setErrorMsg("");

    try {
      // 1. Update Institution
      const { error: instErr } = await supabase
        .from("institutions")
        .update({
          name: configForm.name,
          description: configForm.description,
          logo_url: configForm.logoUrl,
          banner_url: configForm.bannerUrl
        })
        .eq("id", institution.id);

      if (instErr) throw instErr;

      // 2. Update Campus Address
      const { error: campusErr } = await supabase
        .from("campuses")
        .update({
          address: configForm.address
        })
        .eq("id", campusId);

      if (campusErr) throw campusErr;

      triggerSuccess("Configuración de la institución guardada.");
      loadDashboardData(campusId);
    } catch (err: any) {
      setErrorMsg("Error al guardar configuración: " + err.message);
    }
  };

  const handleScholarshipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const cleanSlug = scholarshipForm.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      if (!institution) {
        setErrorMsg("Información de la institución no cargada.");
        return;
      }

      const { data: newSchol, error } = await supabase
        .from("scholarships")
        .insert({
          name: scholarshipForm.name,
          slug: `${cleanSlug}-${Date.now().toString().slice(-4)}`,
          provider: scholarshipForm.provider,
          coverage_percentage: parseFloat(scholarshipForm.coverage),
          description: scholarshipForm.description,
          benefits: scholarshipForm.benefits,
          requirements: scholarshipForm.requirements,
          deadline: scholarshipForm.deadline || null,
          institution_id: institution.id,
          status: "active"
        })
        .select()
        .single();

      if (error) throw error;

      triggerSuccess("Beca registrada con éxito en el sistema.");
      setScholarshipModalOpen(false);
      resetScholarshipForm();
      if (campusId) loadDashboardData(campusId);
    } catch (err: any) {
      setErrorMsg("Error al registrar beca: " + err.message);
    }
  };

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const resetOfferingForm = () => {
    setOfferingForm({
      programId: "",
      tuitionCost: "",
      durationSemesters: "10",
      modality: "presencial",
      isNewProgramName: false,
      newProgramName: "",
      newProgramLevel: "pregrado",
      newProgramCategory: "Tecnología",
      newProgramDegree: ""
    });
  };

  const resetScholarshipForm = () => {
    setScholarshipForm({
      name: "",
      provider: "",
      coverage: "50",
      description: "",
      benefits: "",
      requirements: "",
      deadline: ""
    });
  };

  // Metrics helper computations
  const totalLeadsCount = leads.length;
  const contactedLeadsCount = leads.filter(l => ["contacted", "interested", "applied", "accepted", "enrolled"].includes(l.status)).length;
  const conversionRate = totalLeadsCount > 0 ? Math.round((contactedLeadsCount / totalLeadsCount) * 100) : 0;
  const activeProgramsCount = programOfferings.length;

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FAFAF9]">
        <Navbar />
        <main className="flex-1 flex flex-col justify-center items-center py-12">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs font-bold text-slate-500">Cargando panel de administración...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAF9] text-[#0F172A] overflow-x-hidden font-sans">
      <Navbar />

      {/* Main Admin Section */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Left Column (Main content area) */}
          <div className="flex-grow w-full lg:max-w-[calc(100%-310px)] space-y-6">
        
        {/* Banner/Header Info */}
        <div className="relative bg-white border border-slate-100/80 shadow-sm rounded-3xl overflow-hidden p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          

          <div className="flex items-center gap-4 min-w-0">
            {/* Institution Logo */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
              {institution?.logo_url ? (
                <img src={institution.logo_url} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <BookOpen className="w-7 h-7 text-primary" />
              )}
            </div>
            
            <div className="space-y-0.5 min-w-0">
              <h1 className="text-lg sm:text-2xl font-extrabold text-[#0A1E3A] tracking-tight truncate">
                {institution?.name || "Panel de Universidad"}
              </h1>
              <p className="text-xs text-[#64748B] font-semibold flex items-center gap-1.5 truncate">
                <span>📍 Sede: {campus?.name || "Principal"}</span>
                <span>•</span>
                <span className="text-[#00875A] font-bold">Partner Premium</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setLoading(true);
                if (campusId) loadDashboardData(campusId);
              }}
              className="p-2.5 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200/60 active:scale-95 transition-all"
              title="Refrescar datos"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Notifications */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold rounded-2xl p-4 flex items-center gap-2.5 shadow-sm">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-50 border border-red-100 text-red-800 text-xs font-bold rounded-2xl p-4 flex items-start gap-2.5 shadow-sm">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Overview Stats Cards Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Card 1: Leads */}
          <div className="bg-white border border-slate-100/80 shadow-sm rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-[#64748B] font-bold uppercase tracking-wider">Prospectos</p>
              <h3 className="text-base sm:text-2xl font-extrabold text-slate-800">{totalLeadsCount}</h3>
            </div>
          </div>

          {/* Card 2: Active Programs */}
          <div className="bg-white border border-slate-100/80 shadow-sm rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-[#64748B] font-bold uppercase tracking-wider">Carreras/Cursos</p>
              <h3 className="text-base sm:text-2xl font-extrabold text-slate-800">{activeProgramsCount}</h3>
            </div>
          </div>

          {/* Card 3: Conversion Rate */}
          <div className="bg-white border border-slate-100/80 shadow-sm rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-[#64748B] font-bold uppercase tracking-wider">Conversión</p>
              <h3 className="text-base sm:text-2xl font-extrabold text-slate-800">{conversionRate}%</h3>
            </div>
          </div>

          {/* Card 4: Scholarships */}
          <div className="bg-white border border-slate-100/80 shadow-sm rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-[#64748B] font-bold uppercase tracking-wider">Becas Activas</p>
              <h3 className="text-base sm:text-2xl font-extrabold text-slate-800">{scholarships.length}</h3>
            </div>
          </div>
        </section>

        <div className="w-full" />

        {/* Content Tabs render block */}
        <section className="space-y-6">

          {/* TAB 1: RESUMEN OVERVIEW */}
          {activeTab === "resumen" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Recent Leads list */}
              <div className="md:col-span-2 bg-white border border-slate-100/80 shadow-sm rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm sm:text-base font-extrabold text-[#0A1E3A]">Últimos Prospectos Recibidos</h3>
                  <button onClick={() => setActiveTab("prospectos")} className="text-[10px] sm:text-xs font-bold text-primary hover:underline">
                    Ver todos
                  </button>
                </div>

                {leads.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 text-xs font-semibold">
                    No has recibido prospectos de estudiantes todavía.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {leads.slice(0, 5).map(lead => {
                      const studentName = lead.profiles 
                        ? `${lead.profiles.first_name} ${lead.profiles.last_name}` 
                        : (lead.guest_name || "Estudiante Invitado");
                      const studentMail = lead.profiles ? lead.profiles.email : (lead.guest_email || "No especificado");
                      return (
                        <div key={lead.id} className="py-3 flex justify-between items-center text-xs gap-3">
                          <div className="min-w-0 space-y-0.5">
                            <p className="font-bold text-slate-800 truncate">{studentName}</p>
                            <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                              <span>📚 {lead.programs?.name || "Programa"}</span>
                              <span>•</span>
                              <span>📧 {studentMail}</span>
                            </p>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                            lead.status === "enrolled" ? "bg-emerald-100 text-emerald-800" :
                            lead.status === "contacted" ? "bg-blue-100 text-blue-800" :
                            lead.status === "interested" ? "bg-yellow-100 text-yellow-800" :
                            "bg-slate-100 text-slate-700"
                          }`}>
                            {lead.status === "enrolled" ? "Matriculado" :
                             lead.status === "contacted" ? "Contactado" :
                             lead.status === "interested" ? "Interesado" :
                             lead.status === "clicked" ? "Clic recibido" : lead.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Conversion Statistics visual helper */}
              <div className="bg-white border border-slate-100/80 shadow-sm rounded-2xl p-4 sm:p-5 space-y-5">
                <h3 className="text-sm sm:text-base font-extrabold text-[#0A1E3A] border-b border-slate-100 pb-3">Estado del Embudo</h3>
                <div className="space-y-3.5">
                  {[
                    { label: "Clics de estudiantes", count: leads.filter(l => l.status === "clicked" || l.status === "viewed").length, color: "bg-slate-400" },
                    { label: "Contactados", count: leads.filter(l => l.status === "contacted").length, color: "bg-blue-500" },
                    { label: "Interesados avanzados", count: leads.filter(l => l.status === "interested" || l.status === "applied").length, color: "bg-yellow-500" },
                    { label: "Inscritos / Matriculados", count: leads.filter(l => ["accepted", "enrolled"].includes(l.status)).length, color: "bg-emerald-500" },
                  ].map((item, idx) => {
                    const widthPct = totalLeadsCount > 0 ? (item.count / totalLeadsCount) * 100 : 0;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-[10.5px] font-bold text-slate-600">
                          <span>{item.label}</span>
                          <span>{item.count}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${item.color}`} style={{ width: `${widthPct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROSPECTOS (LEADS) LIST & EDIT STATUS */}
          {activeTab === "prospectos" && (
            <div className="bg-white border border-slate-100/80 shadow-sm rounded-2xl overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#0A1E3A]">Registro de Estudiantes Interesados</h3>
                  <p className="text-[10px] text-[#64748B] font-semibold mt-0.5">Prospectos que han solicitado información sobre tus carreras.</p>
                </div>
                <div className="text-[10px] font-extrabold bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-100/50">
                  {leads.length} prospectos totales
                </div>
              </div>

              {leads.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs font-semibold">
                  Aún no tienes prospectos registrados.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                        <th className="p-4">Estudiante</th>
                        <th className="p-4">Carrera / Curso</th>
                        <th className="p-4">Origen / Canal</th>
                        <th className="p-4">Fecha</th>
                        <th className="p-4">Estado</th>
                        <th className="p-4 text-center">Gestión</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-medium">
                      {leads.map(lead => {
                        const name = lead.profiles ? `${lead.profiles.first_name} ${lead.profiles.last_name}` : (lead.guest_name || "Invitado");
                        const mail = lead.profiles ? lead.profiles.email : (lead.guest_email || "No provisto");
                        const phone = lead.profiles ? lead.profiles.phone : (lead.guest_phone || "No provisto");
                        const cleanPhone = phone?.replace(/\s+/g, "");

                        return (
                          <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4">
                              <div className="space-y-0.5">
                                <p className="font-bold text-slate-800">{name}</p>
                                <div className="text-[10px] text-slate-400 space-y-0.5">
                                  <p className="flex items-center gap-1.5">
                                    <Mail className="w-3 h-3 flex-shrink-0 text-slate-300" />
                                    <span>{mail}</span>
                                  </p>
                                  {cleanPhone && (
                                    <p className="flex items-center gap-1.5">
                                      <Phone className="w-3 h-3 flex-shrink-0 text-slate-300" />
                                      <a href={`tel:${cleanPhone}`} className="hover:text-primary hover:underline">{phone}</a>
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="font-bold text-slate-700">{lead.programs?.name}</div>
                              <span className="text-[9px] font-bold text-slate-400 capitalize">{lead.programs?.level}</span>
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 bg-slate-100 border border-slate-200/50 rounded-full text-[9px] font-extrabold text-slate-600 capitalize">
                                {lead.source === "ai_advisor" ? "Asesor IA 🤖" : lead.source}
                              </span>
                            </td>
                            <td className="p-4 text-slate-500 font-semibold">
                              {new Date(lead.created_at).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                                lead.status === "enrolled" ? "bg-emerald-100 text-emerald-800" :
                                lead.status === "contacted" ? "bg-blue-100 text-blue-800" :
                                lead.status === "interested" ? "bg-yellow-100 text-yellow-800" :
                                "bg-slate-100 text-slate-700"
                              }`}>
                                {lead.status === "enrolled" ? "Matriculado" :
                                 lead.status === "contacted" ? "Contactado" :
                                 lead.status === "interested" ? "Interesado" :
                                 lead.status === "clicked" ? "Clic recibido" : lead.status}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <select
                                value={lead.status}
                                onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value)}
                                className="h-8 pl-2 pr-3 bg-white border border-slate-200 rounded-lg text-[10.5px] font-bold outline-none focus:border-primary transition-all"
                              >
                                <option value="clicked">Clic Recibido</option>
                                <option value="contacted">Contactado</option>
                                <option value="interested">Interesado</option>
                                <option value="enrolled">Matriculado</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROGRAMAS (CRUD OFFERINGS) */}
          {activeTab === "programas" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white border border-slate-100/80 shadow-sm rounded-2xl p-4">
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#0A1E3A]">Oferta Académica Vigente</h3>
                  <p className="text-[10px] text-[#64748B] font-semibold mt-0.5">Añade o edita los costos y modalidades de los programas dictados.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingOffering(null);
                    resetOfferingForm();
                    setProgramModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 h-9 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Programa</span>
                </button>
              </div>

              {programOfferings.length === 0 ? (
                <div className="bg-white border border-slate-100/80 rounded-2xl py-16 text-center text-slate-400 text-xs font-semibold">
                  No has registrado ningún programa en este campus.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {programOfferings.map(offering => (
                    <div key={offering.id} className="bg-white border border-slate-100/80 shadow-sm rounded-2xl p-4 flex flex-col justify-between gap-4">
                      <div className="space-y-1.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[8.5px] font-extrabold bg-slate-100 text-slate-600 uppercase tracking-wide">
                          {offering.programs?.level}
                        </span>
                        <h4 className="text-sm font-extrabold text-slate-800 leading-tight">
                          {offering.programs?.name}
                        </h4>
                        <div className="text-[10px] text-slate-500 font-semibold space-y-1">
                          <p>💰 Semestre: <span className="font-bold text-slate-700">${offering.tuition_cost.toLocaleString("es-CO")} COP</span></p>
                          <p>⏱ Duración: <span className="font-bold text-slate-700">{offering.duration_semesters} semestres</span></p>
                          <p>💻 Modalidad: <span className="font-bold text-slate-700 capitalize">{offering.modality}</span></p>
                        </div>
                      </div>

                      <div className="border-t border-slate-50 pt-3 flex justify-end gap-2">
                        <button
                          onClick={() => handleEditOfferingClick(offering)}
                          className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-100 transition-colors"
                          title="Editar costos/duración"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteOffering(offering.id)}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-100 transition-colors"
                          title="Eliminar del campus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: BECAS Y DESCUENTOS */}
          {activeTab === "becas" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white border border-slate-100/80 shadow-sm rounded-2xl p-4">
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#0A1E3A]">Planes de Becas y Financiación</h3>
                  <p className="text-[10px] text-[#64748B] font-semibold mt-0.5">Registra beneficios económicos propios para incentivar a los estudiantes.</p>
                </div>
                <button
                  onClick={() => {
                    resetScholarshipForm();
                    setScholarshipModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 h-9 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear Beca</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scholarships.map(schol => (
                  <div key={schol.id} className="bg-white border border-slate-100/80 shadow-sm rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-sm font-extrabold text-slate-800 leading-snug">{schol.name}</h4>
                      <span className="flex-shrink-0 px-2.5 py-0.5 bg-purple-50 text-purple-700 text-[9px] font-extrabold rounded-full border border-purple-100 uppercase">
                        Cobertura: {schol.coverage_percentage}%
                      </span>
                    </div>
                    
                    <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                      {schol.description}
                    </p>

                    <div className="bg-slate-50 p-2.5 rounded-xl text-[10px] space-y-1 text-slate-600 font-semibold border border-slate-100">
                      <p>📋 <span className="font-bold">Requisitos:</span> {schol.requirements}</p>
                      <p>💰 <span className="font-bold">Proveedor:</span> {schol.provider}</p>
                      {schol.deadline && <p>📅 <span className="font-bold">Límite aplicación:</span> {schol.deadline}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CONFIGURACIÓN INSTITUCIONAL */}
          {activeTab === "config" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left explanation alert column */}
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-1.5 text-blue-800 font-extrabold text-xs">
                    <AlertTriangle className="w-4 h-4 text-blue-600" />
                    <span>POLÍTICA DE MONETIZACIÓN</span>
                  </div>
                  <p className="text-[10.5px] text-blue-700 leading-relaxed font-semibold">
                    Para asegurar que RutaEdu registre automáticamente a todos tus prospectos (leads) y obtengas créditos en las estadísticas de conversión, no publicamos de manera directa tu número de teléfono o links de contacto directo en el perfil público.
                  </p>
                  <p className="text-[10.5px] text-blue-700 leading-relaxed font-semibold">
                    Los estudiantes completarán sus formularios de contacto directamente a través de nuestro botón oficial, y los leads se te notificarán en tiempo real tanto en este panel como a tu correo de contacto registrado.
                  </p>
                </div>
              </div>

              {/* Main settings config form */}
              <div className="lg:col-span-2 bg-white border border-slate-100/80 shadow-sm rounded-2xl p-4 sm:p-5">
                <h3 className="text-sm sm:text-base font-extrabold text-[#0A1E3A] border-b border-slate-100 pb-3 mb-4">Datos del Partner</h3>
                
                <form onSubmit={handleConfigSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Nombre de la Institución</label>
                      <input 
                        type="text" 
                        required
                        value={configForm.name}
                        onChange={(e) => setConfigForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-primary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Dirección de la Sede</label>
                      <input 
                        type="text" 
                        required
                        value={configForm.address}
                        onChange={(e) => setConfigForm(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Descripción Corta</label>
                    <textarea 
                      rows={3}
                      required
                      value={configForm.description}
                      onChange={(e) => setConfigForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-primary transition-all font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">URL del Logo (1:1)</label>
                      <input 
                        type="url" 
                        value={configForm.logoUrl}
                        onChange={(e) => setConfigForm(prev => ({ ...prev, logoUrl: e.target.value }))}
                        placeholder="https://ejemplo.com/logo.png"
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-primary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">URL del Banner (horizontal)</label>
                      <input 
                        type="url" 
                        value={configForm.bannerUrl}
                        onChange={(e) => setConfigForm(prev => ({ ...prev, bannerUrl: e.target.value }))}
                        placeholder="https://ejemplo.com/banner.jpg"
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="h-10 px-6 bg-[#00875A] hover:bg-[#006F48] text-white text-xs font-bold rounded-xl active:scale-95 shadow-sm transition-all"
                  >
                    Guardar Cambios
                  </button>
                </form>
              </div>

            </div>
          )}

        </section>
      </div>

      {/* Sidebar Area (Right Column - 20%-25% width on desktop) */}
      <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-24 bg-gradient-to-b from-[#00875A] via-[#006F48] to-[#022C1C] text-white shadow-xl rounded-3xl p-5 border border-emerald-950/30 space-y-6">
        {/* Title / Campus Details */}
        <div className="pb-4 border-b border-white/10 space-y-1">
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-300 block">Menú Principal</span>
          <h3 className="text-sm font-extrabold truncate">{campus?.name || "Sede Principal"}</h3>
          <p className="text-[10px] text-emerald-100/60 font-semibold truncate">{institution?.name}</p>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1">
          {[
            { id: "resumen", label: "Resumen", icon: TrendingUp },
            { id: "prospectos", label: `Prospectos (${leads.length})`, icon: Users },
            { id: "programas", label: `Oferta Académica (${programOfferings.length})`, icon: BookOpen },
            { id: "becas", label: "Becas y Descuentos", icon: Award },
            { id: "config", label: "Configuración Sede", icon: Settings },
          ].map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-extrabold transition-all duration-300 border ${
                  isActive 
                    ? "bg-white/20 border-white/10 text-white shadow-sm backdrop-blur-md" 
                    : "border-transparent text-emerald-100/80 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-white/10 text-center">
          <span className="text-[9.5px] text-emerald-300/80 font-bold block">RutaEdu Partner</span>
        </div>
      </aside>

      </div>
      </main>

      {/* Floating button for mobile menu */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-gradient-to-r from-[#00875A] to-[#006F48] text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
        aria-label="Abrir menú"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" 
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full bg-gradient-to-b from-[#00875A] via-[#006F48] to-[#022C1C] text-white p-5 flex flex-col justify-between shadow-2xl transition-all">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <div>
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-300 block mb-0.5">Menú Socio</span>
                  <h3 className="text-sm font-extrabold truncate">{campus?.name || "Sede"}</h3>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold"
                >
                  ✕
                </button>
              </div>

              <nav className="space-y-1.5">
                {[
                  { id: "resumen", label: "Resumen", icon: TrendingUp },
                  { id: "prospectos", label: `Prospectos (${leads.length})`, icon: Users },
                  { id: "programas", label: `Oferta Académica (${programOfferings.length})`, icon: BookOpen },
                  { id: "becas", label: "Becas y Descuentos", icon: Award },
                  { id: "config", label: "Configuración Sede", icon: Settings },
                ].map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as any);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-extrabold transition-all border ${
                        isActive
                          ? "bg-white/20 border-white/10 text-white shadow-sm backdrop-blur-md"
                          : "border-transparent text-emerald-100/80 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
            
            <div className="pt-4 border-t border-white/10 text-center">
              <span className="text-[9.5px] text-emerald-300/80 font-bold block">RutaEdu Partner</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PROGRAM OFFERING */}
      {programModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-100 rounded-3xl p-5 md:p-6 max-w-md w-full shadow-2xl space-y-4 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-[#0A1E3A]">
                {editingOffering ? "Editar Oferta Académica" : "Ofertar Nuevo Programa"}
              </h3>
              <button 
                onClick={() => setProgramModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProgramSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              
              {/* If adding new, allow selecting from existing programs or checking a custom creation input */}
              {!editingOffering && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      id="isNewProgramName"
                      checked={offeringForm.isNewProgramName}
                      onChange={(e) => setOfferingForm(prev => ({ ...prev, isNewProgramName: e.target.checked }))}
                      className="w-4 h-4 text-primary focus:ring-primary border-slate-300 rounded"
                    />
                    <label htmlFor="isNewProgramName" className="text-[10.5px] font-bold text-slate-700 uppercase cursor-pointer">
                      ¿Crear una carrera que no está en la lista?
                    </label>
                  </div>

                  {offeringForm.isNewProgramName ? (
                    <div className="space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Nombre del Programa</label>
                        <input 
                          type="text"
                          placeholder="Ej. Ingeniería Mecánica"
                          value={offeringForm.newProgramName}
                          onChange={(e) => setOfferingForm(prev => ({ ...prev, newProgramName: e.target.value }))}
                          className="w-full h-9 px-3 bg-white border border-slate-200 rounded-xl outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Nivel</label>
                          <select
                            value={offeringForm.newProgramLevel}
                            onChange={(e) => setOfferingForm(prev => ({ ...prev, newProgramLevel: e.target.value }))}
                            className="w-full h-9 px-2 bg-white border border-slate-200 rounded-xl outline-none"
                          >
                            <option value="technical">Técnico</option>
                            <option value="technologist">Tecnólogo</option>
                            <option value="pregrado">Pregrado</option>
                            <option value="especializacion">Especialización</option>
                            <option value="maestria">Maestría</option>
                            <option value="bootcamp">Bootcamp</option>
                            <option value="curso">Curso Corto</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Categoría</label>
                          <select
                            value={offeringForm.newProgramCategory}
                            onChange={(e) => setOfferingForm(prev => ({ ...prev, newProgramCategory: e.target.value }))}
                            className="w-full h-9 px-2 bg-white border border-slate-200 rounded-xl outline-none"
                          >
                            <option value="Ingeniería">Ingeniería</option>
                            <option value="Salud">Salud</option>
                            <option value="Tecnología">Tecnología</option>
                            <option value="Negocios">Negocios</option>
                            <option value="Diseño">Diseño y Arte</option>
                            <option value="Ciencias">Ciencias Sociales</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Selecciona Programa Existente</label>
                      <select
                        value={offeringForm.programId}
                        onChange={(e) => setOfferingForm(prev => ({ ...prev, programId: e.target.value }))}
                        className="w-full h-10 px-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
                      >
                        <option value="">-- Escoge una carrera --</option>
                        {globalPrograms.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.level})</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Tuition and modalities settings */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Costo Semestre ($ COP)</label>
                  <input 
                    type="number" 
                    required
                    placeholder="Ej. 4500000"
                    value={offeringForm.tuitionCost}
                    onChange={(e) => setOfferingForm(prev => ({ ...prev, tuitionCost: e.target.value }))}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Duración (Semestres)</label>
                  <input 
                    type="number" 
                    required
                    placeholder="Ej. 10"
                    value={offeringForm.durationSemesters}
                    onChange={(e) => setOfferingForm(prev => ({ ...prev, durationSemesters: e.target.value }))}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Modalidad de Dictado</label>
                <select
                  value={offeringForm.modality}
                  onChange={(e) => setOfferingForm(prev => ({ ...prev, modality: e.target.value }))}
                  className="w-full h-10 px-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-primary transition-all"
                >
                  <option value="presencial">Presencial</option>
                  <option value="virtual">Virtual 100%</option>
                  <option value="hibrida">Híbrida (Alternancia)</option>
                </select>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setProgramModalOpen(false)}
                  className="h-10 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all active:scale-95 shadow-sm"
                >
                  {editingOffering ? "Actualizar Oferta" : "Publicar Oferta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SCHOLARSHIP */}
      {scholarshipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-100 rounded-3xl p-5 md:p-6 max-w-md w-full shadow-2xl space-y-4 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-[#0A1E3A]">Registrar Nueva Beca</h3>
              <button 
                onClick={() => setScholarshipModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScholarshipSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Nombre de la Beca / Descuento</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej. Beca de Excelencia Andes"
                  value={scholarshipForm.name}
                  onChange={(e) => setScholarshipForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Proveedor / Otorgante</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ej. Fundación UAndes"
                    value={scholarshipForm.provider}
                    onChange={(e) => setScholarshipForm(prev => ({ ...prev, provider: e.target.value }))}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Porcentaje Cobertura (1-100%)</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    max="100"
                    placeholder="100"
                    value={scholarshipForm.coverage}
                    onChange={(e) => setScholarshipForm(prev => ({ ...prev, coverage: e.target.value }))}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Descripción Breve</label>
                <textarea 
                  rows={2}
                  required
                  placeholder="Describe la beca..."
                  value={scholarshipForm.description}
                  onChange={(e) => setScholarshipForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Requisitos clave</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Promedio de 4.5"
                    value={scholarshipForm.requirements}
                    onChange={(e) => setScholarshipForm(prev => ({ ...prev, requirements: e.target.value }))}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Fecha Límite</label>
                  <input 
                    type="date" 
                    value={scholarshipForm.deadline}
                    onChange={(e) => setScholarshipForm(prev => ({ ...prev, deadline: e.target.value }))}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setScholarshipModalOpen(false)}
                  className="h-10 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all active:scale-95 shadow-sm"
                >
                  Guardar Beca
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
