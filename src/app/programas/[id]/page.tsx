"use client";

import React, { useState, useEffect, use } from "react";
import Navbar from "@/components/Navbar";
import { GraduationCap, Calendar, MapPin, DollarSign, Award, BookOpen, Send, CheckCircle, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type ProgramDetails = {
  id: string;
  name: string;
  slug: string;
  level: string;
  description: string;
  category: string;
  degree_title: string;
  campus: {
    id: string;
    name: string;
    address: string;
    email: string;
    phone: string;
    tuition_cost: number;
    currency: string;
    duration_semesters: number;
    modality: string;
    institution: {
      id: string;
      name: string;
      accreditation_status: string;
    };
  } | null;
};

export default function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Next.js 16: params is a Promise, must be unwrapped with React.use()
  const { id } = use(params);

  const [program, setProgram] = useState<ProgramDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leadError, setLeadError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  useEffect(() => {
    const fetchProgram = async () => {
      setLoading(true);

      // Try to find by ID (UUID) first, then by slug
      const { data, error } = await supabase
        .from("programs")
        .select(`
          id,
          name,
          slug,
          level,
          description,
          category,
          degree_title,
          program_campuses (
            id,
            tuition_cost,
            currency,
            duration_semesters,
            modality,
            campuses (
              id,
              name,
              address,
              email,
              phone,
              institutions (
                id,
                name,
                accreditation_status
              )
            )
          )
        `)
        .or(`id.eq.${id},slug.eq.${id}`)
        .eq("status", "active")
        .single();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const pc = (data as any).program_campuses?.[0];
      const campus = pc?.campuses ?? null;

      setProgram({
        id: data.id,
        name: data.name,
        slug: data.slug,
        level: data.level,
        description: data.description,
        category: data.category,
        degree_title: data.degree_title,
        campus: campus
          ? {
              id: campus.id,
              name: campus.name,
              address: campus.address,
              email: campus.email,
              phone: campus.phone,
              tuition_cost: pc.tuition_cost,
              currency: pc.currency,
              duration_semesters: pc.duration_semesters,
              modality: pc.modality,
              institution: campus.institutions,
            }
          : null,
      });

      setLoading(false);
    };

    fetchProgram();
  }, [id]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadError("");

    if (!formData.name || !formData.email || !formData.phone) return;
    if (!program?.campus) return;

    setSubmitting(true);

    try {
      // Get current session (may be null for guests)
      const { data: { session } } = await supabase.auth.getSession();

      const { error } = await supabase.from("leads").insert({
        student_id: session?.user?.id ?? null,
        program_id: program.id,
        campus_id: program.campus.id,
        status: "contacted",
        source: "program_page",
        guest_name: formData.name,
        guest_email: formData.email,
        guest_phone: formData.phone,
        notes: formData.notes || null,
        metadata: {
          institution_name: program.campus.institution?.name,
          program_name: program.name,
        },
      });

      if (error) {
        setLeadError("Hubo un error al enviar tu solicitud. Intenta de nuevo.");
      } else {
        setLeadSubmitted(true);
      }
    } catch {
      setLeadError("Ocurrió un error inesperado. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: currency || "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
            <p className="text-sm text-text-secondary font-semibold">Cargando programa...</p>
          </div>
        </main>
      </div>
    );
  }

  // ── Not found state ──
  if (notFound || !program) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl p-8 shadow-lg text-center max-w-sm space-y-4">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <h2 className="text-lg font-extrabold text-text-primary">Programa no encontrado</h2>
            <p className="text-xs text-text-secondary">Este programa no existe o ya no está disponible.</p>
            <Link href="/explorar" className="block w-full h-12 bg-primary text-white font-bold text-sm rounded-xl flex items-center justify-center">
              Explorar programas
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="max-w-6xl w-full mx-auto px-4 py-8 flex-1 flex flex-col md:flex-row gap-8">

        {/* Left Column: Details */}
        <div className="flex-1 space-y-6">

          <Link href="/explorar" className="inline-flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-primary transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver a Explorar
          </Link>

          {/* Header metadata card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
            <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-teal-50 text-primary uppercase">
              {program.level}
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary">{program.name}</h1>
            {program.campus && (
              <p className="text-sm font-semibold text-text-secondary">
                {program.campus.institution?.name}{" "}
                {program.campus.name && (
                  <span className="text-slate-400">• {program.campus.name}</span>
                )}
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
              {program.campus && (
                <>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                    <div>
                      <span className="text-[10px] text-text-secondary block font-bold">Duración</span>
                      <span className="text-xs font-bold text-text-primary">{program.campus.duration_semesters} semestres</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
                    <div>
                      <span className="text-[10px] text-text-secondary block font-bold">Modalidad</span>
                      <span className="text-xs font-bold text-text-primary capitalize">{program.campus.modality}</span>
                    </div>
                  </div>
                  {program.campus.institution?.accreditation_status && (
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-primary flex-shrink-0" />
                      <div>
                        <span className="text-[10px] text-text-secondary block font-bold">Acreditación</span>
                        <span className="text-xs font-bold text-text-primary">{program.campus.institution.accreditation_status}</span>
                      </div>
                    </div>
                  )}
                  {program.campus.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                      <div>
                        <span className="text-[10px] text-text-secondary block font-bold">Dirección</span>
                        <span className="text-xs font-bold text-text-primary line-clamp-1">{program.campus.address}</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Description Card */}
          {program.description && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-text-primary">Descripción del programa</h3>
              <p className="text-xs md:text-sm text-text-secondary leading-relaxed font-medium">
                {program.description}
              </p>
            </div>
          )}

          {/* Degree title card */}
          {program.degree_title && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-3">
              <h3 className="text-base font-extrabold text-text-primary">Título otorgado</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-primary">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-text-primary">{program.degree_title}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Call to action Lead Form */}
        <div className="w-full md:w-80 flex-shrink-0">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl sticky top-24 space-y-6">

            {program.campus && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-text-secondary block uppercase tracking-widest">Matrícula por semestre</span>
                <h3 className="text-xl font-extrabold text-text-primary">
                  {formatCurrency(program.campus.tuition_cost, program.campus.currency)}
                </h3>
                <span className="text-[10px] text-text-secondary font-medium block">Precios oficiales vigentes.</span>
              </div>
            )}

            {leadSubmitted ? (
              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 text-center space-y-3">
                <CheckCircle className="w-10 h-10 text-primary mx-auto" />
                <h4 className="text-sm font-extrabold text-text-primary">¡Solicitud Enviada!</h4>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  Un asesor de la institución se pondrá en contacto contigo en las próximas horas.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3">
                <h4 className="text-xs font-bold text-text-primary">Solicitar Información Directa</h4>

                {leadError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-[11px] rounded-xl p-3 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{leadError}</span>
                  </div>
                )}

                <div>
                  <input
                    type="text"
                    required
                    placeholder="Tu nombre completo"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3.5 h-11 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-xs font-semibold outline-none focus:border-primary transition-all"
                    style={{ minHeight: "44px" }}
                  />
                </div>
                <div>
                  <input
                    type="email"
                    required
                    placeholder="Tu correo electrónico"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3.5 h-11 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-xs font-semibold outline-none focus:border-primary transition-all"
                    style={{ minHeight: "44px" }}
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    required
                    placeholder="Tu número celular"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3.5 h-11 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-xs font-semibold outline-none focus:border-primary transition-all"
                    style={{ minHeight: "44px" }}
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Mensaje o dudas..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full p-3 h-20 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-xs font-semibold outline-none focus:border-primary transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 bg-primary hover:bg-primary-hover text-white text-xs font-extrabold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-60"
                  style={{ minHeight: "48px" }}
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{submitting ? "Enviando..." : "Enviar datos de contacto"}</span>
                </button>
              </form>
            )}

            <div className="text-[10px] text-text-secondary text-center font-semibold border-t border-slate-100 pt-3">
              RutaEdu no cobra comisiones a los estudiantes por aplicar.
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
